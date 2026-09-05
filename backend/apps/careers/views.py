from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import JobPost, JobApplication
from .serializers import JobPostSerializer, JobApplicationSerializer
from apps.accounts.permissions import IsAdminUserOrStaff


class JobPostViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = JobPost.objects.filter(is_active=True)
    serializer_class = JobPostSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'job_type', 'location']
    search_fields = ['title', 'description', 'requirements']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all().select_related('job_post')
    serializer_class = JobApplicationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'job_post']
    search_fields = ['applicant_name', 'email', 'phone']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminUserOrStaff()]
