import { X } from 'lucide-react'
import * as Icons from 'lucide-react'
import { type KPIConfig, formatKPIValue, getColorConfig } from '../utils/dynamicRenderer'

interface DynamicKPIProps {
  kpi: KPIConfig
  onRemove?: () => void
  showRemove?: boolean
}

export default function DynamicKPI({ kpi, onRemove, showRemove = false }: DynamicKPIProps) {
  // Obter o ícone dinamicamente
  const IconComponent = (Icons as any)[kpi.icon] || Icons.BarChart3
  const colorConfig = getColorConfig(kpi.category, kpi.color)
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 relative group">
      {/* Botão de remover (aparece no hover) */}
      {showRemove && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
          title="Remover KPI"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      )}
      
      {/* Ícone */}
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorConfig.bg} p-3 rounded-lg`}>
          <IconComponent className={`h-6 w-6 ${colorConfig.text}`} />
        </div>
      </div>
      
      {/* Label */}
      <h3 className="text-gray-600 text-sm font-medium mb-1">{kpi.label}</h3>
      
      {/* Valor */}
      <p className="text-2xl font-bold text-gray-900">
        {formatKPIValue(kpi.value, kpi.format)}
      </p>
      
      {/* Descrição (se houver) */}
      {kpi.description && (
        <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
      )}
    </div>
  )
}
