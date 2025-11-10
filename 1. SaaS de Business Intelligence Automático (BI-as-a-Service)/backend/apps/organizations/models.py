from django.db import models
from django.utils.translation import gettext_lazy as _


class Organization(models.Model):
    """Organization/Company model."""
    
    # Basic info
    name = models.CharField(_('nome'), max_length=255)
    slug = models.SlugField(_('slug'), unique=True)
    logo = models.ImageField(_('logo'), upload_to='organizations/', blank=True, null=True)
    
    # Contact info
    email = models.EmailField(_('email'), blank=True)
    phone = models.CharField(_('telefone'), max_length=20, blank=True)
    website = models.URLField(_('website'), blank=True)
    
    # Address
    address = models.CharField(_('endereço'), max_length=255, blank=True)
    city = models.CharField(_('cidade'), max_length=100, blank=True)
    state = models.CharField(_('estado'), max_length=2, blank=True)
    zip_code = models.CharField(_('CEP'), max_length=10, blank=True)
    country = models.CharField(_('país'), max_length=2, default='BR')
    
    # Business info
    INDUSTRY_CHOICES = [
        ('accounting', 'Contabilidade'),
        ('logistics', 'Logística e Transporte'),
        ('marketing', 'Marketing e Publicidade'),
        ('retail', 'Varejo'),
        ('ecommerce', 'E-commerce'),
        ('services', 'Serviços'),
        ('manufacturing', 'Indústria'),
        ('technology', 'Tecnologia'),
        ('other', 'Outro'),
    ]
    industry = models.CharField(
        _('setor'),
        max_length=50,
        choices=INDUSTRY_CHOICES,
        default='other'
    )
    
    company_size = models.CharField(
        _('tamanho da empresa'),
        max_length=50,
        blank=True,
        help_text='Ex: 1-10, 11-50, 51-200, etc.'
    )
    
    # Subscription info
    PLAN_CHOICES = [
        ('free', 'Free'),
        ('starter', 'Starter'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    ]
    plan = models.CharField(
        _('plano'),
        max_length=20,
        choices=PLAN_CHOICES,
        default='free'
    )
    
    trial_ends_at = models.DateTimeField(_('trial termina em'), null=True, blank=True)
    subscription_active = models.BooleanField(_('assinatura ativa'), default=True)
    
    # Limits based on plan
    max_users = models.IntegerField(_('máximo de usuários'), default=1)
    max_dashboards = models.IntegerField(_('máximo de dashboards'), default=1)
    max_datasources = models.IntegerField(_('máximo de fontes de dados'), default=1)
    max_ai_insights_per_month = models.IntegerField(_('máximo de insights IA/mês'), default=3)
    max_data_rows = models.IntegerField(_('máximo de linhas de dados'), default=5000)
    max_charts_per_dashboard = models.IntegerField(_('máximo de gráficos por dashboard'), default=4)
    max_scheduled_reports = models.IntegerField(_('máximo de relatórios agendados'), default=0)
    
    # Feature flags
    can_auto_sync = models.BooleanField(_('pode sincronizar automaticamente'), default=False)
    can_share_dashboards = models.BooleanField(_('pode compartilhar dashboards'), default=False)
    can_export_without_watermark = models.BooleanField(_('pode exportar sem marca d\'água'), default=False)
    can_use_api = models.BooleanField(_('pode usar API'), default=False)
    can_use_whatsapp = models.BooleanField(_('pode usar WhatsApp'), default=False)
    can_use_predictive_analytics = models.BooleanField(_('pode usar análise preditiva'), default=False)
    can_customize_dashboards = models.BooleanField(_('pode customizar dashboards'), default=False)
    has_white_label = models.BooleanField(_('tem white label'), default=False)
    
    # Usage tracking
    ai_insights_used_this_month = models.IntegerField(_('insights IA usados este mês'), default=0)
    last_ai_reset = models.DateTimeField(_('último reset de IA'), null=True, blank=True)
    
    # Settings
    settings = models.JSONField(_('configurações'), default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('criado em'), auto_now_add=True)
    updated_at = models.DateTimeField(_('atualizado em'), auto_now=True)
    
    # Status
    is_active = models.BooleanField(_('ativo'), default=True)
    
    class Meta:
        verbose_name = _('organização')
        verbose_name_plural = _('organizações')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def get_user_count(self):
        """Get number of users in organization."""
        return self.users.count()
    
    def get_dashboard_count(self):
        """Get number of dashboards in organization."""
        return self.dashboards.count()
    
    def get_datasource_count(self):
        """Get number of data sources in organization."""
        return self.datasources.count()
    
    def can_add_user(self):
        """Check if organization can add more users."""
        return self.get_user_count() < self.max_users
    
    def can_add_dashboard(self):
        """Check if organization can add more dashboards."""
        return self.get_dashboard_count() < self.max_dashboards
    
    def can_add_datasource(self):
        """Check if organization can add more data sources."""
        return self.get_datasource_count() < self.max_datasources
    
    def can_use_ai_insight(self):
        """Check if organization can use more AI insights this month."""
        from django.utils import timezone
        from datetime import timedelta
        
        # Initialize last_ai_reset if not set
        if not self.last_ai_reset:
            self.last_ai_reset = timezone.now()
            self.save()
        
        # Reset counter if it's a new month
        if timezone.now() - self.last_ai_reset > timedelta(days=30):
            self.ai_insights_used_this_month = 0
            self.last_ai_reset = timezone.now()
            self.save()
        
        return self.ai_insights_used_this_month < self.max_ai_insights_per_month
    
    def increment_ai_usage(self):
        """Increment AI insights usage counter."""
        self.ai_insights_used_this_month += 1
        self.save()
    
    def get_plan_limits(self):
        """Get all plan limits as a dictionary."""
        return {
            'plan': self.plan,
            'max_users': self.max_users,
            'max_dashboards': self.max_dashboards,
            'max_datasources': self.max_datasources,
            'max_ai_insights_per_month': self.max_ai_insights_per_month,
            'max_data_rows': self.max_data_rows,
            'max_charts_per_dashboard': self.max_charts_per_dashboard,
            'max_scheduled_reports': self.max_scheduled_reports,
            'can_auto_sync': self.can_auto_sync,
            'can_share_dashboards': self.can_share_dashboards,
            'can_export_without_watermark': self.can_export_without_watermark,
            'can_use_api': self.can_use_api,
            'can_use_whatsapp': self.can_use_whatsapp,
            'can_use_predictive_analytics': self.can_use_predictive_analytics,
            'can_customize_dashboards': self.can_customize_dashboards,
            'has_white_label': self.has_white_label,
        }
    
    def get_usage_stats(self):
        """Get current usage statistics."""
        return {
            'users': self.get_user_count(),
            'dashboards': self.get_dashboard_count(),
            'datasources': self.get_datasource_count(),
            'ai_insights_this_month': self.ai_insights_used_this_month,
        }
    
    def set_plan_limits(self, plan_name):
        """Set limits based on plan name."""
        plan_configs = {
            'free': {
                'max_users': 1,
                'max_dashboards': 1,
                'max_datasources': 1,
                'max_ai_insights_per_month': 3,
                'max_data_rows': 5000,
                'max_charts_per_dashboard': 4,
                'max_scheduled_reports': 0,
                'can_auto_sync': False,
                'can_share_dashboards': False,
                'can_export_without_watermark': False,
                'can_use_api': False,
                'can_use_whatsapp': False,
                'can_use_predictive_analytics': False,
                'can_customize_dashboards': False,
                'has_white_label': False,
            },
            'starter': {
                'max_users': 2,
                'max_dashboards': 5,
                'max_datasources': 3,
                'max_ai_insights_per_month': 20,
                'max_data_rows': 50000,
                'max_charts_per_dashboard': 10,
                'max_scheduled_reports': 3,
                'can_auto_sync': True,
                'can_share_dashboards': False,
                'can_export_without_watermark': True,
                'can_use_api': False,
                'can_use_whatsapp': False,
                'can_use_predictive_analytics': False,
                'can_customize_dashboards': False,
                'has_white_label': False,
            },
            'pro': {
                'max_users': 10,
                'max_dashboards': 999999,  # Unlimited
                'max_datasources': 10,
                'max_ai_insights_per_month': 999999,  # Unlimited
                'max_data_rows': 500000,
                'max_charts_per_dashboard': 999999,  # Unlimited
                'max_scheduled_reports': 999999,  # Unlimited
                'can_auto_sync': True,
                'can_share_dashboards': True,
                'can_export_without_watermark': True,
                'can_use_api': True,
                'can_use_whatsapp': True,
                'can_use_predictive_analytics': True,
                'can_customize_dashboards': True,
                'has_white_label': True,
            },
            'enterprise': {
                'max_users': 999999,  # Unlimited
                'max_dashboards': 999999,  # Unlimited
                'max_datasources': 999999,  # Unlimited
                'max_ai_insights_per_month': 999999,  # Unlimited
                'max_data_rows': 999999999,  # Unlimited
                'max_charts_per_dashboard': 999999,  # Unlimited
                'max_scheduled_reports': 999999,  # Unlimited
                'can_auto_sync': True,
                'can_share_dashboards': True,
                'can_export_without_watermark': True,
                'can_use_api': True,
                'can_use_whatsapp': True,
                'can_use_predictive_analytics': True,
                'can_customize_dashboards': True,
                'has_white_label': True,
            },
        }
        
        config = plan_configs.get(plan_name, plan_configs['free'])
        for key, value in config.items():
            setattr(self, key, value)
        
        self.plan = plan_name
        self.save()
