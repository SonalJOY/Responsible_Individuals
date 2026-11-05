from datetime import date
from decimal import Decimal
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
)
from apps.volunteers import services

User = get_user_model()


class Phase3RoleLifecycleAndPrivilegeTests(APITestCase):
    def setUp(self):
        self.impact_area = ImpactArea.objects.create(name='Clean Lakes', slug='clean-lakes')
        self.project = Project.objects.create(
            title='Lake Revival',
            slug='lake-revival',
            focus_area=self.impact_area,
            start_date=date(2026, 1, 1),
            budget=Decimal('100000.00'),
        )
        self.opp_a = VolunteerOpportunity.objects.create(
            title='Water Quality Monitor',
            slug='water-quality-monitor',
            focus_area=self.impact_area,
            project=self.project,
            spots_available=5,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )
        self.opp_b = VolunteerOpportunity.objects.create(
            title='Shoreline Cleanup Lead',
            slug='shoreline-cleanup-lead',
            focus_area=self.impact_area,
            project=self.project,
            spots_available=5,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )

    def test_new_volunteer_profile_defaults_to_pending(self):
        """Test that new VolunteerProfile instances default to PENDING status."""
        user = User.objects.create_user(
            email='new.volunteer@test.org',
            password='Password@123',
            first_name='New',
            last_name='Volunteer',
            role='PUBLIC',
        )
        profile = services.get_or_create_volunteer_profile_for_user(user)
        self.assertEqual(profile.approval_status, VolunteerProfile.ApprovalStatus.PENDING)

    def test_multi_application_role_transitions_and_revocation(self):
        """
        Verify that opportunity application status changes DO NOT alter overall VolunteerProfile approval_status:
        - Approved volunteers remain APPROVED when an individual opportunity application is approved, rejected, or revoked.
        - Overall volunteer status is governed exclusively by onboarding review.
        """
        user = User.objects.create_user(
            email='multi.applicant@test.org',
            password='Password@123',
            first_name='Multi',
            last_name='Applicant',
            role='VOLUNTEER',
        )
        profile = services.get_or_create_volunteer_profile_for_user(user)
        profile.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
        profile.save(update_fields=['approval_status'])

        self.assertEqual(profile.approval_status, VolunteerProfile.ApprovalStatus.APPROVED)
        self.assertEqual(user.role, 'VOLUNTEER')

        # Create two applications for different opportunities
        app_a = services.create_volunteer_application(
            volunteer_profile=profile,
            opportunity=self.opp_a,
            statement_of_purpose='Very keen on water quality monitoring.',
        )
        app_b = services.create_volunteer_application(
            volunteer_profile=profile,
            opportunity=self.opp_b,
            statement_of_purpose='Very keen on shoreline cleanup coordination.',
        )

        # 1. Approve Application A -> spots filled increases, profile remains APPROVED
        services.update_application_status(app_a.id, VolunteerApplication.Status.APPROVED, 'Approved candidate')
        profile.refresh_from_db()
        user.refresh_from_db()
        self.assertEqual(profile.approval_status, VolunteerProfile.ApprovalStatus.APPROVED)
        self.assertEqual(user.role, 'VOLUNTEER')

        # 2. Approve Application B -> profile remains APPROVED
        services.update_application_status(app_b.id, VolunteerApplication.Status.APPROVED, 'Approved for second role')
        profile.refresh_from_db()
        user.refresh_from_db()
        self.assertEqual(profile.approval_status, VolunteerProfile.ApprovalStatus.APPROVED)
        self.assertEqual(user.role, 'VOLUNTEER')

        # 3. Reject/Revoke Application A -> profile and role remain APPROVED (not revoked)
        services.update_application_status(app_a.id, VolunteerApplication.Status.REJECTED, 'Revoking role A')
        profile.refresh_from_db()
        user.refresh_from_db()
        self.assertEqual(
            profile.approval_status,
            VolunteerProfile.ApprovalStatus.APPROVED,
            'Profile must remain APPROVED when individual event application is rejected.'
        )
        self.assertEqual(
            user.role,
            'VOLUNTEER',
            'User role must remain VOLUNTEER when individual event application is rejected.'
        )

        # 4. Reject/Revoke Application B -> profile and role STILL remain APPROVED
        services.update_application_status(app_b.id, VolunteerApplication.Status.REJECTED, 'Revoking role B')
        profile.refresh_from_db()
        user.refresh_from_db()
        self.assertEqual(
            profile.approval_status,
            VolunteerProfile.ApprovalStatus.APPROVED,
            'Existing approved volunteers must remain approved when all event applications conclude or change status.'
        )
        self.assertEqual(
            user.role,
            'VOLUNTEER',
            'User role must remain VOLUNTEER regardless of individual opportunity application status.'
        )

    def test_admin_and_staff_privileges_are_strictly_preserved(self):
        """
        Verify that ADMIN and STAFF users:
        - Are NOT downgraded to VOLUNTEER upon application approval.
        - Are NOT downgraded to PUBLIC upon application rejection.
        """
        admin_user = User.objects.create_superuser(
            email='super.admin@test.org',
            password='Strong#AdminPassword2026',
            first_name='Super',
            last_name='Admin',
        )
        # Ensure role is explicitly ADMIN
        admin_user.role = 'ADMIN'
        admin_user.save()

        staff_user = User.objects.create_user(
            email='staff.member@test.org',
            password='Strong#StaffPassword2026',
            first_name='Staff',
            last_name='Member',
            role='STAFF',
            is_staff=True,
        )

        admin_profile = services.get_or_create_volunteer_profile_for_user(admin_user)
        staff_profile = services.get_or_create_volunteer_profile_for_user(staff_user)

        admin_app = services.create_volunteer_application(
            volunteer_profile=admin_profile,
            opportunity=self.opp_a,
            statement_of_purpose='Admin participating in field drive.',
        )
        staff_app = services.create_volunteer_application(
            volunteer_profile=staff_profile,
            opportunity=self.opp_b,
            statement_of_purpose='Staff participating in field drive.',
        )

        # Approve admin application
        services.update_application_status(admin_app.id, VolunteerApplication.Status.APPROVED, 'Approved admin')
        admin_user.refresh_from_db()
        self.assertEqual(admin_user.role, 'ADMIN', 'Admin role must NOT be replaced with VOLUNTEER.')

        # Reject admin application
        services.update_application_status(admin_app.id, VolunteerApplication.Status.REJECTED, 'Revoked admin')
        admin_user.refresh_from_db()
        self.assertEqual(admin_user.role, 'ADMIN', 'Admin role must NOT be downgraded to PUBLIC.')

        # Approve staff application
        services.update_application_status(staff_app.id, VolunteerApplication.Status.APPROVED, 'Approved staff')
        staff_user.refresh_from_db()
        self.assertEqual(staff_user.role, 'STAFF', 'Staff role must NOT be replaced with VOLUNTEER.')

        # Reject staff application
        services.update_application_status(staff_app.id, VolunteerApplication.Status.REJECTED, 'Revoked staff')
        staff_user.refresh_from_db()
        self.assertEqual(staff_user.role, 'STAFF', 'Staff role must NOT be downgraded to PUBLIC.')

    def test_legacy_register_endpoint_returns_deprecation_warning(self):
        """
        Verify that POST /api/v1/volunteers/register/ returns a standard HTTP 299 warning header
        and does NOT issue tokens or activate the account prior to email OTP verification.
        """
        payload = {
            'email': 'legacy.applicant@test.org',
            'password': 'Secure#Password2026!',
            'confirm_password': 'Secure#Password2026!',
            'first_name': 'Legacy',
            'last_name': 'User',
            'phone': '9876543210',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'skills': 'Field work',
        }
        url = reverse('volunteers:volunteer-register')
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('Warning', res.headers)
        self.assertIn('299', res.headers['Warning'])
        self.assertTrue(res.data.get('deprecated'))
        self.assertTrue(res.data.get('requires_otp'))
        self.assertEqual(res.data.get('identifier'), 'legacy.applicant@test.org')
        # Ensure tokens are not issued
        self.assertNotIn('access', res.data)
        self.assertNotIn('refresh', res.data)

        # Ensure user starts unverified, inactive, and with role=PUBLIC
        user = User.objects.get(email='legacy.applicant@test.org')
        self.assertFalse(user.is_verified)
        self.assertFalse(user.is_active)
        self.assertEqual(user.role, User.Role.PUBLIC)
