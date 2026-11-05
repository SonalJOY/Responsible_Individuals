from decimal import Decimal
from datetime import date
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.impact.models import ImpactArea
from apps.projects.models import Project
from apps.volunteers.models import (
    VolunteerOpportunity,
    VolunteerApplication,
    VolunteerProfile,
    VolunteerParticipation,
    Certificate,
    VolunteerOnboardingApplication,
)
from apps.volunteers import services

User = get_user_model()


class VolunteerPermissionTests(APITestCase):
    def setUp(self):
        # 1. Visitor (unauthenticated)
        # 2. Volunteer user
        reg = services.register_volunteer({
            'email': 'regular.vol@test.org',
            'password': 'Password@123',
            'first_name': 'Regular',
            'last_name': 'Volunteer',
        })
        self.vol_user = reg['user']
        self.vol_profile = reg['volunteer_profile']

        # 3. Admin user
        self.admin_user = User.objects.create_superuser(
            email='admin.perm@test.org',
            password='AdminPassword123',
            first_name='Admin',
            last_name='User',
        )

        self.impact_area = ImpactArea.objects.create(name='Afforestation', slug='afforestation')
        self.project = Project.objects.create(
            title='Tree Planting',
            slug='tree-planting',
            focus_area=self.impact_area,
            start_date=date(2026, 1, 1),
            budget=Decimal('10000.00'),
        )
        self.opp = VolunteerOpportunity.objects.create(
            title='Forest Guard',
            slug='forest-guard',
            focus_area=self.impact_area,
            spots_available=5,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )
        self.app = services.create_volunteer_application(
            volunteer_profile=self.vol_profile,
            opportunity=self.opp,
            statement_of_purpose='Want to help.',
        )

    def test_visitor_public_access_allowed(self):
        # Opportunities list
        res_opp = self.client.get(reverse('volunteers:volunteer-opportunity-list'))
        self.assertEqual(res_opp.status_code, status.HTTP_200_OK)

        # Interests list
        res_int = self.client.get(reverse('volunteers:volunteer-interest-list'))
        self.assertEqual(res_int.status_code, status.HTTP_200_OK)

    def test_visitor_private_endpoints_rejected(self):
        self.assertEqual(self.client.get(reverse('volunteers:my-volunteer-profile')).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(reverse('volunteers:my-volunteer-applications')).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(reverse('volunteers:my-volunteer-participations')).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(reverse('volunteers:my-volunteer-certificates')).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_visitor_cannot_approve_applications(self):
        url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app.id)})
        res = self.client.post(url, {'status': 'APPROVED'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_volunteer_cannot_approve_applications(self):
        self.client.force_authenticate(user=self.vol_user)
        url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app.id)})
        res = self.client.post(url, {'status': 'APPROVED'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_volunteer_cannot_access_admin_endpoints(self):
        self.client.force_authenticate(user=self.vol_user)
        # Admin profiles list
        res_profiles = self.client.get(reverse('volunteers:volunteer-profile-list'))
        self.assertEqual(res_profiles.status_code, status.HTTP_403_FORBIDDEN)

        # Admin applications list
        res_apps = self.client.get(reverse('volunteers:volunteer-application-list'))
        self.assertEqual(res_apps.status_code, status.HTTP_403_FORBIDDEN)

        # Admin participations list
        res_parts = self.client.get(reverse('volunteers:volunteer-participation-list'))
        self.assertEqual(res_parts.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_has_full_management_access(self):
        self.client.force_authenticate(user=self.admin_user)

        res_profiles = self.client.get(reverse('volunteers:volunteer-profile-list'))
        self.assertEqual(res_profiles.status_code, status.HTTP_200_OK)

        res_apps = self.client.get(reverse('volunteers:volunteer-application-list'))
        self.assertEqual(res_apps.status_code, status.HTTP_200_OK)

        res_parts = self.client.get(reverse('volunteers:volunteer-participation-list'))
        self.assertEqual(res_parts.status_code, status.HTTP_200_OK)

        # Admin can approve
        url = reverse('volunteers:volunteer-application-update-status', kwargs={'pk': str(self.app.id)})
        res_approve = self.client.post(url, {'status': 'APPROVED', 'review_notes': 'OK'}, format='json')
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)

    def test_rejected_and_pending_applicants_cannot_access_approved_volunteer_apis(self):
        """
        Verify that applicants with PENDING or REJECTED status, or users without volunteer profile,
        are strictly prohibited (403 Forbidden) from accessing approved-volunteer endpoints:
        1. POST /api/v1/volunteers/apply/
        2. POST /api/v1/volunteers/applications/
        """
        apply_url = reverse('volunteers:volunteer-apply')
        viewset_url = reverse('volunteers:volunteer-application-list')

        # 1. PENDING applicant
        pending_user = User.objects.create_user(
            email='pending.applicant.test@example.com',
            password='Password@123',
            first_name='Pending',
            last_name='Applicant',
            role=User.Role.PUBLIC,
        )
        pending_profile = services.get_or_create_volunteer_profile_for_user(pending_user)
        self.assertEqual(pending_profile.approval_status, VolunteerProfile.ApprovalStatus.PENDING)

        self.client.force_authenticate(user=pending_user)
        res_apply_pending = self.client.post(apply_url, {
            'opportunity_id': str(self.opp.id),
            'statement_of_purpose': 'I would love to participate in this drive.'
        }, format='json')
        self.assertEqual(res_apply_pending.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only verified and approved volunteers', str(res_apply_pending.data))

        res_vs_pending = self.client.post(viewset_url, {
            'opportunity': str(self.opp.id),
            'volunteer_profile': str(pending_profile.id),
            'statement_of_purpose': 'Trying ViewSet create as pending.'
        }, format='json')
        self.assertEqual(res_vs_pending.status_code, status.HTTP_403_FORBIDDEN)

        # 2. REJECTED applicant
        rejected_user = User.objects.create_user(
            email='rejected.applicant.test@example.com',
            password='Password@123',
            first_name='Rejected',
            last_name='Applicant',
            role=User.Role.PUBLIC,
        )
        rejected_profile = services.get_or_create_volunteer_profile_for_user(rejected_user)
        rejected_profile.approval_status = VolunteerProfile.ApprovalStatus.REJECTED
        rejected_profile.save(update_fields=['approval_status'])

        self.client.force_authenticate(user=rejected_user)
        res_apply_rejected = self.client.post(apply_url, {
            'opportunity_id': str(self.opp.id),
            'statement_of_purpose': 'Re-applying to opportunity directly.'
        }, format='json')
        self.assertEqual(res_apply_rejected.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only verified and approved volunteers', str(res_apply_rejected.data))

        res_vs_rejected = self.client.post(viewset_url, {
            'opportunity': str(self.opp.id),
            'volunteer_profile': str(rejected_profile.id),
            'statement_of_purpose': 'Trying ViewSet create as rejected.'
        }, format='json')
        self.assertEqual(res_vs_rejected.status_code, status.HTTP_403_FORBIDDEN)

        # 3. User with no volunteer profile at all
        no_profile_user = User.objects.create_user(
            email='no.profile.user@example.com',
            password='Password@123',
            first_name='No',
            last_name='Profile',
            role=User.Role.PUBLIC,
        )
        self.client.force_authenticate(user=no_profile_user)
        res_apply_no_prof = self.client.post(apply_url, {
            'opportunity_id': str(self.opp.id),
            'statement_of_purpose': 'No profile apply attempt.'
        }, format='json')
        self.assertEqual(res_apply_no_prof.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_and_staff_privilege_boundaries_on_certificates_participation_and_onboarding(self):
        """
        Verify that admin and staff privileges preserve existing privilege boundaries:
        - Staff & Admin CAN issue certificates, log participations, and review onboarding.
        - Regular volunteers and applicants CANNOT (receive 403 Forbidden).
        - Staff user roles are protected and NOT downgraded by reviewing onboarding.
        """
        # Staff user
        staff_user = User.objects.create_user(
            email='coordinator.staff@example.com',
            password='StaffPassword@123',
            first_name='Coordinator',
            last_name='Staff',
            role=User.Role.VOLUNTEER_MANAGER,
            is_staff=True,
        )

        # Candidate needing onboarding review
        candidate_user = User.objects.create_user(
            email='candidate.volunteer@example.com',
            password='CandidatePassword@123',
            first_name='Candidate',
            last_name='Vol',
            role=User.Role.PUBLIC,
        )
        candidate_profile = services.get_or_create_volunteer_profile_for_user(candidate_user)
        onboarding_app = services.submit_onboarding_application(
            volunteer_profile=candidate_profile,
            validated_data={'statement_of_intent': 'Passionate about citizen action and tree planting.'}
        )

        # A. Certificate issuance (POST /api/v1/volunteers/admin/certificates/)
        cert_url = reverse('volunteers:volunteer-admin-certificate-list')
        cert_payload = {
            'volunteer_profile': str(self.vol_profile.id),
            'certificate_code': 'RI-CERT-STAFF-TEST-001',
            'title': 'Field Dedication Certificate',
            'description': 'Awarded for volunteer service',
            'issue_date': '2026-10-23',
            'hours_recognized': '20.0',
        }

        # Regular volunteer -> 403 Forbidden
        self.client.force_authenticate(user=self.vol_user)
        res_cert_vol = self.client.post(cert_url, cert_payload, format='json')
        self.assertEqual(res_cert_vol.status_code, status.HTTP_403_FORBIDDEN)

        # Staff user -> 201 Created
        self.client.force_authenticate(user=staff_user)
        res_cert_staff = self.client.post(cert_url, cert_payload, format='json')
        self.assertEqual(res_cert_staff.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_cert_staff.data['certificate_code'], 'RI-CERT-STAFF-TEST-001')

        # B. Participation logging (POST /api/v1/volunteers/participations/)
        part_url = reverse('volunteers:volunteer-participation-list')
        part_payload = {
            'volunteer_profile': str(self.vol_profile.id),
            'project': self.project.id,
            'date': '2026-10-23',
            'hours': '5.0',
            'activity_performed': 'Tree plantation supervision',
            'verified': True,
        }

        # Regular volunteer -> 403 Forbidden
        self.client.force_authenticate(user=self.vol_user)
        res_part_vol = self.client.post(part_url, part_payload, format='json')
        self.assertEqual(res_part_vol.status_code, status.HTTP_403_FORBIDDEN)

        # Staff user -> 201 Created
        self.client.force_authenticate(user=staff_user)
        res_part_staff = self.client.post(part_url, part_payload, format='json')
        self.assertEqual(res_part_staff.status_code, status.HTTP_201_CREATED)

        # C. Onboarding review (POST /api/v1/volunteers/onboarding-applications/{id}/review/)
        review_url = reverse('volunteers:volunteer-onboarding-application-review', kwargs={'pk': str(onboarding_app.id)})
        review_payload = {
            'status': 'APPROVED',
            'review_notes': 'Staff review verified credentials and onboarding intent.'
        }

        # Regular volunteer -> 403 Forbidden
        self.client.force_authenticate(user=self.vol_user)
        res_review_vol = self.client.post(review_url, review_payload, format='json')
        self.assertEqual(res_review_vol.status_code, status.HTTP_403_FORBIDDEN)

        # Staff user -> 200 OK
        self.client.force_authenticate(user=staff_user)
        res_review_staff = self.client.post(review_url, review_payload, format='json')
        self.assertEqual(res_review_staff.status_code, status.HTTP_200_OK)
        self.assertEqual(res_review_staff.data['status'], 'APPROVED')

        # Verify candidate profile is now approved and role is VOLUNTEER
        candidate_profile.refresh_from_db()
        candidate_user.refresh_from_db()
        self.assertEqual(candidate_profile.approval_status, VolunteerProfile.ApprovalStatus.APPROVED)
        self.assertEqual(candidate_user.role, User.Role.VOLUNTEER)

        # Verify staff user role was NOT downgraded or altered
        staff_user.refresh_from_db()
        self.assertEqual(staff_user.role, User.Role.VOLUNTEER_MANAGER)
        self.assertTrue(staff_user.is_staff)

    def test_reapplication_preserves_prior_audit_trail_and_enforces_permissions_until_approved(self):
        """
        Confirm that:
        1. A rejected applicant can submit a new onboarding application.
        2. The previous rejected record and its review notes remain intact in the database.
        3. While the reapplication is in SUBMITTED status, the applicant still cannot access
           approved-volunteer APIs.
        4. Once the reapplication is approved, the applicant gains access to opportunity applications.
        """
        applicant_user = User.objects.create_user(
            email='reapplicant.audit@example.com',
            password='Password@123',
            first_name='Reapplicant',
            last_name='Audit',
            role=User.Role.PUBLIC,
        )
        applicant_profile = services.get_or_create_volunteer_profile_for_user(applicant_user)

        # 1. Initial submission and rejection
        first_app = services.submit_onboarding_application(
            volunteer_profile=applicant_profile,
            validated_data={'statement_of_intent': 'First attempt with minimal details.'}
        )
        services.review_onboarding_application(
            application_id=first_app.id,
            decision='REJECTED',
            review_notes='Needs more detail on availability and relevant past experience.',
            admin_user=self.admin_user,
        )

        applicant_profile.refresh_from_db()
        self.assertEqual(applicant_profile.approval_status, VolunteerProfile.ApprovalStatus.REJECTED)

        # 2. Re-apply via POST /api/v1/volunteers/submit-onboarding/
        self.client.force_authenticate(user=applicant_user)
        submit_url = reverse('volunteers:submit-onboarding-application')
        res_reapply = self.client.post(submit_url, {
            'statement_of_intent': 'Second submission: Detailed 5-year experience in lake desilting and water testing.',
            'skills_summary': 'Water testing, botany, student coordination',
            'availability': 'Every Saturday and Sunday',
        }, format='json')
        self.assertEqual(res_reapply.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_reapply.data['status'], 'SUBMITTED')

        # 3. Confirm audit trail: 2 distinct records in database
        all_onboarding_records = VolunteerOnboardingApplication.objects.filter(
            volunteer_profile=applicant_profile
        ).order_by('created_at')
        self.assertEqual(all_onboarding_records.count(), 2)

        # Record 1: unchanged, retains REJECTED status and review notes
        rec1 = all_onboarding_records[0]
        self.assertEqual(rec1.status, VolunteerOnboardingApplication.Status.REJECTED)
        self.assertEqual(rec1.admin_review_notes, 'Needs more detail on availability and relevant past experience.')
        self.assertEqual(rec1.statement_of_intent, 'First attempt with minimal details.')

        # Record 2: new, SUBMITTED status
        rec2 = all_onboarding_records[1]
        self.assertEqual(rec2.status, VolunteerOnboardingApplication.Status.SUBMITTED)
        self.assertEqual(rec2.statement_of_intent, 'Second submission: Detailed 5-year experience in lake desilting and water testing.')
        self.assertEqual(rec2.admin_review_notes, '')

        # 4. While second application is pending (SUBMITTED), applicant STILL cannot apply for opportunities
        apply_url = reverse('volunteers:volunteer-apply')
        res_apply_blocked = self.client.post(apply_url, {
            'opportunity_id': str(self.opp.id),
            'statement_of_purpose': 'Attempting to apply while re-application is under review.'
        }, format='json')
        self.assertEqual(res_apply_blocked.status_code, status.HTTP_403_FORBIDDEN)

        # 5. Admin approves reapplication
        services.review_onboarding_application(
            application_id=rec2.id,
            decision='APPROVED',
            review_notes='Re-application accepted. Excellent detailed background.',
            admin_user=self.admin_user,
        )

        applicant_profile.refresh_from_db()
        applicant_user.refresh_from_db()
        self.assertEqual(applicant_profile.approval_status, VolunteerProfile.ApprovalStatus.APPROVED)
        self.assertEqual(applicant_user.role, User.Role.VOLUNTEER)

        # 6. Now applicant CAN successfully apply
        res_apply_success = self.client.post(apply_url, {
            'opportunity_id': str(self.opp.id),
            'statement_of_purpose': 'Successfully applying now that onboarding is approved!'
        }, format='json')
        self.assertEqual(res_apply_success.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_apply_success.data['application']['status'], 'PENDING')

        # Confirm all 2 onboarding applications are still in DB
        self.assertEqual(
            VolunteerOnboardingApplication.objects.filter(volunteer_profile=applicant_profile).count(),
            2
        )
    # ================================================================
    # PHASE 2.1.1: DEACTIVATED VOLUNTEER RESTRICTIONS TESTS
    # ================================================================

    def test_approved_and_active_volunteer_retains_access(self):
        """Approved and active volunteers can successfully apply to opportunities."""
        self.vol_profile.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
        self.vol_profile.is_active = True
        self.vol_profile.save()

        self.client.force_authenticate(user=self.vol_user)
        opp_new = VolunteerOpportunity.objects.create(
            title='Park Cleanup Drive',
            slug='park-cleanup-drive',
            focus_area=self.impact_area,
            spots_available=10,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )
        res = self.client.post(reverse('volunteers:volunteer-apply'), {
            'opportunity_id': str(opp_new.id),
            'statement_of_purpose': 'Active approved volunteer applying.',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_approved_but_inactive_volunteer_receives_403_for_restricted_actions(self):
        """
        Approved volunteers whose profile is deactivated (is_active=False) receive HTTP 403
        when attempting restricted volunteer actions (e.g. applying to volunteer drives).
        """
        self.vol_profile.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
        self.vol_profile.is_active = False
        self.vol_profile.save()

        self.client.force_authenticate(user=self.vol_user)
        opp_new = VolunteerOpportunity.objects.create(
            title='Lake Desilting Weekend',
            slug='lake-desilting-weekend',
            focus_area=self.impact_area,
            spots_available=10,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )

        # 1. Dedicated apply endpoint
        res_apply = self.client.post(reverse('volunteers:volunteer-apply'), {
            'opportunity_id': str(opp_new.id),
            'statement_of_purpose': 'Inactive volunteer trying to apply.',
        }, format='json')
        self.assertEqual(res_apply.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('inactive or suspended', str(res_apply.data))

        # 2. ViewSet application creation
        res_vs = self.client.post(reverse('volunteers:volunteer-application-list'), {
            'opportunity': str(opp_new.id),
            'volunteer_profile': str(self.vol_profile.id),
            'statement_of_purpose': 'Inactive volunteer ViewSet attempt.',
        }, format='json')
        self.assertEqual(res_vs.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('inactive or suspended', str(res_vs.data))

    def test_reactivating_volunteer_restores_access(self):
        """Reactivating an inactive volunteer profile immediately restores application access."""
        self.vol_profile.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
        self.vol_profile.is_active = False
        self.vol_profile.save()

        self.client.force_authenticate(user=self.vol_user)
        opp_new = VolunteerOpportunity.objects.create(
            title='Beach Revival Session',
            slug='beach-revival-session',
            focus_area=self.impact_area,
            spots_available=10,
            spots_filled=0,
            status=VolunteerOpportunity.Status.OPEN,
        )

        # Initially blocked
        res_blocked = self.client.post(reverse('volunteers:volunteer-apply'), {
            'opportunity_id': str(opp_new.id),
            'statement_of_purpose': 'Blocked while inactive.',
        }, format='json')
        self.assertEqual(res_blocked.status_code, status.HTTP_403_FORBIDDEN)

        # Admin reactivates profile
        services.update_volunteer_active_status(
            profile_or_id=self.vol_profile,
            is_active=True,
            reason='Volunteer returned and reactivated by admin',
            admin_user=self.admin_user,
        )

        # Now volunteer can apply successfully
        res_allowed = self.client.post(reverse('volunteers:volunteer-apply'), {
            'opportunity_id': str(opp_new.id),
            'statement_of_purpose': 'Applying now that profile is reactivated!',
        }, format='json')
        self.assertEqual(res_allowed.status_code, status.HTTP_201_CREATED)

    def test_deactivated_volunteer_general_account_authentication_unaffected(self):
        """
        Deactivating a VolunteerProfile does NOT disable the user account:
        The citizen can still authenticate, retrieve their profile, and access historical records.
        """
        self.vol_user.is_active = True
        self.vol_user.save()
        self.vol_profile.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
        self.vol_profile.is_active = True
        self.vol_profile.save()

        # Admin deactivates volunteer profile
        services.update_volunteer_active_status(
            profile_or_id=self.vol_profile,
            is_active=False,
            reason='Volunteer requested account hiatus',
            admin_user=self.admin_user,
        )

        # User is_active remains True
        self.vol_user.refresh_from_db()
        self.assertTrue(self.vol_user.is_active)

        # Authenticated volunteer can still view self-service profile and history
        self.client.force_authenticate(user=self.vol_user)

        res_profile = self.client.get(reverse('volunteers:my-volunteer-profile'))
        self.assertEqual(res_profile.status_code, status.HTTP_200_OK)
        self.assertEqual(res_profile.data['email'], self.vol_user.email)
        self.assertFalse(res_profile.data['is_active'])

        res_apps = self.client.get(reverse('volunteers:my-volunteer-applications'))
        self.assertEqual(res_apps.status_code, status.HTTP_200_OK)

        res_parts = self.client.get(reverse('volunteers:my-volunteer-participations'))
        self.assertEqual(res_parts.status_code, status.HTTP_200_OK)

        res_certs = self.client.get(reverse('volunteers:my-volunteer-certificates'))
        self.assertEqual(res_certs.status_code, status.HTTP_200_OK)

