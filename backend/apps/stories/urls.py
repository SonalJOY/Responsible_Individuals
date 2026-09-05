from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoryViewSet, StoryCategoryViewSet

router = DefaultRouter()
router.register(r'categories', StoryCategoryViewSet, basename='story-category')
router.register(r'', StoryViewSet, basename='story')

app_name = 'stories'

urlpatterns = [
    path('', include(router.urls)),
]
