import { useState } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

interface ColumnMappingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (mapping: Record<string, string>) => void
  availableColumns: string[]
  templateType: 'sales' | 'financial'
  suggestedMapping: Record<string, string>
}

const TEMPLATE_REQUIRED_FIELDS = {
  sales: {
    date: { label: 'Data da Venda', required: true, type: 'date' },
    revenue: { label: 'Valor/Receita', required: true, type: 'number' },
    customer: { label: 'Cliente', required: false, type: 'text' },
    product: { label: 'Produto', required: false, type: 'text' },
    quantity: { label: 'Quantidade', required: false, type: 'number' },
  },
  financial: {
    date: { label: 'Data/Período', required: true, type: 'date' },
    revenue: { label: 'Receita', required: true, type: 'number' },
    expense: { label: 'Despesa', required: true, type: 'number' },
    category: { label: 'Categoria', required: false, type: 'text' },
  },
}

export default function ColumnMappingModal({
  isOpen,
  onClose,
  onConfirm,
  availableColumns,
  templateType,
  suggestedMapping,
}: ColumnMappingModalProps) {
  const [mapping, setMapping] = useState<Record<string, string>>(suggestedMapping)
  
  if (!isOpen) return null

  const fields = TEMPLATE_REQUIRED_FIELDS[templateType]
  const requiredFields = Object.entries(fields).filter(([_, config]) => config.required)
  const allRequiredMapped = requiredFields.every(([field]) => mapping[field])

  const handleConfirm = () => {
    if (allRequiredMapped) {
      onConfirm(mapping)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Mapear Colunas da Planilha
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Conecte as colunas da sua planilha aos campos do template{' '}
              <span className="font-semibold capitalize">{templateType === 'sales' ? 'Vendas' : 'Financeiro'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 <strong>Dica:</strong> Detectamos automaticamente as colunas mais prováveis. 
            Revise e ajuste conforme necessário.
          </p>
        </div>

        {/* Mapping Fields */}
        <div className="space-y-4 mb-6">
          {Object.entries(fields).map(([field, config]) => {
            const isMapped = !!mapping[field]
            const isRequired = config.required

            return (
              <div
                key={field}
                className={`border-2 rounded-lg p-4 transition-all ${
                  isMapped
                    ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                    : isRequired
                    ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {config.label}
                      </h3>
                      {isRequired && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full font-semibold">
                          Obrigatório
                        </span>
                      )}
                      {isMapped && (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      )}
                      {!isMapped && isRequired && (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tipo: {config.type === 'date' ? 'Data' : config.type === 'number' ? 'Número' : 'Texto'}
                    </p>
                  </div>
                </div>

                <select
                  value={mapping[field] || ''}
                  onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Selecione uma coluna --</option>
                  {availableColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>

        {/* Validation Message */}
        {!allRequiredMapped && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-900 dark:text-yellow-200">
              ⚠️ Preencha todos os campos obrigatórios para continuar
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors bg-white dark:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!allRequiredMapped}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Mapeamento
          </button>
        </div>
      </div>
    </div>
  )
}
