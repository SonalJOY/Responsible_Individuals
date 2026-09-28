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
)
from apps.volunteers import services

User = get_user_model()


class ApplicationStatusTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            email='admin.status@test.org',
            password='AdminPassword123',
            first_name='Admin',
            last_name='User',
        )
        self.normal_user = User.objects.create_user(
            email='normal.user@test.org',
            password='Password@123',
            first_name='Normal',
            last_name='User',
        )

        self.impact_area = ImpactArea.objects.create(name='Urban Flora', slug='urban-flora')
        self.project = Project.objects.create(
            title='Park Greening',
            slug='park-greening',
            focus_area=self.impact_area,
            start_date=date(2026, 1, 1),
            budget=Decimal('50000.00'),
        )

        self.opportunity = VolunteerOpportunity.objects.create(
            title='Park Tree Planter',
            slug='park-tree-planter',
            focus_area=self.impact_area,
            project=self.project,
            spots_available=2,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )

        # Register two applicants
        reg1 = services.register_volunteer({
            'email': 'applicant1@test.org',
            'password': 'Password@123',
            'first_name': 'Applicant',
            'last_name': 'One',
        })
        reg2 = services.register_volunteer({
            'email': 'applicant2@test.org',
            'password': 'Password@123',
            'first_name': 'Applicant',
            'last_name': 'Two',
        })
        reg3 = services.register_volunteer({
            'email': 'applicant3@test.org',
            'password': 'Password@123',
            'first_name': 'Applicant',
            'last_name': 'Three',
        })

        self.app1 = services.create_volunteer_application(
            volunteer_profile=reg1['volunteer_profile'],
            opportunity=self.opportunity,
            statement_of_purpose='Want to plant trees 1',
        )
        self.app2 = services.create_volunteer_application(
            volunteer_profile=reg2['volunteer_profile'],
            opportunity=self.opportunity,
            statement_of_purpose='Want to plant trees 2',
        )
        self.app3 = services.create_volunteer_application(
            volunteer_profile=reg3['volunteer_profile'],
            opportunity=self.opportunity,
            statement_of_purpose='Want to plant trees 3',
        )

    def test_admin_approves_application_increments_spots_filled(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app1.id)})
        res = self.client.post(url, {'status': 'APPROVED', 'review_notes': 'Accepted candidate'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.app1.refresh_from_db()
        self.opportunity.refresh_from_db()

        self.assertEqual(self.app1.status, VolunteerApplication.Status.APPROVED)
        self.assertEqual(self.opportunity.spots_filled, 1)

    def test_admin_rejects_application_maintains_capacity(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app1.id)})
        res = self.client.post(url, {'status': 'REJECTED', 'review_notes': 'Not suitable'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.app1.refresh_from_db()
        self.opportunity.refresh_from_db()

        self.assertEqual(self.app1.status, VolunteerApplication.Status.REJECTED)
        self.assertEqual(self.opportunity.spots_filled, 0)

    def test_repeated_approval_does_not_multiply_spots_filled(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app1.id)})
        
        # Approve 1st time
        res1 = self.client.post(url, {'status': 'APPROVED'}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.opportunity.refresh_from_db()
        self.assertEqual(self.opportunity.spots_filled, 1)

        # Approve 2nd time (idempotent)
        res2 = self.client.post(url, {'status': 'APPROVED'}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.opportunity.refresh_from_db()
        self.assertEqual(self.opportunity.spots_filled, 1)

    def test_capacity_boundary_enforcement(self):
        self.client.force_authenticate(user=self.admin_user)
        url1 = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app1.id)})
        url2 = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app2.id)})
        url3 = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app3.id)})

        # Approve 1st (spots: 1/2)
        res1 = self.client.post(url1, {'status': 'APPROVED'}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        # Approve 2nd (spots: 2/2 -> full)
        res2 = self.client.post(url2, {'status': 'APPROVED'}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.opportunity.refresh_from_db()
        self.assertEqual(self.opportunity.spots_filled, 2)
        self.assertEqual(self.opportunity.status, VolunteerOpportunity.Status.FILLED)

        # Attempt to approve 3rd candidate when opportunity is full
        res3 = self.client.post(url3, {'status': 'APPROVED'}, format='json')
        self.assertEqual(res3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('opportunity', res3.data)

        self.app3.refresh_from_db()
        self.assertEqual(self.app3.status, VolunteerApplication.Status.PENDING)
        self.opportunity.refresh_from_db()
        self.assertEqual(self.opportunity.spots_filled, 2)

    def test_transition_from_approved_to_rejected_decrements_spots(self):
        self.client.force_authenticate(user=self.admin_user)
        url1 = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app1.id)})

        # Approve
        self.client.post(url1, {'status': 'APPROVED'}, format='json')
        self.opportunity.refresh_from_db()
        self.assertEqual(self.opportunity.spots_filled, 1)

        # Then cancel/reject
        res = self.client.post(url1, {'status': 'REJECTED'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.opportunity.refresh_from_db()
        self.assertEqual(self.opportunity.spots_filled, 0)
