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

print('=' * 70)
print('✨ INSIGHTS AUTOMÁTICOS')
print('=' * 70)
if result.get('insights'):
    for insight in result['insights']:
        print(f"{insight['icon']} [{insight['type'].upper()}] {insight['message']}")
else:
    print("Nenhum insight gerado")

print('\n' + '=' * 70)
print('⚠️ PROBLEMAS DE QUALIDADE DOS DADOS')
print('=' * 70)
if result.get('data_quality'):
    for problem in result['data_quality']:
        severity_emoji = '🔴' if problem['severity'] == 'high' else '🟡' if problem['severity'] == 'medium' else '🟢'
        print(f"{severity_emoji} {problem['icon']} {problem['message']}")
else:
    print("✅ Nenhum problema detectado!")

print('\n' + '=' * 70)
print('📊 SUGESTÕES DE GRÁFICOS ADICIONAIS')
print('=' * 70)
if result.get('chart_suggestions'):
    for i, suggestion in enumerate(result['chart_suggestions'], 1):
        print(f"{i}. {suggestion['icon']} {suggestion['title']}")
        print(f"   → {suggestion['description']}")
        print(f"   Prioridade: {suggestion['priority'].upper()}")
else:
    print("Nenhuma sugestão disponível")

print('\n' + '=' * 70)
print('📋 RESUMO')
print('=' * 70)
print(f"Total de Insights: {len(result.get('insights', []))}")
print(f"Total de Problemas: {len(result.get('data_quality', []))}")
print(f"Total de Sugestões: {len(result.get('chart_suggestions', []))}")
