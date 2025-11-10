import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.dashboards.models import Dashboard
from apps.dashboards.services import DashboardService

d = Dashboard.objects.first()
service = DashboardService()
result = service.get_dashboard_data(d)

print('=' * 60)
print('DETECÇÃO AUTOMÁTICA DE COLUNAS')
print('=' * 60)
print(f"Valor: {result['metadata']['detected_columns']['value']}")
print(f"Quantidade: {result['metadata']['detected_columns']['quantity']}")
print(f"Data: {result['metadata']['detected_columns']['date']}")
print(f"Produto: {result['metadata']['detected_columns']['product']}")

print('\n' + '=' * 60)
print('KPIs CALCULADOS')
print('=' * 60)
print(f"Faturamento Total: R$ {result['kpis']['total_revenue']:,.2f}")
print(f"Total de Clientes: {result['kpis']['total_customers']}")
print(f"Ticket Médio: R$ {result['kpis']['avg_ticket']:,.2f}")
print(f"Quantidade Total: {result['kpis']['total_quantity']}")

print('\n' + '=' * 60)
print('GRÁFICOS')
print('=' * 60)
print(f"Evolução de Vendas: {len(result['charts']['sales_evolution'])} períodos")
print(f"Top Produtos: {len(result['charts']['top_products'])} produtos")

if result['charts']['top_products']:
    print('\nTop 5 Produtos:')
    for i, p in enumerate(result['charts']['top_products'][:5], 1):
        print(f"  {i}. {p['name']}: R$ {p['sales']:,.2f}")
