import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, DollarSign, Package, Lock, Eye, AlertTriangle, Database } from 'lucide-react'
import UpgradeModal from '../components/UpgradeModal'

// Mock data - será substituído por dados reais da API
const mockDashboards = [
  {
    id: 1,
    name: 'Dashboard de Vendas',
    template: 'sales',
    created_at: '2024-11-01',
    last_updated: '2024-11-09',
    charts_count: 4,
  },
]

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
    available: false, // Requer upgrade
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Crie seu próprio dashboard customizado',
    icon: LayoutDashboard,
    color: 'orange',
    available: false, // Requer upgrade
  },
]

export default function Dashboards() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templateToChange, setTemplateToChange] = useState('')
  const [currentTemplate, setCurrentTemplate] = useState(mockDashboards.length > 0 ? mockDashboards[0].template : '')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<string | null>(null)
  
  // Mock - será substituído por dados reais
  const currentPlan = 'free'
  const dashboardLimit = 1
  const dashboardsCount = mockDashboards.length
  const existingTemplate = currentTemplate

  // Detectar se veio de uma fonte de dados
  useEffect(() => {
    const datasourceId = searchParams.get('datasource')
    if (datasourceId) {
      setSelectedDataSourceId(datasourceId)
      setShowCreateModal(true)
      // Limpar o parâmetro da URL
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const handlePreviewTemplate = (template: string) => {
    setSelectedTemplate(template)
    setShowPreviewModal(true)
  }

  const handleCreateDashboard = (template: string, available: boolean) => {
    if (!available) {
      setSelectedTemplate(template)
      setShowUpgradeModal(true)
      return
    }

    if (dashboardsCount >= dashboardLimit) {
      // Já tem dashboard, perguntar se quer trocar template
      if (existingTemplate !== template) {
        setTemplateToChange(template)
        setShowConfirmModal(true)
      }
      return
    }

    // Criar novo dashboard
    createDashboard(template)
  }

  const createDashboard = (template: string) => {
    // TODO: Integração com API para criar dashboard
    console.log('Criando dashboard com template:', template)
    
    // Por enquanto, apenas mostra mensagem de sucesso
    alert(`Dashboard "${template}" será criado após conectar uma fonte de dados!`)
    
    // Redirecionar para conectar dados
    window.location.href = '/datasources'
  }

  const handleConfirmChange = () => {
    // TODO: Integração com API para atualizar template do dashboard
    console.log('Trocando template para:', templateToChange)
    
    // Atualizar o template atual no estado
    setCurrentTemplate(templateToChange)
    setShowConfirmModal(false)
    
    // Mostrar mensagem de sucesso
    const templateNames: Record<string, string> = {
      sales: 'Vendas',
      financial: 'Financeiro',
      inventory: 'Estoque',
      custom: 'Personalizado',
    }
    
    alert(`Template alterado para "${templateNames[templateToChange]}" com sucesso!`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboards</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Visualize seus dados em dashboards interativos
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Plano: <span className="font-semibold capitalize">{currentPlan}</span>
          </p>
          <p className="text-sm text-gray-600">
            Dashboards: <span className="font-semibold">{dashboardsCount}/{dashboardLimit}</span>
          </p>
        </div>
      </div>

      {/* Limit Warning */}
      {dashboardsCount >= dashboardLimit && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                Limite de dashboards atingido
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                Você atingiu o limite de {dashboardLimit} dashboard no plano Free.
                Faça upgrade para criar mais dashboards.
              </p>
              <Link
                to="/pricing"
                className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold text-sm transition-colors"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Escolha um Template
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => {
            const Icon = template.icon
            const isCurrentTemplate = existingTemplate === template.id
            return (
              <div
                key={template.id}
                className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all ${
                  isCurrentTemplate ? 'border-2 border-blue-500 ring-2 ring-blue-200' : 'border-2 border-transparent'
                } ${!template.available && 'opacity-60'}`}
              >
                {/* Current Template Badge */}
                {isCurrentTemplate && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Em Uso
                    </span>
                  </div>
                )}

                {/* Lock Icon */}
                {!template.available && (
                  <div className="absolute top-4 right-4">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                )}

                {/* Icon */}
                <div className={`bg-${template.color}-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 text-${template.color}-600`} />
                </div>

                {/* Info */}
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{template.description}</p>

                {/* Badge */}
                {!template.available && (
                  <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold mb-4">
                    Plano Pro
                  </span>
                )}

                {/* Actions */}
                <div className="flex space-x-2 mt-4">
                  {template.available && (
                    <>
                      <button
                        onClick={() => handlePreviewTemplate(template.id)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Preview</span>
                      </button>
                      <button
                        onClick={() => handleCreateDashboard(template.id, template.available)}
                        disabled={isCurrentTemplate}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          isCurrentTemplate
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isCurrentTemplate ? 'Atual' : dashboardsCount >= dashboardLimit ? 'Trocar' : 'Usar'}
                      </button>
                    </>
                  )}
                  {!template.available && (
                    <button
                      onClick={() => handleCreateDashboard(template.id, template.available)}
                      className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium text-sm cursor-not-allowed"
                    >
                      Requer Upgrade
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Existing Dashboards */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Meus Dashboards
        </h2>
        {mockDashboards.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <LayoutDashboard className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum dashboard criado
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Escolha um template acima para criar seu primeiro dashboard
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockDashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-500/20 p-3 rounded-lg">
                      <LayoutDashboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{dashboard.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{dashboard.charts_count} gráficos</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Atualizado em {new Date(dashboard.last_updated).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Botões de ação */}
                <div className="flex space-x-3">
                  <Link
                    to={`/dashboards/${dashboard.id}`}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Visualizar Dashboard</span>
                  </Link>
                  <Link
                    to={`/datasources`}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    <Database className="h-4 w-4" />
                    <span>Gerenciar Dados</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setShowPreviewModal(false)}
          onUse={() => {
            setShowPreviewModal(false)
            handleCreateDashboard(selectedTemplate, true)
          }}
        />
      )}

      {/* Confirm Change Modal */}
      {showConfirmModal && (
        <ConfirmChangeModal
          currentTemplate={existingTemplate || ''}
          newTemplate={templateToChange}
          onConfirm={handleConfirmChange}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Create Dashboard Modal */}
      {showCreateModal && selectedDataSourceId && (
        <CreateDashboardModal
          dataSourceId={selectedDataSourceId}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedDataSourceId(null)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setSelectedDataSourceId(null)
            // Recarregar dashboards
            window.location.reload()
          }}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={selectedTemplate ? `Template ${selectedTemplate}` : 'Criar mais dashboards'}
        currentPlan={currentPlan}
        requiredPlan="starter"
      />
    </div>
  )
}

// Template Preview Modal
function TemplatePreviewModal({ template, onClose, onUse }: { template: string; onClose: () => void; onUse: () => void }) {
  const templateData = {
    sales: {
      name: 'Vendas',
      description: 'Dashboard focado em métricas de vendas e conversão',
      features: [
        'Evolução de vendas ao longo do tempo',
        'Taxa de conversão e funil de vendas',
        'Ticket médio e análise de produtos',
        'Comparativo de períodos',
      ],
      kpis: [
        { label: 'Faturamento', value: 'R$ 168.000', change: '+12.5%', positive: true },
        { label: 'Novos Clientes', value: '127', change: '-3.2%', positive: false },
        { label: 'Ticket Médio', value: 'R$ 1.323', change: '+15.8%', positive: true },
      ],
    },
    financial: {
      name: 'Financeiro',
      description: 'Controle completo de receitas e despesas',
      features: [
        'Receitas vs Despesas',
        'Fluxo de caixa mensal',
        'Análise de lucratividade',
        'Projeções financeiras',
      ],
      kpis: [
        { label: 'Receitas', value: 'R$ 168.000', change: '+8.3%', positive: true },
        { label: 'Despesas', value: 'R$ 98.000', change: '+2.1%', positive: false },
        { label: 'Lucro Líquido', value: 'R$ 70.000', change: '+18.5%', positive: true },
      ],
    },
  }

  const data = templateData[template as keyof typeof templateData]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{data.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{data.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-2xl text-gray-600 dark:text-gray-300">×</span>
            </button>
          </div>

          {/* Preview Dashboard */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {/* Mini KPIs */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {data.kpis.map((kpi, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{kpi.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{kpi.value}</p>
                    <p className={`text-xs font-semibold ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mini Charts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-40 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-24 bg-gradient-to-t from-blue-200 to-blue-400 rounded mb-2 mx-auto"></div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Gráfico de Evolução</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-40 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-end space-x-2 justify-center mb-2">
                      <div className="w-8 h-16 bg-green-400 rounded"></div>
                      <div className="w-8 h-20 bg-green-400 rounded"></div>
                      <div className="w-8 h-12 bg-red-400 rounded"></div>
                      <div className="w-8 h-24 bg-green-400 rounded"></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Gráfico Comparativo</p>
                  </div>
                </div>
              </div>

              {/* Preview Label */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  ✨ Prévia do template - Dados reais serão exibidos após conectar sua fonte
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">O que está incluído:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors bg-white dark:bg-gray-700"
            >
              Fechar
            </button>
            <button
              onClick={onUse}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Usar Este Template
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Create Dashboard Modal
function CreateDashboardModal({ dataSourceId, onClose, onSuccess }: {
  dataSourceId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!selectedTemplate) {
      alert('Por favor, selecione um template')
      return
    }

    setLoading(true)
    
    // TODO: Integrar com API para criar dashboard
    console.log('Criando dashboard:', { dataSourceId, template: selectedTemplate })
    
    // Simular criação
    setTimeout(() => {
      alert(`Dashboard criado com sucesso usando template "${selectedTemplate}"!`)
      onSuccess()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Criar Dashboard
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Selecione um template para criar seu dashboard com os dados conectados:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {templates.filter(t => t.available).map((template) => {
            const Icon = template.icon
            const isSelected = selectedTemplate === template.id
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className={`bg-${template.color}-100 dark:bg-${template.color}-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 text-${template.color}-600 dark:text-${template.color}-400`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{template.description}</p>
              </button>
            )
          })}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !selectedTemplate}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Dashboard'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Confirm Change Modal
function ConfirmChangeModal({ currentTemplate, newTemplate, onConfirm, onCancel }: {
  currentTemplate: string
  newTemplate: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const templateNames: Record<string, string> = {
    sales: 'Vendas',
    financial: 'Financeiro',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
          Confirmar Troca de Template
        </h2>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Você está prestes a trocar o template de:
          </p>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-center">
              <div className="bg-blue-100 px-4 py-2 rounded-lg mb-2">
                <p className="font-bold text-blue-900">{templateNames[currentTemplate]}</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Atual</p>
            </div>
            <span className="text-2xl text-gray-400">→</span>
            <div className="text-center">
              <div className="bg-green-100 px-4 py-2 rounded-lg mb-2">
                <p className="font-bold text-green-900">{templateNames[newTemplate]}</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Novo</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-300 font-semibold mb-2">
            ⚠️ Atenção: Esta ação não pode ser desfeita
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            Ao trocar o template, os dados e configurações atuais do dashboard serão perdidos.
            Um novo dashboard será criado com o template selecionado.
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors bg-white dark:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
          >
            Confirmar Troca
          </button>
        </div>
      </div>
    </div>
  )
}
