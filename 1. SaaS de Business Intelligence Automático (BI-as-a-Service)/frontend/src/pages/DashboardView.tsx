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
      const data = await dashboardService.getData(Number(id))
      
      setDashboard(dashboardInfo)
      setDashboardData(data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboards"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{dashboard.name}</h1>
                <p className="text-sm text-gray-600">
                  Atualizado em {new Date(dashboard.updated_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
              
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exportar PDF</span>
              </button>
              
              <Link
                to={`/dashboards/${id}/settings`}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Free Plan Notice */}
      {currentPlan === 'free' && (
        <div className={`border-b ${
          visibleChartsCount >= maxCharts 
            ? 'bg-red-50 border-red-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className={`text-sm ${
              visibleChartsCount >= maxCharts 
                ? 'text-red-800' 
                : 'text-blue-800'
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

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        {dashboardData && dashboardData.kpis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {dashboard.template === 'sales' && (
              <>
                {/* KPI: Faturamento */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-green-600 text-sm font-semibold">
                      +{dashboardData.kpis.growth_rate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">Faturamento</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {(dashboardData.kpis.total_revenue || 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">vs. mês anterior</p>
                </div>

                {/* KPI: Clientes */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">Clientes</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.kpis.total_customers || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total</p>
                </div>

                {/* KPI: Ticket Médio */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">Ticket Médio</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {(dashboardData.kpis.avg_ticket || 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Por cliente</p>
                </div>

                {/* KPI: Margem Líquida (se disponível) */}
                {dashboardData.kpis.margem_liquida !== undefined && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">Margem Líquida</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.kpis.margem_liquida.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Após taxas</p>
                  </div>
                )}

                {/* KPI: Total Descontos (se disponível) */}
                {dashboardData.kpis.total_descontos !== undefined && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-red-100 p-3 rounded-lg">
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">Descontos</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {dashboardData.kpis.total_descontos.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Total concedido</p>
                  </div>
                )}

                {/* KPI: Taxa de Aprovação (se disponível) */}
                {dashboardData.kpis.taxa_aprovacao !== undefined && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">Taxa Aprovação</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.kpis.taxa_aprovacao.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Pagamentos</p>
                  </div>
                )}

                {/* KPI: Melhor Região (se disponível) */}
                {dashboardData.kpis.melhor_regiao && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <MapPin className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">Melhor Região</h3>
                    <p className="text-xl font-bold text-gray-900">
                      {dashboardData.kpis.melhor_regiao}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      R$ {(dashboardData.kpis.vendas_melhor_regiao || 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}

                {/* KPI: Melhor Vendedor (se disponível) */}
                {dashboardData.kpis.melhor_vendedor && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">Melhor Vendedor</h3>
                    <p className="text-lg font-bold text-gray-900">
                      {dashboardData.kpis.melhor_vendedor}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      R$ {(dashboardData.kpis.vendas_melhor_vendedor || 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </>
            )}

            {dashboard.template === 'financial' && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">Receitas</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {(dashboardData.kpis.total_revenue || 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">Despesas</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {(dashboardData.kpis.total_expenses || 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">Lucro Líquido</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {(dashboardData.kpis.net_profit || 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Margem: {(dashboardData.kpis.profit_margin || 0).toFixed(1)}%
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {(!dashboardData || !dashboardData.kpis) && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center mb-8">
            <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma fonte de dados conectada
            </h3>
            <p className="text-gray-600 mb-6">
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

        {/* ✨ INSIGHTS AUTOMÁTICOS */}
        {dashboardData && dashboardData.insights && dashboardData.insights.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Insights Automáticos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    insight.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : insight.type === 'highlight'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{insight.message}</p>
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
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900">Qualidade dos Dados</h3>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              {dashboardData.data_quality.map((problem, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    problem.severity === 'high'
                      ? 'bg-red-50'
                      : problem.severity === 'medium'
                      ? 'bg-yellow-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{problem.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{problem.message}</p>
                    {problem.column && (
                      <p className="text-xs text-gray-500 mt-1">Coluna: {problem.column}</p>
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
              <Lightbulb className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Sugestões de Gráficos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.chart_suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 p-4 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      suggestion.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : suggestion.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {suggestion.priority}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h4>
                  <p className="text-xs text-gray-600 mb-3">{suggestion.description}</p>
                  <button 
                    onClick={() => handleAddChart(suggestion.type)}
                    disabled={addedCharts.includes(suggestion.type)}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      addedCharts.includes(suggestion.type)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Evolução de Vendas</h3>
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Receitas vs Despesas</h3>
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vendas por Categoria</h3>
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Produtos</h3>
                <div className="space-y-4">
                  {dashboardData.charts.top_products.map((product: any, index: number) => {
                    const maxSales = Math.max(...dashboardData.charts.top_products.map((p: any) => p.sales))
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                            <span className="text-sm font-bold text-gray-900">
                              R$ {product.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
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
            <div className="mb-4 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-900">
                🎨 Gráficos Adicionados ({addedCharts.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Estes gráficos foram adicionados por você
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {addedCharts.map((chartType) => (
                <div key={chartType} className="bg-white rounded-xl shadow-sm p-6 relative border-2 border-blue-200">
                {/* Botão Remover */}
                <button
                  onClick={() => handleRemoveChart(chartType)}
                  className="absolute top-4 right-4 p-2 hover:bg-red-100 rounded-lg transition-colors group"
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
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-300">
            <div className="text-center py-8">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🔒 Limite de gráficos atingido
              </h3>
              <p className="text-gray-600 mb-4">
                Você está usando todos os {maxCharts} gráficos disponíveis no plano Free.
                Faça upgrade para adicionar mais gráficos.
              </p>
              <Link
                to="/pricing"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Compartilhamento de dashboards"
        currentPlan={currentPlan}
        requiredPlan="pro"
      />
    </div>
  )
}
