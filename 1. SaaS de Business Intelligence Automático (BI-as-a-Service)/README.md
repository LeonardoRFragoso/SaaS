# 🚀 InsightFlow BI - Business Intelligence Automático

**Transforme suas planilhas em decisões inteligentes**

Plataforma SaaS de Business Intelligence que conecta automaticamente às fontes de dados da empresa (Google Sheets, Excel, Drive) e gera dashboards interativos com insights de IA.

## 📋 Visão Geral

- **Nome**: InsightFlow BI
- **Tagline**: "Transforme suas planilhas em decisões inteligentes"
- **Stack**: Django + React + PostgreSQL + Redis + Celery
- **Status**: Em desenvolvimento (MVP)

## ✨ Principais Funcionalidades

### MVP (Versão 1.0)
- ✅ Conexão automática com Google Sheets e Excel
- ✅ Dashboards pré-configurados (Vendas, Financeiro, Performance)
- ✅ Insights automáticos com IA (GPT-4)
- ✅ Relatórios automatizados por email/WhatsApp
- ✅ Chat IA integrado para consultas em linguagem natural
- ✅ Sistema de autenticação e multi-tenancy

### Roadmap Futuro
- 📱 Aplicativo mobile (iOS/Android)
- 🔔 Alertas em tempo real
- 🤝 Integração com Slack/Teams
- 📊 IA Preditiva (forecast, churn)
- 🎨 White Label

## 🏗️ Arquitetura do Projeto

```
SaaS/
├── backend/                    # Django REST API
│   ├── apps/
│   │   ├── authentication/    # Login, registro, JWT
│   │   ├── users/            # Gerenciamento de usuários
│   │   ├── organizations/    # Multi-tenancy
│   │   ├── datasources/      # Conexões com fontes de dados
│   │   ├── dashboards/       # Dashboards e visualizações
│   │   ├── insights/         # Insights gerados por IA
│   │   ├── reports/          # Relatórios automatizados
│   │   └── billing/          # Faturamento e assinaturas
│   ├── config/               # Configurações Django
│   └── requirements.txt      # Dependências Python
│
├── frontend/                  # React + TypeScript
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços de API
│   │   ├── store/           # Estado global (Zustand)
│   │   └── types/           # Tipos TypeScript
│   └── package.json         # Dependências Node
│
└── escopo.txt               # Escopo completo do projeto
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.11+** com Django 5.0
- **Django REST Framework** (APIs)
- **PostgreSQL** (banco de dados)
- **Redis** (cache e filas)
- **Celery** (tarefas assíncronas)
- **JWT** (autenticação)
- **OpenAI GPT-4** (insights de IA)

### Frontend
- **React 19** com TypeScript
- **Vite** (build tool)
- **TailwindCSS** + shadcn/ui (UI)
- **React Router** (roteamento)
- **Zustand** (estado global)
- **React Query** (cache de dados)
- **Recharts** (gráficos)

### Infraestrutura
- **Docker** + Kubernetes
- **AWS/Google Cloud**
- **GitHub Actions** (CI/CD)
- **Cloudflare** (CDN)

## 🚀 Como Executar

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis

### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Edite o .env com suas credenciais

# Executar migrações
python manage.py makemigrations
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Executar servidor
python manage.py runserver
```

Backend disponível em: `http://localhost:8000`

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env

# Executar em desenvolvimento
npm run dev
```

Frontend disponível em: `http://localhost:3000`

## 📊 Planos e Preços

### Starter - R$ 79/mês
- 1 usuário
- 2 dashboards
- 3 fontes de dados
- 50 perguntas IA/mês

### Pro - R$ 149/mês ⭐
- 5 usuários
- 10 dashboards
- Fontes ilimitadas
- 200 perguntas IA/mês
- Relatórios por WhatsApp

### Enterprise - R$ 299/mês
- Usuários ilimitados
- Dashboards ilimitados
- IA Preditiva
- White Label
- API de acesso

## 🎯 Público-Alvo

1. **Escritórios Contábeis** - Oferecer BI como serviço adicional
2. **Transportadoras** - Análise de rentabilidade por rota
3. **Agências de Marketing** - Automatizar relatórios de campanhas
4. **Representantes Comerciais** - Identificar melhores clientes
5. **Pequeno Varejo** - Gestão de vendas e estoque

## 📈 Metas de Crescimento (12 meses)

- **Mês 3**: 10 clientes pagantes
- **Mês 6**: 30 clientes pagantes
- **Mês 9**: 60 clientes pagantes
- **Mês 12**: 100 clientes pagantes
- **MRR no 12º mês**: ~R$ 14.500

## 🔐 Segurança

- Criptografia end-to-end (AES-256)
- Autenticação OAuth 2.0 + JWT
- LGPD compliant
- Backup automático diário
- Logs de auditoria
- 2FA (em desenvolvimento)

## 📝 Documentação

- [Escopo Completo](./escopo.txt) - Visão detalhada do projeto
- [Backend README](./backend/README.md) - Documentação do backend
- [Frontend README](./frontend/README.md) - Documentação do frontend

## 🤝 Contribuindo

Este é um projeto proprietário. Para contribuir, entre em contato com a equipe.

## 📄 Licença

Proprietary - InsightFlow BI © 2024

## 📞 Contato

Para mais informações sobre o projeto, entre em contato através dos canais oficiais.

---

**Status do Projeto**: 🟢 Em Desenvolvimento Ativo

**Última Atualização**: Novembro 2024
