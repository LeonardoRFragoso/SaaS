from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class DataSource(models.Model):
    """Data source model for connecting to external data."""
    
    SOURCE_TYPE_CHOICES = [
        ('google_sheets', 'Google Sheets'),
        ('excel_online', 'Excel Online'),
        ('csv_upload', 'Upload CSV'),
        ('xlsx_upload', 'Upload Excel'),
        ('database', 'Banco de Dados'),
        ('api', 'API'),
    ]
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='datasources',
        verbose_name=_('organização')
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_datasources',
        verbose_name=_('criado por')
    )
    
    name = models.CharField(_('nome'), max_length=255)
    source_type = models.CharField(_('tipo'), max_length=50, choices=SOURCE_TYPE_CHOICES)
    
    # Data info
    row_count = models.IntegerField(_('número de linhas'), default=0)
    
    # Connection details (encrypted)
    connection_config = models.JSONField(_('configuração de conexão'), default=dict)
    
    # Sync settings
    auto_sync = models.BooleanField(_('sincronização automática'), default=True)
    SYNC_FREQUENCY_CHOICES = [
        ('manual', 'Manual'),
        ('hourly', 'A cada hora'),
        ('6hours', 'A cada 6 horas'),
        ('daily', 'Diariamente'),
    ]
    sync_frequency = models.CharField(
        _('frequência de sincronização'),
        max_length=20,
        choices=SYNC_FREQUENCY_CHOICES,
        default='daily'
    )
    
    last_synced_at = models.DateTimeField(_('última sincronização'), null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(_('ativo'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('criado em'), auto_now_add=True)
    updated_at = models.DateTimeField(_('atualizado em'), auto_now=True)
    
    class Meta:
        verbose_name = _('fonte de dados')
        verbose_name_plural = _('fontes de dados')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_source_type_display()})"
