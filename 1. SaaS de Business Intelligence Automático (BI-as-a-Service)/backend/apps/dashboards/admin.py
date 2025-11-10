from django.contrib import admin
from .models import Dashboard


@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    list_display = ('name', 'template', 'organization', 'is_public', 'created_at')
    list_filter = ('template', 'is_public', 'created_at')
    search_fields = ('name', 'description', 'organization__name')
    readonly_fields = ('created_at', 'updated_at')
