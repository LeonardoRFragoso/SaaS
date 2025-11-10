from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError(_('O email é obrigatório'))
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model with email as the unique identifier."""
    
    username = None  # Remove username field
    email = models.EmailField(_('email'), unique=True)
    
    # Profile fields
    full_name = models.CharField(_('nome completo'), max_length=255, blank=True)
    phone = models.CharField(_('telefone'), max_length=20, blank=True)
    avatar = models.ImageField(_('avatar'), upload_to='avatars/', blank=True, null=True)
    
    # Organization relationship
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='users',
        verbose_name=_('organização'),
        null=True,
        blank=True
    )
    
    # Role in organization
    ROLE_CHOICES = [
        ('owner', 'Proprietário'),
        ('admin', 'Administrador'),
        ('member', 'Membro'),
        ('viewer', 'Visualizador'),
    ]
    role = models.CharField(
        _('função'),
        max_length=20,
        choices=ROLE_CHOICES,
        default='member'
    )
    
    # Preferences
    language = models.CharField(_('idioma'), max_length=10, default='pt-br')
    timezone = models.CharField(_('fuso horário'), max_length=50, default='America/Sao_Paulo')
    
    # Timestamps
    created_at = models.DateTimeField(_('criado em'), auto_now_add=True)
    updated_at = models.DateTimeField(_('atualizado em'), auto_now=True)
    last_login_at = models.DateTimeField(_('último login'), null=True, blank=True)
    
    # Email verification
    email_verified = models.BooleanField(_('email verificado'), default=False)
    email_verification_token = models.CharField(max_length=100, blank=True)
    
    # 2FA
    two_factor_enabled = models.BooleanField(_('2FA habilitado'), default=False)
    two_factor_secret = models.CharField(max_length=100, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        verbose_name = _('usuário')
        verbose_name_plural = _('usuários')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        """Return the full name or email if full name is not set."""
        return self.full_name or self.email
    
    def get_short_name(self):
        """Return the first name or email."""
        if self.full_name:
            return self.full_name.split()[0]
        return self.email.split('@')[0]
