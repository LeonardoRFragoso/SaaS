"""
Sistema de Previsões e Machine Learning
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Any
from datetime import datetime, timedelta


class PredictionEngine:
    """Engine de previsões usando ML"""
    
    def generate_predictions(self, df: pd.DataFrame, col_types: Dict, plan: str = 'free') -> Dict[str, Any]:
        """
        Gera previsões baseadas nos dados históricos.
        
        Args:
            df: DataFrame com os dados
            col_types: Tipos de colunas detectados
            plan: Plano do usuário ('free', 'starter', 'pro', 'enterprise')
        
        Returns:
            Dict com previsões e métricas
        """
        predictions = {}
        
        if not col_types.get('date') or not col_types.get('numeric'):
            return predictions
        
        date_col = col_types['date'][0]
        value_col = col_types['numeric'][0]
        
        try:
            # Preparar dados
            df_copy = df.copy()
            df_copy[date_col] = pd.to_datetime(df_copy[date_col], errors='coerce')
            df_copy = df_copy.dropna(subset=[date_col, value_col])
            df_copy = df_copy.sort_values(date_col)
            
            if len(df_copy) < 3:  # Precisa de pelo menos 3 pontos
                return predictions
            
            # Plano FREE: Regressão Linear Simples
            if plan == 'free':
                predictions = self._predict_linear(df_copy, date_col, value_col)
            
            # Planos PAGOS: Modelos avançados (Prophet, ARIMA)
            else:
                try:
                    # Tentar Prophet primeiro (melhor qualidade)
                    predictions = self._predict_prophet(df_copy, date_col, value_col)
                except:
                    # Fallback para linear se Prophet não estiver disponível
                    predictions = self._predict_linear(df_copy, date_col, value_col)
            
            # Adicionar confiança e recomendações
            predictions['confidence'] = self._calculate_confidence(df_copy, value_col)
            predictions['recommendations'] = self._generate_recommendations(predictions, df_copy, value_col)
            
        except Exception as e:
            predictions['error'] = str(e)
        
        return predictions
    
    def _predict_linear(self, df: pd.DataFrame, date_col: str, value_col: str) -> Dict:
        """Previsão usando regressão linear simples (FREE)"""
        # Converter datas para números (dias desde o início)
        df['days'] = (df[date_col] - df[date_col].min()).dt.days
        
        # Regressão linear simples
        X = df['days'].values
        y = df[value_col].values
        
        # Calcular coeficientes manualmente (sem sklearn)
        n = len(X)
        x_mean = X.mean()
        y_mean = y.mean()
        
        # Slope (m) e Intercept (b)
        numerator = ((X - x_mean) * (y - y_mean)).sum()
        denominator = ((X - x_mean) ** 2).sum()
        
        if denominator == 0:
            return {}
        
        m = numerator / denominator
        b = y_mean - m * x_mean
        
        # Prever próximos 30 dias
        last_day = X.max()
        future_days = np.array([last_day + i for i in range(1, 31)])
        future_values = m * future_days + b
        
        # Calcular tendência
        trend_pct = (m / y_mean * 30) * 100 if y_mean != 0 else 0
        
        # Previsão para próximo mês
        next_month_prediction = future_values.mean()
        
        return {
            'method': 'linear_regression',
            'next_month_prediction': float(next_month_prediction),
            'trend_percentage': float(trend_pct),
            'trend_direction': 'up' if m > 0 else 'down',
            'daily_predictions': [
                {
                    'day': int(i),
                    'value': float(future_values[i])
                }
                for i in range(min(7, len(future_values)))  # Próximos 7 dias
            ],
            'min_predicted': float(future_values.min()),
            'max_predicted': float(future_values.max()),
        }
    
    def _predict_prophet(self, df: pd.DataFrame, date_col: str, value_col: str) -> Dict:
        """Previsão usando Prophet (PLANOS PAGOS)"""
        try:
            from prophet import Prophet
            
            # Preparar dados no formato do Prophet
            prophet_df = pd.DataFrame({
                'ds': df[date_col],
                'y': df[value_col]
            })
            
            # Criar e treinar modelo
            model = Prophet(
                daily_seasonality=False,
                weekly_seasonality=True,
                yearly_seasonality=False
            )
            model.fit(prophet_df)
            
            # Fazer previsões para 30 dias
            future = model.make_future_dataframe(periods=30)
            forecast = model.predict(future)
            
            # Pegar apenas previsões futuras
            future_forecast = forecast[forecast['ds'] > df[date_col].max()]
            
            next_month_prediction = future_forecast['yhat'].mean()
            
            # Calcular tendência
            current_avg = df[value_col].tail(7).mean()
            trend_pct = ((next_month_prediction - current_avg) / current_avg * 100) if current_avg != 0 else 0
            
            return {
                'method': 'prophet',
                'next_month_prediction': float(next_month_prediction),
                'trend_percentage': float(trend_pct),
                'trend_direction': 'up' if trend_pct > 0 else 'down',
                'daily_predictions': [
                    {
                        'day': i + 1,
                        'value': float(row['yhat']),
                        'lower_bound': float(row['yhat_lower']),
                        'upper_bound': float(row['yhat_upper'])
                    }
                    for i, (_, row) in enumerate(future_forecast.head(7).iterrows())
                ],
                'min_predicted': float(future_forecast['yhat_lower'].min()),
                'max_predicted': float(future_forecast['yhat_upper'].max()),
            }
        except ImportError:
            # Prophet não instalado, usar linear
            return self._predict_linear(df, date_col, value_col)
    
    def _calculate_confidence(self, df: pd.DataFrame, value_col: str) -> str:
        """Calcula nível de confiança da previsão"""
        n = len(df)
        cv = df[value_col].std() / df[value_col].mean() if df[value_col].mean() != 0 else 0
        
        if n >= 30 and cv < 0.3:
            return 'high'
        elif n >= 15 and cv < 0.5:
            return 'medium'
        else:
            return 'low'
    
    def _generate_recommendations(self, predictions: Dict, df: pd.DataFrame, value_col: str) -> List[str]:
        """Gera recomendações baseadas nas previsões"""
        recommendations = []
        
        if not predictions:
            return recommendations
        
        trend = predictions.get('trend_percentage', 0)
        trend_dir = predictions.get('trend_direction', 'stable')
        
        if trend_dir == 'up' and abs(trend) >= 10:
            recommendations.append(f"📈 Tendência positiva de {abs(trend):.1f}% - mantenha o ritmo!")
        elif trend_dir == 'down' and abs(trend) >= 10:
            recommendations.append(f"📉 Atenção: queda prevista de {abs(trend):.1f}% - ação necessária")
        else:
            recommendations.append("➡️ Tendência estável - mantenha o curso")
        
        # Análise de volatilidade
        current_avg = df[value_col].mean()
        predicted = predictions.get('next_month_prediction', current_avg)
        
        if predicted > current_avg * 1.2:
            recommendations.append("🚀 Crescimento acelerado esperado - prepare-se para escalar")
        elif predicted < current_avg * 0.8:
            recommendations.append("⚠️ Declínio significativo - revise sua estratégia")
        
        return recommendations
