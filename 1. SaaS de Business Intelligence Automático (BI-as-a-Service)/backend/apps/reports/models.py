from django.db import models
from django.utils.translation import gettext_lazy as _


class Report(models.Model):
    """Automated report model."""
    
    FREQUENCY_CHOICES = [
        ('daily', 'Diário'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensal'),
        ('custom', 'Personalizado'),
    ]
    
    DELIVERY_METHOD_CHOICES = [
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
        ('both', 'Ambos'),
    ]
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='reports',
        verbose_name=_('organização')
    )
    
    dashboard = models.ForeignKey(
        'dashboards.Dashboard',
        on_delete=models.CASCADE,
        related_name='reports',
        verbose_name=_('dashboard')
    )
    
    name = models.CharField(_('nome'), max_length=255)
    description = models.TextField(_('descrição'), blank=True)
    
    # Schedule settings
    frequency = models.CharField(_('frequência'), max_length=20, choices=FREQUENCY_CHOICES, default='weekly')
    delivery_method = models.CharField(_('método de entrega'), max_length=20, choices=DELIVERY_METHOD_CHOICES, default='email')
    
    # Recipients
    recipients = models.JSONField(_('destinatários'), default=list)
    
    # Template
    template_config = models.JSONField(_('configuração do template'), default=dict)
    
    # Status
    is_active = models.BooleanField(_('ativo'), default=True)
    last_sent_at = models.DateTimeField(_('último envio'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('criado em'), auto_now_add=True)
    updated_at = models.DateTimeField(_('atualizado em'), auto_now=True)
    
    class Meta:
        verbose_name = _('relatório')
        verbose_name_plural = _('relatórios')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
