import csv
import io
import re
import secrets
import hashlib
from django.db import IntegrityError
from .encryption import encrypt_invitation_token, decrypt_invitation_token
from datetime import timedelta
from django.core.validators import validate_email as django_validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password
import uuid
from decimal import Decimal
from django.db import models, transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import UserProfile
from apps.core.models import AuditLog
from .models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
    Certificate,
    VolunteerOnboardingApplication,
    VolunteerInvitationBatch,
    VolunteerInvitation,
)
from .tasks import (
    send_volunteer_registration_email,
    send_admin_registration_email,
    send_application_confirmation_email,
    send_application_status_email,
    send_onboarding_submitted_admin_email,
    send_onboarding_decision_email,
    send_volunteer_invitation_email,
)

User = get_user_model()


def register_volunteer(
    validated_data,
    is_verified=False,
    is_active=False,
    issue_tokens=False,
    approval_status=VolunteerProfile.ApprovalStatus.PENDING,
    send_otp=False,
):
    """
    Registers a new volunteer atomically:
    1. Creates a User with role=PUBLIC (or VOLUNTEER only if explicitly verified)
    2. Creates a linked UserProfile
    3. Creates or links the VolunteerProfile with specified approval_status (default: PENDING)
    4. Attaches VolunteerInterests
    5. If send_otp=True (public registration path), creates an email OTP and queues verification email
    6. Dispatches volunteer confirmation and admin notification emails on successful commit
    7. SimpleJWT tokens are issued ONLY when issue_tokens=True (never during unverified public registration)
    """
    email = validated_data.get('email', '').strip().lower()
    password = validated_data.get('password')
    first_name = validated_data.get('first_name', '').strip()
    last_name = validated_data.get('last_name', '').strip()
    phone = validated_data.get('phone', '').strip()
    city = validated_data.get('city', 'Bengaluru').strip()
    state = validated_data.get('state', '').strip()
    occupation = validated_data.get('occupation', '').strip()
    skills = validated_data.get('skills', '').strip()
    availability = validated_data.get('availability', 'Weekends').strip()
    bio = validated_data.get('bio', '').strip()
    interests = validated_data.get('interests', [])

    if not email:
        raise ValidationError({'email': 'Email is required for registration.'})
    if not password:
        raise ValidationError({'password': 'Password is required for registration.'})

    with transaction.atomic():
        if User.objects.filter(email=email).exists():
            raise ValidationError({'email': 'A user account with this email already exists. Please sign in.'})

        # 1. Create User (starts as PUBLIC and unverified/inactive until OTP verification)
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=User.Role.PUBLIC if not is_verified else User.Role.VOLUNTEER,
            is_verified=is_verified,
            is_active=is_active,
        )

        # 2. Create UserProfile
        UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'city': city,
                'state': state,
                'bio': bio,
            }
        )

        # 3. Create or link VolunteerProfile (starts PENDING by default)
        existing_profile = VolunteerProfile.objects.filter(email=email).first()
        full_name = f"{first_name} {last_name}".strip() or email

        if existing_profile:
            existing_profile.user = user
            existing_profile.full_name = full_name or existing_profile.full_name
            existing_profile.phone = phone or existing_profile.phone
            existing_profile.city = city or existing_profile.city
            existing_profile.state = state or existing_profile.state
            existing_profile.occupation = occupation or existing_profile.occupation
            existing_profile.skills = skills or existing_profile.skills
            existing_profile.availability = availability or existing_profile.availability
            existing_profile.bio = bio or existing_profile.bio
            existing_profile.save()
            v_profile = existing_profile
        else:
            v_profile = VolunteerProfile.objects.create(
                user=user,
                full_name=full_name,
                email=email,
                phone=phone or '+91 00000 00000',
                city=city or 'Bengaluru',
                state=state,
                occupation=occupation,
                skills=skills or 'Community Volunteering',
                availability=availability or 'Weekends',
                bio=bio,
                approval_status=approval_status,
            )

        # 4. Attach Interests
        if interests:
            v_profile.interests.set(_resolve_interests(interests))

        # 5. Create OTP for email verification if send_otp=True
        if send_otp:
            from apps.accounts.models import OTP
            from apps.accounts.utils import send_email_otp

            otp = OTP.objects.create(
                user=user,
                purpose='email',
            )
            transaction.on_commit(lambda: send_email_otp(user, otp.code))

        # 6. Queue transactional confirmation emails on successful commit
        v_profile_id = str(v_profile.id)
        transaction.on_commit(lambda: send_volunteer_registration_email.delay(v_profile_id))
        transaction.on_commit(lambda: send_admin_registration_email.delay(v_profile_id))

        # 7. Generate SimpleJWT tokens only when issue_tokens=True
        access_token = None
        refresh_token = None
        if issue_tokens:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

        return {
            'user': user,
            'volunteer_profile': v_profile,
            'access': access_token,
            'refresh': refresh_token,
            'identifier': user.email,
            'requires_otp': not is_verified,
            'message': 'Registration initiated. Please verify your OTP.' if not is_verified else 'Volunteer registered successfully.'
        }


def _resolve_interests(interests_list):
    """
    Safely resolves interest items whether provided as UUID objects, UUID strings, slugs, or names.
    """
    if not interests_list:
        return VolunteerInterest.objects.none()

    valid_uuids = []
    slugs_or_names = []
    for item in interests_list:
        if isinstance(item, uuid.UUID):
            valid_uuids.append(item)
        elif isinstance(item, str):
            try:
                valid_uuids.append(uuid.UUID(item))
            except (ValueError, AttributeError):
                slugs_or_names.append(item)

    q = models.Q()
    if valid_uuids:
        q |= models.Q(id__in=valid_uuids)
    if slugs_or_names:
        q |= models.Q(slug__in=slugs_or_names) | models.Q(name__in=slugs_or_names)

    return VolunteerInterest.objects.filter(q) if q else VolunteerInterest.objects.none()


def get_or_create_volunteer_profile_for_user(user, profile_data=None):
    """
    Retrieves or establishes the single VolunteerProfile associated with a User.
    Prevents duplicate profiles and ensures database integrity.
    """
    with transaction.atomic():
        profile = getattr(user, 'volunteer_profile', None)

        if not profile:
            profile = VolunteerProfile.objects.filter(email=user.email).first()
            if profile:
                profile.user = user
                profile.save(update_fields=['user', 'updated_at'])
            else:
                full_name = user.get_full_name() or user.email
                profile = VolunteerProfile.objects.create(
                    user=user,
                    full_name=full_name,
                    email=user.email,
                    phone=user.phone or '+91 00000 00000',
                    city='Bengaluru',
                    skills='Community Volunteering',
                    availability='Weekends',
                    approval_status=VolunteerProfile.ApprovalStatus.PENDING,
                )

        if profile_data:
            update_fields = []
            for field in ['full_name', 'phone', 'city', 'state', 'occupation', 'skills', 'availability', 'bio']:
                if field in profile_data and profile_data[field] is not None:
                    setattr(profile, field, profile_data[field])
                    update_fields.append(field)

            if update_fields:
                update_fields.append('updated_at')
                profile.save(update_fields=update_fields)

            if 'full_name' in profile_data and profile_data['full_name'] and profile.user:
                name_str = str(profile_data['full_name']).strip()
                parts = name_str.split(' ', 1)
                profile.user.first_name = parts[0]
                profile.user.last_name = parts[1] if len(parts) > 1 else ''
                profile.user.save(update_fields=['first_name', 'last_name', 'updated_at'])

            if 'interests' in profile_data:
                profile.interests.set(_resolve_interests(profile_data['interests']))

        return profile


def create_volunteer_application(volunteer_profile, opportunity, statement_of_purpose, experience=''):
    """
    Creates a new VolunteerApplication after verifying:
    - Opportunity active & open status
    - Opportunity capacity
    - Non-duplicate application by the same volunteer profile
    Dispatches application confirmation email upon successful transaction commit.
    """
    with transaction.atomic():
        opp = VolunteerOpportunity.objects.select_for_update().get(id=opportunity.id)

        if not opp.is_active or opp.status == VolunteerOpportunity.Status.CLOSED:
            raise ValidationError({'opportunity': 'This volunteer opportunity is closed for applications.'})

        if opp.status == VolunteerOpportunity.Status.FILLED or opp.spots_filled >= opp.spots_available:
            raise ValidationError({'opportunity': 'This volunteer opportunity has reached its maximum capacity.'})

        if VolunteerApplication.objects.filter(opportunity=opp, volunteer_profile=volunteer_profile).exists():
            raise ValidationError({'detail': 'You have already submitted an application for this opportunity.'})

        application = VolunteerApplication.objects.create(
            opportunity=opp,
            volunteer_profile=volunteer_profile,
            statement_of_purpose=statement_of_purpose,
            experience=experience,
            status=VolunteerApplication.Status.PENDING,
        )

        app_id = str(application.id)
        transaction.on_commit(lambda: send_application_confirmation_email.delay(app_id))

        return application


def update_application_status(application_id, new_status, review_notes=''):
    """
    Safely transitions an application status (APPROVED / REJECTED / PENDING / WAITLISTED)
    and updates the opportunity spots_filled counter atomically.
    Dispatches status update email on commit only when an actual status transition occurs.
    """
    with transaction.atomic():
        application = VolunteerApplication.objects.select_for_update().select_related('opportunity', 'volunteer_profile').get(id=application_id)
        opportunity = VolunteerOpportunity.objects.select_for_update().get(id=application.opportunity_id)

        valid_statuses = [
            VolunteerApplication.Status.APPROVED,
            VolunteerApplication.Status.REJECTED,
            VolunteerApplication.Status.PENDING,
            VolunteerApplication.Status.WAITLISTED,
        ]
        if new_status not in valid_statuses:
            raise ValidationError({'status': f"Invalid status choice: '{new_status}'. Allowed: {valid_statuses}"})

        old_status = application.status

        if old_status != new_status:
            # Transition TO APPROVED
            if new_status == VolunteerApplication.Status.APPROVED:
                if opportunity.spots_filled >= opportunity.spots_available and old_status != VolunteerApplication.Status.APPROVED:
                    raise ValidationError({'opportunity': 'Cannot approve application: Opportunity has reached maximum capacity.'})
                opportunity.spots_filled = min(opportunity.spots_available, opportunity.spots_filled + 1)
                if opportunity.spots_filled >= opportunity.spots_available:
                    opportunity.status = VolunteerOpportunity.Status.FILLED
                opportunity.save(update_fields=['spots_filled', 'status', 'updated_at'])

            # Transition FROM APPROVED to non-APPROVED
            elif old_status == VolunteerApplication.Status.APPROVED:
                opportunity.spots_filled = max(0, opportunity.spots_filled - 1)
                if opportunity.status == VolunteerOpportunity.Status.FILLED and opportunity.spots_filled < opportunity.spots_available:
                    opportunity.status = VolunteerOpportunity.Status.OPEN
                opportunity.save(update_fields=['spots_filled', 'status', 'updated_at'])

            application.status = new_status

            if new_status in [
                VolunteerApplication.Status.APPROVED,
                VolunteerApplication.Status.REJECTED,
                VolunteerApplication.Status.WAITLISTED,
            ]:
                app_id_str = str(application.id)
                status_to_send = new_status
                transaction.on_commit(
                    lambda: send_application_status_email.delay(app_id_str, status_to_send)
                )

        if review_notes:
            application.review_notes = review_notes

        application.save()
        return application


def log_volunteer_participation(volunteer_profile, project, date, hours, activity_performed, verified=True):
    """
    Logs a volunteer participation session and updates the volunteer's total verified hours.
    """
    with transaction.atomic():
        participation = VolunteerParticipation.objects.create(
            volunteer_profile=volunteer_profile,
            project=project,
            date=date,
            hours=hours,
            activity_performed=activity_performed,
            verified=verified,
        )
        recalculate_volunteer_hours(volunteer_profile)
        return participation


def recalculate_volunteer_hours(volunteer_profile):
    """
    Recalculates total verified hours contributed from verified participation logs.
    """
    total = VolunteerParticipation.objects.filter(
        volunteer_profile=volunteer_profile,
        verified=True,
        is_active=True
    ).aggregate(total=models.Sum('hours'))['total'] or Decimal('0.0')

    volunteer_profile.total_hours_contributed = total
    volunteer_profile.save(update_fields=['total_hours_contributed', 'updated_at'])
    return total


def create_certificate(volunteer_profile, title=None, description='', issue_date=None, hours_recognized=None, certificate_code=None, issued_by=None):
    """
    Creates a new verifiable Certificate for a volunteer.
    """
    with transaction.atomic():
        if not title:
            title = "Certificate of Volunteer Service"
        if not issue_date:
            issue_date = timezone.now().date()
        if hours_recognized is None:
            hours_recognized = volunteer_profile.total_hours_contributed
        if not certificate_code:
            year = issue_date.year
            suffix = uuid.uuid4().hex[:8].upper()
            certificate_code = f"RI-CERT-{year}-{suffix}"

        certificate = Certificate.objects.create(
            volunteer_profile=volunteer_profile,
            certificate_code=certificate_code,
            title=title,
            description=description,
            issue_date=issue_date,
            hours_recognized=hours_recognized,
            status=Certificate.Status.ACTIVE,
            issued_by=issued_by or "Responsible Individuals Foundation",
        )
        return certificate


def submit_onboarding_application(volunteer_profile, validated_data):
    """
    Submits a one-time volunteer onboarding application.
    Enforces that:
    - User is not already APPROVED.
    - User does not have a concurrent SUBMITTED application pending review.
    - Preserves audit trail: rejected prior applications remain intact in database.
    - Updates profile demographic fields if supplied.
    - Dispatches transactional notification to administrators after commit.
    """
    if volunteer_profile.approval_status == VolunteerProfile.ApprovalStatus.APPROVED:
        raise ValidationError({'detail': 'Your volunteer profile is already verified and approved.'})

    with transaction.atomic():
        # Prevent multiple concurrent pending submissions
        has_pending = VolunteerOnboardingApplication.objects.filter(
            volunteer_profile=volunteer_profile,
            status=VolunteerOnboardingApplication.Status.SUBMITTED
        ).exists()
        if has_pending:
            raise ValidationError({
                'detail': 'You already have an onboarding application under review by our administration. Please await a decision.'
            })

        # Update profile demographic fields if supplied
        profile_updates = []
        for field in ['phone', 'city', 'skills', 'availability']:
            val = validated_data.get(field)
            if val and hasattr(volunteer_profile, field):
                setattr(volunteer_profile, field, val)
                profile_updates.append(field)
        if profile_updates:
            profile_updates.append('updated_at')
            volunteer_profile.save(update_fields=profile_updates)

        # Create new onboarding application record (preserving audit trail of any previous rejected records)
        application = VolunteerOnboardingApplication.objects.create(
            volunteer_profile=volunteer_profile,
            statement_of_intent=validated_data['statement_of_intent'],
            skills_summary=validated_data.get('skills_summary', volunteer_profile.skills) or '',
            experience_summary=validated_data.get('experience_summary', '') or '',
            availability=validated_data.get('availability', volunteer_profile.availability) or '',
            status=VolunteerOnboardingApplication.Status.SUBMITTED,
            submitted_at=timezone.now(),
        )

        app_id_str = str(application.id)
        # Transactional notification with fail-safe: Celery task dispatches after commit
        transaction.on_commit(lambda: send_onboarding_submitted_admin_email.delay(app_id_str))

        return application


def review_onboarding_application(application_id, decision, review_notes='', admin_user=None):
    """
    Admin review of a volunteer onboarding application.
    Transitions status to APPROVED or REJECTED.
    When APPROVED:
      - Sets VolunteerProfile.approval_status = APPROVED
      - Updates User.role = VOLUNTEER (preserving staff/admin privileges)
    When REJECTED:
      - Sets VolunteerProfile.approval_status = REJECTED
      - Preserves review notes for applicant feedback
      - Audit record remains in DB so history is never lost
    Transactional, with fail-safe notification on commit.
    """
    valid_decisions = [
        VolunteerOnboardingApplication.Status.APPROVED,
        VolunteerOnboardingApplication.Status.REJECTED,
    ]
    if decision not in valid_decisions:
        raise ValidationError({'status': f"Invalid decision: '{decision}'. Allowed choices: {valid_decisions}"})

    with transaction.atomic():
        application = VolunteerOnboardingApplication.objects.select_for_update().select_related(
            'volunteer_profile', 'volunteer_profile__user'
        ).get(id=getattr(application_id, 'id', application_id))

        previous_status = application.status

        application.status = decision
        application.reviewed_at = timezone.now()
        application.reviewed_by = admin_user
        application.admin_review_notes = review_notes
        application.save(update_fields=['status', 'reviewed_at', 'reviewed_by', 'admin_review_notes', 'updated_at'])

        profile = application.volunteer_profile

        if decision == VolunteerOnboardingApplication.Status.APPROVED:
            profile.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
            profile.save(update_fields=['approval_status', 'updated_at'])

            if profile.user and not profile.user.is_admin_or_staff:
                if profile.user.role != User.Role.VOLUNTEER:
                    profile.user.role = User.Role.VOLUNTEER
                    profile.user.save(update_fields=['role', 'updated_at'])

        elif decision == VolunteerOnboardingApplication.Status.REJECTED:
            profile.approval_status = VolunteerProfile.ApprovalStatus.REJECTED
            profile.save(update_fields=['approval_status', 'updated_at'])

            if profile.user and not profile.user.is_admin_or_staff:
                if profile.user.role != User.Role.PUBLIC:
                    profile.user.role = User.Role.PUBLIC
                    profile.user.save(update_fields=['role', 'updated_at'])

        if previous_status != decision:
            app_id_str = str(application.id)
            decision_str = str(decision)
            transaction.on_commit(lambda: send_onboarding_decision_email.delay(app_id_str, decision_str))

        return application

def update_volunteer_active_status(profile_or_id, is_active, reason, admin_user=None, ip_address=None):
    """
    Controlled administrative active-status transition for VolunteerProfile.
    - Validates transition and reason.
    - Updates VolunteerProfile.is_active without altering User.is_active, role, or approval_status.
    - Creates an AuditLog entry ONLY if an actual transition occurs (prevents duplicate transition logs).
    - Preserves all associated history, applications, participations, certificates, and hours.
    Returns tuple: (profile, status_changed: bool).
    """
    if not isinstance(is_active, bool):
        raise ValidationError({'is_active': 'Must be a valid boolean.'})

    cleaned_reason = (reason or '').strip()
    if len(cleaned_reason) < 5:
        raise ValidationError({'reason': 'Reason must contain at least 5 characters of meaningful text.'})

    with transaction.atomic():
        if isinstance(profile_or_id, VolunteerProfile):
            profile = VolunteerProfile.objects.select_for_update().get(id=profile_or_id.id)
        else:
            profile = VolunteerProfile.objects.select_for_update().get(id=profile_or_id)

        previous_is_active = profile.is_active

        # Repeated requests that do not change current status return idempotent response without logging duplicate audit records
        if previous_is_active == is_active:
            return profile, False

        profile.is_active = is_active
        profile.save(update_fields=['is_active', 'updated_at'])

        action_verb = 'activated' if is_active else 'deactivated'
        admin_identifier = admin_user.email if (admin_user and admin_user.is_authenticated) else 'Administrator'

        AuditLog.objects.create(
            user=admin_user if (admin_user and admin_user.is_authenticated) else None,
            action='UPDATE',
            entity_type='VolunteerProfile',
            entity_id=str(profile.id),
            description=f"Volunteer profile {action_verb} by {admin_identifier}. Reason: {cleaned_reason}",
            ip_address=ip_address,
            metadata={
                'previous_is_active': previous_is_active,
                'new_is_active': is_active,
                'reason': cleaned_reason,
                'volunteer_email': profile.email,
                'volunteer_name': profile.full_name,
            }
        )

        return profile, True



MAX_CSV_FILE_SIZE = 2 * 1024 * 1024  # 2MB
MAX_CSV_ROW_COUNT = 500
INVITATION_EXPIRY_DAYS = 7


def validate_csv_invitation_batch(file_obj, filename, admin_user=None, ip_address=None):
    """
    Parses and validates a CSV upload containing volunteer email addresses without creating
    user accounts or marking volunteers as registered.
    Returns: VolunteerInvitationBatch instance and row-level breakdown.
    """
    if not filename.lower().endswith('.csv'):
        raise ValidationError({'file': 'Only CSV files (.csv) are accepted.'})

    # Validate file size
    size = getattr(file_obj, 'size', None)
    if size is not None and size > MAX_CSV_FILE_SIZE:
        raise ValidationError({'file': f'CSV file size exceeds the maximum allowed limit of {MAX_CSV_FILE_SIZE // (1024 * 1024)}MB.'})

    # Read and decode content
    try:
        content_bytes = file_obj.read()
        if not content_bytes or len(content_bytes.strip()) == 0:
            raise ValidationError({'file': 'Uploaded CSV file is empty.'})
        
        # Try utf-8-sig (handles UTF-8 BOM), fallback to utf-8 and latin-1
        try:
            content_str = content_bytes.decode('utf-8-sig')
        except UnicodeDecodeError:
            try:
                content_str = content_bytes.decode('utf-8')
            except UnicodeDecodeError:
                content_str = content_bytes.decode('latin-1')
    except ValidationError:
        raise
    except Exception as e:
        raise ValidationError({'file': f'Unable to read CSV file: {str(e)}'})

    stream = io.StringIO(content_str)
    try:
        reader = list(csv.reader(stream))
    except Exception as e:
        raise ValidationError({'file': f'Malformed CSV format: {str(e)}'})

    if not reader:
        raise ValidationError({'file': 'Uploaded CSV file contains no data rows.'})

    first_row = reader[0]
    email_col_idx = 0
    start_row_idx = 0
    has_header = False

    # Check if first row contains a recognised email header
    for idx, col in enumerate(first_row):
        col_clean = col.strip().lower()
        if col_clean in ['email', 'email address', 'e-mail', 'mail']:
            email_col_idx = idx
            start_row_idx = 1
            has_header = True
            break

    if not has_header:
        raise ValidationError({'file': "CSV must contain an 'email' or 'email address' header column."})

    raw_rows = reader[start_row_idx:]
    if not raw_rows:
        raise ValidationError({'file': 'Uploaded CSV file contains no data rows after header.'})

    if len(raw_rows) > MAX_CSV_ROW_COUNT:
        raise ValidationError({'file': f'CSV row count ({len(raw_rows)}) exceeds the maximum allowed limit of {MAX_CSV_ROW_COUNT} rows.'})

    rows_detail = []
    seen_in_file = set()
    valid_count = 0
    duplicate_count = 0
    rejected_count = 0

    now = timezone.now()

    for row_num, row in enumerate(raw_rows, start=start_row_idx + 1):
        if not row or all(c.strip() == '' for c in row):
            continue  # skip completely blank lines

        raw_val = row[email_col_idx].strip() if email_col_idx < len(row) else ''
        normalized_email = raw_val.lower()

        # 1. Check blank
        if not normalized_email:
            rejected_count += 1
            rows_detail.append({
                'row_number': row_num,
                'email': raw_val,
                'status': 'INVALID_FORMAT',
                'is_eligible': False,
                'reason': 'Email address column is empty.',
            })
            continue

        # 2. Check format
        try:
            django_validate_email(normalized_email)
        except DjangoValidationError:
            rejected_count += 1
            rows_detail.append({
                'row_number': row_num,
                'email': raw_val,
                'status': 'INVALID_FORMAT',
                'is_eligible': False,
                'reason': 'Malformed email syntax.',
            })
            continue

        # 3. Check duplicate within file
        if normalized_email in seen_in_file:
            duplicate_count += 1
            rows_detail.append({
                'row_number': row_num,
                'email': normalized_email,
                'status': 'DUPLICATE_IN_FILE',
                'is_eligible': False,
                'reason': 'Duplicate email address found within this CSV upload.',
            })
            continue

        seen_in_file.add(normalized_email)

        # 4. Check existing approved volunteer profile
        existing_profile = VolunteerProfile.objects.filter(email__iexact=normalized_email).first()
        if existing_profile:
            rejected_count += 1
            is_approved = existing_profile.approval_status == VolunteerProfile.ApprovalStatus.APPROVED
            status_code = 'ALREADY_APPROVED' if is_approved else 'EXISTING_PROFILE'
            reason_msg = 'This volunteer is already approved.' if is_approved else 'A volunteer profile already exists for this email address.'
            rows_detail.append({
                'row_number': row_num,
                'email': normalized_email,
                'status': status_code,
                'is_eligible': False,
                'reason': reason_msg,
            })
            continue

        # 5. Check active pending invitation
        if VolunteerInvitation.objects.filter(
            email__iexact=normalized_email,
            status=VolunteerInvitation.Status.PENDING,
            expires_at__gt=now
        ).exists():
            duplicate_count += 1
            rows_detail.append({
                'row_number': row_num,
                'email': normalized_email,
                'status': 'ALREADY_PENDING',
                'is_eligible': False,
                'reason': 'An active pending invitation has already been issued for this email.',
            })
            continue

        # 6. Check existing user account requiring account linking
        if User.objects.filter(email__iexact=normalized_email).exists():
            valid_count += 1
            rows_detail.append({
                'row_number': row_num,
                'email': normalized_email,
                'status': 'EXISTING_USER_NEEDS_LINKING',
                'is_eligible': True,
                'reason': 'A registered portal user account exists. Invitation will initiate account linking.',
            })
            continue

        # 7. Valid brand-new volunteer email
        valid_count += 1
        rows_detail.append({
            'row_number': row_num,
            'email': normalized_email,
            'status': 'VALID',
            'is_eligible': True,
            'reason': 'Eligible for new volunteer portal invitation.',
        })

    valid_emails = [r['email'] for r in rows_detail if r.get('is_eligible')]
    rejected_details = [r for r in rows_detail if not r.get('is_eligible') and r.get('status') in ['INVALID_SYNTAX', 'ALREADY_APPROVED', 'EXISTING_PROFILE', 'BLANK']]
    duplicate_details = [r for r in rows_detail if not r.get('is_eligible') and r.get('status') in ['DUPLICATE_IN_FILE', 'ALREADY_PENDING']]

    summary_data = {
        'total_rows': len(rows_detail),
        'valid_rows': valid_count,
        'duplicate_rows': duplicate_count,
        'rejected_rows': rejected_count,
        'valid_emails': valid_emails,
        'rejected_details': rejected_details,
        'duplicate_details': duplicate_details,
        'rows': rows_detail,
    }

    with transaction.atomic():
        batch = VolunteerInvitationBatch.objects.create(
            file_name=filename,
            uploaded_by=admin_user if (admin_user and admin_user.is_authenticated) else None,
            total_rows=len(rows_detail),
            valid_rows=valid_count,
            duplicate_rows=duplicate_count,
            rejected_rows=rejected_count,
            status=VolunteerInvitationBatch.Status.VALIDATED,
            summary=summary_data,
        )

        AuditLog.objects.create(
            user=admin_user if (admin_user and admin_user.is_authenticated) else None,
            action='CREATE',
            entity_type='VolunteerInvitationBatch',
            entity_id=str(batch.id),
            description=f"Uploaded CSV invitation batch '{filename}' ({valid_count}/{len(rows_detail)} valid).",
            ip_address=ip_address,
            metadata={
                'file_name': filename,
                'total_rows': len(rows_detail),
                'valid_rows': valid_count,
                'duplicate_rows': duplicate_count,
                'rejected_rows': rejected_count,
            }
        )

    return batch, summary_data


def generate_and_send_batch_invitations(batch_or_id, admin_user=None, ip_address=None):
    """
    Generates and dispatches individual VolunteerInvitation records for all eligible rows in a batch.
    Never stores or logs raw tokens.
    """
    if isinstance(batch_or_id, VolunteerInvitationBatch):
        batch = batch_or_id
    else:
        batch = VolunteerInvitationBatch.objects.filter(id=batch_or_id).first()
        if not batch:
            raise ValidationError({'batch': 'Invitation batch not found.'})

    if batch.status == VolunteerInvitationBatch.Status.PROCESSED:
        raise ValidationError({'batch': 'This batch has already been processed and invitations dispatched.'})

    eligible_rows = [r for r in batch.summary.get('rows', []) if r.get('is_eligible')]
    if not eligible_rows:
        raise ValidationError({'batch': 'This batch does not contain any eligible email addresses to invite.'})

    created_invitations = []
    invitation_ids_to_dispatch = []
    now = timezone.now()
    expires_at = now + timedelta(days=INVITATION_EXPIRY_DAYS)

    with transaction.atomic():
        for row in eligible_rows:
            email = row['email'].strip().lower()

            # Double check that no pending invitation was created in the meantime
            if VolunteerInvitation.objects.filter(email=email, status=VolunteerInvitation.Status.PENDING, expires_at__gt=now).exists():
                continue

            raw_token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
            encrypted_token = encrypt_invitation_token(raw_token)

            invitation = VolunteerInvitation.objects.create(
                batch=batch,
                email=email,
                token_hash=token_hash,
                encrypted_delivery_token=encrypted_token,
                status=VolunteerInvitation.Status.PENDING,
                expires_at=expires_at,
                invited_by=admin_user if (admin_user and admin_user.is_authenticated) else None,
            )

            created_invitations.append(invitation)
            invitation_ids_to_dispatch.append(str(invitation.id))

            AuditLog.objects.create(
                user=admin_user if (admin_user and admin_user.is_authenticated) else None,
                action='CREATE',
                entity_type='VolunteerInvitation',
                entity_id=str(invitation.id),
                description=f"Generated volunteer invitation for {email} from batch {batch.file_name}.",
                ip_address=ip_address,
                metadata={'email': email, 'batch_id': str(batch.id), 'expires_at': str(expires_at)}
            )

        batch.status = VolunteerInvitationBatch.Status.PROCESSED
        batch.save(update_fields=['status', 'updated_at'])

        AuditLog.objects.create(
            user=admin_user if (admin_user and admin_user.is_authenticated) else None,
            action='UPDATE',
            entity_type='VolunteerInvitationBatch',
            entity_id=str(batch.id),
            description=f"Dispatched {len(created_invitations)} volunteer invitations from batch '{batch.file_name}'.",
            ip_address=ip_address,
            metadata={'batch_id': str(batch.id), 'dispatched_count': len(created_invitations)}
        )

    # Asynchronously dispatch emails passing ONLY invitation ID (no raw tokens in Celery args)
    for inv_id in invitation_ids_to_dispatch:
        send_volunteer_invitation_email.delay(inv_id)

    return {
        'batch_id': str(batch.id),
        'batch': batch,
        'sent_count': len(created_invitations),
        'dispatched_count': len(created_invitations),
        'invitations': created_invitations,
    }


def create_individual_invitation(email, admin_user=None, ip_address=None):
    """
    Generates and dispatches a single volunteer invitation for a specific email address.
    """
    normalized_email = (email or '').strip().lower()
    if not normalized_email:
        raise ValidationError({'email': 'Email is required.'})

    try:
        django_validate_email(normalized_email)
    except DjangoValidationError:
        raise ValidationError({'email': 'Invalid email address syntax.'})

    now = timezone.now()

    if VolunteerProfile.objects.filter(email=normalized_email).exists():
        raise ValidationError({'email': 'A volunteer profile already exists for this email address.'})

    if VolunteerInvitation.objects.filter(email=normalized_email, status=VolunteerInvitation.Status.PENDING, expires_at__gt=now).exists():
        raise ValidationError({'email': 'An active pending invitation has already been issued for this email.'})

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
    encrypted_token = encrypt_invitation_token(raw_token)
    expires_at = now + timedelta(days=INVITATION_EXPIRY_DAYS)

    with transaction.atomic():
        invitation = VolunteerInvitation.objects.create(
            email=normalized_email,
            token_hash=token_hash,
            encrypted_delivery_token=encrypted_token,
            status=VolunteerInvitation.Status.PENDING,
            expires_at=expires_at,
            invited_by=admin_user if (admin_user and admin_user.is_authenticated) else None,
        )

        AuditLog.objects.create(
            user=admin_user if (admin_user and admin_user.is_authenticated) else None,
            action='CREATE',
            entity_type='VolunteerInvitation',
            entity_id=str(invitation.id),
            description=f"Generated individual volunteer invitation for {normalized_email}.",
            ip_address=ip_address,
            metadata={'email': normalized_email, 'expires_at': str(expires_at)}
        )

    # Pass only invitation ID to Celery
    send_volunteer_invitation_email.delay(str(invitation.id))
    return invitation, raw_token


def validate_invitation_token(raw_token):
    """
    Validates a raw invitation token against its SHA-256 hash.
    Ensures token exists, is PENDING, and not expired.
    """
    if not raw_token or not isinstance(raw_token, str):
        raise ValidationError({'token': 'Invitation token is required.'})

    token_hash = hashlib.sha256(raw_token.strip().encode('utf-8')).hexdigest()
    invitation = VolunteerInvitation.objects.filter(token_hash=token_hash).first()

    if not invitation:
        raise ValidationError({'token': 'Invalid or unrecognized invitation token.'})

    if invitation.status == VolunteerInvitation.Status.ACCEPTED:
        raise ValidationError({'token': 'This invitation has already been accepted.'})

    if invitation.status == VolunteerInvitation.Status.REVOKED:
        raise ValidationError({'token': 'This invitation has been revoked by administration.'})

    now = timezone.now()
    if invitation.status == VolunteerInvitation.Status.EXPIRED or now > invitation.expires_at:
        if invitation.status != VolunteerInvitation.Status.EXPIRED:
            invitation.status = VolunteerInvitation.Status.EXPIRED
            invitation.save(update_fields=['status', 'updated_at'])
        raise ValidationError({'token': 'This invitation has expired. Please contact administration for a new invitation.'})

    existing_usr = User.objects.filter(email=invitation.email).first()
    has_existing_account = existing_usr is not None
    has_existing_profile = VolunteerProfile.objects.filter(email=invitation.email).exists()

    return {
        'valid': True,
        'email': invitation.email,
        'status': invitation.status,
        'expires_at': invitation.expires_at,
        'has_existing_account': has_existing_account,
        'has_existing_user': has_existing_account,
        'has_existing_profile': has_existing_profile,
        'existing_user_name': existing_usr.get_full_name() if existing_usr else '',
        'invitation': invitation,
    }


def request_invitation_otp(raw_token, ip_address=None):
    """
    Issues an OTP code to the invitation's intended email for email verification.
    """
    token_info = validate_invitation_token(raw_token)
    invitation = token_info['invitation']

    from apps.accounts.models import OTP, User
    from apps.accounts.utils import send_email_otp

    user = User.objects.filter(email=invitation.email).first()
    if not user:
        # Create unverified user if not already existing
        user = User.objects.create_user(
            email=invitation.email,
            password=None,
            is_active=False,
            is_verified=False,
            role=User.Role.PUBLIC
        )

    otp = OTP.objects.create(
        user=user,
        purpose='email'
    )
    send_email_otp(user, otp.code)

    return {
        'message': f'Verification code sent to {invitation.email}.',
        'identifier': invitation.email,
    }


def accept_invitation_and_register(raw_token, registration_data, authenticated_user=None, ip_address=None):
    """
    Public invitation acceptance and registration workflow.
    - Validates token hash, status, and expiry under row lock (select_for_update).
    - Verified email must strictly match invitation email.
    - Atomically creates or links User account.
    - Atomically creates or links VolunteerProfile as APPROVED and ACTIVE.
    - Registration source recorded as ADMIN_ADDED.
    - Marks invitation ACCEPTED.
    - Writes AuditLog records.
    - Returns JWT tokens and profile data.
    """
    if not raw_token or not isinstance(raw_token, str):
        raise ValidationError({'token': 'Invitation token is required.'})

    token_hash = hashlib.sha256(raw_token.strip().encode('utf-8')).hexdigest()

    from apps.accounts.models import OTP, UserProfile
    from apps.accounts.serializers import UserSerializer

    with transaction.atomic():
        # Lock invitation row before checking current status to prevent race conditions
        invitation = VolunteerInvitation.objects.select_for_update().filter(token_hash=token_hash).first()
        if not invitation:
            raise ValidationError({'token': 'Invalid or unrecognized invitation token.'})

        if invitation.status == VolunteerInvitation.Status.ACCEPTED:
            raise ValidationError({'token': 'This invitation has already been accepted.'})

        if invitation.status == VolunteerInvitation.Status.REVOKED:
            raise ValidationError({'token': 'This invitation has been revoked by administration.'})

        now = timezone.now()
        if invitation.status == VolunteerInvitation.Status.EXPIRED or now > invitation.expires_at:
            if invitation.status != VolunteerInvitation.Status.EXPIRED:
                invitation.status = VolunteerInvitation.Status.EXPIRED
                invitation.save(update_fields=['status', 'updated_at'])
            raise ValidationError({'token': 'This invitation has expired. Please contact administration for a new invitation.'})

        email = invitation.email.lower()
        existing_user = User.objects.select_for_update().filter(email=email).first()
        # -------------------------------------------------------------
        # BRANCH 1: User already exists (Account Linking Workflow)
        # -------------------------------------------------------------
        if existing_user and existing_user.has_usable_password():
            # Enforce authentication / ownership verification
            is_verified_owner = False

            if authenticated_user and authenticated_user.is_authenticated and authenticated_user.email.lower() == email:
                is_verified_owner = True
            elif 'existing_password' in registration_data and registration_data['existing_password']:
                if existing_user.check_password(registration_data['existing_password']):
                    is_verified_owner = True
                else:
                    raise ValidationError({'existing_password': 'The provided password for this existing account is incorrect.'})
            elif 'otp_code' in registration_data and registration_data['otp_code']:
                otp = existing_user.otps.filter(
                    code=str(registration_data['otp_code']).strip(),
                    is_used=False
                ).order_by('-created_at').first()
                if not otp or otp.is_expired:
                    raise ValidationError({'otp_code': 'Invalid or expired verification code.'})
                otp.is_used = True
                otp.save(update_fields=['is_used'])
                is_verified_owner = True

            if not is_verified_owner:
                raise ValidationError({
                    'existing_account': 'An account with this email already exists. Please provide your existing password or verify via OTP to link your account.'
                })

            # Preserve existing user roles. Promote PUBLIC users to VOLUNTEER.
            if existing_user.role == User.Role.PUBLIC:
                existing_user.role = User.Role.VOLUNTEER
            existing_user.is_verified = True
            existing_user.is_active = True
            existing_user.save(update_fields=['role', 'is_verified', 'is_active', 'updated_at'])

            # Link or create VolunteerProfile
            profile = VolunteerProfile.objects.filter(email=email).first()
            if profile:
                profile.user = existing_user
                profile.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
                profile.is_active = True
                profile.registration_source = VolunteerProfile.RegistrationSource.ADMIN_ADDED
                profile.save(update_fields=['user', 'approval_status', 'is_active', 'registration_source', 'updated_at'])
            else:
                profile = VolunteerProfile.objects.create(
                    user=existing_user,
                    email=email,
                    full_name=existing_user.get_full_name() or registration_data.get('full_name', email),
                    phone=registration_data.get('phone', existing_user.phone or '+91 00000 00000'),
                    city=registration_data.get('city', 'Bengaluru'),
                    state=registration_data.get('state', ''),
                    occupation=registration_data.get('occupation', ''),
                    skills=registration_data.get('skills', 'Community Volunteering'),
                    availability=registration_data.get('availability', 'Weekends'),
                    bio=registration_data.get('bio', ''),
                    approval_status=VolunteerProfile.ApprovalStatus.APPROVED,
                    is_active=True,
                    registration_source=VolunteerProfile.RegistrationSource.ADMIN_ADDED,
                )

            target_user = existing_user

        # -------------------------------------------------------------
        # BRANCH 2: Brand-new Volunteer Account (or unactivated stub)
        # -------------------------------------------------------------
        else:
            password = registration_data.get('password')
            confirm_password = registration_data.get('confirm_password')

            if not password:
                raise ValidationError({'password': 'Password is required to create your account.'})
            if confirm_password and password != confirm_password:
                raise ValidationError({'confirm_password': 'Passwords do not match.'})

            try:
                validate_password(password)
            except DjangoValidationError as e:
                raise ValidationError({'password': list(e.messages)})

            # Optional OTP verification if otp_code passed or if user had an OTP generated
            if 'otp_code' in registration_data and registration_data['otp_code']:
                otp = OTP.objects.filter(
                    user__email=email,
                    code=str(registration_data['otp_code']).strip(),
                    is_used=False
                ).order_by('-created_at').first()
                if not otp or otp.is_expired:
                    raise ValidationError({'otp_code': 'Invalid or expired verification code.'})
                otp.is_used = True
                otp.save(update_fields=['is_used'])

            first_name = registration_data.get('first_name', '').strip()
            last_name = registration_data.get('last_name', '').strip()
            phone = registration_data.get('phone', '').strip()
            city = registration_data.get('city', 'Bengaluru').strip()
            state = registration_data.get('state', '').strip()
            occupation = registration_data.get('occupation', '').strip()
            skills = registration_data.get('skills', 'Community Volunteering').strip()
            availability = registration_data.get('availability', 'Weekends').strip()
            bio = registration_data.get('bio', '').strip()
            interests = registration_data.get('interests', [])

            if existing_user:
                target_user = existing_user
                target_user.set_password(password)
                target_user.first_name = first_name or target_user.first_name
                target_user.last_name = last_name or target_user.last_name
                target_user.phone = phone or target_user.phone
                target_user.role = User.Role.VOLUNTEER
                target_user.is_verified = True
                target_user.is_active = True
                target_user.save(update_fields=['password', 'first_name', 'last_name', 'phone', 'role', 'is_verified', 'is_active', 'updated_at'])
            else:
                try:
                    target_user = User.objects.create_user(
                        email=email,
                        password=password,
                        first_name=first_name,
                        last_name=last_name,
                        phone=phone,
                        role=User.Role.VOLUNTEER,
                        is_verified=True,
                        is_active=True,
                    )
                except IntegrityError:
                    raise ValidationError({'email': 'An account with this email address was recently created. Please sign in to link your volunteer profile.'})

            # Create UserProfile
            UserProfile.objects.get_or_create(
                user=target_user,
                defaults={'city': city, 'state': state, 'bio': bio}
            )

            # Create or link VolunteerProfile
            full_name = f"{first_name} {last_name}".strip() or email
            existing_profile = VolunteerProfile.objects.filter(email=email).first()
            if existing_profile:
                existing_profile.user = target_user
                existing_profile.full_name = full_name or existing_profile.full_name
                existing_profile.phone = phone or existing_profile.phone
                existing_profile.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
                existing_profile.is_active = True
                existing_profile.registration_source = VolunteerProfile.RegistrationSource.ADMIN_ADDED
                existing_profile.save(update_fields=['user', 'full_name', 'phone', 'approval_status', 'is_active', 'registration_source', 'updated_at'])
                profile = existing_profile
            else:
                profile = VolunteerProfile.objects.create(
                    user=target_user,
                    email=email,
                    full_name=full_name,
                    phone=phone or '+91 00000 00000',
                    city=city,
                    state=state,
                    occupation=occupation,
                    skills=skills,
                    availability=availability,
                    bio=bio,
                    approval_status=VolunteerProfile.ApprovalStatus.APPROVED,
                    is_active=True,
                    registration_source=VolunteerProfile.RegistrationSource.ADMIN_ADDED,
                )

            if interests:
                profile.interests.set(_resolve_interests(interests))

        # -------------------------------------------------------------
        # FINALIZE INVITATION & AUDIT LOGS
        # -------------------------------------------------------------
        invitation.status = VolunteerInvitation.Status.ACCEPTED
        invitation.accepted_at = timezone.now()
        invitation.volunteer_profile = profile
        invitation.encrypted_delivery_token = None
        invitation.save(update_fields=['status', 'accepted_at', 'volunteer_profile', 'encrypted_delivery_token', 'updated_at'])

        AuditLog.objects.create(
            user=target_user,
            action='UPDATE',
            entity_type='VolunteerInvitation',
            entity_id=str(invitation.id),
            description=f"Volunteer invitation accepted by {email}.",
            ip_address=ip_address,
            metadata={'email': email, 'profile_id': str(profile.id), 'user_id': str(target_user.id)}
        )

        AuditLog.objects.create(
            user=target_user,
            action='CREATE' if not existing_user else 'UPDATE',
            entity_type='VolunteerProfile',
            entity_id=str(profile.id),
            description="Volunteer profile linked to portal account via invitation.",
            ip_address=ip_address,
            metadata={
                'email': email,
                'registration_source': 'ADMIN_ADDED',
                'approval_status': 'APPROVED',
                'is_active': True,
                'invitation_id': str(invitation.id),
            }
        )

    # Issue JWT tokens
    refresh = RefreshToken.for_user(target_user)

    return {
        'message': 'Volunteer registration completed successfully. Welcome to the portal!',
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(target_user).data,
        'profile_id': str(profile.id),
        'approval_status': profile.approval_status,
        'is_active': profile.is_active,
    }


def resend_invitation(invitation_or_id, admin_user=None, ip_address=None):
    """
    Resends an invitation to an eligible volunteer under database row lock (select_for_update).
    - Accepted invitations cannot be resent.
    - Revoked invitations cannot be resent (explicit policy).
    - Generates a new secure token hash, resets status to PENDING, extends expiry.
    - Encrypts new delivery token and queues Celery email dispatch passing only invitation ID.
    """
    new_raw_token = secrets.token_urlsafe(32)
    new_token_hash = hashlib.sha256(new_raw_token.encode('utf-8')).hexdigest()
    new_encrypted_token = encrypt_invitation_token(new_raw_token)
    new_expiry = timezone.now() + timedelta(days=INVITATION_EXPIRY_DAYS)

    with transaction.atomic():
        if isinstance(invitation_or_id, VolunteerInvitation):
            invitation = VolunteerInvitation.objects.select_for_update().get(id=invitation_or_id.id)
        else:
            invitation = VolunteerInvitation.objects.select_for_update().filter(id=invitation_or_id).first()
            if not invitation:
                raise ValidationError({'invitation': 'Invitation not found.'})

        if invitation.status == VolunteerInvitation.Status.ACCEPTED:
            raise ValidationError({'invitation': 'Cannot resend an already accepted invitation.'})

        if invitation.status == VolunteerInvitation.Status.REVOKED:
            raise ValidationError({'invitation': 'Cannot resend a revoked invitation.'})

        invitation.token_hash = new_token_hash
        invitation.encrypted_delivery_token = new_encrypted_token
        invitation.status = VolunteerInvitation.Status.PENDING
        invitation.expires_at = new_expiry
        invitation.email_sent = False
        invitation.email_error = ''
        invitation.save(update_fields=['token_hash', 'encrypted_delivery_token', 'status', 'expires_at', 'email_sent', 'email_error', 'updated_at'])

        AuditLog.objects.create(
            user=admin_user if (admin_user and admin_user.is_authenticated) else None,
            action='UPDATE',
            entity_type='VolunteerInvitation',
            entity_id=str(invitation.id),
            description=f"Resent volunteer invitation to {invitation.email}.",
            ip_address=ip_address,
            metadata={'email': invitation.email, 'expires_at': str(new_expiry)}
        )

    # Pass only invitation ID to Celery
    send_volunteer_invitation_email.delay(str(invitation.id))
    return invitation, new_raw_token


def revoke_invitation(invitation_or_id, admin_user=None, reason=None, ip_address=None):
    """
    Revokes an active or pending invitation under database row lock (select_for_update).
    Purges any pending encrypted delivery token.
    """
    with transaction.atomic():
        if isinstance(invitation_or_id, VolunteerInvitation):
            invitation = VolunteerInvitation.objects.select_for_update().get(id=invitation_or_id.id)
        else:
            invitation = VolunteerInvitation.objects.select_for_update().filter(id=invitation_or_id).first()
            if not invitation:
                raise ValidationError({'invitation': 'Invitation not found.'})

        if invitation.status == VolunteerInvitation.Status.ACCEPTED:
            raise ValidationError({'invitation': 'Cannot revoke an already accepted invitation.'})

        if invitation.status == VolunteerInvitation.Status.REVOKED:
            return invitation

        invitation.status = VolunteerInvitation.Status.REVOKED
        invitation.encrypted_delivery_token = None
        invitation.save(update_fields=['status', 'encrypted_delivery_token', 'updated_at'])

        desc = f"Revoked volunteer invitation for {invitation.email}."
        if reason:
            desc += f" Reason: {reason}"
        meta = {'email': invitation.email}
        if reason:
            meta['reason'] = reason

        AuditLog.objects.create(
            user=admin_user if (admin_user and admin_user.is_authenticated) else None,
            action='UPDATE',
            entity_type='VolunteerInvitation',
            entity_id=str(invitation.id),
            description=desc,
            ip_address=ip_address,
            metadata=meta
        )

    return invitation
