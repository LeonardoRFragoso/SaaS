import api from './api'

export interface Dashboard {
  id: number
  name: string
  description: string
  template: string
  datasources: number[]
  config: any
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Insight {
  type: string
  icon: string
  message: string
}

export interface DataQualityProblem {
  type: string
  icon: string
  severity: string
  column: string | null
  message: string
  count: number
}

export interface ChartSuggestion {
  type: string
  title: string
  description: string
  icon: string
  column: string | null
  priority: string
}

export interface DashboardData {
  kpis: {
    [key: string]: number
  }
  charts: {
    [key: string]: any
  }
  insights?: Insight[]
  data_quality?: DataQualityProblem[]
  chart_suggestions?: ChartSuggestion[]
  metadata?: any
}

export interface PaginatedDashboards {
  count: number
  next: string | null
  previous: string | null
  results: Dashboard[]
}

export const dashboardService = {
  // Listar dashboards
  async list(): Promise<PaginatedDashboards> {
    const response = await api.get('/dashboards/', { params: { include_preview: 1 } })
    if (response.data?.results) {
      return response.data
    }

    return {
      count: Array.isArray(response.data) ? response.data.length : 0,
      next: null,
      previous: null,
      results: Array.isArray(response.data) ? response.data : [],
    }
  },

  // Obter um dashboard
  async get(id: number): Promise<Dashboard> {
    const response = await api.get(`/dashboards/${id}/`)
    return response.data
  },

  // Criar dashboard
  async create(data: {
    name: string
    template: string
    datasources?: number[]
  }): Promise<Dashboard> {
    const response = await api.post('/dashboards/', data)
    return response.data
  },

  // Atualizar dashboard
  async update(id: number, data: Partial<Dashboard>): Promise<Dashboard> {
    const response = await api.patch(`/dashboards/${id}/`, data)
    return response.data
  },

  // Obter dados processados do dashboard
  async getData(id: number, opts?: { period?: '30d' | '90d' | 'ytd'; compare?: boolean }): Promise<DashboardData> {
    const params: any = {}
    if (opts?.period) params.period = opts.period
    if (opts?.compare) params.compare = 1
    const response = await api.get(`/dashboards/${id}/data/`, { params })
    return response.data
  },

  // Trocar template
  async changeTemplate(id: number, template: string): Promise<Dashboard> {
    const response = await api.post(`/dashboards/${id}/change_template/`, {
      template,
    })
    return response.data
  },

  // Deletar dashboard
  async delete(id: number): Promise<void> {
    await api.delete(`/dashboards/${id}/`)
  },

  // Compartilhar pré-visualização pública
  async sharePreview(id: number): Promise<{ token: string; expires_at: string }> {
    const response = await api.post(`/dashboards/${id}/share_preview/`)
    return response.data
  },

  // Definir meta
  async setGoal(id: number, data: { metric: 'revenue' | 'avg_ticket'; target: number; deadline?: string }) {
    const response = await api.post(`/dashboards/${id}/set_goal/`, data)
    return response.data
  },

  // Adicionar nota a um gráfico
  async addNote(id: number, data: { chart_key: string; text: string }) {
    const response = await api.post(`/dashboards/${id}/add_note/`, data)
    return response.data
  },

  // Pergunte à IA
  async ask(id: number, question: string) {
    const response = await api.post(`/dashboards/${id}/ask/`, { question })
    return response.data
  },

  // Visualização pública (token)
  async getPublic(token: string) {
    const response = await api.get('/dashboards/public/', { params: { token } })
    return response.data
  },

  // Pré-visualizar mapeamento sem salvar
  async previewMapping(id: number, mapping: { [k: string]: string | undefined }, opts?: { period?: '30d' | '90d' | 'ytd'; compare?: boolean }) {
    const payload: any = { mapping }
    if (opts?.period) payload.period = opts.period
    if (opts?.compare) payload.compare = true
    const response = await api.post(`/dashboards/${id}/preview_mapping/`, payload)
    return response.data
  },

  // Remover dashboards órfãos (sem fonte)
  async cleanupOrphans(): Promise<{ deleted: number }> {
    const response = await api.post('/dashboards/cleanup_orphans/')
    return response.data
  },
}
