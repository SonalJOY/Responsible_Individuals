from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event, EventRegistration
from .serializers import EventSerializer, EventRegistrationSerializer
from apps.accounts.permissions import IsAdminUserOrStaff


class EventViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = Event.objects.filter(is_active=True).select_related('focus_area')
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'focus_area', 'city']
    search_fields = ['title', 'venue', 'city', 'description']
    ordering_fields = ['date', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserOrStaff()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request, slug=None):
        event = self.get_object()
        if event.is_full:
            return Response({'error': 'This event has reached its maximum capacity.'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['event'] = event.id
        serializer = EventRegistrationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            event.registered_count = event.registrations.count()
            event.save(update_fields=['registered_count'])
            return Response({
                'message': f'Registration confirmed for {event.title}!',
                'registration': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.all().select_related('event')
    serializer_class = EventRegistrationSerializer
    permission_classes = [IsAdminUserOrStaff]
    filterset_fields = ['event', 'attended', 'is_volunteer']
    search_fields = ['name', 'email', 'phone']
