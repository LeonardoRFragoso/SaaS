import { Link } from 'react-router-dom'
import { Check, X, Zap, TrendingUp, Building2, BarChart3 } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: 'para sempre',
    description: 'Perfeito para testar o produto',
    icon: BarChart3,
    color: 'gray',
    features: [
      { text: '1 fonte de dados (5.000 linhas)', included: true },
      { text: '1 dashboard (4 gráficos)', included: true },
      { text: '3 insights de IA por mês', included: true },
      { text: 'Exportar PDF (com marca d\'água)', included: true },
      { text: 'Templates básicos', included: true },
      { text: 'Sincronização manual', included: true },
      { text: '1 usuário', included: true },
      { text: 'Suporte por base de conhecimento', included: true },
      { text: 'Sincronização automática', included: false },
      { text: 'Relatórios agendados', included: false },
      { text: 'Compartilhamento externo', included: false },
      { text: 'API de acesso', included: false },
    ],
    cta: 'Começar Grátis',
    ctaLink: '/register',
    popular: false,
  },
  {
    name: 'Starter',
    price: 'R$ 79',
    period: '/mês',
    description: 'Ideal para pequenos negócios',
    icon: Zap,
    color: 'blue',
    features: [
      { text: '3 fontes de dados (50.000 linhas)', included: true },
      { text: '5 dashboards (10 gráficos cada)', included: true },
      { text: '20 insights de IA por mês', included: true },
      { text: 'Exportar PDF sem marca d\'água', included: true },
      { text: 'Todos os templates', included: true },
      { text: 'Sincronização automática (diária)', included: true },
      { text: '2 usuários', included: true },
      { text: 'Suporte por email (48h)', included: true },
      { text: '3 relatórios agendados', included: true },
      { text: 'Envio por email', included: true },
      { text: 'Detecção de anomalias básica', included: true },
      { text: 'Análise preditiva', included: false },
      { text: 'WhatsApp', included: false },
      { text: 'API de acesso', included: false },
    ],
    cta: 'Começar Teste Grátis',
    ctaLink: '/register?plan=starter',
    popular: true,
    badge: 'Mais Popular',
  },
  {
    name: 'Pro',
    price: 'R$ 199',
    period: '/mês',
    description: 'Para empresas em crescimento',
    icon: TrendingUp,
    color: 'purple',
    features: [
      { text: '10 fontes de dados (500.000 linhas)', included: true },
      { text: 'Dashboards ilimitados', included: true },
      { text: 'Insights de IA ilimitados', included: true },
      { text: 'Análise preditiva (forecasting)', included: true },
      { text: 'Detecção de anomalias avançada', included: true },
      { text: 'Sincronização em tempo real (1h)', included: true },
      { text: '10 usuários', included: true },
      { text: 'Suporte prioritário por chat (4h)', included: true },
      { text: 'Relatórios ilimitados', included: true },
      { text: 'Envio por email + WhatsApp', included: true },
      { text: 'Compartilhamento externo', included: true },
      { text: 'API de acesso aos dados', included: true },
      { text: 'White-label (sem marca)', included: true },
      { text: 'Dashboards customizados', included: true },
    ],
    cta: 'Começar Teste Grátis',
    ctaLink: '/register?plan=pro',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'R$ 499',
    period: '/mês',
    description: 'Para grandes corporações',
    icon: Building2,
    color: 'indigo',
    features: [
      { text: 'Fontes de dados ilimitadas', included: true },
      { text: 'Dados ilimitados', included: true },
      { text: 'IA avançada ilimitada', included: true },
      { text: 'Modelos de ML customizados', included: true },
      { text: 'Sincronização em tempo real (15min)', included: true },
      { text: 'Usuários ilimitados', included: true },
      { text: 'Suporte 24/7 por telefone', included: true },
      { text: 'Gerente de conta dedicado', included: true },
      { text: 'Onboarding personalizado', included: true },
      { text: 'Treinamento da equipe', included: true },
      { text: 'SSO (Single Sign-On)', included: true },
      { text: 'Permissões granulares (RBAC)', included: true },
      { text: 'SLA de 99.9% uptime', included: true },
      { text: 'Compliance (LGPD, SOC2, ISO)', included: true },
    ],
    cta: 'Falar com Vendas',
    ctaLink: '/contact-sales',
    popular: false,
  },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Escolha o plano ideal para você
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comece grátis e faça upgrade quando precisar de mais recursos.
            Todos os planos incluem 14 dias de teste grátis.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon
            const borderColor = plan.popular ? 'border-blue-500' : 'border-gray-200'
            const bgColor = plan.popular ? 'bg-blue-50' : 'bg-white'
            
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl shadow-xl ${bgColor} border-2 ${borderColor} p-8 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-${plan.color}-100 mb-4`}>
                    <Icon className={`h-8 w-8 text-${plan.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  to={plan.ctaLink}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Perguntas Frequentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Posso mudar de plano depois?</h3>
              <p className="text-gray-600">
                Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As mudanças são aplicadas imediatamente.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Como funciona o teste grátis?</h3>
              <p className="text-gray-600">
                14 dias completos com todos os recursos do plano escolhido. Sem cartão de crédito necessário.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">
                Sim, sem multas ou taxas. Você pode cancelar sua assinatura a qualquer momento pelo painel.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Há desconto para pagamento anual?</h3>
              <p className="text-gray-600">
                Sim! Pagando anualmente você ganha 2 meses grátis (20% de desconto).
              </p>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Garantia de 30 dias</h2>
          <p className="text-xl text-blue-100 mb-6">
            Se você não ficar satisfeito com o InsightFlow BI, devolvemos 100% do seu dinheiro.
            Sem perguntas, sem complicações.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold text-lg transition-colors"
          >
            Começar Agora
          </Link>
        </div>
      </div>
    </div>
  )
}
