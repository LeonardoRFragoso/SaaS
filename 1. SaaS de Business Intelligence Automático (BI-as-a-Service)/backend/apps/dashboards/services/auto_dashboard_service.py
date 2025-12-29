"""
Serviço de Criação Automática de Dashboard com Análise de IA
Usa GPT para analisar dados CSV e criar dashboard inteligente automaticamente
"""
import logging
import json
from typing import Dict, Any, Optional
from django.conf import settings
from django.utils import timezone
import pandas as pd

from apps.dashboards.models import Dashboard
from apps.dashboards.intelligent_analyzer import IntelligentDataAnalyzer
from apps.datasources.services.data_ingestion_service import DataIngestionService
from apps.dashboards.services.data_processing_service import DataProcessingService

logger = logging.getLogger(__name__)


class AutoDashboardService:
    """
    Serviço que cria dashboards automaticamente após upload de CSV
    usando análise de IA (GPT) para entender os dados
    """
    
    def __init__(self):
        self.analyzer = IntelligentDataAnalyzer()
        self.ingestion_service = DataIngestionService()
        self.data_processor = DataProcessingService()
    
    def create_dashboard_from_datasource(
        self,
        datasource,
        user,
        organization
    ) -> Dict[str, Any]:
        """
        Cria dashboard automaticamente após upload de datasource
        
        Args:
            datasource: DataSource instance
            user: User instance
            organization: Organization instance
            
        Returns:
            Dict com informações do dashboard criado
        """
        try:
            # 1. Obter dados do datasource
            snapshot = self.ingestion_service.get_snapshot(datasource)
            
            if not snapshot:
                raise ValueError("Nenhum dado disponível na fonte de dados")
            
            # 2. Reconstruir DataFrame
            df = self.data_processor.reconstruct_dataframe(snapshot)
            
            if df.empty:
                raise ValueError("DataFrame vazio")
            
            # 3. Analisar dados com IA
            logger.info(f"Analisando dados com IA para datasource {datasource.id}")
            analysis = self._analyze_data_with_ai(df, datasource.name)
            
            # 4. Determinar template baseado na análise
            template = self._determine_template(analysis, df)
            
            # 5. Criar dashboard
            dashboard = Dashboard.objects.create(
                name=f"{datasource.name}",
                template=template,
                organization=organization,
                created_by=user,
                is_preview=False,
                config={
                    'auto_created': True,
                    'ai_analysis': analysis.get('summary', {}),
                    'template_reason': analysis.get('template_reason', ''),
                    'column_mapping': analysis.get('column_mapping', {}),
                }
            )
            
            # 6. Vincular datasource ao dashboard
            dashboard.datasources.add(datasource)
            
            logger.info(f"Dashboard {dashboard.id} criado automaticamente para datasource {datasource.id}")
            
            return {
                'dashboard_id': dashboard.id,
                'dashboard_name': dashboard.name,
                'dashboard_template': template,
                'dashboard_created': True,
                'is_preview': False,
                'ai_analysis': analysis.get('summary', ''),
                'message': f'Dashboard "{dashboard.name}" criado com sucesso!'
            }
            
        except Exception as e:
            logger.error(f"Erro ao criar dashboard automaticamente: {str(e)}", exc_info=True)
            raise
    
    def _convert_to_serializable(self, val):
        """
        Converte valores pandas/numpy para tipos serializáveis em JSON
        """
        import numpy as np
        from datetime import datetime
        
        if pd.isna(val):
            return None
        elif isinstance(val, (pd.Timestamp, datetime)):
            return val.isoformat()
        elif isinstance(val, (np.integer, np.int64, np.int32)):
            return int(val)
        elif isinstance(val, (np.floating, np.float64, np.float32)):
            if np.isnan(val) or np.isinf(val):
                return None
            return float(val)
        elif isinstance(val, np.bool_):
            return bool(val)
        else:
            return val
    
    def _analyze_data_with_ai(self, df: pd.DataFrame, datasource_name: str) -> Dict[str, Any]:
        """
        Usa GPT para analisar os dados e entender sua estrutura
        
        Returns:
            Dict com análise completa dos dados
        """
        # Primeiro: análise inteligente local
        intelligent_analysis = self.analyzer.analyze_dataframe(df)
        
        # Preparar contexto para GPT
        context = self._prepare_context_for_gpt(df, intelligent_analysis, datasource_name)
        
        # Chamar GPT para análise semântica
        try:
            gpt_analysis = self._call_gpt_for_analysis(context)
            
            # Combinar análises
            return {
                'intelligent_analysis': intelligent_analysis,
                'gpt_insights': gpt_analysis,
                'summary': gpt_analysis.get('summary', ''),
                'template_reason': gpt_analysis.get('template_reason', ''),
                'column_mapping': gpt_analysis.get('column_mapping', {}),
                'suggested_kpis': gpt_analysis.get('suggested_kpis', []),
            }
            
        except Exception as e:
            logger.warning(f"GPT análise falhou, usando análise local: {str(e)}")
            
            # Fallback: usar apenas análise local
            return {
                'intelligent_analysis': intelligent_analysis,
                'gpt_insights': {},
                'summary': 'Análise automática realizada (GPT indisponível)',
                'template_reason': 'Baseado em análise estatística',
                'column_mapping': self._extract_column_mapping(intelligent_analysis),
                'suggested_kpis': [],
            }
    
    def _prepare_context_for_gpt(
        self,
        df: pd.DataFrame,
        intelligent_analysis: Dict,
        datasource_name: str
    ) -> str:
        """
        Prepara contexto estruturado para enviar ao GPT
        """
        # Amostra dos dados - converter para formato serializável
        sample_data = []
        for _, row in df.head(5).iterrows():
            row_dict = {}
            for col, val in row.items():
                row_dict[col] = self._convert_to_serializable(val)
            sample_data.append(row_dict)
        
        # Estatísticas das colunas
        columns_info = []
        for col in df.columns:
            # Converter sample_values para formato serializável
            sample_values = []
            for val in df[col].dropna().head(3):
                sample_values.append(self._convert_to_serializable(val))
            
            col_info = {
                'name': col,
                'type': str(df[col].dtype),
                'null_count': int(df[col].isnull().sum()),
                'unique_values': int(df[col].nunique()),
                'sample_values': sample_values
            }
            columns_info.append(col_info)
        
        context = f"""Analise os seguintes dados de negócio e forneça insights:

NOME DO ARQUIVO: {datasource_name}

ESTRUTURA DOS DADOS:
- Total de linhas: {len(df)}
- Total de colunas: {len(df.columns)}
- Colunas: {', '.join(df.columns)}

DETALHES DAS COLUNAS:
{json.dumps(columns_info, indent=2, ensure_ascii=False)}

AMOSTRA DOS DADOS (primeiras 5 linhas):
{json.dumps(sample_data, indent=2, ensure_ascii=False, default=str)}

ANÁLISE ESTATÍSTICA:
{json.dumps(intelligent_analysis.get('inferred_schema', {}), indent=2, ensure_ascii=False)}

INSTRUÇÕES:
1. Identifique o tipo de dados (vendas, financeiro, operacional, etc)
2. Determine qual template de dashboard seria mais adequado:
   - 'sales': Para dados de vendas/transações/clientes
   - 'financial': Para dados financeiros/receitas/despesas
3. Sugira mapeamento de colunas para KPIs:
   - Qual coluna representa VALOR/PREÇO/RECEITA?
   - Qual coluna representa DATA?
   - Qual coluna representa PRODUTO/CATEGORIA?
   - Qual coluna representa QUANTIDADE?
4. Explique em 1-2 frases o que esses dados representam

FORMATO DE RESPOSTA (JSON):
{{
  "data_type": "sales|financial|operational|other",
  "template": "sales|financial",
  "template_reason": "Explicação clara do porquê escolheu este template",
  "summary": "Resumo em 1-2 frases sobre o que são esses dados",
  "column_mapping": {{
    "value": "nome_da_coluna_de_valor",
    "date": "nome_da_coluna_de_data",
    "product": "nome_da_coluna_de_produto",
    "quantity": "nome_da_coluna_de_quantidade"
  }},
  "suggested_kpis": [
    "KPI 1 sugerido",
    "KPI 2 sugerido"
  ]
}}
"""
        
        return context
    
    def _call_gpt_for_analysis(self, context: str) -> Dict[str, Any]:
        """
        Chama GPT para analisar os dados
        """
        import openai
        
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY não configurada")
        
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # Modelo custo-benefício
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um especialista em análise de dados de negócio. Analise dados CSV e identifique sua estrutura e propósito."
                    },
                    {
                        "role": "user",
                        "content": context
                    }
                ],
                temperature=0.3,
                max_tokens=800,
                response_format={"type": "json_object"}
            )
            
            # Parse resposta
            content = response.choices[0].message.content
            analysis = json.loads(content)
            
            logger.info(f"GPT Analysis: {analysis}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"Erro ao chamar GPT: {str(e)}")
            raise
    
    def _determine_template(self, analysis: Dict, df: pd.DataFrame) -> str:
        """
        Determina o template baseado na análise de IA
        """
        gpt_insights = analysis.get('gpt_insights', {})
        suggested_template = gpt_insights.get('template')
        
        # Se GPT sugeriu um template válido, usar
        if suggested_template in ['sales', 'financial']:
            return suggested_template
        
        # Fallback: análise local
        intelligent_analysis = analysis.get('intelligent_analysis', {})
        schema = intelligent_analysis.get('inferred_schema', {})
        
        # Se tem medidas monetárias + temporal, provavelmente é vendas
        measures = schema.get('measures', [])
        temporal = schema.get('temporal', [])
        
        if measures and temporal:
            return 'sales'
        
        # Default
        return 'sales'
    
    def _extract_column_mapping(self, intelligent_analysis: Dict) -> Dict[str, str]:
        """
        Extrai mapeamento de colunas da análise inteligente
        """
        schema = intelligent_analysis.get('inferred_schema', {})
        columns_info = intelligent_analysis.get('columns', {})
        
        mapping = {}
        
        # Temporal
        temporal = schema.get('temporal', [])
        if temporal:
            mapping['date'] = temporal[0]
        
        # Medidas (valor)
        measures = schema.get('measures', [])
        for measure in measures:
            col_info = columns_info.get(measure, {})
            semantic_type = col_info.get('semantic_type')
            
            # Primeiro monetário encontrado é o valor principal
            if semantic_type == 'monetary' and 'value' not in mapping:
                mapping['value'] = measure
            elif semantic_type == 'quantity' and 'quantity' not in mapping:
                mapping['quantity'] = measure
        
        # Dimensões (produto/categoria)
        dimensions = schema.get('dimensions', [])
        if dimensions:
            mapping['product'] = dimensions[0]
        
        return mapping
