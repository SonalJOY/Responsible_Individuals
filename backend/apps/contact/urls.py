from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactEnquiryViewSet, NewsletterSubscriberView

router = DefaultRouter()
router.register(r'enquiries', ContactEnquiryViewSet, basename='contact-enquiry')

app_name = 'contact'

urlpatterns = [
    path('newsletter/subscribe/', NewsletterSubscriberView.as_view(), name='newsletter-subscribe'),
    path('', include(router.urls)),
]
