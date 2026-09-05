from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, EventRegistrationViewSet

router = DefaultRouter()
router.register(r'registrations', EventRegistrationViewSet, basename='event-registration')
router.register(r'', EventViewSet, basename='event')

app_name = 'events'

urlpatterns = [
    path('', include(router.urls)),
]
