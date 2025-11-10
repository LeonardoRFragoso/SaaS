from rest_framework import serializers
from .models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for Organization model."""
    
    user_count = serializers.IntegerField(source='get_user_count', read_only=True)
    dashboard_count = serializers.IntegerField(source='get_dashboard_count', read_only=True)
    datasource_count = serializers.IntegerField(source='get_datasource_count', read_only=True)
    
    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'slug', 'logo', 'email', 'phone', 'website',
            'address', 'city', 'state', 'zip_code', 'country',
            'industry', 'company_size', 'plan', 'trial_ends_at',
            'subscription_active', 'max_users', 'max_dashboards',
            'max_datasources', 'max_ai_queries', 'settings',
            'user_count', 'dashboard_count', 'datasource_count',
            'created_at', 'updated_at', 'is_active'
        )
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')


class OrganizationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating organizations."""
    
    class Meta:
        model = Organization
        fields = ('name', 'email', 'phone', 'industry', 'company_size')
    
    def create(self, validated_data):
        """Create organization with auto-generated slug."""
        from django.utils.text import slugify
        import uuid
        
        name = validated_data['name']
        slug = slugify(name)
        
        # Ensure unique slug
        if Organization.objects.filter(slug=slug).exists():
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"
        
        validated_data['slug'] = slug
        return super().create(validated_data)


class OrganizationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating organizations."""
    
    class Meta:
        model = Organization
        fields = (
            'name', 'logo', 'email', 'phone', 'website',
            'address', 'city', 'state', 'zip_code', 'country',
            'industry', 'company_size', 'settings'
        )
