from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from apps.accounts.permissions import IsAdminUserOrStaff
from apps.accounts.serializers import UserSerializer
from .models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
    Certificate,
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
    filterset_fields = ['approval_status', 'city']
    search_fields = ['full_name', 'email', 'phone', 'skills']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action in ['list', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        # Gracefully handle profile creation or retrieval by email to prevent duplicate email crashes
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'email': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = VolunteerProfile.objects.filter(email=email).first()
        if existing:
            # Update fields safely
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if request.user.is_authenticated and not serializer.validated_data.get('user'):
            serializer.save(user=request.user)
        else:
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VolunteerApplicationViewSet(viewsets.ModelViewSet):
    queryset = VolunteerApplication.objects.all().select_related('opportunity', 'volunteer_profile')
    serializer_class = VolunteerApplicationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'opportunity']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
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
    Atomic registration for volunteers: creates User + UserProfile + VolunteerProfile + links Interests.
    Returns User data, VolunteerProfile data, and SimpleJWT authentication tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VolunteerRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = services.register_volunteer(serializer.validated_data)

        return Response({
            'user': UserSerializer(result['user']).data,
            'volunteer_profile': VolunteerProfileSerializer(result['volunteer_profile']).data,
            'access': result['access'],
            'refresh': result['refresh'],
            'message': result['message'],
        }, status=status.HTTP_201_CREATED)


class VolunteerApplyView(APIView):
    """
    POST /api/v1/volunteers/apply/
    Authenticated volunteer application endpoint.
    Derives VolunteerProfile from request.user, validates capacity & duplicate constraints,
    and returns created application.
    """
    permission_classes = [permissions.IsAuthenticated]

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
