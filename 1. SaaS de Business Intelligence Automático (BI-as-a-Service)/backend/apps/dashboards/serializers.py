from rest_framework import serializers
from .models import Dashboard


class DashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dashboard
        fields = [
            'id',
            'name',
            'description',
            'template',
            'datasources',
            'config',
            'is_public',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        # Validar limites do plano
        request = self.context.get('request')
        if request and request.user:
            organization = request.user.organization
            
            # Verificar se pode adicionar novo dashboard
            if not self.instance:  # Criando novo dashboard
                if not organization.can_add_dashboard():
                    raise serializers.ValidationError({
                        'error': 'Limite de dashboards atingido',
                        'current_plan': organization.plan,
                        'max_dashboards': organization.max_dashboards,
                    })
        
        return data
