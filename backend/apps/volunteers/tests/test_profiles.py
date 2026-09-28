from decimal import Decimal
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.volunteers.models import VolunteerProfile, VolunteerInterest
from apps.volunteers import services

User = get_user_model()


class VolunteerProfileTests(APITestCase):
    def setUp(self):
        self.interest_lake = VolunteerInterest.objects.create(name='Lake Revival', slug='lake-revival')
        self.interest_tree = VolunteerInterest.objects.create(name='Tree Plantation', slug='tree-plantation')

        # Volunteer A
        reg_a = services.register_volunteer({
            'email': 'volunteer.a@test.org',
            'password': 'Password@123',
            'first_name': 'Volunteer',
            'last_name': 'A',
            'phone': '+91 91111 11111',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'occupation': 'Software Engineer',
            'skills': 'Python, Data Analysis',
            'availability': 'Weekends',
            'bio': 'Passionate about coding for good.',
            'interests': ['lake-revival'],
        })
        self.user_a = reg_a['user']
        self.profile_a = reg_a['volunteer_profile']

        # Volunteer B
        reg_b = services.register_volunteer({
            'email': 'volunteer.b@test.org',
            'password': 'Password@123',
            'first_name': 'Volunteer',
            'last_name': 'B',
            'phone': '+91 92222 22222',
            'city': 'Mysuru',
            'state': 'Karnataka',
            'occupation': 'Teacher',
            'skills': 'Pedagogy, Science',
            'availability': 'Weekdays',
            'bio': 'Passionate about teaching.',
            'interests': ['tree-plantation'],
        })
        self.user_b = reg_b['user']
        self.profile_b = reg_b['volunteer_profile']

        self.my_profile_url = reverse('volunteers:my-volunteer-profile')

    def test_get_my_profile_success(self):
        self.client.force_authenticate(user=self.user_a)
        res = self.client.get(self.my_profile_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'volunteer.a@test.org')
        self.assertEqual(res.data['full_name'], 'Volunteer A')
        self.assertEqual(res.data['city'], 'Bengaluru')
        self.assertEqual(res.data['occupation'], 'Software Engineer')
        self.assertEqual(res.data['skills'], 'Python, Data Analysis')
        self.assertEqual(len(res.data['interests']), 1)

    def test_patch_my_profile_allowed_fields(self):
        self.client.force_authenticate(user=self.user_a)
        payload = {
            'phone': '+91 99999 00000',
            'city': 'Mangaluru',
            'skills': 'Python, Data Analysis, Drone Mapping',
            'availability': 'Flexible',
            'bio': 'Updated bio description.',
            'interests': ['lake-revival', 'tree-plantation'],
        }
        res = self.client.patch(self.my_profile_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['phone'], '+91 99999 00000')
        self.assertEqual(res.data['city'], 'Mangaluru')
        self.assertEqual(res.data['skills'], 'Python, Data Analysis, Drone Mapping')
        self.assertEqual(len(res.data['interests']), 2)

        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.phone, '+91 99999 00000')
        self.assertEqual(self.profile_a.city, 'Mangaluru')
        self.assertEqual(self.profile_a.skills, 'Python, Data Analysis, Drone Mapping')
        self.assertEqual(self.profile_a.interests.count(), 2)

    def test_volunteer_cannot_modify_protected_fields(self):
        self.client.force_authenticate(user=self.user_a)
        # Attempt to change user ownership, total_hours_contributed, or is_approved
        payload = {
            'user': str(self.user_b.id),
            'total_hours_contributed': '999.00',
            'is_approved': True,
        }
        res = self.client.patch(self.my_profile_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.profile_a.refresh_from_db()
        # Ensure user ownership and hours did NOT change through API
        self.assertEqual(self.profile_a.user, self.user_a)
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('0.00'))

    def test_unauthenticated_my_profile_returns_401(self):
        res = self.client.get(self.my_profile_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
