from rest_framework import serializers
from .models import DataSource


class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = [
            'id',
            'name',
            'source_type',
            'connection_config',
            'is_active',
            'last_synced_at',
            'row_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'last_synced_at', 'row_count', 'created_at', 'updated_at']

    def validate(self, data):
        # Validar limites do plano
        request = self.context.get('request')
        if request and request.user:
            organization = request.user.organization
            
            # Verificar se pode adicionar nova fonte
            if not self.instance:  # Criando nova fonte
                if not organization.can_add_datasource():
                    raise serializers.ValidationError({
                        'error': 'Limite de fontes de dados atingido',
                        'current_plan': organization.plan,
                        'max_datasources': organization.max_datasources,
                    })
        
        return data


class DataSourceDataSerializer(serializers.Serializer):
    """Serializer para os dados da fonte"""
    columns = serializers.ListField(child=serializers.CharField())
    rows = serializers.ListField(child=serializers.DictField())
    total_rows = serializers.IntegerField()
