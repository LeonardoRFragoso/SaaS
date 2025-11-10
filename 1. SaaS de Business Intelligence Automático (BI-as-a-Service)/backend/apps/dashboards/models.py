from django.db import models
from django.utils.translation import gettext_lazy as _


class Dashboard(models.Model):
    """Dashboard model for data visualization."""
    
    TEMPLATE_CHOICES = [
        ('sales', 'Vendas'),
        ('financial', 'Financeiro'),
        ('performance', 'Performance'),
        ('custom', 'Personalizado'),
    ]
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='dashboards',
        verbose_name=_('organização')
    )
    
    name = models.CharField(_('nome'), max_length=255)
    description = models.TextField(_('descrição'), blank=True)
    template = models.CharField(_('template'), max_length=50, choices=TEMPLATE_CHOICES, default='custom')
    
    # Dashboard configuration (widgets, layout, etc.)
    config = models.JSONField(_('configuração'), default=dict)
    
    # Data sources linked to this dashboard
    datasources = models.ManyToManyField(
        'datasources.DataSource',
        related_name='dashboards',
        verbose_name=_('fontes de dados'),
        blank=True
    )
    
    # Sharing settings
    is_public = models.BooleanField(_('público'), default=False)
    shared_with = models.ManyToManyField(
        'users.User',
        related_name='shared_dashboards',
        verbose_name=_('compartilhado com'),
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('criado em'), auto_now_add=True)
    updated_at = models.DateTimeField(_('atualizado em'), auto_now=True)
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_dashboards',
        verbose_name=_('criado por')
    )
    
    class Meta:
        verbose_name = _('dashboard')
        verbose_name_plural = _('dashboards')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
