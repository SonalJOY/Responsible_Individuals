from decimal import Decimal
from datetime import date
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.impact.models import ImpactArea
from apps.projects.models import Project
from apps.volunteers.models import VolunteerOpportunity


class VolunteerOpportunityTests(APITestCase):
    def setUp(self):
        self.area_env = ImpactArea.objects.create(
            name='Environment & Lakes',
            slug='env-lakes',
            description='Water restoration',
        )
        self.area_edu = ImpactArea.objects.create(
            name='Education & Literacy',
            slug='edu-literacy',
            description='Digital STEM classrooms',
        )

        self.project_lake = Project.objects.create(
            title='Feeder Lake Revival',
            slug='feeder-lake-revival',
            focus_area=self.area_env,
            location='Bengaluru East',
            summary='Restoring urban wetland biodiversity',
            description='Detailed wetland plan',
            start_date=date(2026, 1, 1),
            budget=Decimal('300000.00'),
        )

        self.opp_open = VolunteerOpportunity.objects.create(
            title='Weekend Water Quality Monitor',
            slug='weekend-water-monitor',
            focus_area=self.area_env,
            project=self.project_lake,
            location='Bengaluru East',
            commitment='4 hrs / weekend',
            spots_available=10,
            spots_filled=3,
            description='Measure pH and dissolved oxygen levels',
            responsibilities='Sample water batches',
            requirements='Punctual and enthusiastic',
            status=VolunteerOpportunity.Status.OPEN,
        )

        self.opp_filled = VolunteerOpportunity.objects.create(
            title='Rural High School Coding Mentor',
            slug='rural-coding-mentor',
            focus_area=self.area_edu,
            location='Kolar District',
            commitment='One Saturday / month',
            spots_available=5,
            spots_filled=5,
            description='Python robotics teaching',
            responsibilities='Teach grade 9 students',
            requirements='Basic python',
            status=VolunteerOpportunity.Status.FILLED,
        )

        self.opp_closed = VolunteerOpportunity.objects.create(
            title='Past Monsoon Seedling Planter',
            slug='past-monsoon-seedling-planter',
            focus_area=self.area_env,
            location='Bengaluru South',
            commitment='1 full day',
            spots_available=20,
            spots_filled=20,
            description='Sapling plantation',
            responsibilities='Plant native saplings',
            requirements='Field ready',
            status=VolunteerOpportunity.Status.CLOSED,
        )

    def test_public_opportunities_list_access(self):
        url = reverse('volunteers:volunteer-opportunity-list')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data['results'] if 'results' in res.data else res.data
        self.assertGreaterEqual(len(results), 3)

    def test_opportunity_detail_by_slug(self):
        url = reverse('volunteers:volunteer-opportunity-detail', kwargs={'slug': self.opp_open.slug})
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], self.opp_open.title)
        self.assertEqual(res.data['focus_area_name'], 'Environment & Lakes')
        self.assertEqual(res.data['spots_available'], 10)
        self.assertEqual(res.data['spots_filled'], 3)

    def test_filter_opportunities_by_location(self):
        url = reverse('volunteers:volunteer-opportunity-list')
        res = self.client.get(url, {'location': 'Bengaluru East'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data['results'] if 'results' in res.data else res.data
        for opp in results:
            self.assertEqual(opp['location'], 'Bengaluru East')

    def test_filter_opportunities_by_status(self):
        url = reverse('volunteers:volunteer-opportunity-list')
        res_open = self.client.get(url, {'status': 'OPEN'})
        self.assertEqual(res_open.status_code, status.HTTP_200_OK)
        results_open = res_open.data['results'] if 'results' in res_open.data else res_open.data
        for opp in results_open:
            self.assertEqual(opp['status'], 'OPEN')

        res_filled = self.client.get(url, {'status': 'FILLED'})
        results_filled = res_filled.data['results'] if 'results' in res_filled.data else res_filled.data
        for opp in results_filled:
            self.assertEqual(opp['status'], 'FILLED')

    def test_filter_opportunities_by_focus_area(self):
        url = reverse('volunteers:volunteer-opportunity-list')
        res = self.client.get(url, {'focus_area': str(self.area_edu.id)})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data['results'] if 'results' in res.data else res.data
        for opp in results:
            self.assertEqual(str(opp['focus_area']), str(self.area_edu.id))
