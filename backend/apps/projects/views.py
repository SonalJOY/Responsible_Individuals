from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    ProjectCategory,
    Project,
    ProjectObjective,
    ProjectActivity,
    ProjectKPI,
)
from .serializers import (
    ProjectCategorySerializer,
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectObjectiveSerializer,
    ProjectActivitySerializer,
    ProjectKPISerializer,
)
from apps.accounts.permissions import IsAdminUserOrStaff


class ProjectCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProjectCategory.objects.filter(is_active=True)
    serializer_class = ProjectCategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class ProjectViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = Project.objects.filter(is_active=True).select_related('category', 'focus_area')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'focus_area', 'status', 'featured', 'location']
    search_fields = ['title', 'summary', 'description', 'location']
    ordering_fields = ['start_date', 'budget', 'raised_amount', 'created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]
