"""
Integração com OpenAI para Insights Avançados (Planos Pagos)
"""
import os
from typing import Dict, List, Any
import pandas as pd


class OpenAIInsightsGenerator:
    """
    Gerador de insights avançados usando OpenAI GPT-4.
    REQUER: API Key da OpenAI e planos PRO ou ENTERPRISE
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self.model = "gpt-4-turbo-preview"  # ou gpt-4o-mini para economizar
    
    def generate_advanced_insights(self, df: pd.DataFrame, kpis: Dict, plan: str) -> List[Dict]:
        """
        Gera insights avançados usando GPT-4.
        
        Args:
            df: DataFrame com dados
            kpis: KPIs calculados
            plan: Plano do usuário
        
        Returns:
            Lista de insights gerados por IA
        """
        # Verificar se o plano permite OpenAI
        if plan not in ['pro', 'enterprise']:
            return []
        
        if not self.api_key:
            return [{
                'type': 'info',
                'icon': '💡',
                'message': 'Configure OPENAI_API_KEY para insights avançados com IA'
            }]
        
        try:
            # Preparar contexto dos dados
            context = self._prepare_data_context(df, kpis)
            
            # Chamar OpenAI
            insights = self._call_openai_api(context)
            
            return insights
        
        except Exception as e:
            return [{
                'type': 'error',
                'icon': '⚠️',
                'message': f'Erro ao gerar insights com IA: {str(e)}'
            }]
    
    def _prepare_data_context(self, df: pd.DataFrame, kpis: Dict) -> str:
        """Prepara contexto dos dados para a IA"""
        # Estatísticas básicas
        stats = df.describe().to_dict() if not df.empty else {}
        
        context = f"""
Analise os seguintes dados de negócio e forneça 3-5 insights acionáveis:

KPIs:
- Faturamento Total: R$ {kpis.get('total_revenue', 0):,.2f}
- Total de Transações: {kpis.get('total_customers', 0)}
- Ticket Médio: R$ {kpis.get('avg_ticket', 0):,.2f}

Dados:
- Total de Registros: {len(df)}
- Colunas: {', '.join(df.columns.tolist())}

Estatísticas: {stats}

Forneça insights práticos e acionáveis em português do Brasil.
Cada insight deve ter:
1. Um ícone emoji relevante
2. Uma mensagem clara e objetiva (máximo 150 caracteres)
3. Uma recomendação de ação quando aplicável

Formato de resposta em JSON:
[
  {{"type": "highlight/warning/tip", "icon": "emoji", "message": "texto do insight"}}
]
"""
        return context
    
    def _call_openai_api(self, context: str) -> List[Dict]:
        """
        Chama a API da OpenAI.
        
        NOTA: Esta é uma estrutura. Para funcionar, instale:
        pip install openai
        
        E configure a API key:
        export OPENAI_API_KEY="sk-..."
        """
        try:
            import openai
            
            client = openai.OpenAI(api_key=self.api_key)
            
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um analista de dados especializado em business intelligence. Forneça insights claros, objetivos e acionáveis."
                    },
                    {
                        "role": "user",
                        "content": context
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            # Parsear resposta
            import json
            insights_text = response.choices[0].message.content
            
            # Tentar extrair JSON da resposta
            if '```json' in insights_text:
                insights_text = insights_text.split('```json')[1].split('```')[0]
            elif '```' in insights_text:
                insights_text = insights_text.split('```')[1].split('```')[0]
            
            insights = json.loads(insights_text.strip())
            
            return insights
        
        except ImportError:
            return [{
                'type': 'info',
                'icon': '📦',
                'message': 'Instale o pacote openai: pip install openai'
            }]
        except Exception as e:
            return [{
                'type': 'error',
                'icon': '⚠️',
                'message': f'Erro OpenAI: {str(e)}'
            }]
    
    def generate_narrative_report(self, dashboard_data: Dict, plan: str) -> str:
        """
        Gera um relatório narrativo completo usando GPT-4.
        Disponível apenas para plano ENTERPRISE.
        """
        if plan != 'enterprise':
            return "Relatório narrativo disponível apenas no plano Enterprise."
        
        if not self.api_key:
            return "Configure OPENAI_API_KEY para gerar relatórios narrativos."
        
        try:
            import openai
            
            client = openai.OpenAI(api_key=self.api_key)
            
            # Preparar dados
            kpis = dashboard_data.get('kpis', {})
            insights = dashboard_data.get('insights', [])
            predictions = dashboard_data.get('predictions', {})
            
            prompt = f"""
Crie um relatório executivo profissional baseado nos seguintes dados:

KPIS:
{kpis}

INSIGHTS:
{insights}

PREVISÕES:
{predictions}

Escreva um relatório de 300-500 palavras em português do Brasil, incluindo:
1. Resumo Executivo
2. Análise de Performance
3. Insights Principais
4. Recomendações Estratégicas
5. Previsões e Próximos Passos

Use tom profissional e linguagem de negócios.
"""
            
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Você é um consultor de negócios experiente."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            return f"Erro ao gerar relatório: {str(e)}"
