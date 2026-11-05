from datetime import timedelta
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.volunteers.models import VolunteerInterest, VolunteerProfile
from apps.volunteers import services
from apps.accounts.models import UserProfile

User = get_user_model()


class VolunteerRegistrationTests(APITestCase):
    def setUp(self):
        self.interest_lake = VolunteerInterest.objects.create(name='Lake & River Conservation', slug='lake-conservation')
        self.interest_stem = VolunteerInterest.objects.create(name='STEM Education', slug='stem-education')
        self.url = reverse('volunteers:volunteer-register')

    def test_new_volunteer_registration_initiates_otp_without_tokens(self):
        """
        Verify that POST /api/v1/volunteers/register/ initiates registration with email OTP
        without issuing tokens or creating an active/verified account prior to OTP verification.
        """
        payload = {
            'email': 'divya.nair@example.com',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123',
            'first_name': 'Divya',
            'last_name': 'Nair',
            'phone': '9845012345',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'occupation': 'Environmental Scientist',
            'skills': 'Water Testing, GIS',
            'availability': 'Weekends',
            'bio': 'Dedicated to urban lake revival.',
            'interests': ['lake-conservation', 'stem-education'],
        }
        res = self.client.post(self.url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # CRITICAL SECURITY ASSERTION: No authentication tokens issued prior to email verification
        self.assertNotIn('access', res.data)
        self.assertNotIn('refresh', res.data)
        self.assertTrue(res.data.get('requires_otp'))
        self.assertEqual(res.data.get('identifier'), 'divya.nair@example.com')
        self.assertIn('Warning', res.headers)
        self.assertIn('299', res.headers['Warning'])

        # Database assertions: Account starts unverified, inactive, and with role=PUBLIC
        user = User.objects.get(email='divya.nair@example.com')
        self.assertEqual(user.role, User.Role.PUBLIC)
        self.assertFalse(user.is_verified)
        self.assertFalse(user.is_active)

        user_profile = UserProfile.objects.get(user=user)
        self.assertEqual(user_profile.city, 'Bengaluru')

        # VolunteerProfile starts PENDING
        v_profile = VolunteerProfile.objects.get(user=user)
        self.assertEqual(v_profile.approval_status, VolunteerProfile.ApprovalStatus.PENDING)
        self.assertEqual(v_profile.full_name, 'Divya Nair')
        self.assertEqual(v_profile.email, 'divya.nair@example.com')
        self.assertEqual(v_profile.phone, '9845012345')
        self.assertEqual(v_profile.skills, 'Water Testing, GIS')
        self.assertEqual(v_profile.interests.count(), 2)

        # OTP record was generated and associated with user
        from apps.accounts.models import OTP
        otp = user.otps.filter(is_used=False).latest('created_at')
        self.assertIsNotNone(otp)
        self.assertEqual(otp.purpose, 'email')

    def test_unverified_account_cannot_login_or_access_protected_routes(self):
        """
        Verify that registering via the legacy endpoint does not allow bypass of OTP:
        the account cannot log in with password until email OTP verification is complete.
        """
        payload = {
            'email': 'unverified.bypass@example.com',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123',
            'first_name': 'Unverified',
            'phone': '9845012345',
        }
        res = self.client.post(self.url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Password login attempt MUST be rejected with 403 Forbidden because is_active=False
        login_res = self.client.post(
            reverse('accounts:login'),
            {'identifier': 'unverified.bypass@example.com', 'password': 'SecurePassword@123'},
            format='json'
        )
        self.assertEqual(login_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Account not verified', str(login_res.data))

        # Direct protected route access without token returns 401 Unauthorized
        profile_res = self.client.get(reverse('volunteers:my-volunteer-profile'))
        self.assertEqual(profile_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_otp_verification_activates_account_without_approving_volunteer_profile(self):
        """
        Verify that verifying OTP activates the user and returns tokens,
        but does NOT approve the volunteer profile (approval_status remains PENDING).
        """
        payload = {
            'email': 'verify.flow@example.com',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123',
            'first_name': 'Flow',
            'phone': '9845012345',
        }
        self.client.post(self.url, payload, format='json')
        user = User.objects.get(email='verify.flow@example.com')
        v_profile = VolunteerProfile.objects.get(user=user)
        self.assertEqual(v_profile.approval_status, VolunteerProfile.ApprovalStatus.PENDING)

        otp = user.otps.filter(is_used=False).latest('created_at')

        # Standard OTP verification
        verify_res = self.client.post(
            reverse('accounts:verify_otp'),
            {'identifier': user.email, 'code': otp.code},
            format='json'
        )
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', verify_res.data)
        self.assertIn('refresh', verify_res.data)

        user.refresh_from_db()
        self.assertTrue(user.is_verified)
        self.assertTrue(user.is_active)
        self.assertEqual(user.role, User.Role.PUBLIC)

        # Profile remains PENDING after email verification alone
        v_profile.refresh_from_db()
        self.assertEqual(v_profile.approval_status, VolunteerProfile.ApprovalStatus.PENDING)

    def test_duplicate_email_registration_rejected(self):
        # Existing user
        User.objects.create_user(email='existing@example.com', password='SecurePassword@123')

        payload = {
            'email': 'existing@example.com',
            'password': 'NewPassword@123',
            'first_name': 'Duplicate',
            'last_name': 'User',
            'phone': '9845000000',
        }
        res = self.client.post(self.url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data)
        self.assertEqual(User.objects.filter(email='existing@example.com').count(), 1)
        self.assertEqual(VolunteerProfile.objects.filter(email='existing@example.com').count(), 0)

    def test_invalid_registration_missing_required_fields(self):
        # Missing email and password
        payload = {
            'first_name': 'Incomplete',
            'city': 'Bengaluru',
        }
        res = self.client.post(self.url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data)
        self.assertIn('password', res.data)
        self.assertEqual(User.objects.filter(first_name='Incomplete').count(), 0)

    def test_password_mismatch_rejected(self):
        payload = {
            'email': 'mismatch@example.com',
            'password': 'SecurePassword@123',
            'confirm_password': 'DifferentPassword@123',
            'first_name': 'Mismatch',
            'phone': '9845012345',
        }
        res = self.client.post(self.url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', res.data)
        self.assertFalse(User.objects.filter(email='mismatch@example.com').exists())

    def test_registration_links_existing_orphan_volunteer_profile(self):
        # Existing volunteer profile created without user
        orphan_profile = VolunteerProfile.objects.create(
            full_name='Pre-existing Volunteer',
            email='claimed@example.com',
            phone='9999911111',
            city='Bengaluru',
            skills='Teaching',
            availability='Flexible',
        )

        payload = {
            'email': 'claimed@example.com',
            'password': 'ClaimPassword@123',
            'first_name': 'Claimed',
            'last_name': 'Volunteer',
            'phone': '9999922222',
        }
        res = self.client.post(self.url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        orphan_profile.refresh_from_db()
        self.assertIsNotNone(orphan_profile.user)
        self.assertEqual(orphan_profile.user.email, 'claimed@example.com')
        self.assertEqual(VolunteerProfile.objects.filter(email='claimed@example.com').count(), 1)

    def test_registration_transaction_safety_rolls_back_on_error(self):
        from unittest.mock import patch
        payload = {
            'email': 'rollback.test@example.com',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123',
            'first_name': 'Rollback',
            'last_name': 'User',
            'phone': '9999988888',
        }
        # Force an unexpected failure inside the transaction
        with patch('apps.volunteers.services.VolunteerProfile.objects.create', side_effect=RuntimeError('Database simulation error')):
            with self.assertRaises(RuntimeError):
                services.register_volunteer(payload)

        # Verify no orphan User or VolunteerProfile was committed
        self.assertFalse(User.objects.filter(email='rollback.test@example.com').exists())
        self.assertFalse(VolunteerProfile.objects.filter(email='rollback.test@example.com').exists())

    def test_invalid_otp_code_rejected(self):
        """
        Submitting an incorrect OTP code fails validation and keeps the user unverified and inactive.
        """
        payload = {
            'email': 'invalid.otp@example.com',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123',
            'first_name': 'Invalid',
            'phone': '9845011111',
        }
        reg_res = self.client.post(self.url, payload, format='json')
        self.assertEqual(reg_res.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email='invalid.otp@example.com')
        otp = user.otps.filter(is_used=False).latest('created_at')

        wrong_code = '000000' if otp.code != '000000' else '111111'

        verify_res = self.client.post(
            reverse('accounts:verify_otp'),
            {'identifier': user.email, 'code': wrong_code},
            format='json'
        )
        self.assertEqual(verify_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid verification code', str(verify_res.data))

        user.refresh_from_db()
        self.assertFalse(user.is_verified)
        self.assertFalse(user.is_active)

    def test_expired_otp_code_rejected(self):
        """
        Submitting an expired OTP code fails validation with an expiration error and keeps the account unverified.
        """
        payload = {
            'email': 'expired.otp@example.com',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123',
            'first_name': 'Expired',
            'phone': '9845022222',
        }
        reg_res = self.client.post(self.url, payload, format='json')
        self.assertEqual(reg_res.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email='expired.otp@example.com')
        otp = user.otps.filter(is_used=False).latest('created_at')

        from apps.accounts.models import OTP
        OTP.objects.filter(id=otp.id).update(
            created_at=timezone.now() - timedelta(minutes=15)
        )
        otp.refresh_from_db()
        self.assertTrue(otp.is_expired)

        verify_res = self.client.post(
            reverse('accounts:verify_otp'),
            {'identifier': user.email, 'code': otp.code},
            format='json'
        )
        self.assertEqual(verify_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expired', str(verify_res.data).lower())

        user.refresh_from_db()
        self.assertFalse(user.is_verified)
        self.assertFalse(user.is_active)

    def test_duplicate_registration_across_standard_and_legacy_endpoints(self):
        """
        Verifies duplicate registration detection across both standard auth (/api/v1/auth/register/)
        and legacy volunteer registration (/api/v1/volunteers/register/).
        """
        std_payload = {
            'name': 'Standard User',
            'email': 'std.user@example.com',
            'password': 'SecurePassword@123',
            'phone': '9845033333',
        }
        res_std = self.client.post(reverse('accounts:register'), std_payload, format='json')
        self.assertEqual(res_std.status_code, status.HTTP_201_CREATED)

        res_dup_std = self.client.post(reverse('accounts:register'), std_payload, format='json')
        self.assertEqual(res_dup_std.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res_dup_std.data)

        leg_payload = {
            'email': 'std.user@example.com',
            'password': 'AnotherPassword@123',
            'first_name': 'Standard',
            'last_name': 'User',
            'phone': '9845044444',
        }
        res_dup_leg = self.client.post(self.url, leg_payload, format='json')
        self.assertEqual(res_dup_leg.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res_dup_leg.data)

    def test_resend_otp_and_successful_verification(self):
        """
        Verifies that requesting resend OTP sends a new valid OTP, which successfully verifies
        the account and issues access/refresh JWT tokens.
        """
        payload = {
            'email': 'resend.flow@example.com',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123',
            'first_name': 'Resend',
            'phone': '9845055555',
        }
        self.client.post(self.url, payload, format='json')
        user = User.objects.get(email='resend.flow@example.com')
        initial_otp = user.otps.latest('created_at')

        resend_res = self.client.post(
            reverse('accounts:resend_otp'),
            {'identifier': user.email},
            format='json'
        )
        self.assertEqual(resend_res.status_code, status.HTTP_200_OK)

        new_otp = user.otps.filter(is_used=False).latest('created_at')
        self.assertNotEqual(initial_otp.id, new_otp.id)

        verify_res = self.client.post(
            reverse('accounts:verify_otp'),
            {'identifier': user.email, 'code': new_otp.code},
            format='json'
        )
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', verify_res.data)
        self.assertIn('refresh', verify_res.data)

        user.refresh_from_db()
        self.assertTrue(user.is_verified)
        self.assertTrue(user.is_active)
