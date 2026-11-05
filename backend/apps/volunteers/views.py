from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from apps.accounts.permissions import IsAdminUserOrStaff, IsOwnerOrAdmin, IsApprovedVolunteer
from apps.accounts.serializers import UserSerializer
from .models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
    Certificate,
    VolunteerOnboardingApplication,
)
from .serializers import (
    VolunteerInterestSerializer,
    VolunteerOpportunitySerializer,
    VolunteerProfileSerializer,
    VolunteerApplicationSerializer,
    VolunteerParticipationSerializer,
    CertificateSerializer,
    VolunteerRegistrationSerializer,
    VolunteerApplySerializer,
    VolunteerOnboardingApplicationSerializer,
    VolunteerOnboardingSubmitSerializer,
    VolunteerOnboardingReviewSerializer,
    VolunteerActiveStatusSerializer,
)
from . import services


class VolunteerInterestViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = VolunteerInterest.objects.filter(is_active=True)
    serializer_class = VolunteerInterestSerializer


class VolunteerOpportunityViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = VolunteerOpportunity.objects.filter(is_active=True).select_related('focus_area', 'project')
    serializer_class = VolunteerOpportunitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'focus_area', 'location']
    search_fields = ['title', 'description', 'requirements', 'location']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class VolunteerProfileViewSet(viewsets.ModelViewSet):
    queryset = VolunteerProfile.objects.all().prefetch_related('interests', 'certificates')
    serializer_class = VolunteerProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['approval_status', 'city', 'is_active']
    search_fields = ['full_name', 'email', 'phone', 'skills']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action in ['list', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

    def create(self, request, *args, **kwargs):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'email': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = VolunteerProfile.objects.filter(email__iexact=email).first()
        if existing:
            # Security remediation: Reject unauthorized attempts to update existing profiles.
            # Do not rely on email knowledge as proof of ownership.
            if not (request.user and request.user.is_authenticated):
                return Response(
                    {'detail': 'Authentication required to update an existing profile.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            is_admin_or_staff = bool(request.user.is_admin_or_staff)
            is_owner = bool(existing.user_id and existing.user_id == request.user.id)

            if not (is_admin_or_staff or is_owner):
                return Response(
                    {'detail': 'You do not have permission to modify this profile.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Authorized update for owner or administrator
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            # If full_name is updated by owner and linked user exists, synchronize first/last names
            if is_owner and 'full_name' in request.data and request.data['full_name'] and existing.user:
                name_str = str(request.data['full_name']).strip()
                parts = name_str.split(' ', 1)
                existing.user.first_name = parts[0]
                existing.user.last_name = parts[1] if len(parts) > 1 else ''
                existing.user.save(update_fields=['first_name', 'last_name', 'updated_at'])

            return Response(serializer.data, status=status.HTTP_200_OK)

        # New profile creation
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if request.user and request.user.is_authenticated:
            if not request.user.is_admin_or_staff and VolunteerProfile.objects.filter(user=request.user).exists():
                return Response(
                    {'detail': 'A volunteer profile already exists for this account.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not serializer.validated_data.get('user'):
                if not request.user.is_admin_or_staff or not VolunteerProfile.objects.filter(user=request.user).exists():
                    serializer.save(email=email, user=request.user)
                else:
                    serializer.save(email=email)
            else:
                serializer.save(email=email)
        else:
            serializer.save(email=email)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserOrStaff], url_path='set-active-status')
    def set_active_status(self, request, pk=None):
        profile = self.get_object()
        serializer = VolunteerActiveStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_active = serializer.validated_data['is_active']
        reason = serializer.validated_data['reason']

        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0].strip()
        else:
            ip_address = request.META.get('REMOTE_ADDR')

        profile, changed = services.update_volunteer_active_status(
            profile_or_id=profile,
            is_active=is_active,
            reason=reason,
            admin_user=request.user,
            ip_address=ip_address,
        )

        if not changed:
            msg = f"Volunteer profile active status is already {is_active}."
        else:
            msg = f"Volunteer profile successfully {'activated' if is_active else 'deactivated'}."

        return Response({
            'message': msg,
            'status_changed': changed,
            'is_active': profile.is_active,
            'profile': VolunteerProfileSerializer(profile).data,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserOrStaff], url_path='set_active_status')
    def set_active_status_snake(self, request, pk=None):
        return self.set_active_status(request, pk)


class VolunteerApplicationViewSet(viewsets.ModelViewSet):
    queryset = VolunteerApplication.objects.all().select_related('opportunity', 'volunteer_profile')
    serializer_class = VolunteerApplicationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'opportunity', 'volunteer_profile']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsApprovedVolunteer()]
        return [IsAdminUserOrStaff()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        opportunity = serializer.validated_data['opportunity']
        volunteer_profile = serializer.validated_data['volunteer_profile']
        statement = serializer.validated_data['statement_of_purpose']
        experience = serializer.validated_data.get('experience', '')

        app = services.create_volunteer_application(
            volunteer_profile=volunteer_profile,
            opportunity=opportunity,
            statement_of_purpose=statement,
            experience=experience,
        )
        return Response(VolunteerApplicationSerializer(app).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserOrStaff])
    def update_status(self, request, pk=None):
        new_status = request.data.get('status')
        notes = request.data.get('review_notes', '')

        if not new_status:
            return Response({'error': 'Status is required.'}, status=status.HTTP_400_BAD_REQUEST)

        app = services.update_application_status(
            application_id=pk,
            new_status=new_status,
            review_notes=notes,
        )

        return Response({
            'message': f'Application status updated to {new_status}',
            'status': new_status,
            'application': VolunteerApplicationSerializer(app).data
        }, status=status.HTTP_200_OK)


class VolunteerParticipationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUserOrStaff]
    queryset = VolunteerParticipation.objects.all().select_related('volunteer_profile', 'project')
    serializer_class = VolunteerParticipationSerializer
    filterset_fields = ['volunteer_profile', 'project', 'verified']

    def perform_create(self, serializer):
        participation = serializer.save()
        services.recalculate_volunteer_hours(participation.volunteer_profile)

    def perform_update(self, serializer):
        participation = serializer.save()
        services.recalculate_volunteer_hours(participation.volunteer_profile)

    def perform_destroy(self, instance):
        profile = instance.volunteer_profile
        instance.delete()
        services.recalculate_volunteer_hours(profile)


class CertificateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUserOrStaff]
    queryset = Certificate.objects.all().select_related('volunteer_profile')
    serializer_class = CertificateSerializer
    filterset_fields = ['volunteer_profile', 'status', 'issue_date']
    search_fields = ['certificate_code', 'volunteer_profile__full_name', 'volunteer_profile__email']


# ================================================================
# UNIFIED DEDICATED ENDPOINTS FOR VOLUNTEER WORKFLOW
# ================================================================

class VolunteerRegisterView(APIView):
    """
    POST /api/v1/volunteers/register/
    [DEPRECATED] Legacy volunteer registration endpoint.
    Direct token issuance is disabled to prevent OTP bypass. Newly registered accounts start unverified,
    inactive, and pending approval. To complete registration and obtain tokens, callers must verify email
    via /api/v1/auth/verify-otp/.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VolunteerRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = services.register_volunteer(
            serializer.validated_data,
            is_verified=False,
            is_active=False,
            issue_tokens=False,
            approval_status=VolunteerProfile.ApprovalStatus.PENDING,
            send_otp=True,
        )

        resp = Response({
            'message': 'Registration initiated. Please verify your email using the OTP sent to activate your account and obtain access tokens.',
            'identifier': result['identifier'],
            'requires_otp': True,
            'user': UserSerializer(result['user']).data,
            'volunteer_profile': VolunteerProfileSerializer(result['volunteer_profile']).data,
            'deprecated': True,
            'deprecation_notice': 'Direct token issuance via legacy registration is disabled to prevent OTP bypass. Please verify via /api/v1/auth/verify-otp/ to activate your account and obtain tokens.',
        }, status=status.HTTP_201_CREATED)
        resp['Warning'] = '299 - "This endpoint is deprecated. Direct token issuance is disabled. Verify email via /api/v1/auth/verify-otp/."'
        return resp


class VolunteerApplyView(APIView):
    """
    POST /api/v1/volunteers/apply/
    Authenticated volunteer application endpoint.
    Derives VolunteerProfile from request.user, validates capacity & duplicate constraints,
    and returns created application.
    """
    permission_classes = [permissions.IsAuthenticated, IsApprovedVolunteer]

    def post(self, request):
        serializer = VolunteerApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        opp_id = serializer.validated_data.get('opportunity_id')
        opp_slug = serializer.validated_data.get('opportunity_slug')

        if opp_id:
            opportunity = get_object_or_404(VolunteerOpportunity, id=opp_id)
        else:
            opportunity = get_object_or_404(VolunteerOpportunity, slug=opp_slug)

        # Profile retrieval/sync with update fields if supplied
        profile_updates = {}
        for key in ['skills', 'phone', 'city', 'availability']:
            if key in serializer.validated_data and serializer.validated_data[key]:
                profile_updates[key] = serializer.validated_data[key]

        volunteer_profile = services.get_or_create_volunteer_profile_for_user(
            user=request.user,
            profile_data=profile_updates or None
        )

        app = services.create_volunteer_application(
            volunteer_profile=volunteer_profile,
            opportunity=opportunity,
            statement_of_purpose=serializer.validated_data['statement_of_purpose'],
            experience=serializer.validated_data.get('experience', ''),
        )

        return Response({
            'message': 'Volunteer application submitted successfully.',
            'application': VolunteerApplicationSerializer(app).data,
        }, status=status.HTTP_201_CREATED)


class MyVolunteerProfileView(APIView):
    """
    GET /api/v1/volunteers/my-profile/
    PATCH /api/v1/volunteers/my-profile/
    Self-service endpoint for authenticated volunteers to view and update their profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = services.get_or_create_volunteer_profile_for_user(request.user)
        return Response(VolunteerProfileSerializer(profile).data)

    def patch(self, request):
        profile = services.get_or_create_volunteer_profile_for_user(request.user, profile_data=request.data)
        return Response(VolunteerProfileSerializer(profile).data)


class MyVolunteerApplicationsView(generics.ListAPIView):
    """
    GET /api/v1/volunteers/my-applications/
    Lists applications submitted by the logged-in volunteer.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VolunteerApplicationSerializer

    def get_queryset(self):
        return VolunteerApplication.objects.filter(
            volunteer_profile__user=self.request.user
        ).select_related('opportunity', 'opportunity__focus_area', 'volunteer_profile').order_by('-created_at')


class MyVolunteerParticipationsView(generics.ListAPIView):
    """
    GET /api/v1/volunteers/my-participations/
    Lists logged participation sessions and verified hours for the logged-in volunteer.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VolunteerParticipationSerializer

    def get_queryset(self):
        return VolunteerParticipation.objects.filter(
            volunteer_profile__user=self.request.user
        ).select_related('project', 'volunteer_profile').order_by('-date', '-created_at')


class MyCertificatesView(APIView):
    """
    GET /api/v1/volunteers/certificates/
    Lists verified certificates awarded to the authenticated volunteer.
    Admin users can pass ?all=true to list platform-wide certificates.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.is_admin_or_staff and request.query_params.get('all') == 'true':
            certs = Certificate.objects.all().select_related('volunteer_profile').order_by('-issue_date')
        else:
            certs = Certificate.objects.filter(
                volunteer_profile__user=request.user,
                is_active=True,
                status=Certificate.Status.ACTIVE
            ).select_related('volunteer_profile').order_by('-issue_date')

        return Response(CertificateSerializer(certs, many=True).data)


class MyOnboardingApplicationView(APIView):
    """
    GET /api/v1/volunteers/my-onboarding/
    Returns the latest onboarding application for the authenticated user, or a NOT_SUBMITTED status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = services.get_or_create_volunteer_profile_for_user(request.user)
        latest = profile.onboarding_applications.order_by('-created_at').first()
        if latest:
            return Response(VolunteerOnboardingApplicationSerializer(latest).data, status=status.HTTP_200_OK)
        return Response({
            'status': 'NOT_SUBMITTED',
            'volunteer_profile': str(profile.id),
            'profile_approval_status': profile.approval_status,
            'message': 'No onboarding application submitted yet. Please complete and submit your onboarding application.'
        }, status=status.HTTP_200_OK)


class SubmitOnboardingApplicationView(APIView):
    """
    POST /api/v1/volunteers/submit-onboarding/
    Submits a one-time volunteer onboarding application.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VolunteerOnboardingSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = services.get_or_create_volunteer_profile_for_user(request.user)
        application = services.submit_onboarding_application(
            volunteer_profile=profile,
            validated_data=serializer.validated_data
        )

        return Response(
            VolunteerOnboardingApplicationSerializer(application).data,
            status=status.HTTP_201_CREATED
        )


class VolunteerOnboardingApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin ViewSet to review citizen onboarding applications.
    GET /api/v1/volunteers/onboarding-applications/
    POST /api/v1/volunteers/onboarding-applications/{id}/review/
    """
    permission_classes = [IsAdminUserOrStaff]
    queryset = VolunteerOnboardingApplication.objects.all().select_related('volunteer_profile', 'reviewed_by').order_by('-created_at')
    serializer_class = VolunteerOnboardingApplicationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status']
    search_fields = ['volunteer_profile__full_name', 'volunteer_profile__email', 'statement_of_intent']

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserOrStaff])
    def review(self, request, pk=None):
        instance = self.get_object()
        serializer = VolunteerOnboardingReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        app = services.review_onboarding_application(
            application_id=instance.id,
            decision=serializer.validated_data['status'],
            review_notes=serializer.validated_data.get('review_notes', ''),
            admin_user=request.user
        )

        return Response({
            'message': f"Onboarding application {app.status.lower()} successfully.",
            'status': app.status,
            'application': VolunteerOnboardingApplicationSerializer(app).data,
        }, status=status.HTTP_200_OK)


# =============================================================================
# VOLUNTEER INVITATION VIEWS (Phase 2.3)
# =============================================================================

def _get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


