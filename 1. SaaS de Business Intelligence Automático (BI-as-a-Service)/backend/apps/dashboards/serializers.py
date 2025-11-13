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
            'is_preview',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_preview']

    def validate(self, data):
        # Validar limites do plano
        request = self.context.get('request')
        if request and request.user:
            organization = request.user.organization
            
            # Verificar se pode adicionar novo dashboard (prévias não contam)
            if not self.instance:  # Criando novo dashboard
                is_preview = bool(self.initial_data.get('is_preview', False))
                if not is_preview and not organization.can_add_dashboard():
                    raise serializers.ValidationError({
                        'error': 'Limite de dashboards atingido',
                        'current_plan': organization.plan,
                        'max_dashboards': organization.max_dashboards,
                    })
                
                # Exigir pelo menos uma fonte de dados ao criar dashboard real
                if not is_preview:
                    datasources = self.initial_data.get('datasources') or data.get('datasources') or []
                    if not datasources:
                        raise serializers.ValidationError({
                            'error': 'Para criar um dashboard, conecte uma fonte de dados ou use a Pré-visualização automática.',
                            'hint': 'Conecte uma fonte em /datasources e crie o dashboard a partir dela.'
                        })
        
        return data
