from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VolunteerInterestViewSet,
    VolunteerOpportunityViewSet,
    VolunteerProfileViewSet,
    VolunteerApplicationViewSet,
    VolunteerParticipationViewSet,
    CertificateViewSet,
    VolunteerOnboardingApplicationViewSet,
    VolunteerRegisterView,
    VolunteerApplyView,
    MyVolunteerProfileView,
    MyVolunteerApplicationsView,
    MyVolunteerParticipationsView,
    MyCertificatesView,
    MyOnboardingApplicationView,
    SubmitOnboardingApplicationView,
    VolunteerInvitationBatchViewSet,
    VolunteerInvitationViewSet,
    ValidateInvitationTokenView,
    RequestInvitationOTPView,
    AcceptInvitationView,
)

router = DefaultRouter()
router.register(r'interests', VolunteerInterestViewSet, basename='volunteer-interest')
router.register(r'opportunities', VolunteerOpportunityViewSet, basename='volunteer-opportunity')
router.register(r'profiles', VolunteerProfileViewSet, basename='volunteer-profile')
router.register(r'applications', VolunteerApplicationViewSet, basename='volunteer-application')
router.register(r'participations', VolunteerParticipationViewSet, basename='volunteer-participation')
router.register(r'admin/certificates', CertificateViewSet, basename='volunteer-admin-certificate')
router.register(r'onboarding-applications', VolunteerOnboardingApplicationViewSet, basename='volunteer-onboarding-application')
router.register(r'invitations/batches', VolunteerInvitationBatchViewSet, basename='volunteer-invitation-batch')
router.register(r'invitations', VolunteerInvitationViewSet, basename='volunteer-invitation')

app_name = 'volunteers'

urlpatterns = [
    # Dedicated Unified Volunteer Endpoints
    path('register/', VolunteerRegisterView.as_view(), name='volunteer-register'),
    path('apply/', VolunteerApplyView.as_view(), name='volunteer-apply'),
    path('my-profile/', MyVolunteerProfileView.as_view(), name='my-volunteer-profile'),
    path('my-applications/', MyVolunteerApplicationsView.as_view(), name='my-volunteer-applications'),
    path('my-participations/', MyVolunteerParticipationsView.as_view(), name='my-volunteer-participations'),
    path('certificates/', MyCertificatesView.as_view(), name='my-volunteer-certificates'),
    path('my-onboarding/', MyOnboardingApplicationView.as_view(), name='my-onboarding-application'),
    path('submit-onboarding/', SubmitOnboardingApplicationView.as_view(), name='submit-onboarding-application'),

    # Volunteer Invitation Public Endpoints (must precede router to avoid pk pattern collisions)
    path('invitations/validate-token/', ValidateInvitationTokenView.as_view(), name='volunteer-invitation-validate'),
    path('invitations/request-otp/', RequestInvitationOTPView.as_view(), name='volunteer-invitation-request-otp'),
    path('invitations/accept/', AcceptInvitationView.as_view(), name='volunteer-invitation-accept'),

    # ViewSet Router endpoints
    path('', include(router.urls)),
]
