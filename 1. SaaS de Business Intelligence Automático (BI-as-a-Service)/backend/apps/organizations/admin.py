from django.contrib import admin
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    """Admin for Organization model."""
    
    list_display = ('name', 'plan', 'industry', 'subscription_active', 'created_at')
    list_filter = ('plan', 'industry', 'subscription_active', 'is_active')
    search_fields = ('name', 'email', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'slug', 'logo', 'industry', 'company_size')
        }),
        ('Contato', {
            'fields': ('email', 'phone', 'website')
        }),
        ('Endereço', {
            'fields': ('address', 'city', 'state', 'zip_code', 'country')
        }),
        ('Assinatura', {
            'fields': ('plan', 'trial_ends_at', 'subscription_active')
        }),
        ('Limites', {
            'fields': ('max_users', 'max_dashboards', 'max_datasources', 'max_ai_queries')
        }),
        ('Configurações', {
            'fields': ('settings', 'is_active')
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at')
        }),
    )
