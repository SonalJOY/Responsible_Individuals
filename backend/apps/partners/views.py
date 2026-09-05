from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Partner, PartnerEnquiry, SupportedProject
from .serializers import PartnerSerializer, PartnerEnquirySerializer, SupportedProjectSerializer
from apps.accounts.permissions import IsAdminUserOrStaff


class PartnerViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = Partner.objects.filter(is_active=True).prefetch_related('supported_projects')
    serializer_class = PartnerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['partner_type', 'featured']
    search_fields = ['name', 'description']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class PartnerEnquiryViewSet(viewsets.ModelViewSet):
    queryset = PartnerEnquiry.objects.all()
    serializer_class = PartnerEnquirySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'org_type']
    search_fields = ['org_name', 'contact_person', 'email', 'message']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminUserOrStaff()]
