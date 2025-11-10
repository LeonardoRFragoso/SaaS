"""
AI Processor para análise de dados
- Free: Usa Python puro (pandas, heurísticas)
- Paid: Usa GPT-4 para análise inteligente
"""

import pandas as pd
import json
from typing import Dict, List, Any, Optional
from django.conf import settings
import openai


class DataProcessor:
    """Processador de dados com suporte a Free (Python) e Paid (GPT)"""
    
    def __init__(self, plan: str = 'free'):
        self.plan = plan
        self.use_ai = plan in ['starter', 'pro', 'enterprise']
        
        if self.use_ai:
            openai.api_key = settings.OPENAI_API_KEY
    
    def detect_column_mapping(self, df: pd.DataFrame, template_type: str) -> Dict[str, Any]:
        """
        Detecta mapeamento de colunas
        Free: Heurística Python
        Paid: GPT-4 analisa e sugere
        """
        if self.use_ai:
            return self._detect_with_gpt(df, template_type)
        else:
            return self._detect_with_python(df, template_type)
    
    def _detect_with_python(self, df: pd.DataFrame, template_type: str) -> Dict[str, Any]:
        """Detecção usando Python puro (PLANO FREE)"""
        
        # Padrões de busca por template
        PATTERNS = {
            'sales': {
                'date': ['data', 'date', 'dt', 'data_venda', 'sale_date', 'created_at', 'timestamp'],
                'revenue': ['valor', 'revenue', 'receita', 'total', 'value', 'amount', 'price', 'preco'],
                'customer': ['cliente', 'customer', 'client', 'nome', 'name', 'comprador'],
                'product': ['produto', 'product', 'item', 'sku', 'descricao', 'description'],
                'quantity': ['quantidade', 'qty', 'qtd', 'units', 'unidades', 'qtde'],
            },
            'financial': {
                'date': ['data', 'date', 'dt', 'periodo', 'month', 'mes', 'ano', 'year'],
                'revenue': ['receita', 'revenue', 'income', 'entrada', 'credito', 'credit'],
                'expense': ['despesa', 'expense', 'cost', 'saida', 'gasto', 'debito', 'debit'],
                'category': ['categoria', 'category', 'tipo', 'type', 'classe', 'class'],
                'description': ['descricao', 'description', 'historico', 'obs', 'observacao'],
            }
        }
        
        detected = {}
        available_columns = df.columns.tolist()
        patterns = PATTERNS.get(template_type, {})
        
        # Buscar correspondências
        for field, search_patterns in patterns.items():
            for col in available_columns:
                col_lower = col.lower().strip().replace('_', '').replace(' ', '')
                
                for pattern in search_patterns:
                    pattern_clean = pattern.lower().replace('_', '').replace(' ', '')
                    
                    if pattern_clean in col_lower or col_lower in pattern_clean:
                        detected[field] = col
                        break
                
                if field in detected:
                    break
        
        # Detectar tipos de dados
        column_types = {}
        for col in available_columns:
            dtype = str(df[col].dtype)
            sample = df[col].dropna().head(5).tolist()
            
            column_types[col] = {
                'dtype': dtype,
                'sample': sample,
                'is_numeric': pd.api.types.is_numeric_dtype(df[col]),
                'is_datetime': pd.api.types.is_datetime64_any_dtype(df[col]),
            }
        
        return {
            'mapping': detected,
            'available_columns': available_columns,
            'column_types': column_types,
            'confidence': 'medium',  # Python tem confiança média
            'method': 'python_heuristic',
        }
    
    def _detect_with_gpt(self, df: pd.DataFrame, template_type: str) -> Dict[str, Any]:
        """Detecção usando GPT-4 (PLANOS PAGOS)"""
        
        # Preparar informações para o GPT
        columns_info = []
        for col in df.columns:
            sample_values = df[col].dropna().head(5).tolist()
            columns_info.append({
                'name': col,
                'dtype': str(df[col].dtype),
                'sample': sample_values,
                'null_count': int(df[col].isnull().sum()),
                'unique_count': int(df[col].nunique()),
            })
        
        # Prompt para GPT
        prompt = f"""
Você é um especialista em análise de dados. Analise as colunas abaixo e mapeie-as para um dashboard de {template_type}.

Colunas disponíveis:
{json.dumps(columns_info, indent=2, ensure_ascii=False)}

Template: {template_type}

Para o template de {'vendas' if template_type == 'sales' else 'financeiro'}, identifique:
{self._get_template_fields(template_type)}

Retorne um JSON com:
{{
  "mapping": {{
    "field_name": "column_name",
    ...
  }},
  "confidence": "high|medium|low",
  "reasoning": "Explicação da sua análise",
  "suggestions": ["Sugestões de KPIs adicionais"],
  "warnings": ["Avisos sobre qualidade dos dados"]
}}
"""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Você é um especialista em análise de dados e Business Intelligence."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000,
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return {
                'mapping': result.get('mapping', {}),
                'available_columns': df.columns.tolist(),
                'column_types': {col: str(df[col].dtype) for col in df.columns},
                'confidence': result.get('confidence', 'high'),
                'reasoning': result.get('reasoning', ''),
                'suggestions': result.get('suggestions', []),
                'warnings': result.get('warnings', []),
                'method': 'gpt4_analysis',
            }
            
        except Exception as e:
            # Fallback para Python se GPT falhar
            print(f"GPT analysis failed: {e}, falling back to Python")
            return self._detect_with_python(df, template_type)
    
    def _get_template_fields(self, template_type: str) -> str:
        """Retorna descrição dos campos esperados por template"""
        
        fields = {
            'sales': """
- date: Data da venda/transação
- revenue: Valor da venda/receita
- customer: Nome do cliente
- product: Nome do produto
- quantity: Quantidade vendida
""",
            'financial': """
- date: Data ou período
- revenue: Receita/entrada
- expense: Despesa/saída
- category: Categoria da transação
- description: Descrição/histórico
"""
        }
        
        return fields.get(template_type, '')
    
    def generate_insights(self, df: pd.DataFrame, dashboard_config: Dict) -> List[Dict]:
        """
        Gera insights sobre os dados
        Free: Insights básicos (tendências, médias)
        Paid: Insights avançados com GPT
        """
        if self.use_ai:
            return self._generate_insights_with_gpt(df, dashboard_config)
        else:
            return self._generate_insights_with_python(df, dashboard_config)
    
    def _generate_insights_with_python(self, df: pd.DataFrame, config: Dict) -> List[Dict]:
        """Insights básicos com Python (PLANO FREE)"""
        
        insights = []
        
        # Insight 1: Tendência geral
        if 'revenue' in config.get('mapping', {}):
            revenue_col = config['mapping']['revenue']
            if revenue_col in df.columns and pd.api.types.is_numeric_dtype(df[revenue_col]):
                total = df[revenue_col].sum()
                mean = df[revenue_col].mean()
                
                insights.append({
                    'type': 'trend',
                    'title': 'Análise de Receita',
                    'description': f'Total: R$ {total:,.2f} | Média: R$ {mean:,.2f}',
                    'priority': 'medium',
                    'recommendations': [
                        'Acompanhe a evolução mensal',
                        'Compare com períodos anteriores',
                    ]
                })
        
        # Insight 2: Top performers
        if 'product' in config.get('mapping', {}) and 'revenue' in config.get('mapping', {}):
            product_col = config['mapping']['product']
            revenue_col = config['mapping']['revenue']
            
            if product_col in df.columns and revenue_col in df.columns:
                top_products = df.groupby(product_col)[revenue_col].sum().nlargest(3)
                
                insights.append({
                    'type': 'opportunity',
                    'title': 'Top 3 Produtos',
                    'description': f'Produtos com maior receita: {", ".join(top_products.index.tolist())}',
                    'priority': 'high',
                    'recommendations': [
                        'Foque nos produtos de maior retorno',
                        'Analise o que torna esses produtos bem-sucedidos',
                    ]
                })
        
        return insights
    
    def _generate_insights_with_gpt(self, df: pd.DataFrame, config: Dict) -> List[Dict]:
        """Insights avançados com GPT (PLANOS PAGOS)"""
        
        # Preparar resumo estatístico
        stats_summary = {}
        for field, col in config.get('mapping', {}).items():
            if col in df.columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    stats_summary[field] = {
                        'mean': float(df[col].mean()),
                        'median': float(df[col].median()),
                        'std': float(df[col].std()),
                        'min': float(df[col].min()),
                        'max': float(df[col].max()),
                    }
                else:
                    stats_summary[field] = {
                        'unique_count': int(df[col].nunique()),
                        'top_values': df[col].value_counts().head(5).to_dict(),
                    }
        
        prompt = f"""
Você é um analista de BI experiente. Analise os dados abaixo e gere insights acionáveis.

Resumo Estatístico:
{json.dumps(stats_summary, indent=2, ensure_ascii=False)}

Total de registros: {len(df)}

Gere 3-5 insights no formato JSON:
[
  {{
    "type": "trend|anomaly|opportunity|alert",
    "title": "Título do insight",
    "description": "Descrição detalhada",
    "priority": "high|medium|low",
    "recommendations": ["Ação 1", "Ação 2"]
  }}
]

Foque em:
- Tendências importantes
- Anomalias ou padrões incomuns
- Oportunidades de melhoria
- Alertas sobre riscos
"""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Você é um analista de Business Intelligence especializado."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500,
            )
            
            insights = json.loads(response.choices[0].message.content)
            return insights
            
        except Exception as e:
            print(f"GPT insights failed: {e}, falling back to Python")
            return self._generate_insights_with_python(df, config)
    
    def suggest_kpis(self, df: pd.DataFrame, template_type: str) -> List[Dict]:
        """
        Sugere KPIs relevantes
        Free: KPIs padrão do template
        Paid: KPIs personalizados sugeridos por GPT
        """
        if self.use_ai:
            return self._suggest_kpis_with_gpt(df, template_type)
        else:
            return self._suggest_kpis_with_python(template_type)
    
    def _suggest_kpis_with_python(self, template_type: str) -> List[Dict]:
        """KPIs padrão por template (PLANO FREE)"""
        
        kpis = {
            'sales': [
                {'label': 'Faturamento Total', 'field': 'revenue', 'aggregation': 'sum', 'format': 'currency'},
                {'label': 'Ticket Médio', 'field': 'revenue', 'aggregation': 'avg', 'format': 'currency'},
                {'label': 'Total de Vendas', 'field': 'revenue', 'aggregation': 'count', 'format': 'number'},
            ],
            'financial': [
                {'label': 'Receitas', 'field': 'revenue', 'aggregation': 'sum', 'format': 'currency'},
                {'label': 'Despesas', 'field': 'expense', 'aggregation': 'sum', 'format': 'currency'},
                {'label': 'Lucro Líquido', 'field': 'calculated', 'aggregation': 'revenue-expense', 'format': 'currency'},
            ],
        }
        
        return kpis.get(template_type, [])
    
    def _suggest_kpis_with_gpt(self, df: pd.DataFrame, template_type: str) -> List[Dict]:
        """KPIs personalizados sugeridos por GPT (PLANOS PAGOS)"""
        
        # Análise das colunas disponíveis
        columns_info = {
            col: {
                'dtype': str(df[col].dtype),
                'sample': df[col].dropna().head(3).tolist(),
                'unique_count': int(df[col].nunique()),
            }
            for col in df.columns
        }
        
        prompt = f"""
Analise as colunas disponíveis e sugira KPIs relevantes para um dashboard de {template_type}.

Colunas:
{json.dumps(columns_info, indent=2, ensure_ascii=False)}

Retorne um JSON array com 4-6 KPIs sugeridos:
[
  {{
    "label": "Nome do KPI",
    "field": "nome_da_coluna",
    "aggregation": "sum|avg|count|min|max",
    "format": "currency|number|percentage",
    "reasoning": "Por que este KPI é importante"
  }}
]
"""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Você é um especialista em KPIs e métricas de negócio."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1000,
            )
            
            kpis = json.loads(response.choices[0].message.content)
            return kpis
            
        except Exception as e:
            print(f"GPT KPI suggestion failed: {e}, falling back to Python")
            return self._suggest_kpis_with_python(template_type)
