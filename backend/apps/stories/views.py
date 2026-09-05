from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Story, StoryCategory
from .serializers import StorySerializer, StoryCategorySerializer
from apps.accounts.permissions import IsAdminUserOrStaff


class StoryCategoryViewSet(viewsets.ModelViewSet):
    queryset = StoryCategory.objects.filter(is_active=True)
    serializer_class = StoryCategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class StoryViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = Story.objects.filter(is_active=True).select_related('focus_area', 'project', 'category')
    serializer_class = StorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['focus_area', 'category', 'featured']
    search_fields = ['title', 'beneficiary_name', 'location', 'challenge', 'outcome']
    ordering_fields = ['published_date', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]
