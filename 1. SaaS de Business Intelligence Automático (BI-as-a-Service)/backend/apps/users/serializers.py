from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'full_name', 'phone', 'avatar',
            'organization', 'role', 'language', 'timezone',
            'email_verified', 'two_factor_enabled',
            'created_at', 'updated_at', 'last_login_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'email_verified')


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users."""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'full_name', 'phone')
    
    def validate(self, data):
        """Validate that passwords match."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'As senhas não coincidem.'})
        return data
    
    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = ('full_name', 'phone', 'avatar', 'language', 'timezone')


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True, min_length=8)
    
    def validate(self, data):
        """Validate that new passwords match."""
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({'new_password': 'As senhas não coincidem.'})
        return data
