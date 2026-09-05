from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ImpactArea, ImpactMetric, ImpactStatistic, ImpactReport
from .serializers import (
    ImpactAreaSerializer,
    ImpactMetricSerializer,
    ImpactStatisticSerializer,
    ImpactReportSerializer,
)
from apps.accounts.permissions import IsAdminUserOrStaff


class ImpactAreaViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = ImpactArea.objects.filter(is_active=True).prefetch_related('metrics')
    serializer_class = ImpactAreaSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class ImpactMetricViewSet(viewsets.ModelViewSet):
    queryset = ImpactMetric.objects.filter(is_active=True)
    serializer_class = ImpactMetricSerializer
    filterset_fields = ['impact_area', 'metric_type']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class ImpactStatisticViewSet(viewsets.ModelViewSet):
    queryset = ImpactStatistic.objects.filter(is_active=True).order_by('order')
    serializer_class = ImpactStatisticSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class ImpactReportViewSet(viewsets.ModelViewSet):
    queryset = ImpactReport.objects.filter(is_active=True).order_by('-year')
    serializer_class = ImpactReportSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def track_download(self, request, pk=None):
        report = self.get_object()
        report.download_count += 1
        report.save(update_fields=['download_count'])
        return Response({'download_count': report.download_count})
