from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VolunteerInterestViewSet,
    VolunteerOpportunityViewSet,
    VolunteerProfileViewSet,
    VolunteerApplicationViewSet,
    VolunteerParticipationViewSet,
)

router = DefaultRouter()
router.register(r'interests', VolunteerInterestViewSet, basename='volunteer-interest')
router.register(r'opportunities', VolunteerOpportunityViewSet, basename='volunteer-opportunity')
router.register(r'profiles', VolunteerProfileViewSet, basename='volunteer-profile')
router.register(r'applications', VolunteerApplicationViewSet, basename='volunteer-application')
router.register(r'participations', VolunteerParticipationViewSet, basename='volunteer-participation')

app_name = 'volunteers'

urlpatterns = [
    path('', include(router.urls)),
]
