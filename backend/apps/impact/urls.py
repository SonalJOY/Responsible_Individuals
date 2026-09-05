from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ImpactAreaViewSet,
    ImpactMetricViewSet,
    ImpactStatisticViewSet,
    ImpactReportViewSet,
)

router = DefaultRouter()
router.register(r'areas', ImpactAreaViewSet, basename='impact-area')
router.register(r'metrics', ImpactMetricViewSet, basename='impact-metric')
router.register(r'statistics', ImpactStatisticViewSet, basename='impact-statistic')
router.register(r'reports', ImpactReportViewSet, basename='impact-report')

app_name = 'impact'

urlpatterns = [
    path('', include(router.urls)),
]
