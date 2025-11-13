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
  Trash2,
} from 'lucide-react'
import UpgradeModal from '../components/UpgradeModal'
import { dashboardService, type Dashboard } from '../services/dashboardService'
import { dataSourceService } from '../services/dataSourceService'
import { organizationService } from '../services/organizationService'
import UsageLimits from '../components/UsageLimits'
import type { Organization } from '../types'

const templates = [
  {
    id: 'sales',
    name: 'Vendas',
    description: 'Acompanhe vendas, ticket médio e conversões',
    icon: TrendingUp,
    color: 'blue',
    plan: 'free',
    available: true,
  },
  {
    id: 'financial',
    name: 'Financeiro',
    description: 'Receitas, despesas e fluxo de caixa',
    icon: DollarSign,
    color: 'green',
    plan: 'free',
    available: true,
  },
  {
    id: 'inventory',
    name: 'Estoque',
    description: 'Controle de produtos e movimentações',
    icon: Package,
    color: 'purple',
    plan: 'pro',
    available: false,
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Crie seu próprio dashboard customizado',
    icon: LayoutDashboard,
    color: 'orange',
    plan: 'pro',
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
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState<1 | 2>(1)
  const [schemaSheets, setSchemaSheets] = useState<{ gid: number; title: string; columns: string[]; sample_rows: any[] }[]>([])
  const [selectedSheet, setSelectedSheet] = useState<number | null>(null)
  const [mapping, setMapping] = useState<{ value?: string; date?: string; product?: string; quantity?: string }>({})

  const currentPlan = organization?.plan ?? 'free'
  const dashboardLimit = organization?.max_dashboards ?? 1
  const dashboardsCount = (organization?.dashboard_count ?? 0) || dashboards.length
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
        setShowWizard(true)
        setWizardStep(1)
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

  const handleDeleteDashboard = async (dashboardId: number, name?: string) => {
    if (!confirm(`Tem certeza que deseja deletar o dashboard "${name || dashboardId}"? Esta ação não pode ser desfeita.`)) {
      return
    }
    try {
      setActionLoading(true)
      await dashboardService.delete(dashboardId)
      const refreshed = await dashboardService.list()
      setDashboards(refreshed.results)
    } catch (err: any) {
      const message =
        err?.response?.data?.error ??
        err?.response?.data?.detail ??
        'Não foi possível deletar o dashboard.'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }

  const loadSchema = async (dsId: number) => {
    try {
      const schema = await dataSourceService.getSchema(dsId)
      setSchemaSheets(schema.sheets || [])
      setSelectedSheet(schema.sheets?.[0]?.gid ?? 0)
    } catch {
      try {
        const data = await dataSourceService.getData(dsId)
        setSchemaSheets([{
          gid: 0,
          title: 'Arquivo',
          columns: data.columns || [],
          sample_rows: (data.rows || []).slice(0, 5),
        }])
        setSelectedSheet(0)
      } catch {
        setSchemaSheets([])
      }
    }
  }

  useEffect(() => {
    if (showWizard && pendingDatasourceId) {
      loadSchema(pendingDatasourceId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWizard, pendingDatasourceId])

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

      {/* Usage Limits */}
      {organization && (
        <div className="mb-8">
          <UsageLimits
            limits={{
              plan: organization.plan,
              max_dashboards: organization.max_dashboards,
              max_datasources: organization.max_datasources,
              max_ai_insights_per_month: organization.max_ai_insights_per_month,
            }}
            usage={{
              dashboards: dashboardsCount,
              datasources: organization.datasource_count ?? 0,
              ai_insights_this_month: (organization as any).ai_insights_used_this_month ?? 0,
            }}
          />
        </div>
      )}

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
              <div className="flex items-center gap-3">
                <Link
                  to="/pricing"
                  className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold text-sm transition-colors"
                >
                  Ver planos
                </Link>
                <button
                  onClick={async () => {
                    try {
                      setActionLoading(true)
                      const res = await dashboardService.cleanupOrphans()
                      const refreshed = await dashboardService.list()
                      setDashboards(refreshed.results)
                      alert(`${res.deleted} painel(is) órfão(s) removido(s).`)
                    } catch (err: any) {
                      const message =
                        err?.response?.data?.error ??
                        err?.response?.data?.detail ??
                        'Não foi possível limpar painéis órfãos.'
                      setError(message)
                    } finally {
                      setActionLoading(false)
                    }
                  }}
                  className="inline-block px-4 py-2 border border-yellow-600 text-yellow-800 dark:text-yellow-300 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800/20 font-semibold text-sm transition-colors"
                >
                  Limpar painéis órfãos
                </button>
              </div>
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
            const locked = (template.plan === 'pro' || template.plan === 'enterprise') && !['pro','enterprise'].includes(currentPlan)

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
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{template.description}</p>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mb-4 ${locked ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'}`}>
                  Plano {template.plan?.toUpperCase() || 'FREE'}
                </span>

                <button
                  onClick={() => {
                    if (locked) {
                      openUpgradeModal(`Template ${template.name}`)
                      return
                    }
                    handleCreateDashboard(template.id)
                  }}
                  disabled={actionLoading}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    template.available
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 cursor-not-allowed'
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

                {/* Excluir dashboard */}
                <button
                  onClick={() => handleDeleteDashboard(dashboard.id as unknown as number, dashboard.name)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                  title="Excluir dashboard"
                >
                  <Trash2 className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400" />
                </button>
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

      {/* Wizard de criação a partir de uma fonte */}
      {showWizard && pendingDatasourceId && (
        <CreateFromSourceWizard
          onClose={() => setShowWizard(false)}
          step={wizardStep}
          setStep={setWizardStep}
          sheets={schemaSheets}
          selectedSheet={selectedSheet}
          setSelectedSheet={setSelectedSheet}
          mapping={mapping}
          setMapping={setMapping}
          templates={templates}
          plan={currentPlan}
          onCreate={async (templateId) => {
            if (!pendingDatasourceId) return
            try {
              setActionLoading(true)
              const templateInfo = templates.find(t => t.id === templateId)
              if (!templateInfo) return
              const baseName = templateInfo.name
              const suffix = dashboardsCount + 1
              const payload: { name: string; template: string; datasources?: number[]; config?: any } = {
                name: `${baseName} ${suffix}`.trim(),
                template: templateId,
                datasources: [pendingDatasourceId],
                config: { column_mapping: mapping, selected_sheet: selectedSheet },
              }
              const created = await dashboardService.create(payload as any)
              const refreshed = await dashboardService.list()
              setDashboards(refreshed.results)
              setShowWizard(false)
              navigate(`/dashboards/${created.id}`)
            } catch (err: any) {
              const message =
                err?.response?.data?.error ??
                err?.response?.data?.detail ??
                'Não foi possível criar o dashboard a partir desta fonte.'
              setError(message)
            } finally {
              setActionLoading(false)
            }
          }}
        />
      )}
    </div>
  )
}

function CreateFromSourceWizard({
  onClose,
  step,
  setStep,
  sheets,
  selectedSheet,
  setSelectedSheet,
  mapping,
  setMapping,
  templates,
  plan,
  onCreate,
}: {
  onClose: () => void
  step: 1 | 2
  setStep: (s: 1 | 2) => void
  sheets: { gid: number; title: string; columns: string[]; sample_rows: any[] }[]
  selectedSheet: number | null
  setSelectedSheet: (gid: number | null) => void
  mapping: { value?: string; date?: string; product?: string; quantity?: string }
  setMapping: (m: { value?: string; date?: string; product?: string; quantity?: string }) => void
  templates: any[]
  plan: string
  onCreate: (templateId: string) => Promise<void>
}) {
  const [localError, setLocalError] = useState<string | null>(null)
  const current = sheets.find(s => s.gid === selectedSheet) || sheets[0]
  const cols = current?.columns || []
  const locked = (tpl: any) => (tpl.plan === 'pro' || tpl.plan === 'enterprise') && !['pro','enterprise'].includes(plan)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Criar dashboard com a fonte
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✖</button>
        </div>
        <div className="p-6">
          {/* Steps */}
          <div className="flex items-center gap-3 mb-6 text-sm">
            <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}>1. Selecionar abas e colunas</span>
            <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}>2. Escolher template</span>
          </div>

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Abas */}
              <div className="md:col-span-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Abas detectadas</h4>
                <div className="space-y-2">
                  {sheets.map(s => (
                    <button
                      key={s.gid}
                      onClick={() => setSelectedSheet(s.gid)}
                      className={`w-full text-left px-3 py-2 rounded-lg border ${selectedSheet === s.gid ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'} text-gray-700 dark:text-gray-200`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mapeamento */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Mapeamento de colunas</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'value', label: 'Valor' },
                    { key: 'date', label: 'Data' },
                    { key: 'product', label: 'Produto' },
                    { key: 'quantity', label: 'Quantidade' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">{f.label}</label>
                      <select
                        value={(mapping as any)[f.key] || ''}
                        onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value || undefined })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Detectar automaticamente</option>
                        {cols.map(c => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Amostra */}
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Amostra</h4>
                  <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          {cols.map(c => (<th key={c} className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase">{c}</th>))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {(current?.sample_rows || []).map((r, idx) => (
                          <tr key={idx}>
                            {cols.map(c => (<td key={c} className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">{String(r?.[c] ?? '')}</td>))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Templates sugeridos</h4>
              {localError && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
                  {localError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map((tpl) => {
                  const lockedTpl = locked(tpl)
                  return (
                    <div key={tpl.id} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                      {lockedTpl && (
                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                          <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full">Plano {tpl.plan?.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <tpl.icon className={`h-5 w-5 text-${tpl.color}-600`} />
                        <h5 className="font-semibold text-gray-900 dark:text-white">{tpl.name}</h5>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{tpl.description}</p>
                      {/* Prévia simples mock */}
                      <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-end gap-1 p-2">
                        {[20, 50, 80, 60, 30].map((h, i) => (
                          <div key={i} className="flex-1 bg-blue-500/70 rounded" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${lockedTpl ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'}`}>
                          {lockedTpl ? `Plano ${tpl.plan}` : 'Disponível'}
                        </span>
                        <button
                          onClick={async () => {
                            setLocalError(null)
                            if (lockedTpl) return
                            try {
                              await onCreate(tpl.id)
                            } catch (err: any) {
                              const msg = err?.response?.data?.error ?? err?.message ?? 'Não foi possível criar o dashboard.'
                              setLocalError(msg)
                            }
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg ${lockedTpl ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                          {lockedTpl ? 'Preview' : 'Criar'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">Fechar</button>
          <div className="flex items-center gap-2">
            {step === 2 && <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">Voltar</button>}
            {step === 1 && <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Continuar</button>}
          </div>
        </div>
      </div>
    </div>
  )
}