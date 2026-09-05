from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.projects.models import Project
from apps.impact.models import ImpactStatistic, ImpactArea
from apps.donations.models import Donation, Donor


class CorePlatformAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.area = ImpactArea.objects.create(
            slug='test-env',
            name='Test Environment',
            description='Testing environment',
            color_accent='#10B981',
            order=1
        )
        self.stat = ImpactStatistic.objects.create(
            key='test_stat',
            title='Test Projects',
            counter_value='50+',
            raw_number=50,
            order=1
        )
        self.project = Project.objects.create(
            title='Test Lake Restoration',
            slug='test-lake-restoration',
            focus_area=self.area,
            location='Bengaluru',
            summary='Testing project summary',
            description='Testing detailed description',
            start_date='2025-01-01',
            budget=100000,
            raised_amount=50000,
            beneficiaries_count=500
        )

    def test_impact_statistics_endpoint(self):
        response = self.client.get('/api/v1/impact/statistics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data.get('results', response.data)), 1)

    def test_projects_list_endpoint(self):
        response = self.client.get('/api/v1/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertTrue(any(p['slug'] == 'test-lake-restoration' for p in results))

    def test_project_detail_endpoint(self):
        response = self.client.get('/api/v1/projects/test-lake-restoration/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Lake Restoration')

    def test_donation_process_endpoint(self):
        payload = {
            'full_name': 'Test Donor',
            'email': 'donor@test.org',
            'phone': '+91 99999 88888',
            'amount': 5000,
            'frequency': 'ONETIME',
            'project_id': str(self.project.id),
        }
        response = self.client.post('/api/v1/donations/process/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('receipt_number', response.data)
        self.assertTrue(Donation.objects.filter(donor__email='donor@test.org').exists())
