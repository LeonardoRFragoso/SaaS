import { AlertCircle, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

interface UsageLimitsProps {
  limits: {
    plan: string
    max_dashboards: number
    max_datasources: number
    max_ai_insights_per_month: number
  }
  usage: {
    dashboards: number
    datasources: number
    ai_insights_this_month: number
  }
}

export default function UsageLimits({ limits, usage }: UsageLimitsProps) {
  const getPercentage = (used: number, max: number) => {
    if (max >= 999999) return 0 // Unlimited
    return Math.min((used / max) * 100, 100)
  }

  const getColorClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600'
    if (percentage >= 70) return 'bg-yellow-600'
    return 'bg-blue-600'
  }

  const items = [
    {
      label: 'Dashboards',
      used: usage.dashboards,
      max: limits.max_dashboards,
      unlimited: limits.max_dashboards >= 999999,
    },
    {
      label: 'Fontes de Dados',
      used: usage.datasources,
      max: limits.max_datasources,
      unlimited: limits.max_datasources >= 999999,
    },
    {
      label: 'Insights IA (este mês)',
      used: usage.ai_insights_this_month,
      max: limits.max_ai_insights_per_month,
      unlimited: limits.max_ai_insights_per_month >= 999999,
    },
  ]

  const hasHighUsage = items.some(
    (item) => !item.unlimited && getPercentage(item.used, item.max) >= 80
  )

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Uso do Plano</h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
          {limits.plan}
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const percentage = getPercentage(item.used, item.max)
          const colorClass = getColorClass(percentage)

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm text-gray-600">
                  {item.unlimited ? (
                    <span className="text-green-600 font-semibold">Ilimitado</span>
                  ) : (
                    <>
                      {item.used} / {item.max}
                    </>
                  )}
                </span>
              </div>
              {!item.unlimited && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hasHighUsage && limits.plan === 'free' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-900 mb-1">
                Você está próximo do limite
              </p>
              <p className="text-sm text-yellow-800 mb-3">
                Faça upgrade para continuar usando todos os recursos sem interrupções.
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center text-sm font-semibold text-yellow-900 hover:text-yellow-800"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Ver Planos
              </Link>
            </div>
          </div>
        </div>
      )}

      {limits.plan === 'free' && !hasHighUsage && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Precisa de mais recursos?
          </p>
          <Link
            to="/pricing"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors"
          >
            Fazer Upgrade
          </Link>
        </div>
      )}
    </div>
  )
}
