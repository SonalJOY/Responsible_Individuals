from decimal import Decimal
from datetime import date
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import status
from rest_framework.test import APITestCase

from apps.volunteers.models import Certificate
from apps.volunteers import services

User = get_user_model()


class CertificateTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            email='admin.cert@test.org',
            password='AdminPassword123',
            first_name='Cert',
            last_name='Admin',
        )

        reg_a = services.register_volunteer({
            'email': 'cert.vol.a@test.org',
            'password': 'Password@123',
            'first_name': 'Awardee',
            'last_name': 'Alpha',
        })
        self.user_a = reg_a['user']
        self.profile_a = reg_a['volunteer_profile']

        reg_b = services.register_volunteer({
            'email': 'cert.vol.b@test.org',
            'password': 'Password@123',
            'first_name': 'Awardee',
            'last_name': 'Beta',
        })
        self.user_b = reg_b['user']
        self.profile_b = reg_b['volunteer_profile']

        self.my_certs_url = reverse('volunteers:my-volunteer-certificates')

    def test_certificate_creation_attributes(self):
        cert = services.create_certificate(
            volunteer_profile=self.profile_a,
            title='Star Volunteer Award 2026',
            description='In recognition of dedicated environmental monitoring',
            hours_recognized=Decimal('50.0'),
            certificate_code='RI-CERT-2026-ALPHA',
        )

        self.assertEqual(cert.volunteer_profile, self.profile_a)
        self.assertEqual(cert.title, 'Star Volunteer Award 2026')
        self.assertEqual(cert.hours_recognized, Decimal('50.0'))
        self.assertEqual(cert.status, Certificate.Status.ACTIVE)
        self.assertEqual(cert.issue_date, date.today())
        self.assertEqual(cert.certificate_code, 'RI-CERT-2026-ALPHA')

    def test_certificate_self_service_isolation(self):
        # Create cert for A
        cert_a = services.create_certificate(
            volunteer_profile=self.profile_a,
            title='Star Volunteer A',
            hours_recognized=Decimal('25.0'),
        )
        # Create cert for B
        cert_b = services.create_certificate(
            volunteer_profile=self.profile_b,
            title='Star Volunteer B',
            hours_recognized=Decimal('30.0'),
        )

        # Authenticate as A
        self.client.force_authenticate(user=self.user_a)
        res_a = self.client.get(self.my_certs_url)
        self.assertEqual(res_a.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_a.data), 1)
        self.assertEqual(res_a.data[0]['certificate_code'], cert_a.certificate_code)
        self.assertEqual(res_a.data[0]['title'], 'Star Volunteer A')

        # Authenticate as B
        self.client.force_authenticate(user=self.user_b)
        res_b = self.client.get(self.my_certs_url)
        self.assertEqual(res_b.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_b.data), 1)
        self.assertEqual(res_b.data[0]['certificate_code'], cert_b.certificate_code)
        self.assertEqual(res_b.data[0]['title'], 'Star Volunteer B')

    def test_duplicate_certificate_code_rejected(self):
        services.create_certificate(
            volunteer_profile=self.profile_a,
            title='First Issue',
            hours_recognized=Decimal('10.0'),
            certificate_code='DUPLICATE-CODE-001',
        )

        with self.assertRaises(IntegrityError):
            Certificate.objects.create(
                volunteer_profile=self.profile_b,
                title='Second Issue Duplicate',
                hours_recognized=Decimal('15.0'),
                certificate_code='DUPLICATE-CODE-001',
            )

    def test_revoked_certificate_status(self):
        cert = services.create_certificate(
            volunteer_profile=self.profile_a,
            title='Revocable Certificate',
            hours_recognized=Decimal('10.0'),
        )
        cert.status = Certificate.Status.REVOKED
        cert.save()

        # Volunteer self-service should only show ACTIVE certificates
        self.client.force_authenticate(user=self.user_a)
        res = self.client.get(self.my_certs_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

        # Admin with ?all=true can audit revoked certificates
        self.client.force_authenticate(user=self.admin_user)
        admin_res = self.client.get(self.my_certs_url, {'all': 'true'})
        self.assertEqual(admin_res.status_code, status.HTTP_200_OK)
        self.assertTrue(any(c['status'] == 'REVOKED' for c in admin_res.data))

    def test_unauthenticated_certificates_access_rejected(self):
        res = self.client.get(self.my_certs_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
