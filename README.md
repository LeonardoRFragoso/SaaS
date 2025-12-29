🚀 Ecossistema SaaS - Plataformas de Serviços com IA

Ecossistema modular de aplicações SaaS com inteligência artificial integrada, projetado para oferecer soluções escaláveis e automatizadas para diferentes necessidades de negócio.

## 📦 Produtos do Ecossistema

### 1. 🎯 **BI-as-a-Service** - Business Intelligence Automático
Plataforma completa de Business Intelligence com análise automatizada por IA, criação inteligente de dashboards e insights em tempo real.

**Status**: ✅ Ativo | **Versão**: v1.1.0 | **Repositório**: `1. SaaS de Business Intelligence Automático (BI-as-a-Service)/`

### 2. 📊 **Próximos Produtos** (Planejados)
- **CRM-as-a-Service** - Gestão de relacionamento com clientes com IA
- **Marketing Automation** - Automação de marketing multicanal
- **Financial SaaS** - Gestão financeira automatizada
- **HR-as-a-Service** - Recursos humanos com análise preditiva

---

## 🎯 BI-as-a-Service - Detalhes

### ✨ Funcionalidades Principais

### 📊 **Criação Automática de Dashboards com IA**
- Upload de CSV com análise automática via GPT-4o-mini
- Identificação inteligente de colunas (valor, data, produto, quantidade)
- Detecção automática de tipo de negócio (vendas, financeiro, operacional)
- Criação de dashboard com template adequado sem configuração manual
- Processamento e visualização de dados em tempo real

### 🤖 **Análise Inteligente de Dados**
- Análise estatística profunda com `IntelligentDataAnalyzer`
- Detecção semântica de tipos de dados (monetário, temporal, categoria)
- Identificação automática de relacionamentos entre colunas
- Sugestões inteligentes de visualizações baseadas na estrutura dos dados
- Cálculo automático de KPIs relevantes

### 📈 **Dashboards e Visualizações**
- Templates pré-configurados (Vendas, Financeiro)
- KPIs dinâmicos com cálculos automáticos
- Gráficos interativos (evolução temporal, distribuição, top produtos)
- Análise comparativa e benchmarks
- Exportação de relatórios em PDF

### 💡 **Insights com IA**
- Geração automática de insights via OpenAI
- Detecção de tendências e anomalias
- Recomendações estratégicas baseadas em dados
- Análise de qualidade de dados
- Previsões e alertas inteligentes

### 🔗 **Fontes de Dados**
- Upload de arquivos CSV
- Conexão com Google Sheets
- Sincronização automática de dados
- Validação e normalização de dados
- Armazenamento otimizado com snapshot

### 👥 **Gestão Multi-tenant**
- Organizações isoladas
- Controle de acesso por usuário
- Planos com limites configuráveis
- Sistema de billing integrado

## 🛠️ Stack Tecnológica

### Backend
- **Framework**: Django 5.0 + Django REST Framework
- **Banco de Dados**: PostgreSQL 15
- **Cache**: Redis
- **IA**: OpenAI GPT-4o-mini
- **Processamento**: Pandas, NumPy
- **Tasks Assíncronas**: Celery

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Roteamento**: React Router v6
- **HTTP Client**: Axios

### DevOps
- **Containerização**: Docker + Docker Compose
- **Proxy Reverso**: Nginx
- **CI/CD**: GitHub Actions (opcional)

## 🚀 Quick Start

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 20+ (para desenvolvimento local)
- Python 3.11+ (para desenvolvimento local)

### 1. Clone o repositório
```bash
git clone https://github.com/LeonardoRFragoso/SaaS.git
cd SaaS
```

### 2. Configure as variáveis de ambiente
```bash
# Backend
cd "1. SaaS de Business Intelligence Automático (BI-as-a-Service)/backend"
cp .env.example .env
# Edite .env e adicione sua OPENAI_API_KEY
```

### 3. Inicie com Docker
```bash
cd "1. SaaS de Business Intelligence Automático (BI-as-a-Service)"
docker-compose up --build -d
```

### 4. Execute as migrações
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### 5. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin

## 📁 Estrutura do Projeto

```
SaaS/
├── 1. SaaS de Business Intelligence Automático (BI-as-a-Service)/
│   ├── backend/
│   │   ├── apps/
│   │   │   ├── dashboards/          # Dashboards e visualizações
│   │   │   │   ├── services/
│   │   │   │   │   ├── auto_dashboard_service.py  # Criação automática com IA
│   │   │   │   │   └── data_processing_service.py # Processamento de dados
│   │   │   │   ├── intelligent_analyzer.py        # Análise inteligente
│   │   │   │   └── views/
│   │   │   ├── datasources/         # Fontes de dados
│   │   │   │   ├── services/
│   │   │   │   │   └── data_ingestion_service.py  # Ingestão de dados
│   │   │   │   └── views/
│   │   │   ├── insights/            # Insights com IA
│   │   │   ├── organizations/       # Multi-tenancy
│   │   │   ├── billing/             # Sistema de pagamentos
│   │   │   └── users/               # Autenticação
│   │   ├── config/                  # Configurações Django
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── pages/               # Páginas React
│   │   │   ├── components/          # Componentes reutilizáveis
│   │   │   ├── services/            # APIs e serviços
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
└── README.md
```

## 🎯 Uso Rápido

### Upload de CSV com Dashboard Automático

1. **Acesse a página de Fontes de Dados**
   ```
   http://localhost:3000/datasources
   ```

2. **Clique em "Upload CSV"**
   - Escolha seu arquivo CSV
   - Dê um nome descritivo
   - Clique em "Conectar"

3. **Aguarde a Mágica** ✨
   - A IA analisa automaticamente os dados
   - Identifica colunas e tipo de negócio
   - Cria dashboard com KPIs relevantes
   - Redireciona para o dashboard criado

4. **Visualize seus dados**
   - KPIs calculados automaticamente
   - Gráficos de evolução temporal
   - Análises por categoria/produto
   - Insights gerados por IA

## 🔑 Variáveis de Ambiente

### Backend (.env)
```env
# Django
SECRET_KEY=sua-secret-key-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://saas_user:saas_password@db:5432/saas_db

# Redis
REDIS_URL=redis://redis:6379/0

# OpenAI (obrigatório para análise IA)
OPENAI_API_KEY=sk-...

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Email (opcional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

## 🧪 Desenvolvimento Local

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 Recursos de IA

### GPT-4o-mini para Análise
- **Modelo**: `gpt-4o-mini` (custo-benefício otimizado)
- **Uso**: Análise de estrutura de dados CSV
- **Output**: JSON estruturado com mapeamento de colunas
- **Fallback**: Análise estatística local se GPT falhar

### Análise Estatística Local
- Detecção de tipos semânticos (monetário, temporal, categoria)
- Análise de cardinalidade e distribuição
- Identificação de relacionamentos entre colunas
- Cálculo automático de KPIs

## 🐛 Resolução de Problemas

### Dashboard mostra R$ 0
✅ **Resolvido**: Implementada correção completa
- Persistência de dados completos no snapshot
- get_data() busca do snapshot correto
- erilizção JON corrigida

### Erro de timezone ao carregar dados
✅ **Resolvido**: Comparação de datetime normalizada
- Conversão para datetime naive (sem timezone)
 Compatibilidade com pandas

### GPT não analisa os dados
- Verifique se `OPENA_API_KEY` está configurada
- Sistema usa fallback automático para análise local

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'diciona MinhaFeature'`)4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

#📝 Changelog

### v1.1.0 (Dezembro 2025)
- ✨ Criação automática de dashboard com análise GPT
- 🔧 Correção de persistência de dados completos
- 🐛 Correção de serialização JON
- 🔧 Correção de timezone em comprção de datas
- 📊 Dashboard com dados reais (não mais R$ 0)

### v1.0.0
- 🎉 Versão inicial
- 📊 istema de dashboards
- 🤖 Insights com IA
- 🔗 Integração com fontes de dados

## 📄 Licença

Este projeto está sob a licença MIT.

## 👤 Autor

**Leonardo R. Fragoso**
- GitHub: [@LeonardoRFragoso](https://github.com/LeonardoRFragoso)

## 🙏 Agradecimentos

- OpenAI pela API GPT
- Comunidade Django e React
- Contribuidores open source

---

**💡 Dica**: Para melhor experiência, use dados reais de vendas ou financeiros com colunas de data, valor e categoria. A IA funciona melhor com dados estruturados!