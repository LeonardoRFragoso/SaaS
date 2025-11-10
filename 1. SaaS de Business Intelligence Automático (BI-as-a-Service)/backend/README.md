# InsightFlow BI - Backend

Backend da plataforma InsightFlow BI construído com Django e Django REST Framework.

## 🚀 Tecnologias

- **Python 3.11+**
- **Django 5.0**
- **Django REST Framework**
- **PostgreSQL** (banco de dados principal)
- **Redis** (cache e filas)
- **Celery** (tarefas assíncronas)
- **JWT** (autenticação)

## 📁 Estrutura do Projeto

```
backend/
├── apps/                      # Aplicações Django
│   ├── authentication/        # Autenticação e registro
│   ├── users/                 # Gerenciamento de usuários
│   ├── organizations/         # Organizações/empresas
│   ├── datasources/          # Fontes de dados (Google Sheets, Excel, etc.)
│   ├── dashboards/           # Dashboards e visualizações
│   ├── insights/             # Insights gerados por IA
│   ├── reports/              # Relatórios automatizados
│   └── billing/              # Faturamento e assinaturas
├── config/                   # Configurações do Django
│   ├── settings.py          # Configurações principais
│   ├── urls.py              # URLs principais
│   ├── wsgi.py              # WSGI config
│   └── celery.py            # Configuração do Celery
├── manage.py                # CLI do Django
├── requirements.txt         # Dependências Python
└── .env.example            # Exemplo de variáveis de ambiente
```

## 🔧 Instalação e Configuração

### 1. Criar ambiente virtual

```bash
python -m venv venv
```

### 2. Ativar ambiente virtual

**Windows:**
```bash
.\venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais.

### 5. Executar migrações

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Criar superusuário

```bash
python manage.py createsuperuser
```

### 7. Executar servidor de desenvolvimento

```bash
python manage.py runserver
```

O servidor estará disponível em: `http://localhost:8000`

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/register/` - Registro de novo usuário
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/refresh/` - Refresh token
- `POST /api/auth/password-reset/` - Solicitar reset de senha

### Usuários
- `GET /api/users/me/` - Perfil do usuário atual
- `PUT /api/users/update_profile/` - Atualizar perfil
- `POST /api/users/change_password/` - Alterar senha

### Organizações
- `GET /api/organizations/my_organization/` - Organização do usuário
- `GET /api/organizations/{slug}/usage/` - Estatísticas de uso

### Dashboards, Insights, Reports, Billing
- Em desenvolvimento...

## 🧪 Testes

```bash
pytest
```

## 📝 Notas de Desenvolvimento

### Apps Principais

1. **authentication**: Sistema de login/registro com JWT
2. **users**: Modelo de usuário customizado com email como identificador
3. **organizations**: Multi-tenancy com limites por plano
4. **datasources**: Conexão com Google Sheets, Excel, CSV, etc.
5. **dashboards**: Criação e gerenciamento de dashboards
6. **insights**: IA para análise automática de dados
7. **reports**: Relatórios automatizados por email/WhatsApp
8. **billing**: Integração com Stripe e Mercado Pago

### Próximos Passos

- [ ] Implementar integração com Google Sheets API
- [ ] Implementar integração com Microsoft Graph API
- [ ] Criar sistema de geração de insights com OpenAI
- [ ] Implementar envio de relatórios por email (SendGrid)
- [ ] Implementar envio de relatórios por WhatsApp
- [ ] Configurar Celery para tarefas assíncronas
- [ ] Implementar sistema de billing com Stripe/Mercado Pago

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Passwords hasheados com bcrypt
- CORS configurado
- Rate limiting (a implementar)
- 2FA (a implementar)

## 📄 Licença

Proprietary - InsightFlow BI © 2024
