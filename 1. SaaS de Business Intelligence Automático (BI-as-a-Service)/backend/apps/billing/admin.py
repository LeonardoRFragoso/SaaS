from django.contrib import admin
from .models import Subscription, Invoice


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('organization', 'status', 'current_period_start', 'current_period_end')
    list_filter = ('status', 'created_at')
    search_fields = ('organization__name', 'external_id')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'subscription', 'amount', 'status', 'invoice_date', 'paid_at')
    list_filter = ('status', 'invoice_date')
    search_fields = ('subscription__organization__name', 'external_id')
    readonly_fields = ('created_at', 'updated_at')
