from decimal import Decimal
from datetime import date
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.impact.models import ImpactArea
from apps.projects.models import Project
from apps.volunteers.models import VolunteerOpportunity, VolunteerApplication
from apps.volunteers import services

User = get_user_model()


class VolunteerPermissionTests(APITestCase):
    def setUp(self):
        # 1. Visitor (unauthenticated)
        # 2. Volunteer user
        reg = services.register_volunteer({
            'email': 'regular.vol@test.org',
            'password': 'Password@123',
            'first_name': 'Regular',
            'last_name': 'Volunteer',
        })
        self.vol_user = reg['user']
        self.vol_profile = reg['volunteer_profile']

        # 3. Admin user
        self.admin_user = User.objects.create_superuser(
            email='admin.perm@test.org',
            password='AdminPassword123',
            first_name='Admin',
            last_name='User',
        )

        self.impact_area = ImpactArea.objects.create(name='Afforestation', slug='afforestation')
        self.project = Project.objects.create(
            title='Tree Planting',
            slug='tree-planting',
            focus_area=self.impact_area,
            start_date=date(2026, 1, 1),
            budget=Decimal('10000.00'),
        )
        self.opp = VolunteerOpportunity.objects.create(
            title='Forest Guard',
            slug='forest-guard',
            focus_area=self.impact_area,
            spots_available=5,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )
        self.app = services.create_volunteer_application(
            volunteer_profile=self.vol_profile,
            opportunity=self.opp,
            statement_of_purpose='Want to help.',
        )

    def test_visitor_public_access_allowed(self):
        # Opportunities list
        res_opp = self.client.get(reverse('volunteers:volunteer-opportunity-list'))
        self.assertEqual(res_opp.status_code, status.HTTP_200_OK)

        # Interests list
        res_int = self.client.get(reverse('volunteers:volunteer-interest-list'))
        self.assertEqual(res_int.status_code, status.HTTP_200_OK)

    def test_visitor_private_endpoints_rejected(self):
        self.assertEqual(self.client.get(reverse('volunteers:my-volunteer-profile')).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(reverse('volunteers:my-volunteer-applications')).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(reverse('volunteers:my-volunteer-participations')).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(reverse('volunteers:my-volunteer-certificates')).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_visitor_cannot_approve_applications(self):
        url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app.id)})
        res = self.client.post(url, {'status': 'APPROVED'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_volunteer_cannot_approve_applications(self):
        self.client.force_authenticate(user=self.vol_user)
        url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app.id)})
        res = self.client.post(url, {'status': 'APPROVED'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_volunteer_cannot_access_admin_endpoints(self):
        self.client.force_authenticate(user=self.vol_user)
        # Admin profiles list
        res_profiles = self.client.get(reverse('volunteers:volunteer-profile-list'))
        self.assertEqual(res_profiles.status_code, status.HTTP_403_FORBIDDEN)

        # Admin applications list
        res_apps = self.client.get(reverse('volunteers:volunteer-application-list'))
        self.assertEqual(res_apps.status_code, status.HTTP_403_FORBIDDEN)

        # Admin participations list
        res_parts = self.client.get(reverse('volunteers:volunteer-participation-list'))
        self.assertEqual(res_parts.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_has_full_management_access(self):
        self.client.force_authenticate(user=self.admin_user)

        res_profiles = self.client.get(reverse('volunteers:volunteer-profile-list'))
        self.assertEqual(res_profiles.status_code, status.HTTP_200_OK)

        res_apps = self.client.get(reverse('volunteers:volunteer-application-list'))
        self.assertEqual(res_apps.status_code, status.HTTP_200_OK)

        res_parts = self.client.get(reverse('volunteers:volunteer-participation-list'))
        self.assertEqual(res_parts.status_code, status.HTTP_200_OK)

        # Admin can approve
        url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app.id)})
        res_approve = self.client.post(url, {'status': 'APPROVED', 'review_notes': 'OK'}, format='json')
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)
