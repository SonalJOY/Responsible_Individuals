import uuid
from decimal import Decimal
from django.db import models, transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import UserProfile
from .models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
    Certificate,
)
from .tasks import (
    send_volunteer_registration_email,
    send_admin_registration_email,
    send_application_confirmation_email,
    send_application_status_email,
)

User = get_user_model()


def register_volunteer(validated_data):
    """
    Registers a new volunteer atomically:
    1. Creates a User with role=VOLUNTEER
    2. Creates a linked UserProfile
    3. Creates or links the VolunteerProfile
    4. Attaches VolunteerInterests
    5. Dispatches volunteer confirmation and admin notification emails on successful commit.
    6. Returns user, profile, and SimpleJWT tokens.
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

        # 1. Create User
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=User.Role.VOLUNTEER,
            is_verified=True,
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

        # 3. Create or link VolunteerProfile
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
                approval_status=VolunteerProfile.ApprovalStatus.APPROVED,
            )

        # 4. Attach Interests
        if interests:
            v_profile.interests.set(_resolve_interests(interests))

        # 5. Queue transactional confirmation emails on successful commit
        v_profile_id = str(v_profile.id)
        transaction.on_commit(lambda: send_volunteer_registration_email.delay(v_profile_id))
        transaction.on_commit(lambda: send_admin_registration_email.delay(v_profile_id))

        # 6. Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return {
            'user': user,
            'volunteer_profile': v_profile,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Volunteer registered successfully.'
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
                    approval_status=VolunteerProfile.ApprovalStatus.APPROVED,
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
