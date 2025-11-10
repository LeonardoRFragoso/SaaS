import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.dashboards.models import Dashboard
from apps.dashboards.services import DashboardService

d = Dashboard.objects.first()
service = DashboardService()
result = service.get_dashboard_data(d)

print('=' * 80)
print('🔮 PREVISÕES COM MACHINE LEARNING')
print('=' * 80)
if result.get('predictions'):
    pred = result['predictions']
    print(f"Método: {pred.get('method', 'N/A').upper()}")
    print(f"Previsão Próximo Mês: R$ {pred.get('next_month_prediction', 0):,.2f}")
    print(f"Tendência: {pred.get('trend_direction', 'N/A').upper()} ({pred.get('trend_percentage', 0):.1f}%)")
    print(f"Confiança: {pred.get('confidence', 'N/A').upper()}")
    
    if pred.get('recommendations'):
        print("\nRecomendações:")
        for rec in pred['recommendations']:
            print(f"  • {rec}")
    
    if pred.get('daily_predictions'):
        print("\nPróximos 7 dias:")
        for day_pred in pred['daily_predictions'][:3]:
            print(f"  Dia {day_pred['day']}: R$ {day_pred['value']:,.2f}")
else:
    print("Nenhuma previsão disponível")

print('\n' + '=' * 80)
print('🔔 ALERTAS INTELIGENTES')
print('=' * 80)
if result.get('alerts'):
    for alert in result['alerts']:
        severity_icon = '🔴' if alert['severity'] == 'critical' else '🟡' if alert['severity'] == 'warning' else '🟢'
        print(f"\n{severity_icon} {alert['icon']} {alert['title']}")
        print(f"   {alert['message']}")
        if alert.get('action'):
            print(f"   Ação sugerida: {alert['action']}")
else:
    print("Nenhum alerta ativo")

print('\n' + '=' * 80)
print('📊 RESUMO COMPLETO')
print('=' * 80)
print(f"✨ Insights: {len(result.get('insights', []))}")
print(f"⚠️ Problemas: {len(result.get('data_quality', []))}")
print(f"📊 Sugestões: {len(result.get('chart_suggestions', []))}")
print(f"🔮 Previsões: {'✅ Ativo' if result.get('predictions') else '❌ Inativo'}")
print(f"🔔 Alertas: {len(result.get('alerts', []))}")
