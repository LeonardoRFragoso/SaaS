"""
Sistema de Análise Inteligente de Dados
Detecta automaticamente estrutura, tipos e relacionamentos usando análise estatística,
não apenas nomes de colunas.
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime


class IntelligentDataAnalyzer:
    """
    Analisador inteligente que ENTENDE os dados através de:
    - Análise estatística
    - Detecção de padrões
    - Inferência de relacionamentos
    - Análise de cardinalidade
    - Detecção de séries temporais
    """
    
    def analyze_dataframe(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Análise PROFUNDA do DataFrame.
        Retorna estrutura completa detectada AUTOMATICAMENTE.
        """
        analysis = {
            'columns': {},
            'relationships': [],
            'inferred_schema': {},
            'suggested_visualizations': [],
            'data_quality_score': 0,
            'auto_kpis': {}
        }
        
        # 1. ANÁLISE POR COLUNA (detectar tipo semântico, não só dtype)
        for col in df.columns:
            analysis['columns'][col] = self._analyze_column(df, col)
        
        # 2. DETECTAR RELACIONAMENTOS ENTRE COLUNAS
        analysis['relationships'] = self._detect_relationships(df, analysis['columns'])
        
        # 3. INFERIR SCHEMA LÓGICO (o que cada coluna representa)
        analysis['inferred_schema'] = self._infer_schema(df, analysis['columns'], analysis['relationships'])
        
        # 4. CALCULAR KPIs AUTOMATICAMENTE
        analysis['auto_kpis'] = self._calculate_auto_kpis(df, analysis['inferred_schema'])
        
        # 5. SUGERIR VISUALIZAÇÕES BASEADO NA ESTRUTURA
        analysis['suggested_visualizations'] = self._suggest_visualizations(df, analysis['inferred_schema'])
        
        # 6. CALCULAR SCORE DE QUALIDADE
        analysis['data_quality_score'] = self._calculate_quality_score(df, analysis['columns'])
        
        return analysis
    
    def _analyze_column(self, df: pd.DataFrame, col: str) -> Dict:
        """
        Análise PROFUNDA de uma coluna.
        Não só dtype, mas tipo SEMÂNTICO baseado no conteúdo.
        """
        series = df[col]
        
        analysis = {
            'name': col,
            'dtype': str(series.dtype),
            'null_count': int(series.isnull().sum()),
            'null_percentage': float(series.isnull().sum() / len(series) * 100),
            'unique_count': int(series.nunique()),
            'cardinality': 'high' if series.nunique() > len(series) * 0.8 else 'medium' if series.nunique() > 20 else 'low',
            'sample_values': series.dropna().head(5).tolist(),
            'semantic_type': None,  # Será inferido
            'role': None,  # measure, dimension, identifier, date
            'is_key': False,
            'confidence': 0
        }
        
        # INFERIR TIPO SEMÂNTICO através de ANÁLISE, não nome
        
        # É IDENTIFICADOR? (alta cardinalidade, valores únicos)
        if analysis['unique_count'] == len(series):
            analysis['semantic_type'] = 'identifier'
            analysis['role'] = 'identifier'
            analysis['is_key'] = True
            analysis['confidence'] = 0.95
            return analysis
        
        # É DATA/TEMPO? (testar parsing)
        if self._is_temporal(series):
            analysis['semantic_type'] = 'temporal'
            analysis['role'] = 'date'
            analysis['confidence'] = 0.9
            return analysis
        
        # É MONETÁRIO? (padrões de valores monetários)
        if self._is_monetary(series):
            analysis['semantic_type'] = 'monetary'
            analysis['role'] = 'measure'
            analysis['confidence'] = 0.85
            analysis['aggregation'] = 'sum'
            return analysis
        
        # É QUANTIDADE? (números inteiros, baixa variação)
        if self._is_quantity(series):
            analysis['semantic_type'] = 'quantity'
            analysis['role'] = 'measure'
            analysis['confidence'] = 0.8
            analysis['aggregation'] = 'sum'
            return analysis
        
        # É PERCENTUAL? (valores entre 0-100 ou 0-1)
        if self._is_percentage(series):
            analysis['semantic_type'] = 'percentage'
            analysis['role'] = 'measure'
            analysis['confidence'] = 0.85
            analysis['aggregation'] = 'avg'
            return analysis
        
        # É CATEGORIA? (baixa cardinalidade, texto)
        if self._is_category(series):
            analysis['semantic_type'] = 'category'
            analysis['role'] = 'dimension'
            analysis['confidence'] = 0.75
            return analysis
        
        # É NOME DE PESSOA? (padrões de nomes)
        if self._is_person_name(series):
            analysis['semantic_type'] = 'person_name'
            analysis['role'] = 'dimension'
            analysis['confidence'] = 0.7
            return analysis
        
        # É MÉTRICA GENÉRICA? (numérico com variação)
        if pd.api.types.is_numeric_dtype(series):
            analysis['semantic_type'] = 'metric'
            analysis['role'] = 'measure'
            analysis['confidence'] = 0.6
            analysis['aggregation'] = 'avg'
            return analysis
        
        # TEXTO LIVRE (alta cardinalidade, texto)
        analysis['semantic_type'] = 'text'
        analysis['role'] = 'attribute'
        analysis['confidence'] = 0.5
        
        return analysis
    
    def _is_temporal(self, series: pd.Series) -> bool:
        """Detecta se é coluna temporal através de ANÁLISE, não nome"""
        if pd.api.types.is_datetime64_any_dtype(series):
            return True
        
        # Tentar converter para data
        try:
            sample = series.dropna().head(10)
            parsed = pd.to_datetime(sample, errors='coerce')
            valid_dates = parsed.notna().sum()
            return valid_dates / len(sample) > 0.7  # 70%+ são datas válidas
        except:
            return False
    
    def _is_monetary(self, series: pd.Series) -> bool:
        """Detecta valores monetários através de PADRÕES estatísticos"""
        if not pd.api.types.is_numeric_dtype(series):
            return False
        
        values = series.dropna()
        if len(values) == 0:
            return False
        
        # Características de valores monetários:
        # 1. Valores positivos (maioria)
        positive_ratio = (values > 0).sum() / len(values)
        if positive_ratio < 0.8:
            return False
        
        # 2. Distribuição típica (alta variação, sem valores extremos)
        cv = values.std() / values.mean() if values.mean() != 0 else 0
        if cv > 5:  # Variação muito alta
            return False
        
        # 3. Valores decimais (maioria tem centavos)
        has_decimals = ((values % 1) != 0).sum() / len(values)
        if has_decimals > 0.3:  # 30%+ tem decimais
            return True
        
        # 4. Valores em faixas típicas de preços (10-100000)
        in_price_range = ((values >= 1) & (values <= 1000000)).sum() / len(values)
        
        return in_price_range > 0.8
    
    def _is_quantity(self, series: pd.Series) -> bool:
        """Detecta quantidades (números inteiros pequenos)"""
        if not pd.api.types.is_numeric_dtype(series):
            return False
        
        values = series.dropna()
        if len(values) == 0:
            return False
        
        # Quantidades: inteiros pequenos (1-100 tipicamente)
        is_integer = ((values % 1) == 0).sum() / len(values) > 0.9  # 90%+ são inteiros
        small_values = values.mean() < 100
        positive = (values > 0).sum() / len(values) > 0.95  # 95%+ positivos
        
        return is_integer and small_values and positive
    
    def _is_percentage(self, series: pd.Series) -> bool:
        """Detecta percentuais (0-100 ou 0-1)"""
        if not pd.api.types.is_numeric_dtype(series):
            return False
        
        values = series.dropna()
        if len(values) == 0:
            return False
        
        # Percentual 0-100
        in_range_100 = ((values >= 0) & (values <= 100)).sum() / len(values)
        if in_range_100 > 0.95:
            return True
        
        # Percentual 0-1 (decimal)
        in_range_1 = ((values >= 0) & (values <= 1)).sum() / len(values)
        if in_range_1 > 0.95:
            return True
        
        return False
    
    def _is_category(self, series: pd.Series) -> bool:
        """Detecta categorias (baixa cardinalidade)"""
        unique_ratio = series.nunique() / len(series)
        return unique_ratio < 0.05  # Menos de 5% de valores únicos
    
    def _is_person_name(self, series: pd.Series) -> bool:
        """Detecta nomes de pessoas através de PADRÕES"""
        if pd.api.types.is_numeric_dtype(series):
            return False
        
        sample = series.dropna().head(20)
        if len(sample) == 0:
            return False
        
        # Padrões de nomes:
        # 1. Tem espaço (Nome Sobrenome)
        has_space = sample.astype(str).str.contains(' ').sum() / len(sample)
        
        # 2. Começa com maiúscula
        starts_upper = sample.astype(str).str[0].str.isupper().sum() / len(sample)
        
        # 3. Comprimento típico (5-50 caracteres)
        typical_length = sample.astype(str).str.len().between(5, 50).sum() / len(sample)
        
        return has_space > 0.7 and starts_upper > 0.8 and typical_length > 0.8
    
    def _detect_relationships(self, df: pd.DataFrame, columns_analysis: Dict) -> List[Dict]:
        """
        Detecta RELACIONAMENTOS entre colunas através de análise,
        não pressuposições.
        """
        relationships = []
        
        cols = list(columns_analysis.keys())
        
        for i, col1 in enumerate(cols):
            for col2 in cols[i+1:]:
                rel = self._analyze_relationship(df, col1, col2, columns_analysis)
                if rel:
                    relationships.append(rel)
        
        return relationships
    
    def _analyze_relationship(self, df: pd.DataFrame, col1: str, col2: str, analysis: Dict) -> Optional[Dict]:
        """Analisa relação entre duas colunas"""
        
        # Relação 1:1 (uma coluna determina outra)
        if self._is_one_to_one(df, col1, col2):
            return {
                'type': 'one_to_one',
                'from': col1,
                'to': col2,
                'confidence': 0.9
            }
        
        # Relação 1:N (uma categoria → muitos valores)
        if self._is_one_to_many(df, col1, col2, analysis):
            return {
                'type': 'one_to_many',
                'dimension': col1,
                'measure': col2,
                'confidence': 0.8,
                'aggregation': 'sum'
            }
        
        # Correlação (duas métricas correlacionadas)
        if self._is_correlated(df, col1, col2, analysis):
            corr_value = df[[col1, col2]].corr().iloc[0, 1]
            return {
                'type': 'correlation',
                'col1': col1,
                'col2': col2,
                'correlation': float(corr_value),
                'confidence': abs(corr_value)
            }
        
        return None
    
    def _is_one_to_one(self, df: pd.DataFrame, col1: str, col2: str) -> bool:
        """Detecta relação 1:1"""
        grouped = df.groupby(col1)[col2].nunique()
        return (grouped == 1).sum() / len(grouped) > 0.95
    
    def _is_one_to_many(self, df: pd.DataFrame, col1: str, col2: str, analysis: Dict) -> bool:
        """Detecta relação 1:N (categoria → medida)"""
        role1 = analysis[col1].get('role')
        role2 = analysis[col2].get('role')
        
        return role1 == 'dimension' and role2 == 'measure'
    
    def _is_correlated(self, df: pd.DataFrame, col1: str, col2: str, analysis: Dict) -> bool:
        """Detecta correlação entre métricas"""
        if analysis[col1].get('role') != 'measure' or analysis[col2].get('role') != 'measure':
            return False
        
        try:
            corr = df[[col1, col2]].corr().iloc[0, 1]
            return abs(corr) > 0.7
        except:
            return False
    
    def _infer_schema(self, df: pd.DataFrame, columns: Dict, relationships: List) -> Dict:
        """
        Inferir SCHEMA LÓGICO do dataset.
        O que cada coluna representa no contexto de negócio.
        """
        schema = {
            'dimensions': [],
            'measures': [],
            'temporal': [],
            'identifiers': [],
            'facts': {}
        }
        
        for col, info in columns.items():
            role = info.get('role')
            
            if role == 'dimension':
                schema['dimensions'].append(col)
            elif role == 'measure':
                schema['measures'].append(col)
            elif role == 'date':
                schema['temporal'].append(col)
            elif role == 'identifier':
                schema['identifiers'].append(col)
        
        # Detectar "fato" principal (transação, venda, etc)
        if schema['measures'] and schema['temporal']:
            schema['facts'] = {
                'type': 'transaction',
                'grain': 'row_level',
                'measures': schema['measures'],
                'dimensions': schema['dimensions'],
                'time': schema['temporal'][0] if schema['temporal'] else None
            }
        
        return schema
    
    def _calculate_auto_kpis(self, df: pd.DataFrame, schema: Dict) -> Dict:
        """
        Calcular KPIs AUTOMATICAMENTE baseado no schema inferido.
        """
        kpis = {}
        
        measures = schema.get('measures', [])
        dimensions = schema.get('dimensions', [])
        
        # Para cada medida, calcular agregações apropriadas
        for measure in measures:
            col_name = measure
            kpis[f'{col_name}_total'] = float(df[col_name].sum())
            kpis[f'{col_name}_avg'] = float(df[col_name].mean())
            kpis[f'{col_name}_max'] = float(df[col_name].max())
            kpis[f'{col_name}_min'] = float(df[col_name].min())
        
        # Contagens
        kpis['total_records'] = len(df)
        
        # Para cada dimensão, encontrar top valores
        for dim in dimensions[:3]:  # Top 3 dimensões
            if df[dim].nunique() < 100:  # Só se não for muito alta cardinalidade
                top_value = df[dim].value_counts().index[0]
                top_count = int(df[dim].value_counts().iloc[0])
                kpis[f'top_{dim}'] = top_value
                kpis[f'top_{dim}_count'] = top_count
        
        return kpis
    
    def _suggest_visualizations(self, df: pd.DataFrame, schema: Dict) -> List[Dict]:
        """
        Sugerir visualizações AUTOMATICAMENTE baseado na estrutura detectada.
        """
        suggestions = []
        
        measures = schema.get('measures', [])
        dimensions = schema.get('dimensions', [])
        temporal = schema.get('temporal', [])
        
        # 1. Se tem temporal + medida → Linha do tempo
        if temporal and measures:
            suggestions.append({
                'type': 'line',
                'x': temporal[0],
                'y': measures[0],
                'title': f'Evolução de {measures[0]} ao longo do tempo',
                'priority': 'high'
            })
        
        # 2. Se tem dimensão + medida → Barras
        if dimensions and measures:
            dim = dimensions[0]
            if df[dim].nunique() <= 20:  # Cardinalidade adequada
                suggestions.append({
                    'type': 'bar',
                    'x': dim,
                    'y': measures[0],
                    'title': f'{measures[0]} por {dim}',
                    'priority': 'high'
                })
        
        # 3. Se tem múltiplas medidas → Scatter para correlação
        if len(measures) >= 2:
            suggestions.append({
                'type': 'scatter',
                'x': measures[0],
                'y': measures[1],
                'title': f'Relação entre {measures[0]} e {measures[1]}',
                'priority': 'medium'
            })
        
        # 4. Distribuição de medidas
        if measures:
            suggestions.append({
                'type': 'histogram',
                'x': measures[0],
                'title': f'Distribuição de {measures[0]}',
                'priority': 'medium'
            })
        
        return suggestions
    
    def _calculate_quality_score(self, df: pd.DataFrame, columns: Dict) -> float:
        """
        Calcular score de qualidade dos dados (0-100).
        """
        scores = []
        
        # 1. Completude (% sem nulos)
        completeness = (1 - df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100
        scores.append(completeness)
        
        # 2. Consistência (% colunas com tipo semântico detectado)
        detected = sum(1 for col in columns.values() if col.get('semantic_type'))
        consistency = (detected / len(columns)) * 100
        scores.append(consistency)
        
        # 3. Unicidade (identificadores únicos)
        unique_ids = sum(1 for col in columns.values() if col.get('is_key'))
        uniqueness = min(unique_ids / max(len(columns) * 0.2, 1) * 100, 100)
        scores.append(uniqueness)
        
        return np.mean(scores)
