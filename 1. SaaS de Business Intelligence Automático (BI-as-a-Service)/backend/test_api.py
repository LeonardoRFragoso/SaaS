import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.dashboards.models import Dashboard
from apps.dashboards.views import DashboardViewSet
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.users.models import User

# Criar request fake
factory = APIRequestFactory()
user = User.objects.first()

print(f'Usuário: {user.email}')
print(f'Organização: {user.organization.name}')

# Testar endpoint /data/
request = factory.get('/api/dashboards/1/data/')
force_authenticate(request, user=user)  # Forçar autenticação

viewset = DashboardViewSet.as_view({'get': 'data'})
response = viewset(request, pk=1)

print('\n' + '=' * 60)
print('RESPOSTA DA API /data/')
print('=' * 60)
print(f'Status: {response.status_code}')
print(f'\nData:')
print(json.dumps(response.data, indent=2, ensure_ascii=False))
