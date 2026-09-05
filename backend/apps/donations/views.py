from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Campaign, Donor, Donation
from .serializers import (
    CampaignSerializer,
    DonorSerializer,
    DonationSerializer,
    CreateDonationSerializer,
)
from apps.accounts.permissions import IsAdminUserOrStaff


class CampaignViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = Campaign.objects.filter(is_active=True).select_related('focus_area', 'project')
    serializer_class = CampaignSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['focus_area', 'featured']
    search_fields = ['title', 'description']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all().select_related('donor', 'campaign', 'project')
    serializer_class = DonationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'frequency', 'campaign']
    search_fields = ['donor__full_name', 'donor__email', 'receipt_number', 'transaction_id']
    ordering_fields = ['amount', 'created_at']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminUserOrStaff()]


class ProcessDonationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CreateDonationSerializer(data=request.data)
        if serializer.is_valid():
            donation = serializer.save()
            return Response({
                'message': 'Donation processed successfully. Thank you for empowering responsible communities!',
                'donation': DonationSerializer(donation).data,
                'receipt_number': donation.receipt_number,
                'transaction_id': donation.transaction_id,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReceiptLookupView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, receipt_number):
        donation = Donation.objects.filter(receipt_number=receipt_number).first()
        if not donation:
            return Response({'error': 'Receipt not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(DonationSerializer(donation).data)
