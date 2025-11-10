from django.contrib import admin
from .models import Insight


@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    list_display = ('title', 'insight_type', 'organization', 'is_important', 'is_read', 'created_at')
    list_filter = ('insight_type', 'is_important', 'is_read', 'created_at')
    search_fields = ('title', 'description', 'organization__name')
    readonly_fields = ('created_at',)
