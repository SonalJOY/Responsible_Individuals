from decimal import Decimal
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.volunteers.models import (
    VolunteerProfile,
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerApplication,
    VolunteerParticipation,
    Certificate,
)
from apps.core.models import AuditLog
from apps.volunteers import services

User = get_user_model()


class VolunteerProfileTests(APITestCase):
    def setUp(self):
        self.interest_lake = VolunteerInterest.objects.create(name='Lake Revival', slug='lake-revival')
        self.interest_tree = VolunteerInterest.objects.create(name='Tree Plantation', slug='tree-plantation')

        # Volunteer A
        reg_a = services.register_volunteer({
            'email': 'volunteer.a@test.org',
            'password': 'Password@123',
            'first_name': 'Volunteer',
            'last_name': 'A',
            'phone': '+91 91111 11111',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'occupation': 'Software Engineer',
            'skills': 'Python, Data Analysis',
            'availability': 'Weekends',
            'bio': 'Passionate about coding for good.',
            'interests': ['lake-revival'],
        })
        self.user_a = reg_a['user']
        self.profile_a = reg_a['volunteer_profile']

        # Volunteer B
        reg_b = services.register_volunteer({
            'email': 'volunteer.b@test.org',
            'password': 'Password@123',
            'first_name': 'Volunteer',
            'last_name': 'B',
            'phone': '+91 92222 22222',
            'city': 'Mysuru',
            'state': 'Karnataka',
            'occupation': 'Teacher',
            'skills': 'Pedagogy, Science',
            'availability': 'Weekdays',
            'bio': 'Passionate about teaching.',
            'interests': ['tree-plantation'],
        })
        self.user_b = reg_b['user']
        self.profile_b = reg_b['volunteer_profile']

        # Admin user
        self.admin_user = User.objects.create_superuser(
            email='admin@test.org',
            password='AdminPassword@123',
            role=User.Role.SUPER_ADMIN,
        )

        # Orphaned profile (no linked user account)
        self.orphan_profile = VolunteerProfile.objects.create(
            user=None,
            full_name='Orphan Volunteer',
            email='orphan@test.org',
            phone='+91 93333 33333',
            city='Hubballi',
            skills='Logistics, Driving',
            availability='Evenings',
        )

        self.my_profile_url = reverse('volunteers:my-volunteer-profile')
        self.profiles_url = reverse('volunteers:volunteer-profile-list')

    def test_get_my_profile_success(self):
        self.client.force_authenticate(user=self.user_a)
        res = self.client.get(self.my_profile_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'volunteer.a@test.org')
        self.assertEqual(res.data['full_name'], 'Volunteer A')
        self.assertEqual(res.data['city'], 'Bengaluru')
        self.assertEqual(res.data['occupation'], 'Software Engineer')
        self.assertEqual(res.data['skills'], 'Python, Data Analysis')
        self.assertEqual(len(res.data['interests']), 1)

    def test_patch_my_profile_allowed_fields(self):
        self.client.force_authenticate(user=self.user_a)
        payload = {
            'phone': '+91 99999 00000',
            'city': 'Mangaluru',
            'skills': 'Python, Data Analysis, Drone Mapping',
            'availability': 'Flexible',
            'bio': 'Updated bio description.',
            'interests': ['lake-revival', 'tree-plantation'],
        }
        res = self.client.patch(self.my_profile_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['phone'], '+91 99999 00000')
        self.assertEqual(res.data['city'], 'Mangaluru')
        self.assertEqual(res.data['skills'], 'Python, Data Analysis, Drone Mapping')
        self.assertEqual(len(res.data['interests']), 2)

        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.phone, '+91 99999 00000')
        self.assertEqual(self.profile_a.city, 'Mangaluru')
        self.assertEqual(self.profile_a.skills, 'Python, Data Analysis, Drone Mapping')
        self.assertEqual(self.profile_a.interests.count(), 2)

    def test_volunteer_cannot_modify_protected_fields(self):
        self.client.force_authenticate(user=self.user_a)
        # Attempt to change user ownership, total_hours_contributed, email, role, or approval_status
        payload = {
            'user': str(self.user_b.id),
            'email': 'tampered@hacker.com',
            'approval_status': 'APPROVED',
            'role': 'ADMIN',
            'total_hours_contributed': '999.00',
        }
        res = self.client.patch(self.my_profile_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.profile_a.refresh_from_db()
        self.user_a.refresh_from_db()
        # Ensure user ownership, email, approval_status, role, and hours did NOT change through API
        self.assertEqual(self.profile_a.user, self.user_a)
        self.assertEqual(self.profile_a.email, 'volunteer.a@test.org')
        self.assertEqual(self.profile_a.approval_status, VolunteerProfile.ApprovalStatus.PENDING)
        self.assertEqual(self.user_a.role, User.Role.PUBLIC)
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('0.00'))

    def test_volunteer_cannot_update_other_profile_via_viewset(self):
        # User A attempts to update User B's profile via VolunteerProfileViewSet
        self.client.force_authenticate(user=self.user_a)
        detail_url = reverse('volunteers:volunteer-profile-detail', kwargs={'pk': self.profile_b.id})
        res = self.client.patch(detail_url, {'skills': 'Malicious Injection'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.profile_b.refresh_from_db()
        self.assertEqual(self.profile_b.skills, 'Pedagogy, Science')

    def test_profile_full_name_update_syncs_user_names(self):
        self.client.force_authenticate(user=self.user_a)
        res = self.client.patch(self.my_profile_url, {'full_name': 'Aarav Sharma'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user_a.refresh_from_db()
        self.assertEqual(self.user_a.first_name, 'Aarav')
        self.assertEqual(self.user_a.last_name, 'Sharma')

    def test_unauthenticated_my_profile_returns_401(self):
        res = self.client.get(self.my_profile_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # =========================================================================
    # OWNERSHIP SECURITY REMEDIATION REGRESSION TESTS (POST /api/v1/volunteers/profiles/)
    # =========================================================================

    def test_unauthenticated_attempt_to_modify_existing_profile_rejected(self):
        """Unauthenticated caller submitting an existing email must be rejected with 401."""
        payload = {
            'email': 'volunteer.b@test.org',
            'skills': 'Malicious Injection via Create',
            'city': 'Hacked City',
        }
        res = self.client.post(self.profiles_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Authentication required', res.data.get('detail', ''))

        self.profile_b.refresh_from_db()
        self.assertEqual(self.profile_b.skills, 'Pedagogy, Science')
        self.assertEqual(self.profile_b.city, 'Mysuru')

    def test_authenticated_user_cannot_modify_other_user_profile_via_create(self):
        """Authenticated User A attempting to modify User B's profile must be rejected with 403."""
        self.client.force_authenticate(user=self.user_a)
        payload = {
            'email': 'volunteer.b@test.org',
            'skills': 'Cross User Attack via Create',
            'city': 'Compromised City',
        }
        res = self.client.post(self.profiles_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('permission', res.data.get('detail', ''))

        self.profile_b.refresh_from_db()
        self.assertEqual(self.profile_b.skills, 'Pedagogy, Science')
        self.assertEqual(self.profile_b.city, 'Mysuru')

    def test_unauthenticated_cannot_modify_or_expose_orphaned_profile(self):
        """Unauthenticated caller cannot modify or read orphaned profile data."""
        payload = {
            'email': 'orphan@test.org',
            'skills': 'Orphan Hijack Attempt',
        }
        res = self.client.post(self.profiles_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        self.orphan_profile.refresh_from_db()
        self.assertEqual(self.orphan_profile.skills, 'Logistics, Driving')

    def test_authenticated_non_admin_cannot_modify_orphaned_profile(self):
        """Authenticated non-admin user cannot modify an orphaned profile."""
        self.client.force_authenticate(user=self.user_a)
        payload = {
            'email': 'orphan@test.org',
            'skills': 'Orphan Claim by Non-Admin',
        }
        res = self.client.post(self.profiles_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        self.orphan_profile.refresh_from_db()
        self.assertEqual(self.orphan_profile.skills, 'Logistics, Driving')
        self.assertIsNone(self.orphan_profile.user)

    def test_legitimate_owner_can_update_own_profile_via_create(self):
        """Authenticated owner submitting their own email can update permitted fields."""
        self.client.force_authenticate(user=self.user_a)
        payload = {
            'email': 'volunteer.a@test.org',
            'skills': 'Python, Django, FastAPI',
            'city': 'Bengaluru North',
        }
        res = self.client.post(self.profiles_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['skills'], 'Python, Django, FastAPI')
        self.assertEqual(res.data['city'], 'Bengaluru North')

        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.skills, 'Python, Django, FastAPI')
        self.assertEqual(self.profile_a.city, 'Bengaluru North')

    def test_owner_cannot_escalate_approval_status_or_change_user_via_create(self):
        """Legitimate owner cannot change protected read-only fields via create."""
        self.client.force_authenticate(user=self.user_a)
        payload = {
            'email': 'volunteer.a@test.org',
            'skills': 'Valid Skill Update',
            'approval_status': 'APPROVED',
            'total_hours_contributed': '999.0',
            'user': str(self.user_b.id),
        }
        res = self.client.post(self.profiles_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.skills, 'Valid Skill Update')
        self.assertEqual(self.profile_a.approval_status, VolunteerProfile.ApprovalStatus.PENDING)
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('0.0'))
        self.assertEqual(self.profile_a.user, self.user_a)

    def test_authorized_admin_can_update_profile_via_create(self):
        """Authorized administrator/staff can update volunteer profiles via create."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            'email': 'volunteer.b@test.org',
            'skills': 'Pedagogy, Leadership, Mentoring',
        }
        res = self.client.post(self.profiles_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.profile_b.refresh_from_db()
        self.assertEqual(self.profile_b.skills, 'Pedagogy, Leadership, Mentoring')

    def test_authorized_admin_can_update_orphaned_profile_via_create(self):
        """Authorized administrator/staff can manage orphaned profiles via create."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            'email': 'orphan@test.org',
            'skills': 'Logistics, Fleet Operations',
        }
        res = self.client.post(self.profiles_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.orphan_profile.refresh_from_db()
        self.assertEqual(self.orphan_profile.skills, 'Logistics, Fleet Operations')

    def test_existing_profile_fields_remain_unchanged_after_all_rejected_attempts(self):
        """Ensure all fields on the target profile are completely unchanged after rejected calls."""
        self.profile_b.refresh_from_db()
        original_data = {
            'full_name': self.profile_b.full_name,
            'email': self.profile_b.email,
            'phone': self.profile_b.phone,
            'city': self.profile_b.city,
            'state': self.profile_b.state,
            'occupation': self.profile_b.occupation,
            'skills': self.profile_b.skills,
            'availability': self.profile_b.availability,
            'bio': self.profile_b.bio,
            'approval_status': self.profile_b.approval_status,
            'total_hours_contributed': self.profile_b.total_hours_contributed,
            'user_id': self.profile_b.user_id,
        }

        # 1. Unauthenticated malicious attempt
        self.client.logout()
        res1 = self.client.post(self.profiles_url, {
            'email': 'volunteer.b@test.org',
            'full_name': 'Attacker Name',
            'skills': 'Attacker Skills',
            'city': 'Attacker City',
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_401_UNAUTHORIZED)

        # 2. Authenticated other-user malicious attempt
        self.client.force_authenticate(user=self.user_a)
        res2 = self.client.post(self.profiles_url, {
            'email': 'volunteer.b@test.org',
            'full_name': 'Tampered Name',
            'skills': 'Tampered Skills',
            'city': 'Tampered City',
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)

        # Verify all fields in database remain strictly identical
        self.profile_b.refresh_from_db()
        for field, original_val in original_data.items():
            current_val = getattr(self.profile_b, field)
            self.assertEqual(current_val, original_val, f"Field '{field}' was unexpectedly modified.")

    def test_legitimate_new_profile_creation_authenticated_user(self):
        """Authenticated user without an existing volunteer profile can create one."""
        user_c = User.objects.create_user(
            email='volunteer.c@test.org',
            password='Password@123',
            first_name='Volunteer',
            last_name='C',
            phone='+91 94444 44444',
            role=User.Role.PUBLIC,
        )
        self.client.force_authenticate(user=user_c)
        payload = {
            'email': 'volunteer.c@test.org',
            'full_name': 'Volunteer C',
            'phone': '+91 94444 44444',
            'city': 'Chennai',
            'skills': 'Graphic Design, Content Creation',
            'availability': 'Weekends',
        }
        res = self.client.post(self.profiles_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['email'], 'volunteer.c@test.org')
        self.assertEqual(res.data['city'], 'Chennai')

        created = VolunteerProfile.objects.filter(email='volunteer.c@test.org').first()
        self.assertIsNotNone(created)
        self.assertEqual(created.user, user_c)
        self.assertEqual(created.skills, 'Graphic Design, Content Creation')

    def test_authenticated_user_cannot_create_duplicate_second_profile(self):
        """An authenticated user who already has a profile cannot create a second profile with a different email."""
        self.client.force_authenticate(user=self.user_a)
        payload = {
            'email': 'brandnew.different@test.org',
            'full_name': 'Brand New Profile',
            'phone': '+91 95555 55555',
            'city': 'Kolkata',
            'skills': 'Different Skills',
            'availability': 'Weekdays',
        }
        res = self.client.post(self.profiles_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already exists', res.data.get('detail', ''))

    def test_create_profile_missing_email_returns_400(self):
        """Missing email returns 400 Bad Request."""
        res = self.client.post(self.profiles_url, {'skills': 'Testing'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data)
    # ================================================================
    # PHASE 2.1: FILTERING & ACTIVE-STATUS MANAGEMENT TESTS
    # ================================================================

    def test_filter_profiles_by_is_active_true(self):
        """Admin can filter volunteer profiles by is_active=true."""
        self.profile_a.is_active = True
        self.profile_a.save()
        self.profile_b.is_active = False
        self.profile_b.save()

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get(f"{self.profiles_url}?is_active=true")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('count', res.data)
        self.assertIn('results', res.data)

        emails = [p['email'] for p in res.data['results']]
        self.assertIn('volunteer.a@test.org', emails)
        self.assertNotIn('volunteer.b@test.org', emails)

    def test_filter_profiles_by_is_active_false(self):
        """Admin can filter volunteer profiles by is_active=false."""
        self.profile_a.is_active = True
        self.profile_a.save()
        self.profile_b.is_active = False
        self.profile_b.save()

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get(f"{self.profiles_url}?is_active=false")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('count', res.data)
        self.assertIn('results', res.data)

        emails = [p['email'] for p in res.data['results']]
        self.assertNotIn('volunteer.a@test.org', emails)
        self.assertIn('volunteer.b@test.org', emails)

    def test_filter_profiles_by_approval_status(self):
        """Admin can filter volunteer profiles by approval_status."""
        self.profile_a.approval_status = VolunteerProfile.ApprovalStatus.APPROVED
        self.profile_a.save()
        self.profile_b.approval_status = VolunteerProfile.ApprovalStatus.PENDING
        self.profile_b.save()

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get(f"{self.profiles_url}?approval_status=APPROVED")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        emails = [p['email'] for p in res.data['results']]
        self.assertIn('volunteer.a@test.org', emails)
        self.assertNotIn('volunteer.b@test.org', emails)

    def test_filter_opportunity_applications_by_volunteer_profile(self):
        """Admin can filter opportunity applications by volunteer_profile UUID."""
        opp = VolunteerOpportunity.objects.create(
            title='Tree Drive 2026',
            slug='tree-drive-2026',
            description='Planting trees in Hebbal',
            responsibilities='Digging, watering',
            requirements='Stamina',
            location='Bengaluru',
            commitment='Weekends',
            status=VolunteerOpportunity.Status.OPEN,
        )
        app_a = services.create_volunteer_application(
            volunteer_profile=self.profile_a,
            opportunity=opp,
            statement_of_purpose='Want to plant trees A',
        )
        app_b = services.create_volunteer_application(
            volunteer_profile=self.profile_b,
            opportunity=opp,
            statement_of_purpose='Want to plant trees B',
        )

        self.client.force_authenticate(user=self.admin_user)
        apps_url = reverse('volunteers:volunteer-application-list')
        res = self.client.get(f"{apps_url}?volunteer_profile={self.profile_a.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('count', res.data)
        self.assertIn('results', res.data)
        self.assertEqual(len(res.data['results']), 1)
        self.assertEqual(res.data['results'][0]['volunteer_email'], 'volunteer.a@test.org')
        self.assertEqual(res.data['results'][0]['id'], str(app_a.id))

    def test_existing_search_and_pagination_still_work(self):
        """Search by keyword and pagination format are preserved."""
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get(f"{self.profiles_url}?search=Python")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('count', res.data)
        self.assertIn('results', res.data)
        self.assertGreaterEqual(res.data['count'], 1)
        emails = [p['email'] for p in res.data['results']]
        self.assertIn('volunteer.a@test.org', emails)

    def test_admin_can_deactivate_volunteer_profile(self):
        """Admin can deactivate an active profile with a mandatory reason."""
        self.profile_a.is_active = True
        self.profile_a.save()

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-profile-set-active-status', kwargs={'pk': self.profile_a.id})
        payload = {
            'is_active': False,
            'reason': 'Volunteer requested temporary break for exams',
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['status_changed'])
        self.assertFalse(res.data['is_active'])

        self.profile_a.refresh_from_db()
        self.assertFalse(self.profile_a.is_active)

        # Audit log verified
        log = AuditLog.objects.filter(entity_type='VolunteerProfile', entity_id=str(self.profile_a.id)).latest('created_at')
        self.assertEqual(log.user, self.admin_user)
        self.assertEqual(log.action, 'UPDATE')
        self.assertEqual(log.metadata['previous_is_active'], True)
        self.assertEqual(log.metadata['new_is_active'], False)
        self.assertIn('temporary break', log.metadata['reason'])

    def test_admin_can_activate_volunteer_profile(self):
        """Admin can reactivate a deactivated profile with a mandatory reason."""
        self.profile_a.is_active = False
        self.profile_a.save()

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-profile-set-active-status', kwargs={'pk': self.profile_a.id})
        payload = {
            'is_active': True,
            'reason': 'Volunteer finished exams and resumed active service',
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['status_changed'])
        self.assertTrue(res.data['is_active'])

        self.profile_a.refresh_from_db()
        self.assertTrue(self.profile_a.is_active)

        # Audit log verified
        log = AuditLog.objects.filter(entity_type='VolunteerProfile', entity_id=str(self.profile_a.id)).latest('created_at')
        self.assertEqual(log.metadata['previous_is_active'], False)
        self.assertEqual(log.metadata['new_is_active'], True)

    def test_active_status_requires_meaningful_reason(self):
        """Reason is mandatory and must contain at least 5 non-whitespace characters."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-profile-set-active-status', kwargs={'pk': self.profile_a.id})

        # Missing reason
        res1 = self.client.post(url, {'is_active': False}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reason', res1.data)

        # Blank reason
        res2 = self.client.post(url, {'is_active': False, 'reason': '   '}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reason', res2.data)

        # Too short reason
        res3 = self.client.post(url, {'is_active': False, 'reason': 'abc'}, format='json')
        self.assertEqual(res3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reason', res3.data)

    def test_active_status_invalid_data_rejected(self):
        """Invalid or missing is_active is rejected with 400 Bad Request."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-profile-set-active-status', kwargs={'pk': self.profile_a.id})

        res1 = self.client.post(url, {'reason': 'Valid reason without is_active'}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('is_active', res1.data)

        res2 = self.client.post(url, {'is_active': 'not-a-bool', 'reason': 'Valid reason'}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('is_active', res2.data)

    def test_unauthenticated_cannot_set_active_status(self):
        """Unauthenticated caller cannot set active status (401 Unauthorized)."""
        url = reverse('volunteers:volunteer-profile-set-active-status', kwargs={'pk': self.profile_a.id})
        res = self.client.post(url, {'is_active': False, 'reason': 'Unauthorized attempt'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_non_admin_cannot_set_active_status(self):
        """Non-admin authenticated user cannot set active status (403 Forbidden)."""
        self.client.force_authenticate(user=self.user_a)
        url = reverse('volunteers:volunteer-profile-set-active-status', kwargs={'pk': self.profile_b.id})
        res = self.client.post(url, {'is_active': False, 'reason': 'Non-admin attempt'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_repeated_status_request_does_not_create_duplicate_audit_log(self):
        """Calling set-active-status with the same status is idempotent and creates no duplicate audit records."""
        self.profile_a.is_active = True
        self.profile_a.save()

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-profile-set-active-status', kwargs={'pk': self.profile_a.id})

        initial_log_count = AuditLog.objects.filter(entity_type='VolunteerProfile', entity_id=str(self.profile_a.id)).count()

        payload = {'is_active': True, 'reason': 'Redundant activation request'}
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data['status_changed'])
        self.assertTrue(res.data['is_active'])

        after_log_count = AuditLog.objects.filter(entity_type='VolunteerProfile', entity_id=str(self.profile_a.id)).count()
        self.assertEqual(initial_log_count, after_log_count)

    def test_user_is_active_role_and_approval_status_remain_unchanged(self):
        """Changing profile active status does NOT alter User.is_active, User.role, or approval_status."""
        self.user_a.is_active = True
        self.user_a.role = User.Role.PUBLIC
        self.user_a.save()
        self.profile_a.approval_status = VolunteerProfile.ApprovalStatus.PENDING
        self.profile_a.is_active = True
        self.profile_a.save()

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-profile-set-active-status', kwargs={'pk': self.profile_a.id})
        payload = {'is_active': False, 'reason': 'Deactivating profile without touching user account'}
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.user_a.refresh_from_db()
        self.profile_a.refresh_from_db()
        self.assertTrue(self.user_a.is_active)
        self.assertEqual(self.user_a.role, User.Role.PUBLIC)
        self.assertEqual(self.profile_a.approval_status, VolunteerProfile.ApprovalStatus.PENDING)
        self.assertFalse(self.profile_a.is_active)

    def test_history_participations_certificates_and_hours_remain_intact(self):
        """Deactivating a profile preserves participation records, certificates, and hours."""
        self.profile_a.is_active = True
        self.profile_a.save()

        part = VolunteerParticipation.objects.create(
            volunteer_profile=self.profile_a,
            date='2026-04-01',
            hours=Decimal('7.5'),
            activity_performed='Community tree maintenance',
            verified=True,
        )
        services.recalculate_volunteer_hours(self.profile_a)

        cert = services.create_certificate(
            volunteer_profile=self.profile_a,
            title='Outstanding Environmental Contributor',
            hours_recognized=Decimal('7.5'),
        )

        self.profile_a.refresh_from_db()
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('7.5'))

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-profile-set-active-status', kwargs={'pk': self.profile_a.id})
        payload = {'is_active': False, 'reason': 'Volunteer taking study leave'}
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.profile_a.refresh_from_db()
        self.assertFalse(self.profile_a.is_active)
        self.assertEqual(self.profile_a.total_hours_contributed, Decimal('7.5'))
        self.assertEqual(self.profile_a.participations.count(), 1)
        self.assertEqual(self.profile_a.certificates.count(), 1)
        self.assertEqual(self.profile_a.certificates.first().certificate_code, cert.certificate_code)

    def test_set_active_status_rejects_patch_method_and_strictly_requires_post(self):
        """Verifies that set-active-status endpoint strictly rejects PATCH (405) and requires POST (200)."""
        self.profile_a.is_active = True
        self.profile_a.save()

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('volunteers:volunteer-profile-set-active-status', kwargs={'pk': self.profile_a.id})
        payload = {'is_active': False, 'reason': 'Testing HTTP method conformance'}

        # PATCH is rejected with 405 Method Not Allowed
        res_patch = self.client.patch(url, payload, format='json')
        self.assertEqual(res_patch.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        # POST is accepted with 200 OK
        res_post = self.client.post(url, payload, format='json')
        self.assertEqual(res_post.status_code, status.HTTP_200_OK)
        self.assertTrue(res_post.data['status_changed'])
        self.assertFalse(res_post.data['is_active'])


