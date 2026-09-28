from decimal import Decimal
from datetime import date
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.impact.models import ImpactArea
from apps.projects.models import Project
from apps.volunteers.models import VolunteerParticipation
from apps.volunteers import services

User = get_user_model()


class VolunteerParticipationTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            email='admin.part@test.org',
            password='AdminPassword123',
            first_name='Admin',
            last_name='Officer',
        )

        self.impact_area = ImpactArea.objects.create(name='Wetlands', slug='wetlands')
        self.project = Project.objects.create(
            title='Lake Wetland Restoration',
            slug='lake-wetland-restoration',
            focus_area=self.impact_area,
            start_date=date(2026, 1, 1),
            budget=Decimal('200000.00'),
        )

        reg_a = services.register_volunteer({
            'email': 'volunteer.hours1@test.org',
            'password': 'Password@123',
            'first_name': 'Hours',
            'last_name': 'VolunteerA',
        })
        self.user_a = reg_a['user']
        self.profile_a = reg_a['volunteer_profile']

        reg_b = services.register_volunteer({
            'email': 'volunteer.hours2@test.org',
            'password': 'Password@123',
            'first_name': 'Hours',
            'last_name': 'VolunteerB',
        })
        self.user_b = reg_b['user']
        self.profile_b = reg_b['volunteer_profile']

        self.my_participations_url = reverse('volunteers:my-volunteer-participations')

    def test_log_verified_participation_calculates_total_hours(self):
        # Initial hours = 0
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('0.00'))

        # Log 5.5 hours verified
        p1 = services.log_volunteer_participation(
            volunteer_profile=self.profile_a,
            project=self.project,
            date=date(2026, 3, 1),
            hours=Decimal('5.5'),
            activity_performed='Water testing and sample batching',
            verified=True,
        )
        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('5.50'))

        # Log 4.5 hours verified
        p2 = services.log_volunteer_participation(
            volunteer_profile=self.profile_a,
            project=self.project,
            date=date(2026, 3, 8),
            hours=Decimal('4.5'),
            activity_performed='Lake desilting fence assembly',
            verified=True,
        )
        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('10.00'))

    def test_unverified_participation_excluded_from_total(self):
        # Log 6.0 hours unverified
        services.log_volunteer_participation(
            volunteer_profile=self.profile_a,
            project=self.project,
            date=date(2026, 3, 15),
            hours=Decimal('6.0'),
            activity_performed='Independent reading',
            verified=False,
        )
        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('0.00'))

    def test_updating_participation_hours_recalculates_total(self):
        p = services.log_volunteer_participation(
            volunteer_profile=self.profile_a,
            project=self.project,
            date=date(2026, 3, 1),
            hours=Decimal('10.0'),
            activity_performed='Field leadership',
            verified=True,
        )
        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('10.00'))

        # Update to 15.0 hours
        p.hours = Decimal('15.0')
        p.save()
        services.recalculate_volunteer_hours(self.profile_a)

        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('15.00'))

    def test_deleting_participation_recalculates_total(self):
        p1 = services.log_volunteer_participation(
            volunteer_profile=self.profile_a,
            project=self.project,
            date=date(2026, 3, 1),
            hours=Decimal('8.0'),
            activity_performed='Initial survey',
            verified=True,
        )
        p2 = services.log_volunteer_participation(
            volunteer_profile=self.profile_a,
            project=self.project,
            date=date(2026, 3, 2),
            hours=Decimal('4.0'),
            activity_performed='Secondary audit',
            verified=True,
        )
        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('12.00'))

        # Delete p2
        p2.delete()
        services.recalculate_volunteer_hours(self.profile_a)

        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('8.00'))

    def test_negative_or_zero_hours_validation(self):
        with self.assertRaises(Exception):
            services.log_volunteer_participation(
                volunteer_profile=self.profile_a,
                project=self.project,
                date=date(2026, 3, 1),
                hours=Decimal('-5.0'),
                verified=True,
            )

    def test_my_participations_isolation(self):
        # A has 2 records
        services.log_volunteer_participation(
            volunteer_profile=self.profile_a,
            project=self.project,
            date=date(2026, 3, 1),
            hours=Decimal('3.0'),
            activity_performed='Activity for A',
            verified=True,
        )
        services.log_volunteer_participation(
            volunteer_profile=self.profile_a,
            project=self.project,
            date=date(2026, 3, 2),
            hours=Decimal('2.0'),
            activity_performed='Activity for A 2',
            verified=True,
        )

        # B has 1 record
        services.log_volunteer_participation(
            volunteer_profile=self.profile_b,
            project=self.project,
            date=date(2026, 3, 3),
            hours=Decimal('7.0'),
            activity_performed='Activity for B',
            verified=True,
        )

        # Authenticate as A
        self.client.force_authenticate(user=self.user_a)
        res_a = self.client.get(self.my_participations_url)
        self.assertEqual(res_a.status_code, status.HTTP_200_OK)
        results_a = res_a.data['results'] if 'results' in res_a.data else res_a.data
        self.assertEqual(len(results_a), 2)
        for item in results_a:
            self.assertIn('Activity for A', item['activity_performed'])

        # Authenticate as B
        self.client.force_authenticate(user=self.user_b)
        res_b = self.client.get(self.my_participations_url)
        self.assertEqual(res_b.status_code, status.HTTP_200_OK)
        results_b = res_b.data['results'] if 'results' in res_b.data else res_b.data
        self.assertEqual(len(results_b), 1)
        self.assertEqual(results_b[0]['activity_performed'], 'Activity for B')
