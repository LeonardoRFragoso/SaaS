import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Package,
  Lock,
  RefreshCw,
  Plus,
  ArrowRight,
} from 'lucide-react'
import UpgradeModal from '../components/UpgradeModal'
import { dashboardService, type Dashboard } from '../services/dashboardService'
import { organizationService } from '../services/organizationService'
import type { Organization } from '../types'

const templates = [
  {
    id: 'sales',
    name: 'Vendas',
    description: 'Acompanhe vendas, ticket médio e conversões',
    icon: TrendingUp,
    color: 'blue',
    available: true,
  },
  {
    id: 'financial',
    name: 'Financeiro',
    description: 'Receitas, despesas e fluxo de caixa',
    icon: DollarSign,
    color: 'green',
    available: true,
  },
  {
    id: 'inventory',
    name: 'Estoque',
    description: 'Controle de produtos e movimentações',
    icon: Package,
    color: 'purple',
    available: false,
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Crie seu próprio dashboard customizado',
    icon: LayoutDashboard,
    color: 'orange',
    available: false,
  },
]

const templateDisplayName = templates.reduce<Record<string, string>>((acc, template) => {
  acc[template.id] = template.name
  return acc
}, {})

export default function Dashboards() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState<string>('Criar dashboards avançados')
  const [pendingDatasourceId, setPendingDatasourceId] = useState<number | null>(null)

  const currentPlan = organization?.plan ?? 'free'
  const dashboardLimit = organization?.max_dashboards ?? 1
  const dashboardsCount = dashboards.length
  const unlimitedPlan = dashboardLimit >= 999999
  const hasReachedLimit = !unlimitedPlan && dashboardsCount >= dashboardLimit

  const dashboardsTemplatesInUse = useMemo(
    () => new Set(dashboards.map((dashboard) => dashboard.template)),
    [dashboards]
  )

  useEffect(() => {
    const initialise = async () => {
      try {
        setLoading(true)
        const [dashResponse, orgResponse] = await Promise.allSettled([
          dashboardService.list(),
          organizationService.getMyOrganization(),
        ])

        if (dashResponse.status === 'fulfilled') {
          setDashboards(dashResponse.value.results)
        } else {
          setError('Não foi possível carregar a lista de dashboards.')
        }

        if (orgResponse.status === 'fulfilled') {
          setOrganization(orgResponse.value)
        }
      } catch (err) {
        setError('Ocorreu um erro ao carregar seus dashboards. Tente novamente em instantes.')
      } finally {
        setLoading(false)
      }
    }

    initialise()
  }, [])

  useEffect(() => {
    const datasourceParam = searchParams.get('datasource')
    if (datasourceParam) {
      const parsed = Number(datasourceParam)
      if (!Number.isNaN(parsed)) {
        setPendingDatasourceId(parsed)
      }
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openUpgradeModal = (feature: string) => {
    setUpgradeFeature(feature)
    setShowUpgradeModal(true)
  }

  const handleCreateDashboard = async (templateId: string) => {
    const templateInfo = templates.find((item) => item.id === templateId)
    if (!templateInfo) {
      return
    }

    if (!templateInfo.available) {
      openUpgradeModal(`Template ${templateInfo.name}`)
      return
    }

    if (hasReachedLimit) {
      openUpgradeModal('Criar mais dashboards')
      return
    }

    try {
      setActionLoading(true)
      const baseName = templateDisplayName[templateId] || 'Dashboard'
      const suffix = dashboardsCount + 1
      const payload: { name: string; template: string; datasources?: number[] } = {
        name: `${baseName} ${suffix}`.trim(),
        template: templateId,
      }

      if (pendingDatasourceId) {
        payload.datasources = [pendingDatasourceId]
      }

      const created = await dashboardService.create(payload)
      setPendingDatasourceId(null)

      const refreshed = await dashboardService.list()
      setDashboards(refreshed.results)

      navigate(`/dashboards/${created.id}`)
    } catch (err: any) {
      const message =
        err?.response?.data?.error ??
        err?.response?.data?.detail ??
        'Não foi possível criar o dashboard. Verifique os dados e tente novamente.'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleChangeTemplate = async (dashboardId: number, templateId: string) => {
    try {
      setActionLoading(true)
      await dashboardService.changeTemplate(dashboardId, templateId)
      const refreshed = await dashboardService.list()
      setDashboards(refreshed.results)
    } catch (err: any) {
      const message =
        err?.response?.data?.error ??
        err?.response?.data?.detail ??
        'Não foi possível alterar o template no momento. Tente novamente em instantes.'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Carregando dashboards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboards</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Visualize e organize seus dashboards conectados às fontes de dados
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Plano: <span className="font-semibold capitalize">{currentPlan}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Dashboards: <span className="font-semibold">{dashboardsCount}</span>
            <span className="text-xs text-gray-500 ml-1">/ {unlimitedPlan ? '∞' : dashboardLimit}</span>
          </p>
        </div>
      </div>

      {pendingDatasourceId && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Plus className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Fonte pronta para virar dashboard
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Escolha um template abaixo para gerar o painel automático com a fonte #{pendingDatasourceId}.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {hasReachedLimit && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                Limite de dashboards atingido
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                Faça upgrade para criar novos dashboards ou altere o template de um painel existente.
              </p>
              <Link
                to="/pricing"
                className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold text-sm transition-colors"
              >
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      )}

      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Escolha um template</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => {
            const Icon = template.icon
            const isActive = dashboardsTemplatesInUse.has(template.id)

            return (
              <div
                key={template.id}
                className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-2 ${
                  isActive ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-400/30' : 'border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Em uso
                    </span>
                  </div>
                )}

                {!template.available && (
                  <div className="absolute top-4 right-4">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                )}

                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-${template.color}-100 dark:bg-${template.color}-500/20`}
                >
                  <Icon className={`h-6 w-6 text-${template.color}-600 dark:text-${template.color}-400`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{template.description}</p>

                <button
                  onClick={() => handleCreateDashboard(template.id)}
                  disabled={actionLoading}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    template.available
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    {template.available
                      ? pendingDatasourceId
                        ? 'Criar com a fonte'
                        : 'Criar dashboard'
                      : 'Requer upgrade'}
                  </span>
                </button>

                {!template.available && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Disponível nos planos Starter, Pro e Enterprise.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seus dashboards</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Acesse ou altere rapidamente seus painéis
            </p>
          </div>
          <Link
            to="/datasources"
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Gerenciar fontes</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {dashboards.length === 0 ? (
          <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
            <LayoutDashboard className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum dashboard criado
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Escolha um template acima ou conecte uma fonte de dados para gerar seu primeiro painel.
            </p>
            <Link
              to="/datasources"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Conectar dados</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex items-start md:items-center space-x-4 flex-1">
                  <div className="bg-blue-100 dark:bg-blue-500/20 p-3 rounded-lg">
                    <LayoutDashboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{dashboard.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Template: <span className="font-semibold capitalize">{dashboard.template}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Fontes conectadas: {dashboard.datasources.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate(`/dashboards/${dashboard.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Abrir
                  </button>

                  <div className="text-right">
                    <button
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        const nextTemplate = dashboard.template === 'sales' ? 'financial' : 'sales'
                        handleChangeTemplate(dashboard.id, nextTemplate)
                      }}
                      disabled={actionLoading}
                    >
                      Alterar template
                    </button>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Alterna entre Vendas e Financeiro
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        currentPlan={currentPlan}
        requiredPlan="starter"
      />
    </div>
  )
}
