from unittest.mock import patch
from django.test import TestCase, override_settings
from django.core import mail
from rest_framework.test import APIClient
from rest_framework import status
from apps.contact.models import ContactEnquiry


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    CONTACT_ADMIN_EMAIL='ri.responsibleindividuals@gmail.com',
    DEFAULT_FROM_EMAIL='Responsible Individuals <noreply@responsibleindividuals.org>',
)
class ContactEnquiryNotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        mail.outbox.clear()

    def test_enquiry_submission_creates_db_record_and_sends_email_to_admin(self):
        payload = {
            'name': 'Ramesh V',
            'email': 'ramesh@example.com',
            'phone': '+91 98765 43210',
            'department': 'VOLUNTEER',
            'subject': 'Weekend Lake Cleanup Volunteering',
            'message': 'I would love to participate in upcoming tree plantation drives in Kengeri.'
        }

        response = self.client.post('/api/v1/contact/enquiries/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactEnquiry.objects.count(), 1)
        enquiry = ContactEnquiry.objects.first()
        self.assertEqual(enquiry.name, 'Ramesh V')
        self.assertEqual(enquiry.email, 'ramesh@example.com')
        self.assertEqual(enquiry.status, ContactEnquiry.Status.NEW)

        # Verify email dispatched to ri.responsibleindividuals@gmail.com
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]

        # Verify recipient is exactly ri.responsibleindividuals@gmail.com
        self.assertIn('ri.responsibleindividuals@gmail.com', sent_email.to)
        self.assertEqual(sent_email.reply_to, ['ramesh@example.com'])
        self.assertIn('Volunteer Opportunities', sent_email.subject)
        self.assertIn('Weekend Lake Cleanup Volunteering', sent_email.subject)

        # Verify body contains enquiry details
        self.assertIn('Ramesh V', sent_email.body)
        self.assertIn('ramesh@example.com', sent_email.body)
        self.assertIn('+91 98765 43210', sent_email.body)
        self.assertIn('tree plantation drives in Kengeri', sent_email.body)

    def test_enquiry_submission_handles_email_failure_gracefully(self):
        payload = {
            'name': 'Priya S',
            'email': 'priya@example.com',
            'phone': '+91 99000 12345',
            'department': 'CSR',
            'subject': 'Corporate Partnership Proposal',
            'message': 'We would like to explore CSR collaboration for solar energy in schools.'
        }

        # Simulate SMTP connection error
        with patch('django.core.mail.EmailMultiAlternatives.send', side_effect=Exception("SMTP Connection Refused")):
            response = self.client.post('/api/v1/contact/enquiries/', payload, format='json')

            # The API should still succeed with 201 Created and save the record in database
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(ContactEnquiry.objects.count(), 1)
            enquiry = ContactEnquiry.objects.first()
            self.assertEqual(enquiry.name, 'Priya S')
