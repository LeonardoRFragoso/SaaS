import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Lock, RefreshCw } from 'lucide-react'
import UpgradeModal from '../components/UpgradeModal'

// Mock data - insights gerados pela IA
const mockInsights = [
  {
    id: 1,
    type: 'trend',
    title: 'Crescimento nas Vendas',
    description: 'Suas vendas cresceram 12.5% em relação ao mês anterior. Continue focando nos produtos de maior margem.',
    priority: 'high',
    recommendations: [
      'Aumente o estoque dos 3 produtos mais vendidos',
      'Crie campanhas de remarketing para clientes recentes',
    ],
    created_at: '2024-11-09T10:30:00',
    is_read: false,
  },
  {
    id: 2,
    type: 'alert',
    title: 'Queda na Aquisição de Clientes',
    description: 'Novos clientes caíram 3.2% este mês. Detectamos queda no tráfego orgânico.',
    priority: 'medium',
    recommendations: [
      'Revise suas campanhas do Google Ads',
      'Otimize a página de checkout',
    ],
    created_at: '2024-11-09T09:15:00',
    is_read: false,
  },
]

const insightTypes = {
  trend: { icon: TrendingUp, color: 'blue', label: 'Tendência' },
  alert: { icon: AlertTriangle, color: 'yellow', label: 'Alerta' },
  opportunity: { icon: Lightbulb, color: 'green', label: 'Oportunidade' },
  anomaly: { icon: Sparkles, color: 'purple', label: 'Anomalia' },
}

export default function Insights() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [filter, setFilter] = useState('all')
  
  // Mock - será substituído por dados reais
  const currentPlan = 'free'
  const insightsLimit = 3
  const insightsUsed = 2
  const insightsRemaining = insightsLimit - insightsUsed

  const handleGenerateInsight = () => {
    if (insightsUsed >= insightsLimit) {
      setShowUpgradeModal(true)
      return
    }

    // Gerar novo insight via API
    console.log('Gerando novo insight...')
  }

  const filteredInsights = filter === 'all' 
    ? mockInsights 
    : mockInsights.filter(i => i.type === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Insights IA</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Análises automáticas e recomendações inteligentes
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Plano: <span className="font-semibold capitalize">{currentPlan}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Insights: <span className="font-semibold">{insightsUsed}/{insightsLimit}</span> este mês
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            {insightsRemaining} restantes
          </p>
        </div>
      </div>

      {/* Usage Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Uso de Insights IA</h3>
          <span className="text-sm text-gray-600 dark:text-gray-300">{insightsUsed}/{insightsLimit}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all ${
              insightsUsed >= insightsLimit ? 'bg-red-600' : 
              insightsUsed >= insightsLimit * 0.8 ? 'bg-yellow-600' : 
              'bg-blue-600'
            }`}
            style={{ width: `${(insightsUsed / insightsLimit) * 100}%` }}
          />
        </div>
        {insightsUsed >= insightsLimit ? (
          <div className="bg-yellow-50 dark:bg-gray-900 border border-yellow-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-300 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                  Limite de insights atingido
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                  Você usou todos os {insightsLimit} insights gratuitos deste mês.
                  Faça upgrade para insights ilimitados.
                </p>
                <Link
                  to="/pricing"
                  className="inline-block px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 font-semibold text-sm transition-colors"
                >
                  Ver Planos
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerateInsight}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Gerar Novo Insight</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Todos
        </button>
        {Object.entries(insightTypes).map(([type, config]) => {
          const Icon = config.icon
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{config.label}</span>
            </button>
          )
        })}
      </div>

      {/* Insights List */}
      <div className="space-y-6">
        {filteredInsights.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Sparkles className="h-16 w-16 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum insight encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Conecte uma fonte de dados e gere insights automáticos
            </p>
            <Link
              to="/datasources"
              className="inline-block px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold transition-colors"
            >
              Conectar Dados
            </Link>
          </div>
        ) : (
          filteredInsights.map((insight) => {
            const config = insightTypes[insight.type as keyof typeof insightTypes]
            const Icon = config.icon
            
            return (
              <div
                key={insight.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-${config.color}-500 hover:shadow-md transition-shadow ${
                  !insight.is_read ? 'bg-blue-50 dark:bg-gray-700' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`bg-${config.color}-100 p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 text-${config.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{insight.title}</h3>
                        {!insight.is_read && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                            Novo
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{insight.description}</p>
                      
                      {insight.recommendations.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                            💡 Recomendações:
                          </p>
                          <ul className="space-y-2">
                            {insight.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-blue-600 dark:text-blue-300 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      insight.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
                      insight.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {insight.priority === 'high' ? 'Alta Prioridade' :
                       insight.priority === 'medium' ? 'Média Prioridade' :
                       'Baixa Prioridade'}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {new Date(insight.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Insights ilimitados"
        currentPlan={currentPlan}
        requiredPlan="starter"
      />
    </div>
  )
}
