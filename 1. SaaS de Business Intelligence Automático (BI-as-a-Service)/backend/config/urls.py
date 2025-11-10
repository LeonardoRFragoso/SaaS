"""
URL configuration for InsightFlow BI project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/organizations/', include('apps.organizations.urls')),
    path('api/datasources/', include('apps.datasources.urls')),
    path('api/dashboards/', include('apps.dashboards.urls')),
    path('api/insights/', include('apps.insights.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/billing/', include('apps.billing.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
