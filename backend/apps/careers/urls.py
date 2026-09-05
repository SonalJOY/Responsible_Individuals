from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostViewSet, JobApplicationViewSet

router = DefaultRouter()
router.register(r'applications', JobApplicationViewSet, basename='job-application')
router.register(r'', JobPostViewSet, basename='job-post')

app_name = 'careers'

urlpatterns = [
    path('', include(router.urls)),
]
