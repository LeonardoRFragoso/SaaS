"""
Sistema de Exportação de Dashboards (PDF, Excel, CSV)
"""
import pandas as pd
from typing import Dict, Any
import io


class DashboardExporter:
    """Exportador de dashboards para diferentes formatos"""
    
    def export_to_excel(self, dashboard_data: Dict, dashboard_name: str) -> bytes:
        """
        Exporta dashboard para Excel com múltiplas abas.
        
        Returns:
            bytes do arquivo Excel
        """
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Aba 1: KPIs
            kpis_df = pd.DataFrame([dashboard_data.get('kpis', {})])
            kpis_df.to_excel(writer, sheet_name='KPIs', index=False)
            
            # Aba 2: Evolução de Vendas
            if dashboard_data.get('charts', {}).get('sales_evolution'):
                sales_df = pd.DataFrame(dashboard_data['charts']['sales_evolution'])
                sales_df.to_excel(writer, sheet_name='Evolução', index=False)
            
            # Aba 3: Top Produtos
            if dashboard_data.get('charts', {}).get('top_products'):
                products_df = pd.DataFrame(dashboard_data['charts']['top_products'])
                products_df.to_excel(writer, sheet_name='Top Produtos', index=False)
            
            # Aba 4: Insights
            if dashboard_data.get('insights'):
                insights_df = pd.DataFrame(dashboard_data['insights'])
                insights_df.to_excel(writer, sheet_name='Insights', index=False)
            
            # Aba 5: Previsões
            if dashboard_data.get('predictions'):
                pred = dashboard_data['predictions']
                pred_data = {
                    'Métrica': ['Método', 'Previsão Próximo Mês', 'Tendência', 'Confiança'],
                    'Valor': [
                        pred.get('method', 'N/A'),
                        f"R$ {pred.get('next_month_prediction', 0):.2f}",
                        f"{pred.get('trend_direction', 'N/A')} ({pred.get('trend_percentage', 0):.1f}%)",
                        pred.get('confidence', 'N/A')
                    ]
                }
                pred_df = pd.DataFrame(pred_data)
                pred_df.to_excel(writer, sheet_name='Previsões', index=False)
        
        output.seek(0)
        return output.getvalue()
    
    def export_to_csv(self, dashboard_data: Dict) -> bytes:
        """
        Exporta dados principais para CSV.
        
        Returns:
            bytes do arquivo CSV
        """
        output = io.StringIO()
        
        # Exportar evolução de vendas ou dados principais
        if dashboard_data.get('charts', {}).get('sales_evolution'):
            df = pd.DataFrame(dashboard_data['charts']['sales_evolution'])
        elif dashboard_data.get('charts', {}).get('top_products'):
            df = pd.DataFrame(dashboard_data['charts']['top_products'])
        else:
            # Exportar KPIs se não houver outro dado
            df = pd.DataFrame([dashboard_data.get('kpis', {})])
        
        df.to_csv(output, index=False)
        output.seek(0)
        
        return output.getvalue().encode('utf-8')
    
    def can_export_without_watermark(self, plan: str) -> bool:
        """Verifica se o plano permite exportar sem marca d'água"""
        return plan in ['starter', 'pro', 'enterprise']
    
    def get_export_limit(self, plan: str) -> int:
        """Retorna limite de exportações por mês"""
        limits = {
            'free': 0,  # Não pode exportar
            'starter': 10,
            'pro': 100,
            'enterprise': 99999
        }
        return limits.get(plan, 0)
