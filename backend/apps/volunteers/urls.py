from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VolunteerInterestViewSet,
    VolunteerOpportunityViewSet,
    VolunteerProfileViewSet,
    VolunteerApplicationViewSet,
    VolunteerParticipationViewSet,
    CertificateViewSet,
    VolunteerRegisterView,
    VolunteerApplyView,
    MyVolunteerProfileView,
    MyVolunteerApplicationsView,
    MyVolunteerParticipationsView,
    MyCertificatesView,
)

router = DefaultRouter()
router.register(r'interests', VolunteerInterestViewSet, basename='volunteer-interest')
router.register(r'opportunities', VolunteerOpportunityViewSet, basename='volunteer-opportunity')
router.register(r'profiles', VolunteerProfileViewSet, basename='volunteer-profile')
router.register(r'applications', VolunteerApplicationViewSet, basename='volunteer-application')
router.register(r'participations', VolunteerParticipationViewSet, basename='volunteer-participation')
router.register(r'admin/certificates', CertificateViewSet, basename='volunteer-admin-certificate')

app_name = 'volunteers'

urlpatterns = [
    # Dedicated Unified Volunteer Endpoints
    path('register/', VolunteerRegisterView.as_view(), name='volunteer-register'),
    path('apply/', VolunteerApplyView.as_view(), name='volunteer-apply'),
    path('my-profile/', MyVolunteerProfileView.as_view(), name='my-volunteer-profile'),
    path('my-applications/', MyVolunteerApplicationsView.as_view(), name='my-volunteer-applications'),
    path('my-participations/', MyVolunteerParticipationsView.as_view(), name='my-volunteer-participations'),
    path('certificates/', MyCertificatesView.as_view(), name='my-volunteer-certificates'),

    # ViewSet Router endpoints
    path('', include(router.urls)),
]
