from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GalleryAlbumViewSet, GalleryItemViewSet

router = DefaultRouter()
router.register(r'albums', GalleryAlbumViewSet, basename='gallery-album')
router.register(r'items', GalleryItemViewSet, basename='gallery-item')

app_name = 'gallery'

urlpatterns = [
    path('', include(router.urls)),
]
