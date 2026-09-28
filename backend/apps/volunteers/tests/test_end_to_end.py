from decimal import Decimal
from datetime import date
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.impact.models import ImpactArea
from apps.projects.models import Project
from apps.volunteers.models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
    Certificate,
)
from apps.volunteers import services

User = get_user_model()


class VolunteerEndToEndLifecycleTests(APITestCase):
    def setUp(self):
        # Admin user
        self.admin = User.objects.create_superuser(
            email='e2e.admin@responsibleindividuals.org',
            password='AdminPassword123',
            first_name='Admin',
            last_name='Supervisor',
        )

        # Impact Area & Project
        self.impact_area = ImpactArea.objects.create(
            name='Freshwater & Wetland Revival',
            slug='freshwater-wetland',
            description='Wetland and water ecosystem rejuvenation',
        )
        self.project = Project.objects.create(
            title='Agara Feeder Lake Revival Project',
            slug='agara-feeder-lake-revival',
            focus_area=self.impact_area,
            location='Bengaluru South',
            summary='Restoring secondary wetlands to mitigate urban flooding',
            description='Community-driven desilting and water monitoring.',
            start_date=date(2026, 1, 1),
            budget=Decimal('500000.00'),
        )

        # Interests
        self.interest_water = VolunteerInterest.objects.create(name='Water & Lake Stewardship', slug='water-stewardship')
        self.interest_biodiv = VolunteerInterest.objects.create(name='Biodiversity Surveying', slug='biodiv-survey')

        # Opportunity
        self.opp = VolunteerOpportunity.objects.create(
            title='Weekend Lake Water Monitor',
            slug='weekend-lake-water-monitor',
            focus_area=self.impact_area,
            project=self.project,
            location='Bengaluru East',
            commitment='4 hrs / weekend',
            spots_available=5,
            spots_filled=0,
            description='Monitor water quality parameters at Agara feeder channel.',
            responsibilities='Conduct pH and turbidity tests, log bird diversity.',
            requirements='Punctual and passionate about urban ecology.',
            status=VolunteerOpportunity.Status.OPEN,
        )

    def test_complete_volunteer_business_lifecycle_18_steps(self):
        """
        Executes the full 18-step business lifecycle test across the actual Django test database.
        """
        # ---------------------------------------------------------------------
        # STEP 1: Visitor opens Volunteer page (Queries public opportunities)
        # ---------------------------------------------------------------------
        opps_url = reverse('volunteers:volunteer-opportunity-list')
        res_step1 = self.client.get(opps_url)
        self.assertEqual(res_step1.status_code, status.HTTP_200_OK)

        # ---------------------------------------------------------------------
        # STEP 2: Opportunities load with correct initial counts
        # ---------------------------------------------------------------------
        opp_list = res_step1.data['results'] if 'results' in res_step1.data else res_step1.data
        self.assertEqual(len(opp_list), 1)
        self.assertEqual(opp_list[0]['title'], 'Weekend Lake Water Monitor')
        self.assertEqual(opp_list[0]['spots_available'], 5)
        self.assertEqual(opp_list[0]['spots_filled'], 0)

        # ---------------------------------------------------------------------
        # STEP 3: Visitor selects opportunity detail
        # ---------------------------------------------------------------------
        detail_url = reverse('volunteers:volunteer-opportunity-detail', kwargs={'slug': self.opp.slug})
        res_step3 = self.client.get(detail_url)
        self.assertEqual(res_step3.status_code, status.HTTP_200_OK)
        self.assertEqual(res_step3.data['slug'], 'weekend-lake-water-monitor')

        # ---------------------------------------------------------------------
        # STEP 4: Visitor registers as volunteer
        # ---------------------------------------------------------------------
        reg_url = reverse('volunteers:volunteer-register')
        reg_payload = {
            'email': 'ananya.kashyap@e2e-test.org',
            'password': 'SecurePassword@2026',
            'confirm_password': 'SecurePassword@2026',
            'first_name': 'Ananya',
            'last_name': 'Kashyap',
            'phone': '9845077777',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'occupation': 'Ecologist',
            'skills': 'Water Sampling, Water Quality Testing, GIS',
            'availability': 'Weekends',
            'bio': 'Passionate about restoring Bengaluru urban wetlands.',
            'interests': ['water-stewardship', 'biodiv-survey'],
        }
        res_step4 = self.client.post(reg_url, reg_payload, format='json')
        self.assertEqual(res_step4.status_code, status.HTTP_201_CREATED)

        # ---------------------------------------------------------------------
        # STEP 5: User receives JWT authentication tokens
        # ---------------------------------------------------------------------
        self.assertIn('access', res_step4.data)
        self.assertIn('refresh', res_step4.data)
        access_token = res_step4.data['access']

        # ---------------------------------------------------------------------
        # STEP 6: VolunteerProfile is created and linked to User
        # ---------------------------------------------------------------------
        user = User.objects.get(email='ananya.kashyap@e2e-test.org')
        self.assertEqual(user.role, User.Role.VOLUNTEER)
        vol_profile = VolunteerProfile.objects.get(user=user)
        self.assertEqual(vol_profile.full_name, 'Ananya Kashyap')
        self.assertEqual(vol_profile.email, 'ananya.kashyap@e2e-test.org')

        # ---------------------------------------------------------------------
        # STEP 7: Interests are correctly linked
        # ---------------------------------------------------------------------
        self.assertEqual(vol_profile.interests.count(), 2)
        self.assertTrue(vol_profile.interests.filter(slug='water-stewardship').exists())

        # ---------------------------------------------------------------------
        # STEP 8: Authenticated Volunteer submits application
        # ---------------------------------------------------------------------
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        apply_url = reverse('volunteers:volunteer-apply')
        apply_payload = {
            'opportunity_id': str(self.opp.id),
            'statement_of_purpose': 'I have 3 years of field water sampling experience and live 2km from Agara.',
            'experience': 'Conducted dissolved oxygen surveys in Kaikondrahalli and Bellandur wetlands.',
        }
        res_step8 = self.client.post(apply_url, apply_payload, format='json')
        self.assertEqual(res_step8.status_code, status.HTTP_201_CREATED)

        # ---------------------------------------------------------------------
        # STEP 9: Application is created with status = PENDING
        # ---------------------------------------------------------------------
        app_id = res_step8.data['application']['id']
        application = VolunteerApplication.objects.get(id=app_id)
        self.assertEqual(application.status, VolunteerApplication.Status.PENDING)
        self.assertEqual(application.volunteer_profile, vol_profile)
        self.assertEqual(application.opportunity, self.opp)

        # ---------------------------------------------------------------------
        # STEP 10: Admin retrieves application
        # ---------------------------------------------------------------------
        self.client.force_authenticate(user=self.admin)
        admin_apps_url = reverse('volunteers:volunteer-application-list')
        res_step10 = self.client.get(admin_apps_url)
        self.assertEqual(res_step10.status_code, status.HTTP_200_OK)
        results = res_step10.data['results'] if 'results' in res_step10.data else res_step10.data
        self.assertGreaterEqual(len(results), 1)

        # ---------------------------------------------------------------------
        # STEP 11: Admin approves application
        # ---------------------------------------------------------------------
        approve_url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(application.id)})
        res_step11 = self.client.post(approve_url, {
            'status': 'APPROVED',
            'review_notes': 'Verified credentials. Approved for Agara batch A.',
        }, format='json')
        self.assertEqual(res_step11.status_code, status.HTTP_200_OK)
        application.refresh_from_db()
        self.assertEqual(application.status, VolunteerApplication.Status.APPROVED)

        # ---------------------------------------------------------------------
        # STEP 12: Opportunity spots update correctly (spots_filled = 1)
        # ---------------------------------------------------------------------
        self.opp.refresh_from_db()
        self.assertEqual(self.opp.spots_filled, 1)

        # ---------------------------------------------------------------------
        # STEP 13 & 14: Participation is logged and verified
        # ---------------------------------------------------------------------
        part = services.log_volunteer_participation(
            volunteer_profile=vol_profile,
            project=self.project,
            date=date(2026, 3, 14),
            hours=Decimal('8.50'),
            activity_performed='Conducted Agara feeder channel pH, dissolved oxygen & turbidity testing',
            verified=True,
        )
        self.assertIsNotNone(part.id)
        self.assertTrue(part.verified)

        # ---------------------------------------------------------------------
        # STEP 15: Volunteer total hours update automatically
        # ---------------------------------------------------------------------
        vol_profile.refresh_from_db()
        self.assertEqual(vol_profile.total_hours_contributed, Decimal('8.50'))

        # ---------------------------------------------------------------------
        # STEP 16: Certificate is issued by Admin
        # ---------------------------------------------------------------------
        cert = services.create_certificate(
            volunteer_profile=vol_profile,
            title='Excellence in Urban Lake Ecology Stewardship',
            description='Awarded for rigorous water quality testing and community field leadership.',
            hours_recognized=Decimal('8.50'),
            certificate_code='RI-E2E-AGARA-2026-001',
        )
        self.assertEqual(cert.status, Certificate.Status.ACTIVE)
        self.assertEqual(cert.certificate_code, 'RI-E2E-AGARA-2026-001')

        # ---------------------------------------------------------------------
        # STEP 17: Volunteer retrieves own profile, application, participation, certificate
        # ---------------------------------------------------------------------
        self.client.force_authenticate(user=user)

        # Own profile
        my_prof_res = self.client.get(reverse('volunteers:my-volunteer-profile'))
        self.assertEqual(my_prof_res.status_code, status.HTTP_200_OK)
        self.assertEqual(my_prof_res.data['email'], 'ananya.kashyap@e2e-test.org')
        self.assertEqual(str(my_prof_res.data['total_hours_contributed']), '8.5')

        # Own application
        my_apps_res = self.client.get(reverse('volunteers:my-volunteer-applications'))
        self.assertEqual(my_apps_res.status_code, status.HTTP_200_OK)
        my_apps = my_apps_res.data['results'] if 'results' in my_apps_res.data else my_apps_res.data
        self.assertEqual(len(my_apps), 1)
        self.assertEqual(my_apps[0]['status'], 'APPROVED')

        # Own participation
        my_parts_res = self.client.get(reverse('volunteers:my-volunteer-participations'))
        self.assertEqual(my_parts_res.status_code, status.HTTP_200_OK)
        my_parts = my_parts_res.data['results'] if 'results' in my_parts_res.data else my_parts_res.data
        self.assertEqual(len(my_parts), 1)
        self.assertEqual(str(my_parts[0]['hours']), '8.5')

        # Own certificate
        my_certs_res = self.client.get(reverse('volunteers:my-volunteer-certificates'))
        self.assertEqual(my_certs_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(my_certs_res.data), 1)
        self.assertEqual(my_certs_res.data[0]['certificate_code'], 'RI-E2E-AGARA-2026-001')

        # ---------------------------------------------------------------------
        # STEP 18: Verify another volunteer CANNOT access these records
        # ---------------------------------------------------------------------
        reg_other = services.register_volunteer({
            'email': 'unrelated.bystander@e2e-test.org',
            'password': 'SecurePassword@123',
            'first_name': 'Other',
            'last_name': 'Volunteer',
            'phone': '9845099999',
        })
        self.client.force_authenticate(user=reg_other['user'])

        # Other volunteer's applications -> 0
        other_apps_res = self.client.get(reverse('volunteers:my-volunteer-applications'))
        other_apps = other_apps_res.data['results'] if 'results' in other_apps_res.data else other_apps_res.data
        self.assertEqual(len(other_apps), 0)

        # Other volunteer's participations -> 0
        other_parts_res = self.client.get(reverse('volunteers:my-volunteer-participations'))
        other_parts = other_parts_res.data['results'] if 'results' in other_parts_res.data else other_parts_res.data
        self.assertEqual(len(other_parts), 0)

        # Other volunteer's certificates -> 0
        other_certs_res = self.client.get(reverse('volunteers:my-volunteer-certificates'))
        self.assertEqual(len(other_certs_res.data), 0)
