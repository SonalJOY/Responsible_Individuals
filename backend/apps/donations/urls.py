from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampaignViewSet, DonationViewSet, ProcessDonationView, ReceiptLookupView

router = DefaultRouter()
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'history', DonationViewSet, basename='donation')

app_name = 'donations'

urlpatterns = [
    path('process/', ProcessDonationView.as_view(), name='process-donation'),
    path('receipt/<str:receipt_number>/', ReceiptLookupView.as_view(), name='receipt-lookup'),
    path('', include(router.urls)),
]
