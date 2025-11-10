# InsightFlow BI - Frontend

Frontend da plataforma InsightFlow BI construído com React, TypeScript e Vite.

## 🚀 Tecnologias

- **React 19** com TypeScript
- **Vite** (build tool)
- **TailwindCSS** (estilização)
- **shadcn/ui** (componentes)
- **React Router** (roteamento)
- **Zustand** (gerenciamento de estado)
- **React Query** (cache e sincronização de dados)
- **Axios** (requisições HTTP)
- **Recharts** (gráficos)
- **Lucide React** (ícones)

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   └── ui/           # Componentes base (shadcn/ui)
│   ├── pages/            # Páginas da aplicação
│   ├── services/         # Serviços de API
│   ├── hooks/            # Custom hooks
│   ├── store/            # Estado global (Zustand)
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Funções utilitárias
│   └── lib/              # Configurações de bibliotecas
├── public/               # Arquivos estáticos
└── index.html           # HTML principal
```

## 🔧 Instalação e Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` se necessário:

```
VITE_API_URL=http://localhost:8000/api
```

### 3. Executar em desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em: `http://localhost:3000`

### 4. Build para produção

```bash
npm run build
```

### 5. Preview do build

```bash
npm run preview
```

## 📡 Integração com Backend

O frontend se comunica com o backend Django através de:

- **Proxy Vite**: Requisições para `/api` são redirecionadas para `http://localhost:8000`
- **Axios**: Cliente HTTP configurado com interceptors para autenticação JWT
- **Token Refresh**: Renovação automática de tokens expirados

## 🎨 Componentes UI

Utilizamos componentes do **shadcn/ui** customizados com TailwindCSS:

- Button
- Input
- Card
- Dialog
- Dropdown Menu
- Select
- Tabs
- Toast/Sonner
- Tooltip

## 🔐 Autenticação

Sistema de autenticação JWT com:

- Login/Registro
- Refresh token automático
- Proteção de rotas
- Persistência de sessão (localStorage)

## 📊 Features Principais

- **Dashboard**: Visualização de dados com gráficos interativos
- **Fontes de Dados**: Conexão com Google Sheets, Excel, CSV
- **Insights IA**: Análises automáticas geradas por IA
- **Relatórios**: Agendamento e envio automático
- **Perfil**: Gerenciamento de conta e organização

## 🧪 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Executar linter
```

## 📝 Notas de Desenvolvimento

### Path Aliases

Configurado `@/*` para importar de `src/*`:

```typescript
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
```

### Tema Dark/Light

Suporte a tema escuro/claro configurado via CSS variables.

### Responsividade

Todos os componentes são responsivos e otimizados para mobile.

## 🔒 Segurança

- Tokens JWT armazenados em localStorage
- HTTPS em produção
- Sanitização de inputs
- Proteção contra XSS

## 📄 Licença

Proprietary - InsightFlow BI © 2024
