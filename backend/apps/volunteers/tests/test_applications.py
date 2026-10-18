from decimal import Decimal
from datetime import date
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.impact.models import ImpactArea
from apps.projects.models import Project
from apps.volunteers.models import VolunteerOpportunity, VolunteerProfile, VolunteerApplication
from apps.volunteers import services

User = get_user_model()


class VolunteerApplicationTests(APITestCase):
    def setUp(self):
        self.impact_area = ImpactArea.objects.create(name='Ecology', slug='ecology')
        self.project = Project.objects.create(
            title='Urban Forest Drive',
            slug='urban-forest-drive',
            focus_area=self.impact_area,
            start_date=date(2026, 1, 1),
            budget=Decimal('100000.00'),
        )

        self.opp_open = VolunteerOpportunity.objects.create(
            title='Weekend Forest Guide',
            slug='weekend-forest-guide',
            focus_area=self.impact_area,
            project=self.project,
            location='Bengaluru',
            commitment='3 hrs / week',
            spots_available=5,
            spots_filled=1,
            description='Guide nature walks',
            responsibilities='Lead student batches',
            requirements='Nature knowledge',
            status=VolunteerOpportunity.Status.OPEN,
        )

        self.opp_full = VolunteerOpportunity.objects.create(
            title='Tree Census Surveyor',
            slug='tree-census-surveyor',
            focus_area=self.impact_area,
            location='Bengaluru',
            commitment='Full day',
            spots_available=2,
            spots_filled=2,
            description='Map urban tree density',
            responsibilities='Tag GPS coords',
            requirements='Smartphone',
            status=VolunteerOpportunity.Status.FILLED,
        )

        self.opp_closed = VolunteerOpportunity.objects.create(
            title='Completed Wetland Drive',
            slug='completed-wetland-drive',
            focus_area=self.impact_area,
            location='Bengaluru',
            commitment='Weekend',
            spots_available=10,
            spots_filled=5,
            description='Past drive',
            responsibilities='Cleanups',
            requirements='None',
            status=VolunteerOpportunity.Status.CLOSED,
        )

        # Register volunteer
        reg = services.register_volunteer({
            'email': 'app.test.volunteer@example.com',
            'password': 'Password@123',
            'first_name': 'Kavita',
            'last_name': 'Krishnan',
            'phone': '+91 98451 00000',
        })
        self.user = reg['user']
        self.profile = reg['volunteer_profile']
        self.apply_url = reverse('volunteers:volunteer-apply')

    def test_valid_authenticated_application(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'opportunity_id': str(self.opp_open.id),
            'statement_of_purpose': 'I am deeply passionate about native forest flora and student education.',
            'experience': 'Guided 5 bird watching walks in cubbon park.',
        }
        res = self.client.post(self.apply_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['application']['status'], 'PENDING')
        self.assertEqual(res.data['application']['volunteer_name'], 'Kavita Krishnan')
        self.assertEqual(res.data['application']['volunteer_email'], 'app.test.volunteer@example.com')

        # Database verification
        app = VolunteerApplication.objects.get(opportunity=self.opp_open, volunteer_profile=self.profile)
        self.assertEqual(app.status, VolunteerApplication.Status.PENDING)
        self.assertEqual(app.statement_of_purpose, payload['statement_of_purpose'])

    def test_same_volunteer_multiple_opportunities(self):
        opp_secondary = VolunteerOpportunity.objects.create(
            title='Secondary Open Role',
            slug='secondary-open-role',
            focus_area=self.impact_area,
            location='Bengaluru',
            commitment='2 hrs / Sunday',
            spots_available=4,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )

        self.client.force_authenticate(user=self.user)
        # Apply to first
        res1 = self.client.post(self.apply_url, {
            'opportunity_slug': self.opp_open.slug,
            'statement_of_purpose': 'First application.',
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Apply to second
        res2 = self.client.post(self.apply_url, {
            'opportunity_slug': opp_secondary.slug,
            'statement_of_purpose': 'Second application.',
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)

        # Confirm 1 profile and 2 applications
        self.assertEqual(VolunteerProfile.objects.filter(user=self.user).count(), 1)
        self.assertEqual(VolunteerApplication.objects.filter(volunteer_profile=self.profile).count(), 2)

    def test_duplicate_application_to_same_opportunity_rejected(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'opportunity_id': str(self.opp_open.id),
            'statement_of_purpose': 'First application.',
        }
        res1 = self.client.post(self.apply_url, payload, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Re-apply
        res2 = self.client.post(self.apply_url, payload, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', res2.data)
        self.assertEqual(VolunteerApplication.objects.filter(opportunity=self.opp_open, volunteer_profile=self.profile).count(), 1)

    def test_unauthenticated_application_rejected(self):
        # Client not authenticated
        payload = {
            'opportunity_id': str(self.opp_open.id),
            'statement_of_purpose': 'Unauthenticated application attempt.',
        }
        res = self.client.post(self.apply_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_apply_to_filled_opportunity_rejected(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'opportunity_id': str(self.opp_full.id),
            'statement_of_purpose': 'Applying to already full role.',
        }
        res = self.client.post(self.apply_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('opportunity', res.data)

    def test_apply_to_closed_opportunity_rejected(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'opportunity_id': str(self.opp_closed.id),
            'statement_of_purpose': 'Applying to closed role.',
        }
        res = self.client.post(self.apply_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('opportunity', res.data)

    def test_apply_with_invalid_opportunity_id_returns_404(self):
        self.client.force_authenticate(user=self.user)
        import uuid
        payload = {
            'opportunity_id': str(uuid.uuid4()),
            'statement_of_purpose': 'Applying to non existent role.',
        }
        res = self.client.post(self.apply_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_apply_ignores_attempted_volunteer_profile_spoofing(self):
        # Create a second volunteer
        reg_other = services.register_volunteer({
            'email': 'victim.volunteer@example.com',
            'password': 'Password@123',
            'first_name': 'Victim',
            'last_name': 'Profile',
        })
        other_profile = reg_other['volunteer_profile']

        # Authenticate as first user, but try sending other volunteer's profile ID
        self.client.force_authenticate(user=self.user)
        payload = {
            'opportunity_id': str(self.opp_open.id),
            'volunteer_profile_id': str(other_profile.id),
            'volunteer_profile': str(other_profile.id),
            'statement_of_purpose': 'Trying to spoof victim profile.',
        }
        res = self.client.post(self.apply_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Application MUST belong to self.profile, not other_profile
        app = VolunteerApplication.objects.get(opportunity=self.opp_open, volunteer_profile=self.profile)
        self.assertEqual(app.volunteer_profile, self.profile)
        self.assertNotEqual(app.volunteer_profile, other_profile)
        self.assertFalse(VolunteerApplication.objects.filter(opportunity=self.opp_open, volunteer_profile=other_profile).exists())
