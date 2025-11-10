from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from apps.users.serializers import UserSerializer


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Validate user credentials."""
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError('Credenciais inválidas.')
            
            if not user.is_active:
                raise serializers.ValidationError('Conta desativada.')
            
            data['user'] = user
        else:
            raise serializers.ValidationError('Email e senha são obrigatórios.')
        
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    organization_name = serializers.CharField(required=False)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'full_name', 'phone', 'organization_name')
    
    def validate(self, data):
        """Validate that passwords match."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'As senhas não coincidem.'})
        return data
    
    def create(self, validated_data):
        """Create user and organization."""
        from apps.organizations.models import Organization
        from django.utils.text import slugify
        import uuid
        
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        organization_name = validated_data.pop('organization_name', None)
        email = validated_data.get('email')
        full_name = validated_data.get('full_name')
        
        # Create organization if name provided
        organization = None
        if organization_name:
            organization_name = organization_name.strip()
        if not organization_name:
            fallback_name = full_name or (email.split('@')[0] if email else 'Minha Organização')
            organization_name = f"Organização de {fallback_name}".strip()
        
        base_slug = slugify(organization_name) or slugify(email.split('@')[0] if email else '') or 'organizacao'
        slug = base_slug
        while Organization.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"

        organization = Organization.objects.create(
            name=organization_name,
            slug=slug,
        )
        organization.set_plan_limits('free')
        organization.trial_ends_at = timezone.now() + timedelta(days=14)
        organization.subscription_active = True
        organization.save(update_fields=['trial_ends_at', 'subscription_active'])
        
        # Create user
        user = User.objects.create_user(
            password=password,
            organization=organization,
            role='owner' if organization else 'member',
            **validated_data
        )
        
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField(min_length=8)
    
    def validate(self, data):
        """Validate that passwords match."""
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({'new_password': 'As senhas não coincidem.'})
        return data
