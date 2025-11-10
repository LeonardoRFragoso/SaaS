from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('name', 'frequency', 'delivery_method', 'organization', 'is_active', 'last_sent_at')
    list_filter = ('frequency', 'delivery_method', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'organization__name')
    readonly_fields = ('created_at', 'updated_at', 'last_sent_at')
