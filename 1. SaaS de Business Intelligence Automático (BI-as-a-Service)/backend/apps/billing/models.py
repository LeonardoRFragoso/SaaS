from django.db import models
from django.utils.translation import gettext_lazy as _


class Subscription(models.Model):
    """Subscription model for billing."""
    
    STATUS_CHOICES = [
        ('active', 'Ativo'),
        ('canceled', 'Cancelado'),
        ('past_due', 'Vencido'),
        ('trialing', 'Trial'),
    ]
    
    organization = models.OneToOneField(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='subscription',
        verbose_name=_('organização')
    )
    
    # Stripe/Mercado Pago IDs
    external_id = models.CharField(_('ID externo'), max_length=255, blank=True)
    customer_id = models.CharField(_('ID do cliente'), max_length=255, blank=True)
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='trialing')
    
    # Billing cycle
    current_period_start = models.DateTimeField(_('início do período'), null=True, blank=True)
    current_period_end = models.DateTimeField(_('fim do período'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('criado em'), auto_now_add=True)
    updated_at = models.DateTimeField(_('atualizado em'), auto_now=True)
    canceled_at = models.DateTimeField(_('cancelado em'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('assinatura')
        verbose_name_plural = _('assinaturas')
    
    def __str__(self):
        return f"{self.organization.name} - {self.get_status_display()}"


class Invoice(models.Model):
    """Invoice model for billing history."""
    
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('open', 'Aberto'),
        ('paid', 'Pago'),
        ('void', 'Cancelado'),
        ('uncollectible', 'Não cobrável'),
    ]
    
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='invoices',
        verbose_name=_('assinatura')
    )
    
    external_id = models.CharField(_('ID externo'), max_length=255, blank=True)
    
    amount = models.DecimalField(_('valor'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('moeda'), max_length=3, default='BRL')
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='open')
    
    # Dates
    invoice_date = models.DateTimeField(_('data da fatura'))
    due_date = models.DateTimeField(_('data de vencimento'), null=True, blank=True)
    paid_at = models.DateTimeField(_('pago em'), null=True, blank=True)
    
    # PDF
    invoice_pdf = models.FileField(_('PDF da fatura'), upload_to='invoices/', blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('criado em'), auto_now_add=True)
    updated_at = models.DateTimeField(_('atualizado em'), auto_now=True)
    
    class Meta:
        verbose_name = _('fatura')
        verbose_name_plural = _('faturas')
        ordering = ['-invoice_date']
    
    def __str__(self):
        return f"Fatura {self.id} - {self.subscription.organization.name}"
