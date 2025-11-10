"""
Sistema de Alertas Inteligentes
"""
import pandas as pd
from typing import Dict, List, Any


class AlertEngine:
    """Engine para detectar e gerar alertas"""
    
    def generate_alerts(self, df: pd.DataFrame, col_types: Dict, kpis: Dict, plan: str = 'free') -> List[Dict]:
        """
        Gera alertas automáticos baseados nos dados e KPIs.
        
        Args:
            df: DataFrame com os dados
            col_types: Tipos de colunas detectados
            kpis: KPIs calculados
            plan: Plano do usuário
        
        Returns:
            Lista de alertas
        """
        alerts = []
        
        # 1. ALERTAS DE META
        alerts.extend(self._check_goal_alerts(kpis, plan))
        
        # 2. ALERTAS DE ANOMALIA
        if col_types.get('numeric'):
            alerts.extend(self._check_anomaly_alerts(df, col_types))
        
        # 3. ALERTAS DE TENDÊNCIA
        if col_types.get('date') and col_types.get('numeric'):
            alerts.extend(self._check_trend_alerts(df, col_types))
        
        # 4. ALERTAS DE THRESHOLD (configuráveis - futura feature)
        alerts.extend(self._check_threshold_alerts(kpis, plan))
        
        # Limitar alertas por plano
        max_alerts = self._get_max_alerts(plan)
        
        # Ordenar por prioridade e limitar
        alerts.sort(key=lambda x: {'critical': 0, 'warning': 1, 'info': 2}.get(x['severity'], 3))
        
        return alerts[:max_alerts]
    
    def _check_goal_alerts(self, kpis: Dict, plan: str) -> List[Dict]:
        """Alertas de progresso de metas"""
        alerts = []
        
        total_revenue = kpis.get('total_revenue', 0)
        
        # Meta exemplo: R$ 20.000 (isso seria configurável pelo usuário)
        goal = 20000
        
        if total_revenue > 0:
            progress = (total_revenue / goal) * 100
            
            if progress >= 100:
                alerts.append({
                    'type': 'goal_achieved',
                    'severity': 'info',
                    'icon': '🎯',
                    'title': 'Meta Atingida!',
                    'message': f'Parabéns! Você alcançou {progress:.1f}% da meta de R$ {goal:,.2f}',
                    'action': None
                })
            elif progress >= 85:
                alerts.append({
                    'type': 'goal_near',
                    'severity': 'info',
                    'icon': '🎯',
                    'title': 'Quase lá!',
                    'message': f'Você está a {100 - progress:.1f}% de atingir sua meta (R$ {goal - total_revenue:,.2f})',
                    'action': 'keep_going'
                })
        
        return alerts
    
    def _check_anomaly_alerts(self, df: pd.DataFrame, col_types: Dict) -> List[Dict]:
        """Detecta anomalias nos dados"""
        alerts = []
        
        value_col = col_types['numeric'][0]
        
        try:
            mean = df[value_col].mean()
            std = df[value_col].std()
            
            # Detectar valores muito abaixo da média (3 desvios padrão)
            threshold_low = mean - 3 * std
            low_values = (df[value_col] < threshold_low).sum()
            
            if low_values > 0 and low_values <= 3:
                alerts.append({
                    'type': 'anomaly_low',
                    'severity': 'warning',
                    'icon': '⚠️',
                    'title': 'Valores Anormalmente Baixos',
                    'message': f'{low_values} registros com valores muito abaixo da média - investigue!',
                    'action': 'investigate'
                })
            
            # Detectar valores muito acima da média
            threshold_high = mean + 3 * std
            high_values = (df[value_col] > threshold_high).sum()
            
            if high_values > 0 and high_values <= 3:
                alerts.append({
                    'type': 'anomaly_high',
                    'severity': 'info',
                    'icon': '🚀',
                    'title': 'Picos de Performance',
                    'message': f'{high_values} registros com performance excepcional - analise o que funcionou!',
                    'action': 'analyze'
                })
        except Exception:
            pass
        
        return alerts
    
    def _check_trend_alerts(self, df: pd.DataFrame, col_types: Dict) -> List[Dict]:
        """Alertas de tendência"""
        alerts = []
        
        date_col = col_types['date'][0]
        value_col = col_types['numeric'][0]
        
        try:
            df_copy = df.copy()
            df_copy[date_col] = pd.to_datetime(df_copy[date_col], errors='coerce')
            df_copy = df_copy.dropna(subset=[date_col])
            df_copy = df_copy.sort_values(date_col)
            
            if len(df_copy) >= 4:
                # Comparar primeiros 50% vs últimos 50%
                mid = len(df_copy) // 2
                first_half_avg = df_copy.iloc[:mid][value_col].mean()
                second_half_avg = df_copy.iloc[mid:][value_col].mean()
                
                if first_half_avg > 0:
                    change_pct = ((second_half_avg - first_half_avg) / first_half_avg) * 100
                    
                    if change_pct < -20:
                        alerts.append({
                            'type': 'trend_down',
                            'severity': 'critical',
                            'icon': '🔴',
                            'title': 'Alerta: Queda Significativa',
                            'message': f'Seus valores caíram {abs(change_pct):.1f}% no período recente',
                            'action': 'urgent_review'
                        })
                    elif change_pct > 20:
                        alerts.append({
                            'type': 'trend_up',
                            'severity': 'info',
                            'icon': '🟢',
                            'title': 'Crescimento Acelerado',
                            'message': f'Seus valores cresceram {change_pct:.1f}% no período recente!',
                            'action': 'celebrate'
                        })
        except Exception:
            pass
        
        return alerts
    
    def _check_threshold_alerts(self, kpis: Dict, plan: str) -> List[Dict]:
        """Alertas baseados em thresholds configuráveis"""
        alerts = []
        
        # Exemplo: Alertar se faturamento diário está muito baixo
        total_revenue = kpis.get('total_revenue', 0)
        total_customers = kpis.get('total_customers', 1)
        
        daily_avg = total_revenue / max(total_customers, 1)
        
        # Threshold: R$ 500 por dia (exemplo)
        if daily_avg < 500 and total_customers > 0:
            alerts.append({
                'type': 'threshold_low',
                'severity': 'warning',
                'icon': '💰',
                'title': 'Faturamento Abaixo do Esperado',
                'message': f'Média de R$ {daily_avg:.2f} por transação está abaixo do ideal',
                'action': 'optimize_pricing'
            })
        
        return alerts
    
    def _get_max_alerts(self, plan: str) -> int:
        """Limite de alertas por plano"""
        limits = {
            'free': 3,
            'starter': 5,
            'pro': 10,
            'enterprise': 99999
        }
        return limits.get(plan, 3)
