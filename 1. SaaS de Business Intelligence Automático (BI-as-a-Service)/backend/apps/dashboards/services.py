import pandas as pd
import numpy as np
from django.utils import timezone
from .models import Dashboard
from apps.datasources.models import DataSource
from .ai_processor import DataProcessor
from apps.datasources.services import DataSourceService
from .insights_generator import InsightsGenerator
from .predictions import PredictionEngine
from .alerts import AlertEngine


class DashboardService:
    """Serviço para processar dados de dashboards"""
    
    def _detect_column_types(self, df):
        """
        Detecta automaticamente os tipos de colunas no DataFrame.
        Retorna um dicionário com as colunas categorizadas por tipo.
        """
        col_types = {
            'numeric': [],
            'categorical': [],
            'date': [],
            'boolean': []
        }
        
        for col in df.columns:
            # Detectar numéricos PRIMEIRO (antes de datetime)
            if pd.api.types.is_numeric_dtype(df[col]):
                col_types['numeric'].append(col)
            # Depois detectar datas
            elif pd.api.types.is_datetime64_any_dtype(df[col]):
                col_types['date'].append(col)
            # Tentar converter para data se parecer uma data
            else:
                try:
                    sample = df[col].dropna().head(5)
                    parsed = pd.to_datetime(sample, errors='raise')
                    col_types['date'].append(col)
                except:
                    # Se não for data, verificar se é boolean
                    unique_values = df[col].nunique()
                    if unique_values == 2:
                        col_types['boolean'].append(col)
                    else:
                        col_types['categorical'].append(col)
        
        return col_types
    
    def _detect_value_column(self, df, numeric_cols):
        """Detecta qual coluna numérica é o valor principal (preço, valor, etc)"""
        if not numeric_cols:
            return None
        
        # Procurar por nomes típicos primeiro
        value_keywords = ['valor', 'value', 'preco', 'price', 'total', 'amount', 'receita', 'revenue']
        for col in numeric_cols:
            col_lower = col.lower()
            if any(keyword in col_lower for keyword in value_keywords):
                return col
        
        # Se não encontrou por nome, usar a coluna com maior soma (provavelmente valores monetários)
        max_sum = 0
        best_col = None
        for col in numeric_cols:
            col_sum = df[col].sum()
            if col_sum > max_sum:
                max_sum = col_sum
                best_col = col
        
        return best_col if best_col else numeric_cols[0]
    
    def _detect_quantity_column(self, df, numeric_cols, value_col):
        """Detecta coluna de quantidade"""
        qty_keywords = ['quantidade', 'qtd', 'qty', 'units', 'unidades', 'qtde']
        
        for col in numeric_cols:
            if col == value_col:
                continue
            col_lower = col.lower()
            if any(keyword in col_lower for keyword in qty_keywords):
                return col
        
        return None
    
    def _calculate_advanced_kpis(self, df):
        """Calcula KPIs avançados baseado nas colunas disponíveis"""
        kpis = {}
        
        try:
            # Detectar colunas financeiras
            if 'valor_bruto' in df.columns and 'valor_liquido' in df.columns:
                valor_bruto = float(df['valor_bruto'].sum())
                valor_liquido = float(df['valor_liquido'].sum())
                kpis['valor_bruto_total'] = valor_bruto
                kpis['valor_liquido_total'] = valor_liquido
                kpis['margem_liquida'] = ((valor_liquido / valor_bruto) * 100) if valor_bruto > 0 else 0
            
            # Detectar descontos
            if 'desconto_valor' in df.columns:
                kpis['total_descontos'] = float(df['desconto_valor'].sum())
                if 'desconto_percentual' in df.columns:
                    kpis['desconto_medio'] = float(df['desconto_percentual'].mean())
            
            # Detectar taxas
            if 'taxa_maquina_valor' in df.columns:
                kpis['custo_taxas'] = float(df['taxa_maquina_valor'].sum())
            
            # Detectar juros
            if 'juros_valor' in df.columns:
                kpis['receita_juros'] = float(df['juros_valor'].sum())
            
            # Análise de pagamentos
            if 'status_pagamento' in df.columns:
                aprovados = (df['status_pagamento'] == 'Aprovado').sum()
                total = len(df)
                kpis['taxa_aprovacao'] = (aprovados / total * 100) if total > 0 else 0
            
            # Performance por vendedor
            if 'vendedor' in df.columns and 'valor_liquido' in df.columns:
                vendedores = df.groupby('vendedor')['valor_liquido'].sum().sort_values(ascending=False)
                if len(vendedores) > 0:
                    kpis['melhor_vendedor'] = str(vendedores.index[0])
                    kpis['vendas_melhor_vendedor'] = float(vendedores.iloc[0])
            
            # Performance por região
            if 'regiao' in df.columns and 'valor_liquido' in df.columns:
                regioes = df.groupby('regiao')['valor_liquido'].sum().sort_values(ascending=False)
                if len(regioes) > 0:
                    kpis['melhor_regiao'] = str(regioes.index[0])
                    kpis['vendas_melhor_regiao'] = float(regioes.iloc[0])
        
        except Exception:
            pass
        
        return kpis
    
    def _generate_additional_charts(self, df, col_types):
        """Gera gráficos adicionais RICOS"""
        additional = {}
        
        # 1. DISTRIBUIÇÃO REAL (Histogram)
        if col_types.get('numeric'):
            value_col = col_types['numeric'][0]
            try:
                hist, bins = np.histogram(df[value_col].dropna(), bins=10)
                distribution_data = [
                    {
                        'range': f'R$ {int(bins[i])}-{int(bins[i+1])}',
                        'count': int(hist[i]),
                        'value': float((bins[i] + bins[i+1]) / 2)
                    }
                    for i in range(len(hist)) if hist[i] > 0
                ]
                additional['value_distribution'] = distribution_data
            except:
                pass
        
        # 2. ANÁLISE POR FORMA DE PAGAMENTO
        payment_cols = [col for col in df.columns if any(word in col.lower() for word in ['pagamento', 'payment'])]
        if payment_cols and col_types.get('numeric'):
            try:
                payment_col = payment_cols[0]
                value_col = col_types['numeric'][0]
                payment_analysis = df.groupby(payment_col)[value_col].agg(['sum', 'count', 'mean']).reset_index()
                additional['payment_analysis'] = [
                    {
                        'method': str(row[payment_col]),
                        'total': float(row['sum']),
                        'count': int(row['count']),
                        'avg_ticket': float(row['mean'])
                    }
                    for _, row in payment_analysis.iterrows()
                ]
            except:
                pass
        
        # 3. ANÁLISE POR REGIÃO
        region_cols = [col for col in df.columns if any(word in col.lower() for word in ['regiao', 'region', 'estado', 'state'])]
        if region_cols and col_types.get('numeric'):
            try:
                region_col = region_cols[0]
                value_col = col_types['numeric'][0]
                region_sales = df.groupby(region_col)[value_col].sum().reset_index()
                additional['region_sales'] = [
                    {
                        'region': str(row[region_col]),
                        'sales': float(row[value_col])
                    }
                    for _, row in region_sales.iterrows()
                ]
            except:
                pass
        
        # 4. TENDÊNCIA SEMANAL REAL
        if col_types.get('date') and col_types.get('numeric'):
            date_col = col_types['date'][0]
            value_col = col_types['numeric'][0]
            try:
                df_copy = df.copy()
                df_copy[date_col] = pd.to_datetime(df_copy[date_col], errors='coerce')
                df_copy = df_copy.dropna(subset=[date_col])
                df_copy = df_copy.sort_values(date_col)
                
                df_copy['week'] = df_copy[date_col].dt.isocalendar().week
                df_copy['year'] = df_copy[date_col].dt.year
                weekly_sales = df_copy.groupby(['year', 'week'])[value_col].sum().reset_index()
                
                additional['weekly_trend'] = [
                    {
                        'week': f"Sem {int(row['week'])}",
                        'value': float(row[value_col])
                    }
                    for _, row in weekly_sales.iterrows()
                ]
            except:
                pass
        
        return additional
    
    def get_dashboard_data(self, dashboard):
        """Obter dados processados do dashboard"""
        # Obter primeira fonte de dados
        datasource = dashboard.datasources.first()
        if not datasource:
            return self._get_empty_data(dashboard.template)
        
        # Obter dados da fonte
        datasource_service = DataSourceService()
        source_data = datasource_service.get_data(datasource)
        
        # Criar DataFrame
        df = pd.DataFrame(source_data['rows'])
        
        # Processar dados
        if dashboard.template == 'sales':
            return self._process_sales_simple(df)
        elif dashboard.template == 'financial':
            return self._process_financial_simple(df)
        else:
            return self._get_empty_data(dashboard.template)
    
    def _process_sales_simple(self, df):
        """Processar dados de vendas"""
        try:
            if df.empty:
                return self._get_empty_data('sales')
            
            # DETECÇÃO AUTOMÁTICA
            col_types = self._detect_column_types(df)
            value_col = self._detect_value_column(df, col_types['numeric'])
            
            if not value_col:
                return self._get_empty_data('sales')
            
            qty_col = self._detect_quantity_column(df, col_types['numeric'], value_col)
            date_col = col_types['date'][0] if col_types['date'] else None
            
            # Detectar produto
            product_col = None
            if col_types['categorical']:
                for col in col_types['categorical']:
                    col_lower = col.lower()
                    if any(word in col_lower for word in ['produto', 'product', 'item', 'sku']):
                        product_col = col
                        break
                
                if not product_col:
                    for col in col_types['categorical']:
                        col_lower = col.lower()
                        if not any(word in col_lower for word in ['cliente', 'customer', 'nome', 'name']):
                            product_col = col
                            break
            
            # KPIs BÁSICOS
            total_revenue = float(df[value_col].sum())
            total_transactions = len(df)
            avg_ticket = total_revenue / total_transactions if total_transactions > 0 else 0
            total_quantity = float(df[qty_col].sum()) if qty_col else 0
            
            # KPIs AVANÇADOS
            advanced_kpis = self._calculate_advanced_kpis(df)
            
            # GRÁFICO: Evolução
            sales_evolution = []
            if date_col:
                df_copy = df.copy()
                df_copy[date_col] = pd.to_datetime(df_copy[date_col], errors='coerce')
                df_copy = df_copy.dropna(subset=[date_col])
                
                if len(df_copy) > 0:
                    df_copy['month'] = df_copy[date_col].dt.strftime('%b')
                    sales_by_month = df_copy.groupby('month')[value_col].sum()
                    
                    month_order_pt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                                      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
                    
                    sales_evolution = [
                        {'month': month, 'value': float(sales_by_month.get(month, 0))}
                        for month in month_order_pt
                        if month in sales_by_month.index
                    ]
            
            # GRÁFICO: Top produtos
            top_products_data = []
            if product_col:
                top_products = df.groupby(product_col)[value_col].sum().nlargest(5)
                top_products_data = [
                    {
                        'name': str(name),
                        'sales': float(value),
                        'growth': 0
                    }
                    for name, value in top_products.items()
                ]
            
            # GRÁFICOS ADICIONAIS
            additional_charts = self._generate_additional_charts(df, col_types)
            
            # GRÁFICO: Categorias
            category_sales = []
            category_cols = [
                col for col in col_types['categorical'] 
                if col != product_col 
                and not any(word in col.lower() for word in ['cliente', 'customer', 'nome', 'name'])
            ]
            
            if category_cols:
                for col in category_cols:
                    unique_count = df[col].nunique()
                    if 2 <= unique_count <= 10:
                        cat_sales = df.groupby(col)[value_col].sum().nlargest(10)
                        category_sales = [
                            {'name': str(name), 'value': float(value)}
                            for name, value in cat_sales.items()
                        ]
                        break
            
            # INSIGHTS E ANÁLISES
            insights_gen = InsightsGenerator()
            kpis_dict = {
                'total_revenue': total_revenue,
                'total_customers': total_transactions,
                'avg_ticket': avg_ticket,
                'total_quantity': total_quantity,
            }
            
            insights = insights_gen.generate_insights(df, col_types, kpis_dict)
            problems = insights_gen.detect_data_problems(df, col_types)
            suggestions = insights_gen.suggest_additional_charts(df, col_types, ['sales_evolution', 'top_products'])
            
            # PREVISÕES
            prediction_engine = PredictionEngine()
            predictions = prediction_engine.generate_predictions(df, col_types, plan='free')
            
            # ALERTAS
            alert_engine = AlertEngine()
            alerts = alert_engine.generate_alerts(df, col_types, kpis_dict, plan='free')
            
            return {
                'kpis': {
                    'total_revenue': total_revenue,
                    'total_customers': total_transactions,
                    'avg_ticket': avg_ticket,
                    'total_quantity': total_quantity,
                    'growth_rate': 0,
                    **advanced_kpis,  # MESCLAR KPIS AVANÇADOS
                },
                'charts': {
                    'sales_evolution': sales_evolution,
                    'top_products': top_products_data,
                    'category_sales': category_sales,
                    **additional_charts,
                },
                'insights': insights,
                'data_quality': problems,
                'chart_suggestions': suggestions,
                'predictions': predictions,
                'alerts': alerts,
                'metadata': {
                    'detected_columns': {
                        'value': value_col,
                        'quantity': qty_col,
                        'date': date_col,
                        'product': product_col,
                    }
                }
            }
        except Exception as e:
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"Error processing sales data: {str(e)}")
            logger.error(traceback.format_exc())
            return self._get_empty_data('sales')
    
    def _process_financial_simple(self, df):
        """Processar dados financeiros"""
        try:
            if df.empty:
                return self._get_empty_data('financial')
            
            col_types = self._detect_column_types(df)
            value_col = self._detect_value_column(df, col_types['numeric'])
            
            if not value_col:
                return self._get_empty_data('financial')
            
            total_revenue = float(df[df[value_col] > 0][value_col].sum())
            total_expenses = float(abs(df[df[value_col] < 0][value_col].sum()))
            net_profit = total_revenue - total_expenses
            profit_margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
            
            return {
                'kpis': {
                    'total_revenue': total_revenue,
                    'total_expenses': total_expenses,
                    'net_profit': net_profit,
                    'profit_margin': profit_margin,
                },
                'charts': {
                    'revenue_by_month': [],
                },
                'insights': [],
                'data_quality': [],
                'chart_suggestions': [],
                'predictions': {},
                'alerts': [],
            }
        except Exception as e:
            return self._get_empty_data('financial')
    
    def _get_empty_data(self, template):
        """Retorna estrutura vazia"""
        if template == 'sales':
            return {
                'kpis': {
                    'total_revenue': 0,
                    'total_customers': 0,
                    'avg_ticket': 0,
                    'growth_rate': 0,
                },
                'charts': {
                    'sales_evolution': [],
                    'top_products': [],
                    'category_sales': [],
                },
                'insights': [],
                'data_quality': [],
                'chart_suggestions': [],
                'predictions': {},
                'alerts': [],
            }
        elif template == 'financial':
            return {
                'kpis': {
                    'total_revenue': 0,
                    'total_expenses': 0,
                    'net_profit': 0,
                    'profit_margin': 0,
                },
                'charts': {
                    'revenue_by_month': [],
                },
                'insights': [],
                'data_quality': [],
                'chart_suggestions': [],
                'predictions': {},
                'alerts': [],
            }
        
        return {'kpis': {}, 'charts': {}}

    def change_template(self, dashboard, new_template, reset_config=True):
        """
        Trocar o template do dashboard garantindo validação e limpeza de configuração.
        """
        valid_templates = {choice for choice, _ in Dashboard.TEMPLATE_CHOICES}
        if new_template not in valid_templates:
            raise ValueError('Template inválido informado.')

        if dashboard.template == new_template and not reset_config:
            return dashboard

        dashboard.template = new_template
        if reset_config:
            dashboard.config = {}

        dashboard.save(update_fields=['template', 'config', 'updated_at'])
        return dashboard
