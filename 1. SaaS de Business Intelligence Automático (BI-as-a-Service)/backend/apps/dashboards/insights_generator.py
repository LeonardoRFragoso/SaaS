"""
Gerador Automático de Insights e Análises Inteligentes
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Any


class InsightsGenerator:
    """Gera insights automáticos a partir dos dados"""
    
    def generate_insights(self, df: pd.DataFrame, col_types: Dict, kpis: Dict) -> List[Dict[str, str]]:
        """
        Gera insights automáticos baseados nos dados.
        Retorna lista de insights com tipo, mensagem e ícone.
        """
        insights = []
        
        # 1. INSIGHTS DE CRESCIMENTO
        if col_types.get('date') and col_types.get('numeric'):
            date_col = col_types['date'][0]
            value_col = col_types['numeric'][0]
            
            try:
                df_copy = df.copy()
                df_copy[date_col] = pd.to_datetime(df_copy[date_col], errors='coerce')
                df_copy = df_copy.dropna(subset=[date_col])
                df_copy = df_copy.sort_values(date_col)
                
                if len(df_copy) >= 2:
                    # Comparar períodos
                    mid_point = len(df_copy) // 2
                    first_half = df_copy.iloc[:mid_point][value_col].sum()
                    second_half = df_copy.iloc[mid_point:][value_col].sum()
                    
                    if first_half > 0:
                        growth = ((second_half - first_half) / first_half) * 100
                        
                        if abs(growth) >= 5:  # Mudança significativa
                            icon = "📈" if growth > 0 else "📉"
                            trend = "cresceram" if growth > 0 else "caíram"
                            insights.append({
                                'type': 'growth' if growth > 0 else 'warning',
                                'icon': icon,
                                'message': f"Seus valores {trend} {abs(growth):.1f}% na segunda metade do período"
                            })
            except Exception:
                pass
        
        # 2. INSIGHTS DE TOP PERFORMERS
        # Filtrar colunas que NÃO são clientes/pessoas
        if col_types.get('categorical') and col_types.get('numeric'):
            value_col = col_types['numeric'][0]
            
            # Encontrar coluna categórica que não seja cliente
            valid_cat_col = None
            for cat_col in col_types['categorical']:
                col_lower = cat_col.lower()
                # Ignorar colunas de clientes
                if not any(word in col_lower for word in ['cliente', 'customer', 'comprador', 'buyer', 'nome', 'name']):
                    valid_cat_col = cat_col
                    break
            
            if valid_cat_col:
                try:
                    top_item = df.groupby(valid_cat_col)[value_col].sum().idxmax()
                    top_value = df.groupby(valid_cat_col)[value_col].sum().max()
                    total = df[value_col].sum()
                    percentage = (top_value / total * 100) if total > 0 else 0
                    
                    if percentage >= 20:  # Item representa 20%+ do total
                        insights.append({
                            'type': 'highlight',
                            'icon': '🎯',
                            'message': f'"{top_item}" representa {percentage:.1f}% do total - seu item mais importante!'
                        })
                except Exception:
                    pass
        
        # 3. INSIGHTS DE VOLUME
        total_records = len(df)
        if total_records >= 100:
            insights.append({
                'type': 'info',
                'icon': '📊',
                'message': f'Você já tem {total_records} registros - dados suficientes para análises avançadas!'
            })
        elif total_records < 10:
            insights.append({
                'type': 'tip',
                'icon': '💡',
                'message': f'Apenas {total_records} registros - adicione mais dados para insights melhores'
            })
        
        # 4. INSIGHTS DE TICKET MÉDIO
        if kpis.get('avg_ticket') and kpis.get('total_customers'):
            avg_ticket = kpis['avg_ticket']
            customers = kpis['total_customers']
            
            # Calcular desvio padrão do ticket
            if col_types.get('numeric'):
                value_col = col_types['numeric'][0]
                std_dev = df[value_col].std()
                
                if std_dev / avg_ticket > 0.5:  # Alta variação
                    insights.append({
                        'type': 'tip',
                        'icon': '💰',
                        'message': f'Ticket médio de R$ {avg_ticket:.2f} com alta variação - oportunidade de segmentar clientes'
                    })
        
        # 5. INSIGHTS DE CONCENTRAÇÃO
        if col_types.get('categorical') and len(col_types['categorical']) >= 2:
            # Verificar se há concentração em categorias
            for cat_col in col_types['categorical'][:2]:
                try:
                    unique_ratio = df[cat_col].nunique() / len(df)
                    if unique_ratio < 0.1:  # Menos de 10% de valores únicos
                        insights.append({
                            'type': 'tip',
                            'icon': '🎨',
                            'message': f'Dados concentrados em poucas categorias de "{cat_col}" - considere expandir variedade'
                        })
                        break
                except Exception:
                    pass
        
        # Limitar a 5 insights mais relevantes
        return insights[:5]
    
    def detect_data_problems(self, df: pd.DataFrame, col_types: Dict) -> List[Dict[str, Any]]:
        """
        Detecta problemas de qualidade nos dados.
        Retorna lista de problemas encontrados.
        """
        problems = []
        
        # 1. VALORES NEGATIVOS EM COLUNAS NUMÉRICAS
        for col in col_types.get('numeric', []):
            try:
                negative_count = (df[col] < 0).sum()
                if negative_count > 0:
                    problems.append({
                        'type': 'warning',
                        'icon': '⚠️',
                        'severity': 'medium',
                        'column': col,
                        'message': f'{negative_count} valores negativos em "{col}" - verifique se está correto',
                        'count': int(negative_count)
                    })
            except Exception:
                pass
        
        # 2. VALORES NULOS/VAZIOS
        for col in df.columns:
            null_count = df[col].isnull().sum()
            if null_count > 0:
                percentage = (null_count / len(df)) * 100
                if percentage >= 10:  # 10% ou mais de dados faltantes
                    problems.append({
                        'type': 'warning',
                        'icon': '❓',
                        'severity': 'high' if percentage >= 30 else 'medium',
                        'column': col,
                        'message': f'{null_count} valores vazios em "{col}" ({percentage:.1f}%)',
                        'count': int(null_count)
                    })
        
        # 3. VALORES DUPLICADOS
        duplicate_count = df.duplicated().sum()
        if duplicate_count > 0:
            problems.append({
                'type': 'info',
                'icon': '🔄',
                'severity': 'low',
                'column': None,
                'message': f'{duplicate_count} linhas duplicadas encontradas',
                'count': int(duplicate_count)
            })
        
        # 4. OUTLIERS EXTREMOS
        for col in col_types.get('numeric', []):
            try:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                
                # Definir outliers extremos (3x IQR)
                lower_bound = Q1 - 3 * IQR
                upper_bound = Q3 + 3 * IQR
                
                outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
                
                if outliers > 0 and outliers < len(df) * 0.1:  # Menos de 10% são outliers
                    problems.append({
                        'type': 'info',
                        'icon': '📍',
                        'severity': 'low',
                        'column': col,
                        'message': f'{outliers} valores extremos detectados em "{col}" - pode ser normal ou erro',
                        'count': int(outliers)
                    })
            except Exception:
                pass
        
        # 5. INCONSISTÊNCIAS DE FORMATO
        for col in col_types.get('categorical', []):
            try:
                # Verificar variações de capitalização
                if df[col].dtype == 'object':
                    original_unique = df[col].nunique()
                    normalized_unique = df[col].str.lower().nunique()
                    
                    if original_unique > normalized_unique:
                        diff = original_unique - normalized_unique
                        problems.append({
                            'type': 'tip',
                            'icon': '🔤',
                            'severity': 'low',
                            'column': col,
                            'message': f'Inconsistência de capitalização em "{col}" ({diff} valores podem ser duplicados)',
                            'count': int(diff)
                        })
            except Exception:
                pass
        
        # Limitar aos 8 problemas mais importantes
        # Ordenar por severidade
        severity_order = {'high': 0, 'medium': 1, 'low': 2}
        problems.sort(key=lambda x: severity_order.get(x.get('severity', 'low'), 3))
        
        return problems[:8]
    
    def suggest_additional_charts(self, df: pd.DataFrame, col_types: Dict, existing_charts: List[str]) -> List[Dict[str, Any]]:
        """
        Sugere gráficos adicionais RICOS baseado nas colunas disponíveis.
        """
        suggestions = []
        
        # 1. SUGERIR GRÁFICO DE DISTRIBUIÇÃO REAL
        if col_types.get('numeric') and 'value_distribution' not in existing_charts:
            value_col = col_types['numeric'][0]
            suggestions.append({
                'type': 'histogram',
                'title': f'Distribuição de Valores',
                'description': 'Veja como seus valores estão distribuídos em faixas',
                'icon': '📊',
                'column': value_col,
                'priority': 'high'
            })
        
        # 2. SUGERIR TENDÊNCIA SEMANAL
        if col_types.get('date') and col_types.get('numeric') and 'weekly_trend' not in existing_charts:
            suggestions.append({
                'type': 'line',
                'title': 'Tendência Semanal',
                'description': 'Analise vendas semana a semana',
                'icon': '📈',
                'column': None,
                'priority': 'high'
            })
        
        # 3. SUGERIR ANÁLISE POR REGIÃO
        region_cols = [col for col in df.columns if any(word in col.lower() for word in ['regiao', 'region', 'estado'])]
        if region_cols and 'region_sales' not in existing_charts:
            suggestions.append({
                'type': 'bar',
                'title': 'Vendas por Região',
                'description': 'Compare performance entre regiões',
                'icon': '🗺️',
                'column': region_cols[0],
                'priority': 'high'
            })
        
        # 4. SUGERIR ANÁLISE POR FORMA DE PAGAMENTO
        payment_cols = [col for col in df.columns if any(word in col.lower() for word in ['pagamento', 'payment'])]
        if payment_cols and 'payment_analysis' not in existing_charts:
            suggestions.append({
                'type': 'scatter',
                'title': 'Análise por Forma de Pagamento',
                'description': 'Veja qual forma de pagamento é mais usada',
                'icon': '💳',
                'column': payment_cols[0],
                'priority': 'high'
            })
        
        # 5. SUGERIR ANÁLISE DE CATEGORIAS
        category_cols = [col for col in df.columns if 'categoria' in col.lower() or 'category' in col.lower()]
        if category_cols and 'category_analysis' not in existing_charts:
            suggestions.append({
                'type': 'pie',
                'title': 'Distribuição por Categoria',
                'description': 'Veja a participação de cada categoria',
                'icon': '🥧',
                'column': category_cols[0],
                'priority': 'medium'
            })
        
        # Ordenar por prioridade
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        suggestions.sort(key=lambda x: priority_order.get(x.get('priority', 'low'), 3))
        
        # Limitar a 5 sugestões mais relevantes
        return suggestions[:5]
