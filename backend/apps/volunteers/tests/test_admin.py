from decimal import Decimal
from datetime import date
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.impact.models import ImpactArea
from apps.projects.models import Project
from apps.volunteers.models import (
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
)
from apps.volunteers import services

User = get_user_model()


class VolunteerAdminApiTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            email='super.admin@test.org',
            password='AdminPassword123',
            first_name='Super',
            last_name='Admin',
        )

        reg = services.register_volunteer({
            'email': 'admin.test.vol@test.org',
            'password': 'Password@123',
            'first_name': 'Candidate',
            'last_name': 'Volunteer',
        })
        self.vol_user = reg['user']
        self.vol_profile = reg['volunteer_profile']

        self.impact_area = ImpactArea.objects.create(name='River Watch', slug='river-watch')
        self.project = Project.objects.create(
            title='Clean Rivers',
            slug='clean-rivers',
            focus_area=self.impact_area,
            start_date=date(2026, 1, 1),
            budget=Decimal('30000.00'),
        )
        self.opp = VolunteerOpportunity.objects.create(
            title='River Clean Lead',
            slug='river-clean-lead',
            focus_area=self.impact_area,
            project=self.project,
            spots_available=10,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )
        self.app = services.create_volunteer_application(
            volunteer_profile=self.vol_profile,
            opportunity=self.opp,
            statement_of_purpose='Admin API application testing',
        )

    def test_admin_get_profiles_list(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-profile-list')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data['results'] if 'results' in res.data else res.data
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]['email'], 'admin.test.vol@test.org')

    def test_admin_get_applications_list(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-application-list')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data['results'] if 'results' in res.data else res.data
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]['volunteer_name'], 'Candidate Volunteer')

    def test_admin_create_and_get_participation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-participation-list')

        # POST participation as admin
        payload = {
            'volunteer_profile': str(self.vol_profile.id),
            'project': self.project.id,
            'date': '2026-03-25',
            'hours': '6.5',
            'activity_performed': 'Admin registered water desilting work',
            'verified': True,
        }
        res_post = self.client.post(url, payload, format='json')
        self.assertEqual(res_post.status_code, status.HTTP_201_CREATED)

        # GET participations list as admin
        res_get = self.client.get(url)
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)
        results = res_get.data['results'] if 'results' in res_get.data else res_get.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['volunteer_name'], 'Candidate Volunteer')

    def test_admin_updates_application_status_with_notes(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app.id)})
        res = self.client.post(url, {
            'status': 'APPROVED',
            'review_notes': 'Selected after interview round 1',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'APPROVED')
        self.assertEqual(res.data['application']['review_notes'], 'Selected after interview round 1')
