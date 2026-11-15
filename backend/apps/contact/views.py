import logging
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ContactEnquiry, NewsletterSubscriber
from .serializers import ContactEnquirySerializer, NewsletterSubscriberSerializer
from .emails import send_contact_enquiry_notification
from apps.accounts.permissions import IsAdminUserOrStaff

logger = logging.getLogger(__name__)


class ContactEnquiryViewSet(viewsets.ModelViewSet):
    queryset = ContactEnquiry.objects.all()
    serializer_class = ContactEnquirySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department', 'status']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminUserOrStaff()]

    def perform_create(self, serializer):
        enquiry = serializer.save()
        try:
            send_contact_enquiry_notification(enquiry)
        except Exception as exc:
            logger.warning(
                "Contact enquiry #%s was saved, but failed to deliver notification email to admin: %s",
                getattr(enquiry, 'id', None),
                exc
            )


class NewsletterSubscriberView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer

    def create(self, request, *args, **kwargs):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        subscriber, created = NewsletterSubscriber.objects.get_or_create(email=email)
        return Response({
            'message': 'Thank you for subscribing to our community impact newsletter!',
            'email': email
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
