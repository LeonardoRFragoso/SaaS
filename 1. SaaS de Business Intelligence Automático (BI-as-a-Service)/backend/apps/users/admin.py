from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom user admin."""
    
    list_display = ('email', 'full_name', 'organization', 'role', 'is_active', 'created_at')
    list_filter = ('is_active', 'is_staff', 'role', 'email_verified', 'created_at')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Informações Pessoais'), {'fields': ('full_name', 'phone', 'avatar')}),
        (_('Organização'), {'fields': ('organization', 'role')}),
        (_('Preferências'), {'fields': ('language', 'timezone')}),
        (_('Segurança'), {'fields': ('email_verified', 'two_factor_enabled')}),
        (_('Permissões'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Datas Importantes'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'full_name', 'organization', 'role'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login')
