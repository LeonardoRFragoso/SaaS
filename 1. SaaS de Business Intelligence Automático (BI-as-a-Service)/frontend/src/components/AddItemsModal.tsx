import { X, Plus } from 'lucide-react'
import * as Icons from 'lucide-react'
import { type KPIConfig, type ChartConfig, formatKPIValue, getColorConfig } from '../utils/dynamicRenderer'

interface AddItemsModalProps {
  isOpen: boolean
  onClose: () => void
  availableKPIs: KPIConfig[]
  availableCharts: ChartConfig[]
  visibleKPIs: string[]
  visibleCharts: string[]
  onAddKPI: (key: string) => void
  onAddChart: (key: string) => void
  maxItems?: number
  currentItemCount?: number
}

export default function AddItemsModal({
  isOpen,
  onClose,
  availableKPIs,
  availableCharts,
  visibleKPIs,
  visibleCharts,
  onAddKPI,
  onAddChart,
  maxItems,
  currentItemCount = 0
}: AddItemsModalProps) {
  if (!isOpen) return null
  
  const canAddMore = !maxItems || currentItemCount < maxItems
  const remaining = maxItems ? maxItems - currentItemCount : Infinity
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Adicionar ao Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">
              Selecione KPIs e gráficos para adicionar
              {maxItems && ` (${remaining} espaços disponíveis)`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* KPIs Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 KPIs Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableKPIs.map(kpi => {
                const isVisible = visibleKPIs.includes(kpi.key)
                const IconComponent = (Icons as any)[kpi.icon] || Icons.BarChart3
                const colorConfig = getColorConfig(kpi.category, kpi.color)
                
                return (
                  <div
                    key={kpi.key}
                    className={`border rounded-lg p-4 transition-all ${
                      isVisible
                        ? 'bg-gray-50 border-gray-300'
                        : canAddMore
                        ? 'hover:border-blue-400 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (!isVisible && canAddMore) {
                        onAddKPI(kpi.key)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`${colorConfig.bg} p-2 rounded-lg`}>
                        <IconComponent className={`h-4 w-4 ${colorConfig.text}`} />
                      </div>
                      {isVisible ? (
                        <span className="text-xs font-medium text-gray-500">✓ Adicionado</span>
                      ) : canAddMore ? (
                        <Plus className="h-4 w-4 text-blue-600" />
                      ) : (
                        <span className="text-xs text-red-500">Limite</span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{kpi.label}</h4>
                    <p className="text-lg font-bold text-gray-700">
                      {formatKPIValue(kpi.value, kpi.format)}
                    </p>
                    {kpi.category && (
                      <span className="text-xs text-gray-500 capitalize">{kpi.category}</span>
                    )}
                  </div>
                )
              })}
            </div>
            {availableKPIs.length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhum KPI disponível</p>
            )}
          </div>
          
          {/* Charts Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Gráficos Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCharts.map(chart => {
                const isVisible = visibleCharts.includes(chart.key)
                
                const priorityColors = {
                  high: 'bg-red-100 text-red-700',
                  medium: 'bg-yellow-100 text-yellow-700',
                  low: 'bg-green-100 text-green-700'
                }
                
                return (
                  <div
                    key={chart.key}
                    className={`border rounded-lg p-4 transition-all ${
                      isVisible
                        ? 'bg-gray-50 border-gray-300'
                        : canAddMore
                        ? 'hover:border-blue-400 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (!isVisible && canAddMore) {
                        onAddChart(chart.key)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{chart.label}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 capitalize">{chart.type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[chart.priority]}`}>
                            {chart.priority}
                          </span>
                        </div>
                      </div>
                      {isVisible ? (
                        <span className="text-xs font-medium text-gray-500">✓ Adicionado</span>
                      ) : canAddMore ? (
                        <Plus className="h-5 w-5 text-blue-600" />
                      ) : (
                        <span className="text-xs text-red-500">Limite</span>
                      )}
                    </div>
                    {chart.description && (
                      <p className="text-xs text-gray-600 mt-2">{chart.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {chart.data.length} pontos de dados
                    </p>
                  </div>
                )
              })}
            </div>
            {availableCharts.length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhum gráfico disponível</p>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
