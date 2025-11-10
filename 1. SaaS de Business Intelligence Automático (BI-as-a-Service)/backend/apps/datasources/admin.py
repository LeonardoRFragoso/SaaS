from django.contrib import admin
from .models import DataSource


@admin.register(DataSource)
class DataSourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'source_type', 'organization', 'auto_sync', 'last_synced_at', 'is_active')
    list_filter = ('source_type', 'auto_sync', 'is_active', 'sync_frequency')
    search_fields = ('name', 'organization__name')
    readonly_fields = ('created_at', 'updated_at', 'last_synced_at')
