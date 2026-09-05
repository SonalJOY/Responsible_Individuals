from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import GalleryAlbum, GalleryItem
from .serializers import GalleryAlbumSerializer, GalleryItemSerializer
from apps.accounts.permissions import IsAdminUserOrStaff


class GalleryAlbumViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = GalleryAlbum.objects.filter(is_active=True).prefetch_related('items')
    serializer_class = GalleryAlbumSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class GalleryItemViewSet(viewsets.ModelViewSet):
    queryset = GalleryItem.objects.filter(is_active=True).select_related('album', 'project')
    serializer_class = GalleryItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['album', 'project', 'media_type']
    search_fields = ['title', 'location', 'tags']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]
