from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.core.views import AdminDashboardStatsView

admin.site.site_header = "Responsible Individuals Administration"
admin.site.site_title = "Responsible Individuals Admin Portal"
admin.site.index_title = "Platform Operations & Content Management"

api_v1_patterns = [
    path('auth/', include('apps.accounts.urls', namespace='accounts')),
    path('cms/', include('apps.cms.urls', namespace='cms')),
    path('impact/', include('apps.impact.urls', namespace='impact')),
    path('projects/', include('apps.projects.urls', namespace='projects')),
    path('events/', include('apps.events.urls', namespace='events')),
    path('stories/', include('apps.stories.urls', namespace='stories')),
    path('gallery/', include('apps.gallery.urls', namespace='gallery')),
    path('volunteers/', include('apps.volunteers.urls', namespace='volunteers')),
    path('donations/', include('apps.donations.urls', namespace='donations')),
    path('partners/', include('apps.partners.urls', namespace='partners')),
    path('careers/', include('apps.careers.urls', namespace='careers')),
    path('contact/', include('apps.contact.urls', namespace='contact')),
    path('admin/dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
