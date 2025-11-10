import { X, Zap, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  currentPlan: string
  requiredPlan: string
}

const planBenefits = {
  starter: [
    '3 fontes de dados',
    '5 dashboards',
    '20 insights IA/mês',
    'Sincronização automática',
    'Exportar sem marca d\'água',
  ],
  pro: [
    '10 fontes de dados',
    'Dashboards ilimitados',
    'Insights IA ilimitados',
    'Análise preditiva',
    'WhatsApp + API',
    'White-label',
  ],
  enterprise: [
    'Recursos ilimitados',
    'IA avançada customizada',
    'Suporte 24/7',
    'Gerente de conta dedicado',
    'SSO e compliance',
  ],
}

const planPrices = {
  starter: 'R$ 79/mês',
  pro: 'R$ 199/mês',
  enterprise: 'R$ 499/mês',
}

export default function UpgradeModal({
  isOpen,
  onClose,
  feature,
  currentPlan,
  requiredPlan,
}: UpgradeModalProps) {
  if (!isOpen) return null

  const benefits = planBenefits[requiredPlan as keyof typeof planBenefits] || []
  const price = planPrices[requiredPlan as keyof typeof planPrices] || ''

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Zap className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Recurso Premium
        </h2>

        {/* Feature Message */}
        <p className="text-center text-gray-600 mb-6">
          <span className="font-semibold">{feature}</span> está disponível apenas no plano{' '}
          <span className="font-semibold text-blue-600 capitalize">{requiredPlan}</span>
        </p>

        {/* Current Plan */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Seu plano atual:</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{currentPlan}</p>
        </div>

        {/* Benefits */}
        <div className="mb-6">
          <p className="font-semibold text-gray-900 mb-3">
            Com o plano {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} você terá:
          </p>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-blue-800 mb-1">A partir de</p>
          <p className="text-3xl font-bold text-blue-600">{price}</p>
          <p className="text-sm text-blue-700 mt-1">14 dias de teste grátis</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-3">
          <Link
            to={`/pricing?upgrade=${requiredPlan}`}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Fazer Upgrade Agora
          </Link>
          <Link
            to="/pricing"
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
          >
            Ver Todos os Planos
          </Link>
          <button
            onClick={onClose}
            className="w-full text-gray-600 py-2 hover:text-gray-900 transition-colors"
          >
            Continuar no plano {currentPlan}
          </button>
        </div>
      </div>
    </div>
  )
}
