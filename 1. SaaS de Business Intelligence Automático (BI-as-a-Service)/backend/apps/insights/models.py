from django.db import models
from django.utils.translation import gettext_lazy as _


class Insight(models.Model):
    """AI-generated insights from data."""
    
    INSIGHT_TYPE_CHOICES = [
        ('anomaly', 'Anomalia'),
        ('trend', 'Tendência'),
        ('recommendation', 'Recomendação'),
        ('alert', 'Alerta'),
    ]
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='insights',
        verbose_name=_('organização')
    )
    
    dashboard = models.ForeignKey(
        'dashboards.Dashboard',
        on_delete=models.CASCADE,
        related_name='insights',
        verbose_name=_('dashboard'),
        null=True,
        blank=True
    )
    
    insight_type = models.CharField(_('tipo'), max_length=50, choices=INSIGHT_TYPE_CHOICES)
    title = models.CharField(_('título'), max_length=255)
    description = models.TextField(_('descrição'))
    
    # AI-generated content
    ai_analysis = models.TextField(_('análise da IA'), blank=True)
    
    # Metadata
    data_context = models.JSONField(_('contexto dos dados'), default=dict)
    
    # Status
    is_read = models.BooleanField(_('lido'), default=False)
    is_important = models.BooleanField(_('importante'), default=False)
    
    # Timestamps
    created_at = models.DateTimeField(_('criado em'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('insight')
        verbose_name_plural = _('insights')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
