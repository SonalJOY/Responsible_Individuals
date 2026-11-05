import uuid
from datetime import date
from decimal import Decimal
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.impact.models import ImpactArea
from apps.projects.models import Project
from apps.volunteers.models import (
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerOnboardingApplication,
)
from apps.volunteers import services

User = get_user_model()


class VolunteerOnboardingTests(APITestCase):
    def setUp(self):
        # 1. Regular Applicant (Public user with PENDING profile)
        self.applicant_user = User.objects.create_user(
            email='applicant.joy@test.org',
            password='SecurePassword@123',
            first_name='Applicant',
            last_name='Joy',
            role=User.Role.PUBLIC,
        )
        self.applicant_profile = services.get_or_create_volunteer_profile_for_user(self.applicant_user)

        # 2. Approved Volunteer
        self.approved_user = User.objects.create_user(
            email='approved.volunteer@test.org',
            password='SecurePassword@123',
            first_name='Approved',
            last_name='Volunteer',
            role=User.Role.VOLUNTEER,
        )
        self.approved_profile = services.get_or_create_volunteer_profile_for_user(self.approved_user)
        self.approved_profile.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
        self.approved_profile.save(update_fields=['approval_status'])

        # 3. Super Admin
        self.admin_user = User.objects.create_superuser(
            email='admin.coordinator@test.org',
            password='AdminPassword@2026',
            first_name='Admin',
            last_name='Coordinator',
        )

        # 4. Opportunity for testing permission enforcement
        self.impact_area = ImpactArea.objects.create(name='Lakes', slug='lakes')
        self.project = Project.objects.create(
            title='Lake Restoration',
            slug='lake-restoration',
            focus_area=self.impact_area,
            start_date=date(2026, 1, 1),
            budget=Decimal('50000.00'),
        )
        self.opp = VolunteerOpportunity.objects.create(
            title='Water Testing Lead',
            slug='water-testing-lead',
            focus_area=self.impact_area,
            project=self.project,
            spots_available=10,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )

    def test_unauthenticated_cannot_access_onboarding(self):
        """Unauthenticated requests must be rejected with 401."""
        my_onboarding_url = reverse('volunteers:my-onboarding-application')
        submit_url = reverse('volunteers:submit-onboarding-application')

        self.assertEqual(self.client.get(my_onboarding_url).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.post(submit_url, {}).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_initial_status_is_not_submitted(self):
        """A user who has not submitted an onboarding application receives NOT_SUBMITTED status."""
        self.client.force_authenticate(user=self.applicant_user)
        url = reverse('volunteers:my-onboarding-application')

        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data.get('status'), 'NOT_SUBMITTED')
        self.assertEqual(res.data.get('profile_approval_status'), 'PENDING')

    def test_submit_onboarding_application_success(self):
        """Submitting a valid onboarding application creates record and sets status to SUBMITTED."""
        self.client.force_authenticate(user=self.applicant_user)
        url = reverse('volunteers:submit-onboarding-application')

        payload = {
            'statement_of_intent': 'I am passionate about environmental conservation and community lake cleanups.',
            'skills_summary': 'Water quality testing, documentation, community outreach',
            'experience_summary': 'Volunteered for 2 years in neighborhood afforestation drives.',
            'availability': 'Saturdays and Sundays',
            'city': 'Bengaluru',
            'phone': '9876543210',
        }

        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], 'SUBMITTED')
        self.assertIsNotNone(res.data['submitted_at'])
        self.assertEqual(res.data['volunteer_name'], 'Applicant Joy')

        # Verify database record
        self.applicant_profile.refresh_from_db()
        self.assertEqual(self.applicant_profile.approval_status, VolunteerProfile.ApprovalStatus.PENDING)
        self.assertEqual(self.applicant_profile.city, 'Bengaluru')
        self.assertEqual(self.applicant_profile.phone, '9876543210')

        # Verify onboarding application record exists
        app = VolunteerOnboardingApplication.objects.filter(volunteer_profile=self.applicant_profile).first()
        self.assertIsNotNone(app)
        self.assertEqual(app.status, VolunteerOnboardingApplication.Status.SUBMITTED)

    def test_duplicate_submission_blocked_while_pending(self):
        """A user cannot submit a second onboarding application while one is already SUBMITTED."""
        self.client.force_authenticate(user=self.applicant_user)
        url = reverse('volunteers:submit-onboarding-application')

        payload = {
            'statement_of_intent': 'First submission statement of intent with sufficient character length.',
        }
        res1 = self.client.post(url, payload, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Attempt second submission
        res2 = self.client.post(url, payload, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already have an onboarding application under review', str(res2.data))

    def test_statement_of_intent_minimum_length_validation(self):
        """A statement of intent shorter than 20 characters must be rejected."""
        self.client.force_authenticate(user=self.applicant_user)
        url = reverse('volunteers:submit-onboarding-application')

        res = self.client.post(url, {'statement_of_intent': 'Too short'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('statement_of_intent', res.data)

    def test_admin_can_list_and_retrieve_onboarding_applications(self):
        """Only administrators can list and inspect onboarding applications."""
        # Create an onboarding submission
        services.submit_onboarding_application(
            volunteer_profile=self.applicant_profile,
            validated_data={'statement_of_intent': 'Dedicated to helping citizens and building cleaner water bodies.'}
        )

        admin_list_url = reverse('volunteers:volunteer-onboarding-application-list')

        # Regular applicant cannot access
        self.client.force_authenticate(user=self.applicant_user)
        self.assertEqual(self.client.get(admin_list_url).status_code, status.HTTP_403_FORBIDDEN)

        # Admin can access
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get(admin_list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res.data.get('results', res.data)) >= 1)

    def test_admin_approve_onboarding_application(self):
        """Admin approval transitions onboarding to APPROVED, profile to APPROVED, and user role to VOLUNTEER."""
        onboarding = services.submit_onboarding_application(
            volunteer_profile=self.applicant_profile,
            validated_data={'statement_of_intent': 'Deeply committed to grassroots environmental action.'}
        )

        self.client.force_authenticate(user=self.admin_user)
        review_url = reverse('volunteers:volunteer-onboarding-application-review', kwargs={'pk': str(onboarding.id)})

        res = self.client.post(review_url, {
            'status': 'APPROVED',
            'review_notes': 'Strong background and clear commitment verified.',
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'APPROVED')

        # Check DB state
        onboarding.refresh_from_db()
        self.applicant_profile.refresh_from_db()
        self.applicant_user.refresh_from_db()

        self.assertEqual(onboarding.status, VolunteerOnboardingApplication.Status.APPROVED)
        self.assertEqual(onboarding.admin_review_notes, 'Strong background and clear commitment verified.')
        self.assertEqual(onboarding.reviewed_by, self.admin_user)
        self.assertIsNotNone(onboarding.reviewed_at)

        self.assertEqual(self.applicant_profile.approval_status, VolunteerProfile.ApprovalStatus.APPROVED)
        self.assertEqual(self.applicant_user.role, User.Role.VOLUNTEER)

    def test_approved_volunteer_cannot_resubmit_onboarding(self):
        """An already approved volunteer cannot submit a new onboarding application."""
        self.client.force_authenticate(user=self.approved_user)
        url = reverse('volunteers:submit-onboarding-application')

        res = self.client.post(url, {
            'statement_of_intent': 'Trying to reapply after already being approved.',
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already verified and approved', str(res.data))

    def test_admin_reject_onboarding_application_with_notes(self):
        """Admin rejection transitions onboarding to REJECTED, profile to REJECTED, and preserves feedback."""
        onboarding = services.submit_onboarding_application(
            volunteer_profile=self.applicant_profile,
            validated_data={'statement_of_intent': 'I want to help with things whenever free.'}
        )

        self.client.force_authenticate(user=self.admin_user)
        review_url = reverse('volunteers:volunteer-onboarding-application-review', kwargs={'pk': str(onboarding.id)})

        res = self.client.post(review_url, {
            'status': 'REJECTED',
            'review_notes': 'Please provide more specific details about your skills and availability.',
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'REJECTED')

        onboarding.refresh_from_db()
        self.applicant_profile.refresh_from_db()
        self.applicant_user.refresh_from_db()

        self.assertEqual(onboarding.status, VolunteerOnboardingApplication.Status.REJECTED)
        self.assertEqual(onboarding.admin_review_notes, 'Please provide more specific details about your skills and availability.')
        self.assertEqual(self.applicant_profile.approval_status, VolunteerProfile.ApprovalStatus.REJECTED)
        self.assertEqual(self.applicant_user.role, User.Role.PUBLIC)

    def test_rejected_applicant_can_view_feedback_and_safely_reapply(self):
        """A rejected applicant can view admin feedback and submit a new onboarding application without losing audit history."""
        # 1. Initial submission
        onboarding1 = services.submit_onboarding_application(
            volunteer_profile=self.applicant_profile,
            validated_data={'statement_of_intent': 'Initial brief submission statement.'}
        )
        services.review_onboarding_application(
            application_id=onboarding1.id,
            decision='REJECTED',
            review_notes='Please expand your statement with specific environmental interests.',
            admin_user=self.admin_user
        )

        # 2. Applicant views status and feedback
        self.client.force_authenticate(user=self.applicant_user)
        my_onboarding_url = reverse('volunteers:my-onboarding-application')
        res1 = self.client.get(my_onboarding_url)
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(res1.data['status'], 'REJECTED')
        self.assertIn('expand your statement', res1.data['admin_review_notes'])

        # 3. Applicant safely reapplies with improved statement
        submit_url = reverse('volunteers:submit-onboarding-application')
        res2 = self.client.post(submit_url, {
            'statement_of_intent': 'I have detailed experience in water sampling and lake remediation in East Bengaluru.',
            'skills_summary': 'Water chemistry, lab testing, community organizing',
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res2.data['status'], 'SUBMITTED')

        # 4. Verify audit trail: BOTH application records exist in the database!
        all_apps = VolunteerOnboardingApplication.objects.filter(
            volunteer_profile=self.applicant_profile
        ).order_by('created_at')
        self.assertEqual(all_apps.count(), 2)

        self.assertEqual(all_apps[0].status, VolunteerOnboardingApplication.Status.REJECTED)
        self.assertEqual(all_apps[0].admin_review_notes, 'Please expand your statement with specific environmental interests.')

        self.assertEqual(all_apps[1].status, VolunteerOnboardingApplication.Status.SUBMITTED)
        self.assertEqual(all_apps[1].statement_of_intent, 'I have detailed experience in water sampling and lake remediation in East Bengaluru.')

    def test_server_side_permission_enforcement_on_opportunity_apply(self):
        """Server-side permission enforcement: only APPROVED volunteers or admins can apply for opportunities."""
        apply_url = reverse('volunteers:volunteer-apply')
        payload = {
            'opportunity_id': str(self.opp.id),
            'statement_of_purpose': 'Applying for water testing position on Saturday.',
        }

        # 1. PENDING applicant -> 403 Forbidden
        self.client.force_authenticate(user=self.applicant_user)
        res_pending = self.client.post(apply_url, payload, format='json')
        self.assertEqual(res_pending.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only verified and approved volunteers', str(res_pending.data))

        # 2. REJECTED applicant -> 403 Forbidden
        self.applicant_profile.approval_status = VolunteerProfile.ApprovalStatus.REJECTED
        self.applicant_profile.save(update_fields=['approval_status'])
        res_rejected = self.client.post(apply_url, payload, format='json')
        self.assertEqual(res_rejected.status_code, status.HTTP_403_FORBIDDEN)

        # 3. APPROVED volunteer -> 201 Created
        self.client.force_authenticate(user=self.approved_user)
        res_approved = self.client.post(apply_url, payload, format='json')
        self.assertEqual(res_approved.status_code, status.HTTP_201_CREATED)

        # 4. Super Admin -> 201 Created
        admin_opp_payload = {
            'opportunity_id': str(self.opp.id),
            'statement_of_purpose': 'Admin joining the field drive as observer.',
        }
        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.post(apply_url, admin_opp_payload, format='json')
        self.assertEqual(res_admin.status_code, status.HTTP_201_CREATED)

    def test_admin_staff_roles_not_downgraded_by_onboarding_review(self):
        """Staff/Admin users reviewing or receiving an onboarding decision are never downgraded."""
        staff_user = User.objects.create_user(
            email='staff.reviewer@test.org',
            password='StaffPassword@2026',
            first_name='Staff',
            last_name='Reviewer',
            role='STAFF',
            is_staff=True,
        )
        staff_profile = services.get_or_create_volunteer_profile_for_user(staff_user)

        onboarding = services.submit_onboarding_application(
            volunteer_profile=staff_profile,
            validated_data={'statement_of_intent': 'Staff member onboarding into volunteer field activities.'}
        )

        # Approve
        services.review_onboarding_application(
            application_id=onboarding.id,
            decision='APPROVED',
            review_notes='Approved staff member',
            admin_user=self.admin_user
        )
        staff_user.refresh_from_db()
        self.assertEqual(staff_user.role, 'STAFF', 'Staff role must not be replaced with VOLUNTEER.')

    def test_admin_review_non_existent_uuid_returns_404(self):
        """Admin review request with a non-existent UUID must return HTTP 404."""
        self.client.force_authenticate(user=self.admin_user)
        non_existent_id = str(uuid.uuid4())
        review_url = reverse('volunteers:volunteer-onboarding-application-review', kwargs={'pk': non_existent_id})

        res = self.client.post(review_url, {
            'status': 'APPROVED',
            'review_notes': 'Attempting review on non-existent application',
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_review_malformed_id_returns_404(self):
        """Admin review request with a malformed ID string must return HTTP 404."""
        self.client.force_authenticate(user=self.admin_user)
        review_url = '/api/v1/volunteers/onboarding-applications/invalid-uuid-string/review/'

        res = self.client.post(review_url, {
            'status': 'APPROVED',
            'review_notes': 'Attempting review with invalid ID format',
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_approval_dispatches_notification_once(self):
        """Approving an application dispatches exactly one decision notification."""
        onboarding = services.submit_onboarding_application(
            volunteer_profile=self.applicant_profile,
            validated_data={'statement_of_intent': 'Committed to long-term grassroots lake conservation.'}
        )

        self.client.force_authenticate(user=self.admin_user)
        review_url = reverse('volunteers:volunteer-onboarding-application-review', kwargs={'pk': str(onboarding.id)})

        with patch('apps.volunteers.services.send_onboarding_decision_email.delay') as mock_delay:
            with self.captureOnCommitCallbacks(execute=True):
                res = self.client.post(review_url, {
                    'status': 'APPROVED',
                    'review_notes': 'Applicant approved with verified credentials.',
                }, format='json')

            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertEqual(mock_delay.call_count, 1)
            mock_delay.assert_called_once_with(str(onboarding.id), 'APPROVED')

    def test_repeated_approval_decision_does_not_duplicate_notification(self):
        """Repeating the same approval decision on an already approved application does not dispatch duplicate emails."""
        onboarding = services.submit_onboarding_application(
            volunteer_profile=self.applicant_profile,
            validated_data={'statement_of_intent': 'Deep commitment to community afforestation.'}
        )

        self.client.force_authenticate(user=self.admin_user)
        review_url = reverse('volunteers:volunteer-onboarding-application-review', kwargs={'pk': str(onboarding.id)})

        with patch('apps.volunteers.services.send_onboarding_decision_email.delay') as mock_delay:
            # 1. First approval -> exactly 1 email
            with self.captureOnCommitCallbacks(execute=True):
                res1 = self.client.post(review_url, {'status': 'APPROVED', 'review_notes': 'First decision'}, format='json')
            self.assertEqual(res1.status_code, status.HTTP_200_OK)
            self.assertEqual(mock_delay.call_count, 1)

            # 2. Repeated approval -> 0 additional emails (count remains 1)
            with self.captureOnCommitCallbacks(execute=True):
                res2 = self.client.post(review_url, {'status': 'APPROVED', 'review_notes': 'Repeated review'}, format='json')
            self.assertEqual(res2.status_code, status.HTTP_200_OK)
            self.assertEqual(mock_delay.call_count, 1)

    def test_repeated_rejection_decision_does_not_duplicate_notification(self):
        """Repeating the same rejection decision on an already rejected application does not dispatch duplicate emails."""
        onboarding = services.submit_onboarding_application(
            volunteer_profile=self.applicant_profile,
            validated_data={'statement_of_intent': 'Brief intent for testing duplicate rejection prevention.'}
        )

        self.client.force_authenticate(user=self.admin_user)
        review_url = reverse('volunteers:volunteer-onboarding-application-review', kwargs={'pk': str(onboarding.id)})

        with patch('apps.volunteers.services.send_onboarding_decision_email.delay') as mock_delay:
            # 1. First rejection -> exactly 1 email
            with self.captureOnCommitCallbacks(execute=True):
                res1 = self.client.post(review_url, {'status': 'REJECTED', 'review_notes': 'Initial rejection notes'}, format='json')
            self.assertEqual(res1.status_code, status.HTTP_200_OK)
            self.assertEqual(mock_delay.call_count, 1)

            # 2. Repeated rejection -> 0 additional emails (count remains 1)
            with self.captureOnCommitCallbacks(execute=True):
                res2 = self.client.post(review_url, {'status': 'REJECTED', 'review_notes': 'Updated notes without status change'}, format='json')
            self.assertEqual(res2.status_code, status.HTTP_200_OK)
            self.assertEqual(mock_delay.call_count, 1)

    def test_genuine_new_decision_preserves_notification(self):
        """A genuine status change (e.g. from REJECTED to APPROVED upon re-evaluation) dispatches the new decision notification."""
        onboarding = services.submit_onboarding_application(
            volunteer_profile=self.applicant_profile,
            validated_data={'statement_of_intent': 'Initial submission for transition verification.'}
        )

        self.client.force_authenticate(user=self.admin_user)
        review_url = reverse('volunteers:volunteer-onboarding-application-review', kwargs={'pk': str(onboarding.id)})

        with patch('apps.volunteers.services.send_onboarding_decision_email.delay') as mock_delay:
            # 1. First decision: REJECTED
            with self.captureOnCommitCallbacks(execute=True):
                res1 = self.client.post(review_url, {'status': 'REJECTED', 'review_notes': 'Needs additional info'}, format='json')
            self.assertEqual(res1.status_code, status.HTTP_200_OK)
            self.assertEqual(mock_delay.call_count, 1)
            mock_delay.assert_called_with(str(onboarding.id), 'REJECTED')

            # 2. Genuine new decision: APPROVED upon re-evaluation
            with self.captureOnCommitCallbacks(execute=True):
                res2 = self.client.post(review_url, {'status': 'APPROVED', 'review_notes': 'Additional info provided offline and approved'}, format='json')
            self.assertEqual(res2.status_code, status.HTTP_200_OK)
            self.assertEqual(mock_delay.call_count, 2)
            mock_delay.assert_called_with(str(onboarding.id), 'APPROVED')
