from decimal import Decimal
from datetime import date
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.impact.models import ImpactArea
from apps.projects.models import Project
from apps.volunteers.models import VolunteerOpportunity
from apps.volunteers import services

User = get_user_model()


class VolunteerDataIsolationTests(APITestCase):
    def setUp(self):
        self.impact_area = ImpactArea.objects.create(name='Conservation', slug='conservation')
        self.project = Project.objects.create(
            title='Wetland Conservation',
            slug='wetland-conservation',
            focus_area=self.impact_area,
            start_date=date(2026, 1, 1),
            budget=Decimal('50000.00'),
        )
        self.opp_a = VolunteerOpportunity.objects.create(
            title='Field Monitor A',
            slug='field-monitor-a',
            focus_area=self.impact_area,
            spots_available=5,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )
        self.opp_b = VolunteerOpportunity.objects.create(
            title='Field Monitor B',
            slug='field-monitor-b',
            focus_area=self.impact_area,
            spots_available=5,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )

        # 1. Register Volunteer A
        reg_a = services.register_volunteer({
            'email': 'volunteer.alice@example.com',
            'password': 'Password@123',
            'first_name': 'Alice',
            'last_name': 'Green',
            'phone': '+91 90000 11111',
            'city': 'Bengaluru',
        })
        self.user_a = reg_a['user']
        self.profile_a = reg_a['volunteer_profile']

        # 2. Register Volunteer B
        reg_b = services.register_volunteer({
            'email': 'volunteer.bob@example.com',
            'password': 'Password@123',
            'first_name': 'Bob',
            'last_name': 'Blue',
            'phone': '+91 90000 22222',
            'city': 'Mysuru',
        })
        self.user_b = reg_b['user']
        self.profile_b = reg_b['volunteer_profile']

        # 3. Create Applications for A and B
        self.app_a = services.create_volunteer_application(
            volunteer_profile=self.profile_a,
            opportunity=self.opp_a,
            statement_of_purpose='Alice application for Opp A',
        )
        self.app_b = services.create_volunteer_application(
            volunteer_profile=self.profile_b,
            opportunity=self.opp_b,
            statement_of_purpose='Bob application for Opp B',
        )

        # 4. Create Participations for A and B
        self.part_a = services.log_volunteer_participation(
            volunteer_profile=self.profile_a,
            project=self.project,
            date=date(2026, 3, 1),
            hours=Decimal('10.0'),
            activity_performed='Alice water testing',
            verified=True,
        )
        self.part_b = services.log_volunteer_participation(
            volunteer_profile=self.profile_b,
            project=self.project,
            date=date(2026, 3, 2),
            hours=Decimal('12.0'),
            activity_performed='Bob tree survey',
            verified=True,
        )

        # 5. Create Certificates for A and B
        self.cert_a = services.create_certificate(
            volunteer_profile=self.profile_a,
            title='Alice Excellence Certificate',
            hours_recognized=Decimal('10.0'),
        )
        self.cert_b = services.create_certificate(
            volunteer_profile=self.profile_b,
            title='Bob Excellence Certificate',
            hours_recognized=Decimal('12.0'),
        )

    def test_alice_cannot_see_bob_private_data(self):
        self.client.force_authenticate(user=self.user_a)

        # 1. Profile: Alice gets own profile, Bob's info is not present
        res_profile = self.client.get(reverse('volunteers:my-volunteer-profile'))
        self.assertEqual(res_profile.status_code, status.HTTP_200_OK)
        self.assertEqual(res_profile.data['email'], 'volunteer.alice@example.com')
        self.assertNotEqual(res_profile.data['email'], 'volunteer.bob@example.com')

        # 2. Applications: Alice only sees Alice's application
        res_apps = self.client.get(reverse('volunteers:my-volunteer-applications'))
        self.assertEqual(res_apps.status_code, status.HTTP_200_OK)
        apps = res_apps.data['results'] if 'results' in res_apps.data else res_apps.data
        self.assertEqual(len(apps), 1)
        self.assertEqual(apps[0]['volunteer_email'], 'volunteer.alice@example.com')
        self.assertEqual(apps[0]['opportunity_title'], self.opp_a.title)

        # 3. Participations: Alice only sees Alice's participation
        res_parts = self.client.get(reverse('volunteers:my-volunteer-participations'))
        self.assertEqual(res_parts.status_code, status.HTTP_200_OK)
        parts = res_parts.data['results'] if 'results' in res_parts.data else res_parts.data
        self.assertEqual(len(parts), 1)
        self.assertEqual(parts[0]['activity_performed'], 'Alice water testing')

        # 4. Certificates: Alice only sees Alice's certificate
        res_certs = self.client.get(reverse('volunteers:my-volunteer-certificates'))
        self.assertEqual(res_certs.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_certs.data), 1)
        self.assertEqual(res_certs.data[0]['certificate_code'], self.cert_a.certificate_code)

    def test_bob_cannot_see_alice_private_data(self):
        self.client.force_authenticate(user=self.user_b)

        # 1. Profile: Bob gets own profile, Alice's info is not present
        res_profile = self.client.get(reverse('volunteers:my-volunteer-profile'))
        self.assertEqual(res_profile.status_code, status.HTTP_200_OK)
        self.assertEqual(res_profile.data['email'], 'volunteer.bob@example.com')
        self.assertNotEqual(res_profile.data['email'], 'volunteer.alice@example.com')

        # 2. Applications: Bob only sees Bob's application
        res_apps = self.client.get(reverse('volunteers:my-volunteer-applications'))
        self.assertEqual(res_apps.status_code, status.HTTP_200_OK)
        apps = res_apps.data['results'] if 'results' in res_apps.data else res_apps.data
        self.assertEqual(len(apps), 1)
        self.assertEqual(apps[0]['volunteer_email'], 'volunteer.bob@example.com')
        self.assertEqual(apps[0]['opportunity_title'], self.opp_b.title)

        # 3. Participations: Bob only sees Bob's participation
        res_parts = self.client.get(reverse('volunteers:my-volunteer-participations'))
        self.assertEqual(res_parts.status_code, status.HTTP_200_OK)
        parts = res_parts.data['results'] if 'results' in res_parts.data else res_parts.data
        self.assertEqual(len(parts), 1)
        self.assertEqual(parts[0]['activity_performed'], 'Bob tree survey')

        # 4. Certificates: Bob only sees Bob's certificate
        res_certs = self.client.get(reverse('volunteers:my-volunteer-certificates'))
        self.assertEqual(res_certs.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_certs.data), 1)
        self.assertEqual(res_certs.data[0]['certificate_code'], self.cert_b.certificate_code)
