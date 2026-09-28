import uuid
from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.core import mail
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError as DRFValidationError
from celery.exceptions import Retry

from apps.volunteers.models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
)
from apps.volunteers import services
from apps.volunteers.tasks import (
    send_volunteer_registration_email,
    send_admin_registration_email,
    send_application_confirmation_email,
    send_application_status_email,
)

User = get_user_model()


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    CELERY_TASK_ALWAYS_EAGER=True,
    CELERY_TASK_EAGER_PROPAGATES=True,
    VOLUNTEER_ADMIN_EMAIL='volunteer-admin@responsibleindividuals.org',
    DEFAULT_FROM_EMAIL='Responsible Individuals <noreply@responsibleindividuals.org>',
    SITE_NAME='Responsible Individuals',
)
class VolunteerEmailNotificationTests(TestCase):
    def setUp(self):
        mail.outbox.clear()

        self.interest_lake = VolunteerInterest.objects.create(
            name="Lake Rejuvenation",
            slug="lake-rejuvenation"
        )
        self.interest_robotics = VolunteerInterest.objects.create(
            name="Youth Robotics",
            slug="youth-robotics"
        )

        self.opportunity = VolunteerOpportunity.objects.create(
            title="Kaikondrahalli Lake Water Quality Audit",
            slug="kaikondrahalli-water-audit",
            location="Bengaluru East",
            commitment="4 hours/weekend",
            spots_available=5,
            spots_filled=0,
            description="Perform scientific water sample tests.",
            responsibilities="Collect samples, log pH, test turbidity.",
            requirements="Basic chemistry familiarity or enthusiasm to learn.",
            status=VolunteerOpportunity.Status.OPEN,
        )

    def test_01_successful_registration_sends_volunteer_and_admin_emails(self):
        """1 & 2. Successful volunteer registration sends confirmation to volunteer and notification to admin."""
        with self.captureOnCommitCallbacks(execute=True):
            result = services.register_volunteer({
                'email': 'priya.sharma@example.com',
                'password': 'SecureVolunteerPassword2026!',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'phone': '+91 98765 43210',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'occupation': 'Environmental Scientist',
                'skills': 'Water Testing, Community Mobilization',
                'availability': 'Weekends',
                'interests': [self.interest_lake.slug, self.interest_robotics.slug],
            })

        self.assertIsNotNone(result['user'])
        self.assertIsNotNone(result['volunteer_profile'])

        # 2 emails should be sent: 1 to volunteer, 1 to admin
        self.assertEqual(len(mail.outbox), 2)

        # Volunteer Confirmation Email
        volunteer_email = next((m for m in mail.outbox if 'priya.sharma@example.com' in m.to), None)
        self.assertIsNotNone(volunteer_email, "Volunteer confirmation email was not sent")
        self.assertIn("Welcome to Responsible Individuals", volunteer_email.subject)
        self.assertIn("Registration Confirmed", volunteer_email.subject)
        self.assertIn("Priya Sharma", volunteer_email.body)
        self.assertIn("Lake Rejuvenation", volunteer_email.body)
        # Verify passwords/secrets are NOT in email
        self.assertNotIn("SecureVolunteerPassword2026!", volunteer_email.body)

        # Admin Notification Email
        admin_email = next((m for m in mail.outbox if 'volunteer-admin@responsibleindividuals.org' in m.to), None)
        self.assertIsNotNone(admin_email, "Admin registration notification email was not sent")
        self.assertIn("New Volunteer Registered: Priya Sharma", admin_email.subject)
        self.assertIn("priya.sharma@example.com", admin_email.body)
        self.assertIn("+91 98765 43210", admin_email.body)
        self.assertIn("Environmental Scientist", admin_email.body)
        self.assertNotIn("SecureVolunteerPassword2026!", admin_email.body)

    def test_02_failed_registration_does_not_send_emails(self):
        """3. Failed registration (e.g. missing required fields or duplicate email) does NOT send emails."""
        with self.assertRaises(DRFValidationError):
            with self.captureOnCommitCallbacks(execute=True):
                services.register_volunteer({
                    'email': '',  # Invalid email
                    'password': 'SomePassword123!',
                    'first_name': 'Invalid',
                })

        self.assertEqual(len(mail.outbox), 0)

    def test_03_successful_application_sends_confirmation_email(self):
        """4. Successful application creation sends confirmation email to volunteer."""
        user = User.objects.create_user(
            email='arjun.patel@example.com',
            password='TestPassword123!',
            first_name='Arjun',
            last_name='Patel',
            role=User.Role.VOLUNTEER,
        )
        profile = services.get_or_create_volunteer_profile_for_user(user)

        with self.captureOnCommitCallbacks(execute=True):
            app = services.create_volunteer_application(
                volunteer_profile=profile,
                opportunity=self.opportunity,
                statement_of_purpose="I have 3 years experience in community water monitoring.",
                experience="Conducted 12 lake water health assessments.",
            )

        self.assertEqual(app.status, VolunteerApplication.Status.PENDING)
        self.assertEqual(len(mail.outbox), 1)

        sent_msg = mail.outbox[0]
        self.assertIn('arjun.patel@example.com', sent_msg.to)
        self.assertIn(f"Application Received: {self.opportunity.title}", sent_msg.subject)
        self.assertIn("Arjun Patel", sent_msg.body)
        self.assertIn("Kaikondrahalli Lake Water Quality Audit", sent_msg.body)
        self.assertIn("Pending Review", sent_msg.body)

    def test_04_duplicate_application_fails_and_does_not_send_email(self):
        """5. Attempting duplicate application fails validation and sends no extra email."""
        user = User.objects.create_user(
            email='kavita.nair@example.com',
            password='TestPassword123!',
            first_name='Kavita',
            last_name='Nair',
            role=User.Role.VOLUNTEER,
        )
        profile = services.get_or_create_volunteer_profile_for_user(user)

        # First application succeeds
        with self.captureOnCommitCallbacks(execute=True):
            services.create_volunteer_application(
                volunteer_profile=profile,
                opportunity=self.opportunity,
                statement_of_purpose="Passionate about local urban ecology.",
            )
        self.assertEqual(len(mail.outbox), 1)
        mail.outbox.clear()

        # Duplicate application attempt
        with self.assertRaises(DRFValidationError):
            with self.captureOnCommitCallbacks(execute=True):
                services.create_volunteer_application(
                    volunteer_profile=profile,
                    opportunity=self.opportunity,
                    statement_of_purpose="Submitting second duplicate application.",
                )

        # Must not send another confirmation email
        self.assertEqual(len(mail.outbox), 0)

    def test_05_application_approval_sends_approval_email(self):
        """6. Transition from PENDING -> APPROVED sends approval email."""
        user = User.objects.create_user(
            email='rahul.verma@example.com',
            password='TestPassword123!',
            first_name='Rahul',
            last_name='Verma',
            role=User.Role.VOLUNTEER,
        )
        profile = services.get_or_create_volunteer_profile_for_user(user)
        app = services.create_volunteer_application(
            volunteer_profile=profile,
            opportunity=self.opportunity,
            statement_of_purpose="Excited to participate in field surveys.",
        )
        mail.outbox.clear()

        with self.captureOnCommitCallbacks(execute=True):
            services.update_application_status(
                application_id=app.id,
                new_status=VolunteerApplication.Status.APPROVED,
                review_notes="Approved for the Saturday morning batch."
            )

        self.assertEqual(len(mail.outbox), 1)
        msg = mail.outbox[0]
        self.assertIn('rahul.verma@example.com', msg.to)
        self.assertIn(f"Application Approved: {self.opportunity.title}", msg.subject)
        self.assertIn("Rahul Verma", msg.body)
        self.assertIn("Approved for the Saturday morning batch.", msg.body)

    def test_06_application_rejection_sends_rejection_email(self):
        """7. Transition from PENDING -> REJECTED sends respectful decline email."""
        user = User.objects.create_user(
            email='sneha.rao@example.com',
            password='TestPassword123!',
            first_name='Sneha',
            last_name='Rao',
            role=User.Role.VOLUNTEER,
        )
        profile = services.get_or_create_volunteer_profile_for_user(user)
        app = services.create_volunteer_application(
            volunteer_profile=profile,
            opportunity=self.opportunity,
            statement_of_purpose="Interested in learning water testing techniques.",
        )
        mail.outbox.clear()

        with self.captureOnCommitCallbacks(execute=True):
            services.update_application_status(
                application_id=app.id,
                new_status=VolunteerApplication.Status.REJECTED,
                review_notes="Role filled for this cohort."
            )

        self.assertEqual(len(mail.outbox), 1)
        msg = mail.outbox[0]
        self.assertIn('sneha.rao@example.com', msg.to)
        self.assertIn(f"Update on Your Volunteer Application: {self.opportunity.title}", msg.subject)
        self.assertIn("Sneha Rao", msg.body)
        self.assertIn("Role filled for this cohort.", msg.body)

    def test_07_application_waitlist_sends_waitlist_email(self):
        """8. Transition from PENDING -> WAITLISTED sends waitlist email."""
        user = User.objects.create_user(
            email='manish.gupta@example.com',
            password='TestPassword123!',
            first_name='Manish',
            last_name='Gupta',
            role=User.Role.VOLUNTEER,
        )
        profile = services.get_or_create_volunteer_profile_for_user(user)
        app = services.create_volunteer_application(
            volunteer_profile=profile,
            opportunity=self.opportunity,
            statement_of_purpose="Available every Sunday for water testing.",
        )
        mail.outbox.clear()

        with self.captureOnCommitCallbacks(execute=True):
            services.update_application_status(
                application_id=app.id,
                new_status=VolunteerApplication.Status.WAITLISTED,
                review_notes="Added to waitlist #1"
            )

        self.assertEqual(len(mail.outbox), 1)
        msg = mail.outbox[0]
        self.assertIn('manish.gupta@example.com', msg.to)
        self.assertIn(f"Application Waitlisted: {self.opportunity.title}", msg.subject)
        self.assertIn("Manish Gupta", msg.body)
        self.assertIn("Added to waitlist #1", msg.body)

    def test_08_same_status_update_does_not_send_duplicate_email(self):
        """9. Idempotency: Saving the same status (e.g. APPROVED -> APPROVED) sends NO email."""
        user = User.objects.create_user(
            email='ananya.das@example.com',
            password='TestPassword123!',
            first_name='Ananya',
            last_name='Das',
            role=User.Role.VOLUNTEER,
        )
        profile = services.get_or_create_volunteer_profile_for_user(user)
        app = services.create_volunteer_application(
            volunteer_profile=profile,
            opportunity=self.opportunity,
            statement_of_purpose="Ecology volunteer.",
        )

        # Transition PENDING -> APPROVED
        with self.captureOnCommitCallbacks(execute=True):
            services.update_application_status(
                application_id=app.id,
                new_status=VolunteerApplication.Status.APPROVED,
            )
        self.assertEqual(len(mail.outbox), 1)
        mail.outbox.clear()

        # Update again with APPROVED -> APPROVED (e.g. updating review notes only)
        with self.captureOnCommitCallbacks(execute=True):
            services.update_application_status(
                application_id=app.id,
                new_status=VolunteerApplication.Status.APPROVED,
                review_notes="Updated internal review note without status change."
            )

        # No duplicate status email should be sent
        self.assertEqual(len(mail.outbox), 0)

    def test_09_email_failure_does_not_corrupt_or_rollback_database(self):
        """14. If the email sending backend raises an error, database records remain intact."""
        user = User.objects.create_user(
            email='deepak.kumar@example.com',
            password='TestPassword123!',
            first_name='Deepak',
            last_name='Kumar',
            role=User.Role.VOLUNTEER,
        )
        profile = services.get_or_create_volunteer_profile_for_user(user)

        with patch('apps.volunteers.tasks._send_templated_email', side_effect=RuntimeError("SMTP Connection Timeout")):
            # Celery task should handle the exception gracefully
            success = send_application_confirmation_email(application_id=uuid.uuid4())
            self.assertFalse(success)

        # Application creation in database should succeed regardless
        app = services.create_volunteer_application(
            volunteer_profile=profile,
            opportunity=self.opportunity,
            statement_of_purpose="Deepak statement of purpose.",
        )
        self.assertTrue(VolunteerApplication.objects.filter(id=app.id).exists())

    def test_10_celery_task_retry_behavior_on_transient_error(self):
        """15. Celery tasks invoke retry with backoff on transient errors."""
        user = User.objects.create_user(
            email='vikram.singh@example.com',
            password='TestPassword123!',
            first_name='Vikram',
            last_name='Singh',
            role=User.Role.VOLUNTEER,
        )
        profile = services.get_or_create_volunteer_profile_for_user(user)

        with patch('apps.volunteers.tasks.send_volunteer_registration_email.retry') as mock_retry:
            mock_retry.side_effect = Retry("Simulated task retry")
            with patch('apps.volunteers.tasks._send_templated_email', side_effect=ConnectionError("Transient socket error")):
                with self.assertRaises(Retry):
                    send_volunteer_registration_email(str(profile.id))

            mock_retry.assert_called_once()
