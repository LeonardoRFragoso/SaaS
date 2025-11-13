import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Share2, RefreshCw, Settings, TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Lock, Database, Lightbulb, AlertTriangle, Plus, Sparkles, X, CheckCircle, MapPin, Award } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import UpgradeModal from '../components/UpgradeModal'
import { dashboardService, type Dashboard, type DashboardData } from '../services/dashboardService'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6']

export default function DashboardView() {
  const { id } = useParams()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [addedCharts, setAddedCharts] = useState<string[]>([]) // Gráficos adicionados dinamicamente
  const [period, setPeriod] = useState<'30d' | '90d' | 'ytd'>('30d')
  const [compare, setCompare] = useState<boolean>(true)
  const [shareInfo, setShareInfo] = useState<{ url: string; expiresAt: string } | null>(null)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState<{ text: string; suggested_actions: any[] } | null>(null)
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [mapping, setMapping] = useState<{ value?: string; date?: string; product?: string; quantity?: string }>({})
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [mappingPreview, setMappingPreview] = useState<any | null>(null)
  
  // Mock - será substituído por dados reais do usuário
  const currentPlan = 'free' as const
  const canExportWithoutWatermark = currentPlan !== 'free'
  const canShare = ['pro', 'enterprise'].includes(currentPlan)
  const maxCharts = currentPlan === 'free' ? 4 : currentPlan === 'starter' ? 10 : 999999
  
  // Contar gráficos realmente exibidos
  const countVisibleCharts = () => {
    if (!dashboardData?.charts) return 0
    let count = 0
    
    if (dashboardData.charts.sales_evolution && dashboardData.charts.sales_evolution.length > 0) count++
    if (dashboardData.charts.revenue_by_month) count++
    if (dashboardData.charts.category_sales && dashboardData.charts.category_sales.length > 0) count++
    if (dashboardData.charts.top_products && dashboardData.charts.top_products.length > 0) count++
    
    // Adicionar gráficos dinâmicos
    count += addedCharts.length
    
    return count
  }
  
  const visibleChartsCount = countVisibleCharts()
  
  // Funções para adicionar/remover gráficos
  const handleAddChart = async (chartType: string) => {
    // Verificar limite
    if (visibleChartsCount >= maxCharts) {
      alert(`Limite de ${maxCharts} gráficos atingido!\n\nFaça upgrade para adicionar mais gráficos.`)
      setShowUpgradeModal(true)
      return
    }
    
    // Verificar se já não foi adicionado
    if (addedCharts.includes(chartType)) {
      alert('Este gráfico já foi adicionado!')
      return
    }
    
    // Verificar se há dados disponíveis
    const hasData = dashboardData?.charts && (
      (chartType === 'histogram' && dashboardData.charts.value_distribution?.length > 0) ||
      (chartType === 'line' && dashboardData.charts.weekly_trend?.length > 0) ||
      (chartType === 'bar' && dashboardData.charts.region_sales?.length > 0) ||
      (chartType === 'scatter' && dashboardData.charts.payment_analysis?.length > 0)
    )
    
    if (!hasData) {
      alert('Dados não disponíveis para este gráfico.\n\nO gráfico será adicionado quando houver dados suficientes.')
      return
    }
    
    // Adicionar ao estado
    setAddedCharts([...addedCharts, chartType])
    console.log('Gráfico adicionado:', chartType, 'Total:', [...addedCharts, chartType].length)
  }
  
  const handleRemoveChart = (chartType: string) => {
    if (confirm(`Tem certeza que deseja remover o gráfico?`)) {
      setAddedCharts(addedCharts.filter(c => c !== chartType))
    }
  }

  // Carregar dashboard
  useEffect(() => {
    if (id) {
      loadDashboard()
    }
  }, [id])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const dashboardInfo = await dashboardService.get(Number(id))
      const data = await dashboardService.getData(Number(id), { period, compare })
      
      setDashboard(dashboardInfo)
      setDashboardData(data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar colunas disponíveis quando abrir o modal de mapeamento
  useEffect(() => {
    const loadColumns = async () => {
      if (!showMappingModal || !dashboard) return
      const dsId = dashboard.datasources?.[0]
      if (!dsId) return
      try {
        const data = await dataSourceService.getData(dsId)
        setAvailableColumns(data.columns || [])
      } catch {
        setAvailableColumns([])
      }
    }
    loadColumns()
  }, [showMappingModal, dashboard])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadDashboard()
    setIsRefreshing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Dashboard não encontrado</p>
          <Link to="/dashboards" className="text-blue-600 hover:underline">
            Voltar para Dashboards
          </Link>
        </div>
      </div>
    )
  }

  const handleExport = () => {
    if (!canExportWithoutWatermark) {
      alert('Exportando PDF com marca d\'água InsightFlow BI')
    }
    // Implementar exportação real
    console.log('Exportando dashboard...')
  }

  const handleShare = () => {
    if (!canShare) {
      setShowUpgradeModal(true)
      return
    }
    // Implementar compartilhamento
    console.log('Compartilhando dashboard...')
  }
  
  const handleTemplateSwitch = async (template: 'sales' | 'financial') => {
    if (!id) return
    try {
      // Evitar chamada desnecessária
      if (dashboard?.template === template) return
      const updated = await dashboardService.changeTemplate(Number(id), template)
      setDashboard(updated)
      // Recarregar dados processados
      const data = await dashboardService.getData(Number(id))
      setDashboardData(data)
    } catch (err: any) {
      // Se bloqueado pelo plano, abrir modal de upgrade
      if (err?.response?.status === 403) {
        setShowUpgradeModal(true)
        return
      }
      console.error('Erro ao trocar template:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboards"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboard.name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Atualizado em {new Date(dashboard.updated_at).toLocaleString('pt-BR')}
                </p>
                { (dashboard as any)?.is_preview && (
                  <p className="mt-1 inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Pré-visualização — alterne entre Vendas e Financeiro para comparar modelos
                  </p>
                )}
              </div>
              {/* Banner de link de prévia gerado */}
              {shareInfo && (
                <div className="mt-3 text-xs text-blue-800 dark:text-blue-300">
                  Link de prévia: <a className="underline" href={shareInfo.url} target="_blank" rel="noreferrer">{shareInfo.url}</a> • expira em {new Date(shareInfo.expiresAt).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Períodos e comparação */}
              <div className="hidden md:flex items-center space-x-2 mr-2">
                <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {(['30d','90d','ytd'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPeriod(p); setTimeout(loadDashboard, 0) }}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        period === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {p === '30d' ? '30d' : p === '90d' ? '90d' : 'YTD'}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-2">
                  <input
                    type="checkbox"
                    checked={compare}
                    onChange={(e) => { setCompare(e.target.checked); setTimeout(loadDashboard, 0) }}
                  />
                  Comparar
                </label>
              </div>
              {/* Troca de Template (Preview de modelos gratuitos) */}
              <div className="hidden md:flex items-center space-x-2 mr-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Visualizar como:</span>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleTemplateSwitch('sales')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      dashboard?.template === 'sales'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Vendas
                  </button>
                  <button
                    onClick={() => handleTemplateSwitch('financial')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      dashboard?.template === 'financial'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Financeiro
                  </button>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {canShare ? (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span>Compartilhar</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>
              {/* Prévia pública */}
              <button
                onClick={async () => {
                  try {
                    if (!id) return
                    const { token, expires_at } = await dashboardService.sharePreview(Number(id))
                    const url = `${window.location.origin}/public?token=${token}`
                    setShareInfo({ url, expiresAt: expires_at })
                    navigator.clipboard?.writeText(url).catch(() => {})
                    alert('Link de prévia copiado! Válido por 24h.')
                  } catch {
                    alert('Não foi possível gerar o link de prévia.')
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span>Gerar link de prévia</span>
              </button>
              
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exportar PDF</span>
              </button>
              
              <Link
                to={`/dashboards/${id}/settings`}
                className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Executivo + Qualidade + Metas */}
      {dashboardData?.executive_summary && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Crescimento vs período anterior</p>
              <p className={`text-2xl font-bold ${dashboardData.executive_summary.headline_growth_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.executive_summary.headline_growth_pct >= 0 ? '+' : ''}{dashboardData.executive_summary.headline_growth_pct}%
              </p>
            </div>
            <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {(dashboardData.executive_summary.avg_ticket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Qualidade dos Dados</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${dashboardData.executive_summary.data_quality_level === 'good' ? 'bg-green-500' : dashboardData.executive_summary.data_quality_level === 'ok' ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${dashboardData.executive_summary.data_quality_score}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{dashboardData.executive_summary.data_quality_score}%</p>
            </div>
            <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Metas</p>
              {dashboardData.goals?.defined && dashboardData.goals.items.length > 0 ? (
                <div className="space-y-2">
                  {dashboardData.goals.items.map((g: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{g.metric === 'revenue' ? 'Faturamento' : 'Ticket Médio'}</span>
                        <span>{g.progress_pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, g.progress_pct)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (!id) return
                    const metric = window.confirm('Definir meta de Faturamento? Clique Cancelar para meta de Ticket Médio.') ? 'revenue' : 'avg_ticket'
                    const raw = window.prompt(`Qual o alvo de ${metric === 'revenue' ? 'faturamento' : 'ticket médio'}? Use números, ex.: 50000`)
                    if (!raw) return
                    const target = Number(raw.replace(/[^\d.-]/g, ''))
                    if (Number.isNaN(target)) return alert('Valor inválido')
                    try {
                      await dashboardService.setGoal(Number(id), { metric, target })
                      await loadDashboard()
                    } catch {
                      alert('Não foi possível salvar a meta.')
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                  Definir meta
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Free Plan Notice */}
      {currentPlan === 'free' && (
        <div className={`border-b ${
          visibleChartsCount >= maxCharts 
            ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
            : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className={`text-sm ${
              visibleChartsCount >= maxCharts 
                ? 'text-red-800 dark:text-red-200' 
                : 'text-blue-800 dark:text-blue-300'
            }`}>
              {visibleChartsCount >= maxCharts ? (
                <>
                  <strong>⚠️ Limite atingido:</strong> Usando {visibleChartsCount}/{maxCharts} gráficos. 
                </>
              ) : (
                <>
                  <strong>Plano Free:</strong> Usando {visibleChartsCount} de {maxCharts} gráficos disponíveis. 
                </>
              )}
              Exportação com marca d'água. 
              <Link to="/pricing" className="underline font-semibold ml-2">
                Fazer upgrade
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Benchmark e Impacto Estimado */}
      {(dashboardData?.benchmark || dashboardData?.impact_estimates) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardData?.benchmark && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Benchmark do Setor</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Setor: <span className="font-semibold capitalize">{dashboardData.benchmark.industry}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ticket médio estimado no setor: <span className="font-semibold">R$ {dashboardData.benchmark.industry_avg_ticket_estimate?.toLocaleString('pt-BR')}</span>
              </p>
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Percentil vs setor</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${dashboardData.benchmark.avg_ticket_vs_industry_percentile || 50}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {dashboardData.benchmark.avg_ticket_vs_industry_percentile || 50}º percentil
                </p>
              </div>
            </div>
          )}
          {dashboardData?.impact_estimates && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Impacto Estimado</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-200 space-y-2">
                <li>Recuperar clientes inativos: <span className="font-semibold">R$ {dashboardData.impact_estimates.recover_inactive_customers?.toLocaleString('pt-BR')}</span></li>
                <li>Otimizar descontos: <span className="font-semibold">R$ {dashboardData.impact_estimates.optimize_discounts?.toLocaleString('pt-BR')}</span></li>
                <li>Aumentar ticket médio em 5%: <span className="font-semibold">R$ {dashboardData.impact_estimates.increase_avg_ticket_5pct?.toLocaleString('pt-BR')}</span></li>
              </ul>
              <Link to="/pricing" className="inline-block mt-3 text-xs text-blue-600 dark:text-blue-400 underline">Desbloquear automações no plano pago</Link>
            </div>
          )}
        </div>
      )}

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        {dashboardData && dashboardData.kpis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {dashboard.template === 'sales' && (
              <>
                {/* KPI: Faturamento */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 dark:bg-blue-500/20 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-green-600 dark:text-green-400 text-sm font-semibold">
                      +{dashboardData.kpis.growth_rate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Faturamento</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {(dashboardData.kpis.total_revenue || 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs. mês anterior</p>
                </div>

                {/* KPI: Clientes */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 dark:bg-purple-500/20 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Clientes</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardData.kpis.total_customers || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
                </div>

                {/* KPI: Ticket Médio */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-100 dark:bg-orange-500/20 p-3 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Ticket Médio</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {(dashboardData.kpis.avg_ticket || 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Por cliente</p>
                </div>

                {/* KPI: Margem Líquida (se disponível) */}
                {dashboardData.kpis.margem_liquida !== undefined && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 dark:bg-green-500/20 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Margem Líquida</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.kpis.margem_liquida.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Após taxas</p>
                  </div>
                )}

                {/* KPI: Total Descontos (se disponível) */}
                {dashboardData.kpis.total_descontos !== undefined && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-red-100 dark:bg-red-500/20 p-3 rounded-lg">
                        <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Descontos</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      R$ {dashboardData.kpis.total_descontos.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total concedido</p>
                  </div>
                )}

                {/* KPI: Taxa de Aprovação (se disponível) */}
                {dashboardData.kpis.taxa_aprovacao !== undefined && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 dark:bg-green-500/20 p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Taxa Aprovação</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.kpis.taxa_aprovacao.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pagamentos</p>
                  </div>
                )}

                {/* KPI: Melhor Região (se disponível) */}
                {dashboardData.kpis.melhor_regiao && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-lg">
                        <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Melhor Região</h3>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.kpis.melhor_regiao}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      R$ {(dashboardData.kpis.vendas_melhor_regiao || 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}

                {/* KPI: Melhor Vendedor (se disponível) */}
                {dashboardData.kpis.melhor_vendedor && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-yellow-100 dark:bg-yellow-500/20 p-3 rounded-lg">
                        <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Melhor Vendedor</h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {dashboardData.kpis.melhor_vendedor}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      R$ {(dashboardData.kpis.vendas_melhor_vendedor || 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </>
            )}

            {dashboard.template === 'financial' && (
              <>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 dark:bg-green-500/20 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Receitas</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {(dashboardData.kpis.total_revenue || 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-red-100 dark:bg-red-500/20 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Despesas</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {(dashboardData.kpis.total_expenses || 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 dark:bg-blue-500/20 p-3 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Lucro Líquido</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {(dashboardData.kpis.net_profit || 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Margem: {(dashboardData.kpis.profit_margin || 0).toFixed(1)}%
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {(!dashboardData || !dashboardData.kpis) && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-12 text-center mb-8">
            <Database className="h-16 w-16 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma fonte de dados conectada
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Conecte uma fonte de dados para visualizar seus KPIs e gráficos
            </p>
            <Link
              to="/datasources"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Conectar Dados
            </Link>
          </div>
        )}

        {/* Pergunte à IA */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pergunte à IA</h3>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ex.: Quais clientes mais cresceram este mês?"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={async () => {
                if (!id || !aiQuestion.trim()) return
                try {
                  const res = await dashboardService.ask(Number(id), aiQuestion.trim())
                  setAiAnswer(res.answer)
                } catch (err: any) {
                  alert(err?.response?.data?.error || 'Limite de IA atingido no seu plano.')
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Perguntar
            </button>
          </div>
          {aiAnswer && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm text-gray-900 dark:text-gray-200 mb-2">{aiAnswer.text}</p>
              <div className="flex flex-wrap gap-2">
                {aiAnswer.suggested_actions?.map((a, i) => (
                  <button key={i} className="px-3 py-1.5 rounded-full text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ✨ INSIGHTS AUTOMÁTICOS */}
        {dashboardData && dashboardData.insights && dashboardData.insights.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Insights Automáticos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    insight.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                      : insight.type === 'highlight'
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⚠️ PROBLEMAS DE QUALIDADE */}
        {dashboardData && dashboardData.data_quality && dashboardData.data_quality.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Qualidade dos Dados</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 space-y-3">
              {dashboardData.data_quality.map((problem, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    problem.severity === 'high'
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : problem.severity === 'medium'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{problem.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{problem.message}</p>
                    {problem.column && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coluna: {problem.column}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📊 SUGESTÕES DE GRÁFICOS */}
        {dashboardData && dashboardData.chart_suggestions && dashboardData.chart_suggestions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sugestões de Gráficos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.chart_suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 p-4 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      suggestion.priority === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                        : suggestion.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {suggestion.priority}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{suggestion.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{suggestion.description}</p>
                  <button 
                    onClick={() => handleAddChart(suggestion.type)}
                    disabled={addedCharts.includes(suggestion.type)}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      addedCharts.includes(suggestion.type)
                        ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    {addedCharts.includes(suggestion.type) ? 'Adicionado' : 'Adicionar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {dashboardData && dashboardData.charts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chart 1 - Sales Evolution */}
            {dashboardData.charts.sales_evolution && dashboardData.charts.sales_evolution.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Evolução de Vendas</h3>
                  <button
                    onClick={async () => {
                      const text = window.prompt('Adicionar nota a este gráfico:')
                      if (!text || !id) return
                      try { await dashboardService.addNote(Number(id), { chart_key: 'sales_evolution', text }); alert('Nota adicionada'); } catch { alert('Não foi possível adicionar a nota.') }
                    }}
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Anotar
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.charts.sales_evolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Chart 2 - Revenue vs Expenses */}
            {dashboard.template === 'financial' && dashboardData.charts.revenue_by_month && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Receitas vs Despesas</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.keys(dashboardData.charts.revenue_by_month).map(month => ({
                    month,
                    receita: dashboardData.charts.revenue_by_month[month] || 0,
                    despesa: dashboardData.charts.expenses_by_month?.[month] || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="receita" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="despesa" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Chart 3 - Category Distribution */}
            {dashboardData.charts.category_sales && dashboardData.charts.category_sales.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vendas por Categoria</h3>
                  <button
                    onClick={async () => {
                      const text = window.prompt('Adicionar nota a este gráfico:')
                      if (!text || !id) return
                      try { await dashboardService.addNote(Number(id), { chart_key: 'category_sales', text }); alert('Nota adicionada'); } catch { alert('Não foi possível adicionar a nota.') }
                    }}
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Anotar
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.charts.category_sales}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.charts.category_sales.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Chart 4 - Top Products */}
            {dashboardData.charts.top_products && dashboardData.charts.top_products.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top 5 Produtos</h3>
                  <button
                    onClick={async () => {
                      const text = window.prompt('Adicionar nota a este gráfico:')
                      if (!text || !id) return
                      try { await dashboardService.addNote(Number(id), { chart_key: 'top_products', text }); alert('Nota adicionada'); } catch { alert('Não foi possível adicionar a nota.') }
                    }}
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Anotar
                  </button>
                </div>
                <div className="space-y-4">
                  {dashboardData.charts.top_products.map((product: any, index: number) => {
                    const maxSales = Math.max(...dashboardData.charts.top_products.map((p: any) => p.sales))
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              R$ {product.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(product.sales / maxSales) * 100}%` }}
                            />
                          </div>
                        </div>
                        {product.growth !== undefined && (
                          <span className={`ml-4 text-xs font-semibold ${
                            product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {product.growth >= 0 ? '+' : ''}{product.growth}%
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gráficos Adicionados Dinamicamente */}
        {addedCharts.length > 0 && dashboardData && (
          <>
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                🎨 Gráficos Adicionados ({addedCharts.length})
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Estes gráficos foram adicionados por você
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {addedCharts.map((chartType) => (
                <div key={chartType} className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm p-6 relative">
                {/* Botão Remover */}
                <button
                  onClick={() => handleRemoveChart(chartType)}
                  className="absolute top-4 right-4 p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                  title="Remover gráfico"
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
                </button>
                
                {/* Renderizar gráfico baseado no tipo */}
                {chartType === 'histogram' && dashboardData.charts.value_distribution && (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Distribuição de Valores</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData.charts.value_distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="range" stroke="#6b7280" angle={-45} textAnchor="end" height={80} style={{fontSize: '11px'}} />
                        <YAxis stroke="#6b7280" label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}
                
                {chartType === 'line' && dashboardData.charts.weekly_trend && (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Tendência Semanal</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dashboardData.charts.weekly_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="week" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Vendas']} />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
                
                {chartType === 'bar' && dashboardData.charts.region_sales && (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🗺️ Vendas por Região</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData.charts.region_sales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="region" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
                        <Bar dataKey="sales" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}
                
                {chartType === 'scatter' && dashboardData.charts.payment_analysis && (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Análise por Forma de Pagamento</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData.charts.payment_analysis}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="method" stroke="#6b7280" angle={-20} textAnchor="end" height={80} style={{fontSize: '11px'}} />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          formatter={(value: number, name: string) => {
                            if (name === 'total') return [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Total']
                            if (name === 'count') return [value, 'Transações']
                            return [value, name]
                          }}
                        />
                        <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>
            ))}
          </div>
          </>
        )}

        {/* Chart Limit Notice - SÓ APARECE QUANDO REALMENTE ATINGIR O LIMITE */}
        {currentPlan === 'free' && visibleChartsCount >= maxCharts && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-center py-8">
              <Lock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                🔒 Limite de gráficos atingido
              </h3>
              <div className="text-gray-600 dark:text-gray-300 mb-4">
                <p className="mb-2">Você está usando todos os {maxCharts} gráficos disponíveis no plano Free.</p>
                <div className="max-w-md mx-auto text-left text-sm bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="font-semibold mb-2">Comparativo rápido</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Free: 4 gráficos, 1 fonte, exportação com marca d’água</li>
                    <li>Starter: 10 gráficos, 3 fontes, metas múltiplas, exportação sem marca</li>
                    <li>Pro: ilimitado, auto‑sync, compartilhamento e API</li>
                  </ul>
                </div>
              </div>
              <Link
                to="/pricing"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        )}

        {/* Checklist de Ativação */}
        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Checklist de Ativação</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dashboardData?.kpis ? 'bg-green-500' : 'bg-gray-400'}`} />
              Conectar dados
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dashboardData?.goals?.defined ? 'bg-green-500' : 'bg-gray-400'}`} />
              Definir uma meta
              {!dashboardData?.goals?.defined && (
                <button onClick={() => setShowMappingModal(true)} className="ml-2 text-blue-600 dark:text-blue-400 underline">
                  Refine colunas
                </button>
              )}
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${aiAnswer ? 'bg-green-500' : 'bg-gray-400'}`} />
              Fazer 1 pergunta à IA
            </li>
          </ul>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Compartilhamento de dashboards"
        currentPlan={currentPlan}
        requiredPlan="pro"
      />

      {/* Mapping Modal */}
      {showMappingModal && dashboard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Refinar mapeamento de colunas</h3>
              <button onClick={() => setShowMappingModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Selecione quais colunas representam Valor, Data, Produto e Quantidade.</p>
            <div className="grid grid-cols-2 gap-4">
              {['value','date','product','quantity'].map((key) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    {key === 'value' ? 'Valor' : key === 'date' ? 'Data' : key === 'product' ? 'Produto' : 'Quantidade'}
                  </label>
                  <select
                    value={(mapping as any)[key] || ''}
                    onChange={(e) => setMapping({ ...mapping, [key]: e.target.value || undefined })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Detectar automaticamente</option>
                    {availableColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setShowMappingModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">Cancelar</button>
              <button
                onClick={async () => {
                  try {
                    if (!id) return
                    const preview = await dashboardService.previewMapping(Number(id), mapping, { period, compare })
                    setMappingPreview(preview)
                  } catch {
                    alert('Não foi possível pré-visualizar o mapeamento')
                  }
                }}
                className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 dark:text-blue-300 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Pré-visualizar
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!id || !dashboard) return
                    const newConfig = { ...(dashboard.config || {}), column_mapping: mapping }
                    await dashboardService.update(Number(id), { config: newConfig } as any)
                    await loadDashboard()
                    setShowMappingModal(false)
                  } catch {
                    alert('Não foi possível salvar o mapeamento')
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Salvar mapeamento
              </button>
            </div>
            {mappingPreview && dashboardData && (
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Antes x Depois</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ticket Médio (atual)</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {(dashboardData.kpis?.avg_ticket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">Ticket Médio (prévia)</p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">R$ {(mappingPreview.kpis?.avg_ticket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-800 dark:text-green-200">Variação</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                      {(((mappingPreview.kpis?.avg_ticket || 0) - (dashboardData.kpis?.avg_ticket || 0)) / Math.max(1, (dashboardData.kpis?.avg_ticket || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
