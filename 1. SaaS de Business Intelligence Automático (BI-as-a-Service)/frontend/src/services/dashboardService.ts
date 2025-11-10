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

export const dashboardService = {
  // Listar dashboards
  async list(): Promise<Dashboard[]> {
    const response = await api.get('/dashboards/')
    return response.data
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
  async getData(id: number): Promise<DashboardData> {
    const response = await api.get(`/dashboards/${id}/data/`)
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
}
