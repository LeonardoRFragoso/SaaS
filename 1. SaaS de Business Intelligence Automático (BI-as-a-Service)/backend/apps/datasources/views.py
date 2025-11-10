from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import DataSource
from .serializers import DataSourceSerializer, DataSourceDataSerializer
from .services import DataSourceService
import pandas as pd
import io


class DataSourceViewSet(viewsets.ModelViewSet):
    serializer_class = DataSourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DataSource.objects.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user
        )
    
    def _detect_template_from_dataframe(self, df):
        """
        Detecta automaticamente qual template usar baseado nas colunas do DataFrame.
        Retorna: 'sales', 'financial', 'performance', ou 'custom'
        """
        # Converter nomes de colunas para lowercase para comparação
        columns_lower = [col.lower() for col in df.columns]
        columns_str = ' '.join(columns_lower)
        
        # Score para cada template
        sales_score = 0
        financial_score = 0
        
        # INDICADORES DE VENDAS
        sales_keywords = [
            'produto', 'product', 'item', 'sku',
            'venda', 'sale', 'vendas', 'sales',
            'cliente', 'customer', 'comprador',
            'quantidade', 'quantity', 'qtd', 'qty',
            'preco', 'price', 'valor', 'value'
        ]
        
        for keyword in sales_keywords:
            if keyword in columns_str:
                sales_score += 1
        
        # INDICADORES FINANCEIROS
        financial_keywords = [
            'receita', 'revenue', 'income',
            'despesa', 'expense', 'cost', 'custo',
            'lucro', 'profit',
            'tipo', 'type', 'categoria', 'category',
            'debito', 'debit', 'credito', 'credit'
        ]
        
        for keyword in financial_keywords:
            if keyword in columns_str:
                financial_score += 1
        
        # Palavras que indicam fortemente financeiro
        if any(word in columns_str for word in ['receita', 'despesa', 'revenue', 'expense', 'debito', 'credito']):
            financial_score += 3
        
        # Palavras que indicam fortemente vendas
        if any(word in columns_str for word in ['produto', 'product', 'cliente', 'customer']):
            sales_score += 2
        
        # Decidir template
        if financial_score > sales_score and financial_score >= 3:
            return 'financial'
        elif sales_score >= 2:
            return 'sales'
        else:
            # Padrão: usar 'sales' se tiver pelo menos 1 coluna numérica
            has_numeric = any(pd.api.types.is_numeric_dtype(df[col]) for col in df.columns)
            return 'sales' if has_numeric else 'custom'

    @action(detail=False, methods=['post'])
    def upload_csv(self, request):
        """Upload de arquivo CSV"""
        file = request.FILES.get('file')
        name = request.data.get('name')
        
        if not file:
            return Response({'error': 'Arquivo não fornecido'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not name:
            return Response({'error': 'Nome não fornecido'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar limite
        organization = request.user.organization
        if not organization.can_add_datasource():
            return Response({
                'error': 'Limite de fontes de dados atingido',
                'current_plan': organization.plan,
                'max_datasources': organization.max_datasources,
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Ler CSV
            df = pd.read_csv(file)
            
            # Verificar limite de linhas
            if len(df) > organization.max_data_rows:
                return Response({
                    'error': f'Arquivo excede o limite de {organization.max_data_rows} linhas',
                    'rows_in_file': len(df),
                    'max_rows': organization.max_data_rows,
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Salvar dados
            service = DataSourceService()
            datasource = service.create_from_csv(
                organization=organization,
                user=request.user,
                name=name,
                dataframe=df
            )
            
            # DETECÇÃO AUTOMÁTICA DO TEMPLATE baseado nas colunas
            detected_template = self._detect_template_from_dataframe(df)
            
            # Criar dashboard automaticamente
            from apps.dashboards.models import Dashboard
            dashboard = Dashboard.objects.create(
                name=f"Dashboard de {name}",
                template=detected_template,
                organization=organization,
                created_by=request.user,
                config={},
                description=f"Dashboard criado automaticamente a partir de {name}"
            )
            # Adicionar datasource ao dashboard (ManyToMany)
            dashboard.datasources.add(datasource)
            
            serializer = self.get_serializer(datasource)
            response_data = serializer.data
            response_data['dashboard_created'] = True
            response_data['dashboard_id'] = dashboard.id
            response_data['dashboard_name'] = dashboard.name
            response_data['dashboard_template'] = dashboard.template
            response_data['message'] = f'Dashboard "{dashboard.name}" criado automaticamente!'
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def connect_google_sheets(self, request):
        """Conectar Google Sheets"""
        name = request.data.get('name')
        url = request.data.get('url')
        
        if not name or not url:
            return Response({'error': 'Nome e URL são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar limite
        organization = request.user.organization
        if not organization.can_add_datasource():
            return Response({
                'error': 'Limite de fontes de dados atingido',
                'current_plan': organization.plan,
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            service = DataSourceService()
            datasource = service.connect_google_sheets(
                organization=organization,
                user=request.user,
                name=name,
                url=url
            )
            
            serializer = self.get_serializer(datasource)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Sincronizar dados da fonte"""
        datasource = self.get_object()
        
        try:
            service = DataSourceService()
            service.sync_datasource(datasource)
            
            serializer = self.get_serializer(datasource)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def data(self, request, pk=None):
        """Obter dados da fonte"""
        datasource = self.get_object()
        
        try:
            service = DataSourceService()
            data = service.get_data(datasource)
            
            serializer = DataSourceDataSerializer(data)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
