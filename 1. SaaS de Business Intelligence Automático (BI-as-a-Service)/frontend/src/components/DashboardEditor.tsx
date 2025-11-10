import { useState } from 'react'
import { Settings, Plus, Trash2, Edit2, Eye, EyeOff, GripVertical, Save } from 'lucide-react'

interface KPI {
  id: string
  label: string
  column: string
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max'
  format: 'currency' | 'number' | 'percentage'
  visible: boolean
  order: number
}

interface Chart {
  id: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'area'
  xAxis: string
  yAxis: string
  aggregation: 'sum' | 'avg' | 'count'
  visible: boolean
  order: number
}

interface DashboardConfig {
  kpis: KPI[]
  charts: Chart[]
  columnMapping: Record<string, string>
}

interface DashboardEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: DashboardConfig) => void
  initialConfig: DashboardConfig
  availableColumns: string[]
  detectedMapping: Record<string, string>
}

export default function DashboardEditor({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  availableColumns,
  detectedMapping,
}: DashboardEditorProps) {
  const [config, setConfig] = useState<DashboardConfig>(initialConfig)
  const [activeTab, setActiveTab] = useState<'mapping' | 'kpis' | 'charts'>('mapping')
  const [editingKPI, setEditingKPI] = useState<string | null>(null)
  const [editingChart, setEditingChart] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  const addKPI = () => {
    const newKPI: KPI = {
      id: `kpi-${Date.now()}`,
      label: 'Novo KPI',
      column: availableColumns[0] || '',
      aggregation: 'sum',
      format: 'number',
      visible: true,
      order: config.kpis.length,
    }
    setConfig({ ...config, kpis: [...config.kpis, newKPI] })
  }

  const updateKPI = (id: string, updates: Partial<KPI>) => {
    setConfig({
      ...config,
      kpis: config.kpis.map((kpi) => (kpi.id === id ? { ...kpi, ...updates } : kpi)),
    })
  }

  const deleteKPI = (id: string) => {
    setConfig({
      ...config,
      kpis: config.kpis.filter((kpi) => kpi.id !== id),
    })
  }

  const addChart = () => {
    const newChart: Chart = {
      id: `chart-${Date.now()}`,
      title: 'Novo Gráfico',
      type: 'bar',
      xAxis: availableColumns[0] || '',
      yAxis: availableColumns[1] || '',
      aggregation: 'sum',
      visible: true,
      order: config.charts.length,
    }
    setConfig({ ...config, charts: [...config.charts, newChart] })
  }

  const updateChart = (id: string, updates: Partial<Chart>) => {
    setConfig({
      ...config,
      charts: config.charts.map((chart) => (chart.id === id ? { ...chart, ...updates } : chart)),
    })
  }

  const deleteChart = (id: string) => {
    setConfig({
      ...config,
      charts: config.charts.filter((chart) => chart.id !== id),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Editor de Dashboard
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Personalize como seus dados são interpretados e exibidos
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setActiveTab('mapping')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'mapping'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              📊 Mapeamento de Colunas
            </button>
            <button
              onClick={() => setActiveTab('kpis')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'kpis'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              📈 KPIs ({config.kpis.length})
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'charts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              📉 Gráficos ({config.charts.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab: Mapeamento */}
          {activeTab === 'mapping' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  💡 <strong>Interpretação Automática:</strong> Detectamos automaticamente como interpretar suas colunas.
                  Revise e ajuste conforme necessário.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(detectedMapping).map(([field, column]) => (
                  <div
                    key={field}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-green-500 dark:border-green-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {field.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                        Detectado
                      </span>
                    </div>
                    <select
                      value={config.columnMapping[field] || column}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          columnMapping: { ...config.columnMapping, [field]: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {availableColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: KPIs */}
          {activeTab === 'kpis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Configure os indicadores principais que aparecem no topo do dashboard
                </p>
                <button
                  onClick={addKPI}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar KPI</span>
                </button>
              </div>

              {config.kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start space-x-4">
                    <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-move" />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nome do KPI
                        </label>
                        <input
                          type="text"
                          value={kpi.label}
                          onChange={(e) => updateKPI(kpi.id, { label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Coluna
                        </label>
                        <select
                          value={kpi.column}
                          onChange={(e) => updateKPI(kpi.id, { column: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Agregação
                        </label>
                        <select
                          value={kpi.aggregation}
                          onChange={(e) =>
                            updateKPI(kpi.id, { aggregation: e.target.value as KPI['aggregation'] })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="sum">Soma</option>
                          <option value="avg">Média</option>
                          <option value="count">Contagem</option>
                          <option value="min">Mínimo</option>
                          <option value="max">Máximo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Formato
                        </label>
                        <select
                          value={kpi.format}
                          onChange={(e) =>
                            updateKPI(kpi.id, { format: e.target.value as KPI['format'] })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="number">Número</option>
                          <option value="currency">Moeda (R$)</option>
                          <option value="percentage">Porcentagem (%)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateKPI(kpi.id, { visible: !kpi.visible })}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        {kpi.visible ? (
                          <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteKPI(kpi.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {config.kpis.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>Nenhum KPI configurado. Clique em "Adicionar KPI" para começar.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Gráficos */}
          {activeTab === 'charts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Configure os gráficos que aparecem no dashboard
                </p>
                <button
                  onClick={addChart}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Gráfico</span>
                </button>
              </div>

              {config.charts.map((chart) => (
                <div
                  key={chart.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start space-x-4">
                    <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-move" />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Título
                        </label>
                        <input
                          type="text"
                          value={chart.title}
                          onChange={(e) => updateChart(chart.id, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tipo
                        </label>
                        <select
                          value={chart.type}
                          onChange={(e) =>
                            updateChart(chart.id, { type: e.target.value as Chart['type'] })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="line">Linha</option>
                          <option value="bar">Barra</option>
                          <option value="area">Área</option>
                          <option value="pie">Pizza</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Eixo X
                        </label>
                        <select
                          value={chart.xAxis}
                          onChange={(e) => updateChart(chart.id, { xAxis: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Eixo Y
                        </label>
                        <select
                          value={chart.yAxis}
                          onChange={(e) => updateChart(chart.id, { yAxis: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Agregação
                        </label>
                        <select
                          value={chart.aggregation}
                          onChange={(e) =>
                            updateChart(chart.id, { aggregation: e.target.value as Chart['aggregation'] })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="sum">Soma</option>
                          <option value="avg">Média</option>
                          <option value="count">Contagem</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateChart(chart.id, { visible: !chart.visible })}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        {chart.visible ? (
                          <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteChart(chart.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {config.charts.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>Nenhum gráfico configurado. Clique em "Adicionar Gráfico" para começar.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {config.kpis.filter((k) => k.visible).length} KPIs e {config.charts.filter((c) => c.visible).length}{' '}
              gráficos visíveis
            </p>
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>Salvar Configuração</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
