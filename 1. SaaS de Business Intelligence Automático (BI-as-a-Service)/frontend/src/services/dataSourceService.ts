import api from './api'

export interface DataSource {
  id: number
  name: string
  source_type: string
  connection_config: any
  is_active: boolean
  last_synced_at: string | null
  row_count: number
  created_at: string
  updated_at: string
  // Campos adicionais ao criar via upload (dashboard automático)
  dashboard_created?: boolean
  dashboard_id?: number
  dashboard_name?: string
  dashboard_template?: string
  message?: string
}

export interface DataSourceData {
  columns: string[]
  rows: any[]
  total_rows: number
}

export interface PaginatedDataSources {
  count: number
  next: string | null
  previous: string | null
  results: DataSource[]
}

export const dataSourceService = {
  // Listar fontes de dados
  async list(): Promise<PaginatedDataSources> {
    const response = await api.get('/datasources/')
    return response.data
  },

  // Obter uma fonte de dados
  async get(id: number): Promise<DataSource> {
    const response = await api.get(`/datasources/${id}/`)
    return response.data
  },

  // Upload CSV
  async uploadCSV(name: string, file: File): Promise<DataSource> {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('file', file)

    const response = await api.post('/datasources/upload_csv/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Conectar Google Sheets
  async connectGoogleSheets(name: string, url: string): Promise<DataSource> {
    const response = await api.post('/datasources/connect_google_sheets/', {
      name,
      url,
    })
    return response.data
  },

  // Sincronizar dados
  async sync(id: number): Promise<DataSource> {
    const response = await api.post(`/datasources/${id}/sync/`)
    return response.data
  },

  // Obter dados da fonte
  async getData(id: number): Promise<DataSourceData> {
    const response = await api.get(`/datasources/${id}/data/`)
    return response.data
  },

  // Deletar fonte de dados
  async delete(id: number): Promise<void> {
    await api.delete(`/datasources/${id}/`)
  },
}
