from rest_framework import viewsets, permissions
from .models import Page, PageSection, HeroBanner, SiteSetting
from .serializers import PageSerializer, PageSectionSerializer, HeroBannerSerializer, SiteSettingSerializer
from apps.accounts.permissions import IsAdminUserOrStaff


class PageViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = Page.objects.filter(is_active=True, published=True)
    serializer_class = PageSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class HeroBannerViewSet(viewsets.ModelViewSet):
    queryset = HeroBanner.objects.filter(is_active=True).order_by('order')
    serializer_class = HeroBannerSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class SiteSettingViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = SiteSetting.objects.filter(is_active=True)
    serializer_class = SiteSettingSerializer
    lookup_field = 'key'
