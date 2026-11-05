import hashlib
import io
from datetime import timedelta
from unittest.mock import patch, MagicMock

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import OTP
from apps.core.models import AuditLog
from apps.volunteers.models import (
    VolunteerProfile,
    VolunteerOnboardingApplication,
    VolunteerInvitationBatch,
    VolunteerInvitation,
)
from apps.volunteers import services
from apps.volunteers.tasks import send_volunteer_invitation_email

User = get_user_model()


class BaseInvitationTestCase(APITestCase):
    def setUp(self):
        # Mock Celery delay across API tests to avoid requiring live Redis broker
        self.email_delay_patcher = patch('apps.volunteers.services.send_volunteer_invitation_email.delay')
        self.mock_email_delay = self.email_delay_patcher.start()
        self.addCleanup(self.email_delay_patcher.stop)

        # 1. Admin user
        self.admin_user = User.objects.create_superuser(
            email='admin.inviter@test.org',
            password='AdminPassword@2026',
            first_name='Admin',
            last_name='Inviter',
        )

        # 2. Staff user
        self.staff_user = User.objects.create_user(
            email='staff.coordinator@test.org',
            password='StaffPassword@2026',
            first_name='Staff',
            last_name='Coordinator',
            role=User.Role.VOLUNTEER_MANAGER,
            is_staff=True,
        )

        # 3. Regular approved volunteer
        self.regular_volunteer = User.objects.create_user(
            email='regular.volunteer@test.org',
            password='VolPassword@2026',
            first_name='Regular',
            last_name='Volunteer',
            role=User.Role.VOLUNTEER,
            is_verified=True,
        )
        self.regular_profile = services.get_or_create_volunteer_profile_for_user(self.regular_volunteer)
        self.regular_profile.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
        self.regular_profile.is_active = True
        self.regular_profile.save()

        # 4. Donor user (existing account for linking tests)
        self.donor_user = User.objects.create_user(
            email='generous.donor@test.org',
            password='DonorPassword@2026',
            first_name='Generous',
            last_name='Donor',
            role=User.Role.DONOR,
            is_verified=True,
        )


class CSVProcessingTests(BaseInvitationTestCase):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.admin_user)
        self.upload_url = reverse('volunteers:volunteer-invitation-batch-upload-preview')

    def test_valid_csv_standard_header(self):
        csv_content = b"email\nv1@test.org\nv2@test.org\nv3@test.org\n"
        uploaded_file = SimpleUploadedFile("volunteers.csv", csv_content, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data

        self.assertEqual(data['batch']['total_rows'], 3)
        self.assertEqual(data['batch']['valid_rows'], 3)
        self.assertEqual(data['batch']['duplicate_rows'], 0)
        self.assertEqual(data['batch']['rejected_rows'], 0)
        self.assertEqual(len(data['summary']['valid_emails']), 3)

    def test_valid_csv_alternative_casing_and_whitespace(self):
        csv_content = b"  Email  \n  ALICE@test.org  \n  bob.smith@domain.co.in \n"
        uploaded_file = SimpleUploadedFile("volunteers.csv", csv_content, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        batch = response.data['batch']

        self.assertEqual(batch['total_rows'], 2)
        self.assertEqual(batch['valid_rows'], 2)
        self.assertIn('alice@test.org', response.data['summary']['valid_emails'])
        self.assertIn('bob.smith@domain.co.in', response.data['summary']['valid_emails'])

    def test_valid_csv_additional_columns_ignored(self):
        csv_content = b"Full Name,email,Phone,City\nAlice Smith,alice.extra@test.org,+919999999999,Bengaluru\n"
        uploaded_file = SimpleUploadedFile("volunteers.csv", csv_content, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['batch']['valid_rows'], 1)
        self.assertEqual(response.data['summary']['valid_emails'], ['alice.extra@test.org'])

    def test_empty_csv_file_rejected(self):
        uploaded_file = SimpleUploadedFile("empty.csv", b"", content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('empty', str(response.data).lower())

    def test_non_csv_file_rejected(self):
        uploaded_file = SimpleUploadedFile("document.pdf", b"%PDF-1.4...", content_type="application/pdf")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('.csv', str(response.data).lower())

    def test_oversized_file_rejected(self):
        # 2MB limit
        large_bytes = b"email\n" + (b"test@test.org\n" * 150000)
        uploaded_file = SimpleUploadedFile("large.csv", large_bytes, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('size', str(response.data).lower())

    def test_file_exceeding_row_limit_rejected(self):
        # 500 rows limit
        lines = ["email"] + [f"user{i}@test.org" for i in range(505)]
        csv_content = "\n".join(lines).encode('utf-8')
        uploaded_file = SimpleUploadedFile("too_many.csv", csv_content, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('500', str(response.data))

    def test_malformed_csv_no_email_header(self):
        csv_content = b"name,phone,city\nAlice,9999999999,Bengaluru\n"
        uploaded_file = SimpleUploadedFile("bad_header.csv", csv_content, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', str(response.data).lower())

    def test_invalid_email_format_rows_counted_as_rejected(self):
        csv_content = b"email\nvalid@test.org\nnot-an-email\nmissing-domain@\n"
        uploaded_file = SimpleUploadedFile("invalid.csv", csv_content, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        batch = response.data['batch']

        self.assertEqual(batch['total_rows'], 3)
        self.assertEqual(batch['valid_rows'], 1)
        self.assertEqual(batch['rejected_rows'], 2)

    def test_duplicate_emails_in_csv_counted_as_duplicates(self):
        csv_content = b"email\nsame@test.org\nSAME@test.org\nsame@test.org\nunique@test.org\n"
        uploaded_file = SimpleUploadedFile("duplicates.csv", csv_content, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        batch = response.data['batch']

        self.assertEqual(batch['total_rows'], 4)
        self.assertEqual(batch['valid_rows'], 2)
        self.assertEqual(batch['duplicate_rows'], 2)

    def test_email_with_existing_approved_profile_counted_as_rejected(self):
        csv_content = f"email\n{self.regular_volunteer.email}\nnew.vol@test.org\n".encode('utf-8')
        uploaded_file = SimpleUploadedFile("approved.csv", csv_content, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        batch = response.data['batch']

        self.assertEqual(batch['valid_rows'], 1)
        self.assertEqual(batch['rejected_rows'], 1)
        self.assertIn('already approved', str(response.data['summary']['rejected_details']).lower())

    def test_email_with_active_pending_invitation_counted_as_duplicate(self):
        services.create_individual_invitation(email='pending.invitee@test.org', admin_user=self.admin_user)

        csv_content = b"email\npending.invitee@test.org\nfresh@test.org\n"
        uploaded_file = SimpleUploadedFile("pending.csv", csv_content, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        batch = response.data['batch']

        self.assertEqual(batch['valid_rows'], 1)
        self.assertEqual(batch['duplicate_rows'], 1)

    def test_existing_user_without_volunteer_profile_is_valid(self):
        # self.donor_user has an account but no VolunteerProfile
        csv_content = f"email\n{self.donor_user.email}\n".encode('utf-8')
        uploaded_file = SimpleUploadedFile("donor.csv", csv_content, content_type="text/csv")

        response = self.client.post(self.upload_url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['batch']['valid_rows'], 1)


class TokenSecurityTests(BaseInvitationTestCase):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.admin_user)

    def test_token_generation_and_hashing(self):
        invitation, raw_token = services.create_individual_invitation(
            email='security.check@test.org',
            admin_user=self.admin_user
        )

        # 32 bytes URL-safe generates a 43+ char string
        self.assertGreaterEqual(len(raw_token), 42)
        # Database holds SHA-256 hash (64 hex characters)
        self.assertEqual(len(invitation.token_hash), 64)
        self.assertEqual(hashlib.sha256(raw_token.encode('utf-8')).hexdigest(), invitation.token_hash)
        # Raw token is NOT stored anywhere in plaintext
        self.assertNotEqual(raw_token, invitation.token_hash)

    def test_raw_token_never_in_list_or_retrieve_api(self):
        invitation, raw_token = services.create_individual_invitation(
            email='no.leak@test.org',
            admin_user=self.admin_user
        )

        list_url = reverse('volunteers:volunteer-invitation-list')
        response = self.client.get(list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        serialized_data_str = str(response.data)
        self.assertNotIn(raw_token, serialized_data_str)
        self.assertNotIn('token_hash', serialized_data_str)
        self.assertNotIn('encrypted_delivery_token', serialized_data_str)

        detail_url = reverse('volunteers:volunteer-invitation-detail', kwargs={'pk': invitation.id})
        detail_response = self.client.get(detail_url)
        self.assertNotIn(raw_token, str(detail_response.data))
        self.assertNotIn('token_hash', str(detail_response.data))
        self.assertNotIn('encrypted_delivery_token', str(detail_response.data))

    def test_get_method_rejected_with_405(self):
        validate_url = reverse('volunteers:volunteer-invitation-validate')
        response = self.client.get(f"{validate_url}?token=some_token")
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_token_validation_succeeds_for_valid_token(self):
        invitation, raw_token = services.create_individual_invitation(
            email='valid.token@test.org',
            admin_user=self.admin_user
        )

        validate_url = reverse('volunteers:volunteer-invitation-validate')
        # Test POST
        post_response = self.client.post(validate_url, {'token': raw_token})
        self.assertEqual(post_response.status_code, status.HTTP_200_OK)
        self.assertTrue(post_response.data['valid'])
        self.assertEqual(post_response.data['email'], 'valid.token@test.org')
        self.assertFalse(post_response.data['has_existing_user'])

    def test_token_validation_fails_for_expired_token(self):
        invitation, raw_token = services.create_individual_invitation(
            email='expired@test.org',
            admin_user=self.admin_user
        )
        invitation.expires_at = timezone.now() - timedelta(days=1)
        invitation.save(update_fields=['expires_at'])

        validate_url = reverse('volunteers:volunteer-invitation-validate')
        response = self.client.post(validate_url, {'token': raw_token})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expired', str(response.data).lower())

        invitation.refresh_from_db()
        self.assertEqual(invitation.status, VolunteerInvitation.Status.EXPIRED)

    def test_token_validation_fails_for_revoked_token(self):
        invitation, raw_token = services.create_individual_invitation(
            email='revoked@test.org',
            admin_user=self.admin_user
        )
        services.revoke_invitation(invitation.id, self.admin_user, reason="Revoked by admin")

        validate_url = reverse('volunteers:volunteer-invitation-validate')
        response = self.client.post(validate_url, {'token': raw_token})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('revoked', str(response.data).lower())

    def test_token_validation_fails_for_accepted_token(self):
        invitation, raw_token = services.create_individual_invitation(
            email='already.accepted@test.org',
            admin_user=self.admin_user
        )
        invitation.status = VolunteerInvitation.Status.ACCEPTED
        invitation.save(update_fields=['status'])

        validate_url = reverse('volunteers:volunteer-invitation-validate')
        response = self.client.post(validate_url, {'token': raw_token})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already', str(response.data).lower())

    def test_token_validation_fails_for_tampered_token(self):
        validate_url = reverse('volunteers:volunteer-invitation-validate')
        response = self.client.post(validate_url, {'token': 'completely_invalid_random_token_12345'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('invalid', str(response.data).lower())

    def test_resending_invitation_invalidates_old_token(self):
        invitation, old_raw_token = services.create_individual_invitation(
            email='resend.test@test.org',
            admin_user=self.admin_user
        )

        resend_url = reverse('volunteers:volunteer-invitation-resend', kwargs={'pk': invitation.id})
        response = self.client.post(resend_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        invitation.refresh_from_db()
        old_hash = hashlib.sha256(old_raw_token.encode('utf-8')).hexdigest()
        self.assertNotEqual(invitation.token_hash, old_hash)

        # Old token now fails validation
        validate_url = reverse('volunteers:volunteer-invitation-validate')
        old_resp = self.client.post(validate_url, {'token': old_raw_token})
        self.assertEqual(old_resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_revoking_invitation_updates_status_and_records_audit_log(self):
        invitation, raw_token = services.create_individual_invitation(
            email='revoke.test@test.org',
            admin_user=self.admin_user
        )

        revoke_url = reverse('volunteers:volunteer-invitation-revoke', kwargs={'pk': invitation.id})
        response = self.client.post(revoke_url, {'reason': 'Uploaded in error'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        invitation.refresh_from_db()
        self.assertEqual(invitation.status, VolunteerInvitation.Status.REVOKED)
        self.assertIsNone(invitation.encrypted_delivery_token)

        # Verify audit log
        log = AuditLog.objects.filter(entity_type='VolunteerInvitation', entity_id=str(invitation.id), action='UPDATE').first()
        self.assertIsNotNone(log)
        self.assertIn('revoked', log.description.lower())
        self.assertNotIn(raw_token, log.description)

    def test_cannot_resend_revoked_invitation(self):
        invitation, raw_token = services.create_individual_invitation(
            email='no.resend.revoked@test.org',
            admin_user=self.admin_user
        )
        services.revoke_invitation(invitation.id, self.admin_user, reason="Revoked")

        resend_url = reverse('volunteers:volunteer-invitation-resend', kwargs={'pk': invitation.id})
        response = self.client.post(resend_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('revoked', str(response.data).lower())

    def test_cannot_resend_accepted_invitation(self):
        invitation, raw_token = services.create_individual_invitation(
            email='no.resend.accepted@test.org',
            admin_user=self.admin_user
        )
        invitation.status = VolunteerInvitation.Status.ACCEPTED
        invitation.save(update_fields=['status'])

        resend_url = reverse('volunteers:volunteer-invitation-resend', kwargs={'pk': invitation.id})
        response = self.client.post(resend_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('accepted', str(response.data).lower())

    def test_can_resend_expired_invitation(self):
        invitation, raw_token = services.create_individual_invitation(
            email='resend.expired@test.org',
            admin_user=self.admin_user
        )
        invitation.status = VolunteerInvitation.Status.EXPIRED
        invitation.expires_at = timezone.now() - timedelta(days=2)
        invitation.save(update_fields=['status', 'expires_at'])

        resend_url = reverse('volunteers:volunteer-invitation-resend', kwargs={'pk': invitation.id})
        response = self.client.post(resend_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        invitation.refresh_from_db()
        self.assertEqual(invitation.status, VolunteerInvitation.Status.PENDING)
        self.assertGreater(invitation.expires_at, timezone.now())

    def test_celery_task_receives_only_uuid_not_raw_token(self):
        self.mock_email_delay.reset_mock()
        invitation, raw_token = services.create_individual_invitation(
            email='celery.arg.check@test.org',
            admin_user=self.admin_user
        )
        self.mock_email_delay.assert_called_once()
        call_args, call_kwargs = self.mock_email_delay.call_args
        self.assertEqual(call_args, (str(invitation.id),))
        self.assertNotIn(raw_token, str(call_args))

    def test_batch_list_excludes_detailed_summary(self):
        csv_content = b"email\nb1@test.org\nb2@test.org\n"
        uploaded_file = SimpleUploadedFile("batch_min.csv", csv_content, content_type="text/csv")
        upload_url = reverse('volunteers:volunteer-invitation-batch-upload-preview')
        self.client.post(upload_url, {'file': uploaded_file}, format='multipart')

        list_url = reverse('volunteers:volunteer-invitation-batch-list')
        response = self.client.get(list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertGreater(len(results), 0)
        for item in results:
            self.assertNotIn('summary', item)

    def test_batch_detail_retains_detailed_summary(self):
        csv_content = b"email\nbdetail1@test.org\n"
        uploaded_file = SimpleUploadedFile("batch_detail.csv", csv_content, content_type="text/csv")
        upload_url = reverse('volunteers:volunteer-invitation-batch-upload-preview')
        resp = self.client.post(upload_url, {'file': uploaded_file}, format='multipart')
        batch_id = resp.data['batch']['id']

        detail_url = reverse('volunteers:volunteer-invitation-batch-detail', kwargs={'pk': batch_id})
        detail_resp = self.client.get(detail_url)
        self.assertEqual(detail_resp.status_code, status.HTTP_200_OK)
        self.assertIn('summary', detail_resp.data)
        self.assertIn('valid_emails', detail_resp.data['summary'])

    def test_concurrent_registration_integrity_error_handled_gracefully(self):
        from django.db import IntegrityError
        from rest_framework.exceptions import ValidationError
        invitation, raw_token = services.create_individual_invitation(
            email='integrity.race@test.org',
            admin_user=self.admin_user
        )

        with patch('apps.accounts.models.User.objects.create_user', side_effect=IntegrityError("duplicate key value")):
            with self.assertRaises(ValidationError) as ctx:
                services.accept_invitation_and_register(
                    raw_token=raw_token,
                    registration_data={
                        'password': 'Password@2026',
                        'confirm_password': 'Password@2026',
                        'first_name': 'Race',
                        'last_name': 'Condition',
                    }
                )
            self.assertIn('recently created', str(ctx.exception).lower())


class RegistrationWorkflowTests(BaseInvitationTestCase):
    def setUp(self):
        super().setUp()
        self.invitation, self.raw_token = services.create_individual_invitation(
            email='new.invited.volunteer@test.org',
            admin_user=self.admin_user
        )
        self.accept_url = reverse('volunteers:volunteer-invitation-accept')

    def test_invited_volunteer_registers_successfully(self):
        # Client unauthenticated (public user)
        self.client.logout()

        payload = {
            'token': self.raw_token,
            'password': 'SecureVolunteer@2026',
            'confirm_password': 'SecureVolunteer@2026',
            'first_name': 'Meera',
            'last_name': 'Natarajan',
            'phone': '+91 98765 43210',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'occupation': 'Biologist',
            'skills': 'Water Testing, Community Outreach',
            'availability': 'Weekends',
            'bio': 'Passionate about local environmental causes.',
        }

        response = self.client.post(self.accept_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        self.assertIn('access', data)
        self.assertIn('refresh', data)

        # Verify User created
        user = User.objects.get(email='new.invited.volunteer@test.org')
        self.assertEqual(user.first_name, 'Meera')
        self.assertEqual(user.last_name, 'Natarajan')
        self.assertEqual(user.role, User.Role.VOLUNTEER)
        self.assertTrue(user.is_verified)
        self.assertTrue(user.is_active)

        # Verify VolunteerProfile
        profile = VolunteerProfile.objects.get(user=user)
        self.assertEqual(profile.email, 'new.invited.volunteer@test.org')
        self.assertEqual(profile.approval_status, VolunteerProfile.ApprovalStatus.APPROVED)
        self.assertTrue(profile.is_active)
        self.assertEqual(profile.registration_source, VolunteerProfile.RegistrationSource.ADMIN_ADDED)

        # Verify Invitation updated
        self.invitation.refresh_from_db()
        self.assertEqual(self.invitation.status, VolunteerInvitation.Status.ACCEPTED)
        self.assertIsNotNone(self.invitation.accepted_at)
        self.assertEqual(self.invitation.volunteer_profile, profile)

        # Verify NO onboarding application was created
        self.assertFalse(VolunteerOnboardingApplication.objects.filter(volunteer_profile=profile).exists())

        # Verify immediate access to volunteer portal endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        profile_resp = self.client.get(reverse('volunteers:my-volunteer-profile'))
        self.assertEqual(profile_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_resp.data['approval_status'], 'APPROVED')

    def test_reattempting_registration_with_used_token_rejected(self):
        self.client.logout()
        payload = {
            'token': self.raw_token,
            'password': 'SecureVolunteer@2026',
            'confirm_password': 'SecureVolunteer@2026',
            'first_name': 'First',
            'last_name': 'Attempt',
        }
        resp1 = self.client.post(self.accept_url, payload, format='json')
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)

        # Second attempt
        resp2 = self.client.post(self.accept_url, payload, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already', str(resp2.data).lower())

    def test_registration_with_mismatched_password_rejected(self):
        self.client.logout()
        payload = {
            'token': self.raw_token,
            'password': 'PasswordOne@123',
            'confirm_password': 'PasswordTwo@123',
            'first_name': 'Test',
        }
        response = self.client.post(self.accept_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', response.data)

        # Ensure no user was created
        self.assertFalse(User.objects.filter(email='new.invited.volunteer@test.org').exists())

    def test_registration_with_weak_password_rejected(self):
        self.client.logout()
        payload = {
            'token': self.raw_token,
            'password': '123',
            'confirm_password': '123',
            'first_name': 'Test',
        }
        response = self.client.post(self.accept_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

        # Ensure no user was created
        self.assertFalse(User.objects.filter(email='new.invited.volunteer@test.org').exists())

    def test_atomic_rollback_on_failure(self):
        self.client.logout()
        payload = {
            'token': self.raw_token,
            'password': 'ValidPassword@2026',
            'confirm_password': 'ValidPassword@2026',
            'first_name': 'Test',
        }

        # Simulate exception during VolunteerProfile.objects.create
        with patch('apps.volunteers.models.VolunteerProfile.objects.create', side_effect=RuntimeError("Simulated database crash")):
            with self.assertRaises(RuntimeError):
                self.client.post(self.accept_url, payload, format='json')

        # Verify transaction rolled back: no user created, invitation still pending
        self.assertFalse(User.objects.filter(email='new.invited.volunteer@test.org').exists())
        self.invitation.refresh_from_db()
        self.assertEqual(self.invitation.status, VolunteerInvitation.Status.PENDING)


class ExistingUserLinkingWorkflowTests(BaseInvitationTestCase):
    def setUp(self):
        super().setUp()
        self.invitation, self.raw_token = services.create_individual_invitation(
            email=self.donor_user.email,
            admin_user=self.admin_user
        )
        self.accept_url = reverse('volunteers:volunteer-invitation-accept')

    def test_existing_user_cannot_silently_link_without_credentials(self):
        self.client.logout()
        # Attempt accepting with empty credentials
        payload = {
            'token': self.raw_token,
            'skills': 'Event coordination',
        }
        response = self.client.post(self.accept_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', str(response.data).lower())

    def test_existing_user_linking_with_password_verification(self):
        self.client.logout()
        payload = {
            'token': self.raw_token,
            'existing_password': 'DonorPassword@2026',
            'skills': 'Fundraising and Outreach',
            'availability': 'Flexible',
        }

        response = self.client.post(self.accept_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify existing user role preserved (still DONOR)
        self.donor_user.refresh_from_db()
        self.assertEqual(self.donor_user.role, User.Role.DONOR)

        # Verify VolunteerProfile linked
        profile = VolunteerProfile.objects.get(user=self.donor_user)
        self.assertEqual(profile.approval_status, VolunteerProfile.ApprovalStatus.APPROVED)
        self.assertTrue(profile.is_active)
        self.assertEqual(profile.registration_source, VolunteerProfile.RegistrationSource.ADMIN_ADDED)

    def test_existing_user_linking_with_incorrect_password_rejected(self):
        self.client.logout()
        payload = {
            'token': self.raw_token,
            'existing_password': 'WrongPassword@999',
        }
        response = self.client.post(self.accept_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('existing_password', response.data)

        # VolunteerProfile not created
        self.assertFalse(VolunteerProfile.objects.filter(email=self.donor_user.email).exists())

    def test_existing_user_linking_with_otp_verification(self):
        self.client.logout()
        # Request OTP
        req_otp_url = reverse('volunteers:volunteer-invitation-request-otp')
        otp_resp = self.client.post(req_otp_url, {'token': self.raw_token})
        self.assertEqual(otp_resp.status_code, status.HTTP_200_OK)

        # Get generated OTP
        otp_obj = OTP.objects.filter(user=self.donor_user, is_used=False).latest('created_at')

        payload = {
            'token': self.raw_token,
            'otp_code': otp_obj.code,
            'skills': 'Donor Relations',
        }
        response = self.client.post(self.accept_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        otp_obj.refresh_from_db()
        self.assertTrue(otp_obj.is_used)

        profile = VolunteerProfile.objects.get(user=self.donor_user)
        self.assertEqual(profile.approval_status, VolunteerProfile.ApprovalStatus.APPROVED)

    def test_authenticated_existing_user_linking_session(self):
        # User already logged into the portal
        self.client.force_authenticate(user=self.donor_user)
        payload = {
            'token': self.raw_token,
            'skills': 'Community Liaison',
        }
        response = self.client.post(self.accept_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile = VolunteerProfile.objects.get(user=self.donor_user)
        self.assertEqual(profile.approval_status, VolunteerProfile.ApprovalStatus.APPROVED)


class EmailDeliveryTests(BaseInvitationTestCase):
    def test_celery_task_success_marks_email_sent_and_purges_delivery_token(self):
        invitation, raw_token = services.create_individual_invitation(
            email='delivery.success@test.org',
            admin_user=self.admin_user
        )

        # Delivery token exists in DB before sending
        invitation.refresh_from_db()
        self.assertIsNotNone(invitation.encrypted_delivery_token)

        with patch('apps.volunteers.tasks._send_templated_email') as mock_email:
            success = send_volunteer_invitation_email(invitation.id)
            self.assertTrue(success)
            self.assertTrue(mock_email.called)

        invitation.refresh_from_db()
        self.assertTrue(invitation.email_sent)
        self.assertIsNotNone(invitation.email_sent_at)
        self.assertEqual(invitation.email_error, '')
        # Authenticated token purged from DB after successful send
        self.assertIsNone(invitation.encrypted_delivery_token)

    def test_celery_task_failure_records_error(self):
        from celery.exceptions import Retry

        invitation, raw_token = services.create_individual_invitation(
            email='delivery.failure@test.org',
            admin_user=self.admin_user
        )

        with patch('apps.volunteers.tasks._send_templated_email', side_effect=Exception("SMTP connection refused")):
            with patch('django.core.mail.send_mail', side_effect=Exception("SMTP connection refused")):
                with patch.object(send_volunteer_invitation_email, 'retry', side_effect=Retry("Simulated retry")):
                    with self.assertRaises(Retry):
                        send_volunteer_invitation_email(invitation.id)

        invitation.refresh_from_db()
        self.assertFalse(invitation.email_sent)
        self.assertIsNotNone(invitation.email_error)
        self.assertIn('SMTP connection refused', invitation.email_error)
        # On failure/retry, delivery token is preserved so retry can deliver without generating a new token
        self.assertIsNotNone(invitation.encrypted_delivery_token)

    def test_email_content_contains_fragment_token_link_and_branding(self):
        invitation, raw_token = services.create_individual_invitation(
            email='content.test@test.org',
            admin_user=self.admin_user
        )

        context = {
            'email': invitation.email,
            'expiry_date': invitation.expires_at.strftime('%B %d, %Y at %I:%M %p UTC'),
            'registration_url': f"http://localhost:5173/volunteer-invitation/accept#token={raw_token}",
            'contact_email': 'contact@responsibleindividuals.org',
            'site_name': 'Responsible Individuals',
        }
        body_html = render_to_string('volunteers/emails/volunteer_invitation.html', context)
        body_txt = render_to_string('volunteers/emails/volunteer_invitation.txt', context)

        # URL fragment format verified in both formats
        self.assertIn(f"#token={raw_token}", body_txt)
        self.assertIn(f"#token={raw_token}", body_html)
        self.assertNotIn(f"?token={raw_token}", body_txt)
        self.assertNotIn(f"?token={raw_token}", body_html)

        # Organization branding
        self.assertIn('Responsible Individuals', body_txt)
        self.assertIn('Responsible Individuals', body_html)

        # Expiration note
        self.assertIn('expire', body_txt.lower())
        self.assertIn('expire', body_html.lower())


class PermissionsAndAuthorizationTests(BaseInvitationTestCase):
    def test_anonymous_user_blocked_from_admin_endpoints(self):
        self.client.logout()

        upload_url = reverse('volunteers:volunteer-invitation-batch-upload-preview')
        list_url = reverse('volunteers:volunteer-invitation-list')
        indiv_url = reverse('volunteers:volunteer-invitation-send-individual')

        self.assertEqual(self.client.post(upload_url).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(list_url).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.post(indiv_url).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_volunteer_blocked_from_admin_endpoints(self):
        self.client.force_authenticate(user=self.regular_volunteer)

        upload_url = reverse('volunteers:volunteer-invitation-batch-upload-preview')
        list_url = reverse('volunteers:volunteer-invitation-list')
        indiv_url = reverse('volunteers:volunteer-invitation-send-individual')

        self.assertEqual(self.client.post(upload_url).status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.get(list_url).status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.post(indiv_url).status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_and_admin_permitted_on_admin_endpoints(self):
        self.client.force_authenticate(user=self.staff_user)
        list_url = reverse('volunteers:volunteer-invitation-list')
        self.assertEqual(self.client.get(list_url).status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.admin_user)
        self.assertEqual(self.client.get(list_url).status_code, status.HTTP_200_OK)

    def test_public_invitation_endpoints_accessible_without_auth(self):
        self.client.logout()

        validate_url = reverse('volunteers:volunteer-invitation-validate')
        otp_url = reverse('volunteers:volunteer-invitation-request-otp')
        accept_url = reverse('volunteers:volunteer-invitation-accept')

        # Should not return 401/403
        self.assertNotEqual(self.client.get(validate_url).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotEqual(self.client.post(otp_url, {}).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotEqual(self.client.post(accept_url, {}).status_code, status.HTTP_401_UNAUTHORIZED)


class AuditLoggingTests(BaseInvitationTestCase):
    def test_audit_logs_created_without_raw_tokens(self):
        # 1. Batch upload log
        csv_content = b"email\naudit1@test.org\naudit2@test.org\n"
        uploaded_file = SimpleUploadedFile("audit.csv", csv_content, content_type="text/csv")

        self.client.force_authenticate(user=self.admin_user)
        upload_url = reverse('volunteers:volunteer-invitation-batch-upload-preview')
        resp = self.client.post(upload_url, {'file': uploaded_file}, format='multipart')
        batch_id = resp.data['batch']['id']

        batch_log = AuditLog.objects.filter(entity_type='VolunteerInvitationBatch', entity_id=batch_id).first()
        self.assertIsNotNone(batch_log)
        self.assertEqual(batch_log.action, 'CREATE')

        # 2. Batch send log
        send_url = reverse('volunteers:volunteer-invitation-batch-send', kwargs={'pk': batch_id})
        send_resp = self.client.post(send_url)
        self.assertEqual(send_resp.status_code, status.HTTP_200_OK)

        batch_send_log = AuditLog.objects.filter(entity_type='VolunteerInvitationBatch', entity_id=batch_id, action='UPDATE').first()
        self.assertIsNotNone(batch_send_log)

        # 3. Individual invitation send & revoke
        invitation, raw_token = services.create_individual_invitation(
            email='audit.indiv@test.org',
            admin_user=self.admin_user
        )
        inv_log = AuditLog.objects.filter(entity_type='VolunteerInvitation', entity_id=str(invitation.id)).first()
        self.assertIsNotNone(inv_log)
        self.assertNotIn(raw_token, str(inv_log.metadata))
        self.assertNotIn(raw_token, inv_log.description)

        # 4. Acceptance log
        res = services.accept_invitation_and_register(
            raw_token=raw_token,
            registration_data={
                'password': 'AuditPassword@2026',
                'confirm_password': 'AuditPassword@2026',
                'first_name': 'Audit',
                'last_name': 'Tester',
            }
        )
        accept_log = AuditLog.objects.filter(
            entity_type='VolunteerInvitation',
            entity_id=str(invitation.id),
            action='UPDATE'
        ).last()
        self.assertIsNotNone(accept_log)
        self.assertNotIn(raw_token, str(accept_log.metadata))
        self.assertNotIn(raw_token, accept_log.description)
