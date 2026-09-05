from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PageViewSet, HeroBannerViewSet, SiteSettingViewSet

router = DefaultRouter()
router.register(r'pages', PageViewSet, basename='page')
router.register(r'banners', HeroBannerViewSet, basename='banner')
router.register(r'settings', SiteSettingViewSet, basename='setting')

app_name = 'cms'

urlpatterns = [
    path('', include(router.urls)),
]
