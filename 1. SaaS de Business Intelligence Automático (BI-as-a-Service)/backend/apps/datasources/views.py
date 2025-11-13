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
    
    def _analyze_dataframe(self, df):
        """
        Analisa o DataFrame para identificar colunas por tipo e sinal mínimo para dashboards.
        """
        columns_info = {
            'numeric': [],
            'date': [],
            'categorical': [],
        }
        
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                columns_info['numeric'].append(col)
                continue
            
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                columns_info['date'].append(col)
                continue
            
            # Tentar converter para data se possível
            try:
                converted = pd.to_datetime(df[col], errors='coerce', utc=False)
                if converted.notna().any():
                    columns_info['date'].append(col)
                    continue
            except Exception:
                pass
            
            columns_info['categorical'].append(col)
        
        # Heurística mínima: ao menos 1 numérica e (1 categórica ou 1 de data), e linhas suficientes
        min_rows_ok = len(df) >= 5
        has_numeric = len(columns_info['numeric']) > 0
        has_cat_or_date = (len(columns_info['categorical']) > 0) or (len(columns_info['date']) > 0)
        
        # Também evitar colunas categóricas com cardinalidade absurda (ruído)
        low_cardinality_exists = False
        for col in columns_info['categorical']:
            try:
                unique_vals = df[col].nunique(dropna=True)
                if unique_vals > 0 and unique_vals <= 50:
                    low_cardinality_exists = True
                    break
            except Exception:
                continue
        
        has_minimum_signal = min_rows_ok and has_numeric and (low_cardinality_exists or len(columns_info['date']) > 0)
        
        return {
            'columns_info': columns_info,
            'has_minimum_signal': has_minimum_signal,
        }
    
    def _suggest_basic_config(self, df, template, max_charts):
        """
        Sugere uma configuração básica de dashboard com no máximo `max_charts` widgets.
        Essa configuração é genérica e segura para dados variados.
        """
        analysis = self._analyze_dataframe(df)
        cols = analysis['columns_info']
        
        widgets = []
        
        # 1) KPI simples: soma do primeiro numérico
        if cols['numeric']:
            widgets.append({
                'type': 'kpi_sum',
                'title': 'Total',
                'column': cols['numeric'][0],
                'format': 'number',
            })
        
        # 2) Linha no tempo se houver data+numérica
        if cols['date'] and cols['numeric'] and len(widgets) < max_charts:
            widgets.append({
                'type': 'line_over_time',
                'title': 'Evolução no tempo',
                'date_column': cols['date'][0],
                'value_column': cols['numeric'][0],
                'interval': 'auto',
            })
        
        # 3) Barras por categoria se houver categoria+numérica
        if cols['categorical'] and cols['numeric'] and len(widgets) < max_charts:
            widgets.append({
                'type': 'bar_by_category',
                'title': 'Por categoria',
                'category_column': cols['categorical'][0],
                'value_column': cols['numeric'][0],
                'top_n': 10,
            })
        
        # 4) Tabela de amostra como fallback
        if len(widgets) < max_charts:
            sample_cols = list(df.columns)[:6]
            widgets.append({
                'type': 'table_preview',
                'title': 'Amostra de dados',
                'columns': sample_cols,
                'rows': 10,
            })
        
        # Garantir que não ultrapasse o limite
        widgets = widgets[:max_charts]
        
        return {
            'layout': 'two-column',
            'template_hint': template,
            'widgets': widgets,
        }
    
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
            
            # Verificar se há sinal mínimo para criação automática de dashboard
            analysis = self._analyze_dataframe(df)
            has_minimum_signal = analysis['has_minimum_signal']
            
            # Salvar dados
            service = DataSourceService()
            datasource = service.create_from_csv(
                organization=organization,
                user=request.user,
                name=name,
                dataframe=df
            )
            
            serializer = self.get_serializer(datasource)
            response_data = serializer.data
            
            # Pré-visualização ÚNICA por organização (não conta no limite do plano)
            from apps.dashboards.models import Dashboard
            # Detectar template
            detected_template = self._detect_template_from_dataframe(df)
            # Garantir qualidade mínima antes de montar prévia
            if not has_minimum_signal:
                response_data['dashboard_created'] = False
                response_data['message'] = 'Fonte de dados conectada. Dados insuficientes para montar a pré-visualização.'
                return Response(response_data, status=status.HTTP_201_CREATED)
            
            preview_name = "Pré-visualização de dados"
            preview_dashboard = Dashboard.objects.filter(
                organization=organization,
                is_preview=True
            ).first()
            
            max_charts = max(1, int(organization.max_charts_per_dashboard or 4))
            basic_config = self._suggest_basic_config(df, detected_template, max_charts)
            
            if preview_dashboard:
                # Atualizar prévia existente
                preview_dashboard.name = preview_name
                preview_dashboard.template = detected_template
                preview_dashboard.config = basic_config
                preview_dashboard.description = f"Pré-visualização automática a partir de {name}"
                preview_dashboard.save(update_fields=['name', 'template', 'config', 'description', 'updated_at'])
                preview_dashboard.datasources.clear()
                preview_dashboard.datasources.add(datasource)
                dashboard = preview_dashboard
            else:
                # Criar prévia
                dashboard = Dashboard.objects.create(
                    name=preview_name,
                    template=detected_template,
                    organization=organization,
                    created_by=request.user,
                    config=basic_config,
                    description=f"Pré-visualização automática a partir de {name}",
                    is_preview=True,
                )
                dashboard.datasources.add(datasource)
            
            response_data['dashboard_created'] = True
            response_data['dashboard_id'] = dashboard.id
            response_data['dashboard_name'] = dashboard.name
            response_data['dashboard_template'] = dashboard.template
            response_data['is_preview'] = True
            response_data['message'] = 'Pré-visualização criada com sucesso! Você pode alternar entre Vendas e Financeiro.'
            
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
    
    @action(detail=True, methods=['get'])
    def schema(self, request, pk=None):
        """
        Retorna análise de schema: abas detectadas e colunas por aba (amostra).
        Para CSV, retorna uma única aba.
        """
        datasource = self.get_object()
        try:
            config = datasource.connection_config
            response = {'sheets': []}
            if datasource.source_type == 'google_sheets':
                sheet_id = config.get('sheet_id')
                sheets = config.get('sheets') or [{'gid': 0, 'title': 'Aba 0'}]
                for s in sheets:
                    gid = s.get('gid', 0)
                    try:
                        csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
                        sample_df = pd.read_csv(csv_url, nrows=50)
                        response['sheets'].append({
                            'gid': gid,
                            'title': s.get('title', f'Aba {gid}'),
                            'columns': sample_df.columns.tolist(),
                            'sample_rows': sample_df.head(5).to_dict('records'),
                        })
                    except Exception:
                        response['sheets'].append({
                            'gid': gid,
                            'title': s.get('title', f'Aba {gid}'),
                            'columns': s.get('columns', []),
                            'sample_rows': [],
                        })
            else:
                # CSV / outros: uma única aba
                response['sheets'].append({
                    'gid': 0,
                    'title': 'Arquivo',
                    'columns': config.get('columns', []),
                    'sample_rows': (config.get('data', []) or [])[:5],
                })
            return Response(response)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
