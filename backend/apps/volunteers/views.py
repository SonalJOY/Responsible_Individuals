from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
)
from .serializers import (
    VolunteerInterestSerializer,
    VolunteerOpportunitySerializer,
    VolunteerProfileSerializer,
    VolunteerApplicationSerializer,
    VolunteerParticipationSerializer,
)
from apps.accounts.permissions import IsAdminUserOrStaff


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
    queryset = VolunteerProfile.objects.all().prefetch_related('interests')
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


class VolunteerApplicationViewSet(viewsets.ModelViewSet):
    queryset = VolunteerApplication.objects.all().select_related('opportunity', 'volunteer_profile')
    serializer_class = VolunteerApplicationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'opportunity']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminUserOrStaff()]

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserOrStaff])
    def update_status(self, request, pk=None):
        app = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('review_notes', '')

        if new_status not in [VolunteerApplication.Status.APPROVED, VolunteerApplication.Status.REJECTED]:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        app.status = new_status
        if notes:
            app.review_notes = notes
        app.save()

        if new_status == VolunteerApplication.Status.APPROVED:
            app.opportunity.spots_filled += 1
            if app.opportunity.spots_filled >= app.opportunity.spots_available:
                app.opportunity.status = VolunteerOpportunity.Status.FILLED
            app.opportunity.save()

        return Response({'message': f'Application marked as {new_status}', 'status': new_status})


class VolunteerParticipationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUserOrStaff]
    queryset = VolunteerParticipation.objects.all().select_related('volunteer_profile', 'project')
    serializer_class = VolunteerParticipationSerializer
    filterset_fields = ['volunteer_profile', 'project']
