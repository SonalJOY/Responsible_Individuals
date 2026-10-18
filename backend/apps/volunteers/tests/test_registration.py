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

    def test_new_volunteer_registration_success(self):
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
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertIn('user', res.data)
        self.assertIn('volunteer_profile', res.data)

        # Database assertions
        user = User.objects.get(email='divya.nair@example.com')
        self.assertEqual(user.role, User.Role.VOLUNTEER)
        self.assertTrue(user.is_verified)

        user_profile = UserProfile.objects.get(user=user)
        self.assertEqual(user_profile.city, 'Bengaluru')

        v_profile = VolunteerProfile.objects.get(user=user)
        self.assertEqual(v_profile.full_name, 'Divya Nair')
        self.assertEqual(v_profile.email, 'divya.nair@example.com')
        self.assertEqual(v_profile.phone, '9845012345')
        self.assertEqual(v_profile.skills, 'Water Testing, GIS')
        self.assertEqual(v_profile.interests.count(), 2)

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
