from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartnerViewSet, PartnerEnquiryViewSet

router = DefaultRouter()
router.register(r'enquiries', PartnerEnquiryViewSet, basename='partner-enquiry')
router.register(r'', PartnerViewSet, basename='partner')

app_name = 'partners'

urlpatterns = [
    path('', include(router.urls)),
]
