import { LayoutDashboard, Database, BarChart3, FileText, Settings, ArrowRight, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Dashboard() {
  const [completedSteps, setCompletedSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
  })

  // TODO: Integrar com API para verificar status real dos passos
  // useEffect(() => {
  //   const checkSteps = async () => {
  //     const hasDataSources = await dataSourceService.list()
  //     setCompletedSteps(prev => ({ ...prev, step1: hasDataSources.length > 0 }))
  //     
  //     const hasDashboards = await dashboardService.list()
  //     setCompletedSteps(prev => ({ ...prev, step2: hasDashboards.length > 0 }))
  //     
  //     const hasInsights = await insightService.list()
  //     setCompletedSteps(prev => ({ ...prev, step3: hasInsights.length > 0 }))
  //   }
  //   checkSteps()
  // }, [])

  // Verificar se pode avançar para o próximo passo
  const canAccessStep2 = completedSteps.step1
  const canAccessStep3 = completedSteps.step1 && completedSteps.step2

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Bem-vindo ao InsightFlow BI</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/dashboards"
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400"
        >
          <div className="bg-blue-100 dark:bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <LayoutDashboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Dashboards</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Visualize e crie dashboards</p>
        </Link>

        <Link
          to="/datasources"
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-green-500 dark:hover:border-green-400"
        >
          <div className="bg-green-100 dark:bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Fontes de Dados</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Conecte suas planilhas</p>
        </Link>

        <Link
          to="/insights"
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400"
        >
          <div className="bg-purple-100 dark:bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Insights IA</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Análises automáticas</p>
        </Link>

        <Link
          to="/reports"
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-orange-500 dark:hover:border-orange-400"
        >
          <div className="bg-orange-100 dark:bg-orange-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Relatórios</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Agende envios automáticos</p>
        </Link>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🚀 Comece em 3 passos simples</h2>
          <div className="text-sm bg-white/20 px-4 py-2 rounded-full">
            {Object.values(completedSteps).filter(Boolean).length}/3 completos
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Passo 1 */}
          <div className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/30 rounded-lg w-12 h-12 flex items-center justify-center">
                <span className="text-2xl font-bold">1</span>
              </div>
              {completedSteps.step1 && (
                <CheckCircle className="h-6 w-6 text-green-300" />
              )}
            </div>
            <h3 className="font-bold text-lg mb-2">Conecte seus dados</h3>
            <p className="text-blue-100 text-sm mb-4">
              Google Sheets, Excel ou upload de arquivo
            </p>
            <Link
              to="/datasources"
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
            >
              <Database className="h-4 w-4" />
              <span>Conectar Dados</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Passo 2 */}
          <div className={`bg-white/10 rounded-xl p-6 transition-all ${
            canAccessStep2 ? 'hover:bg-white/20' : 'opacity-50 cursor-not-allowed'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/30 rounded-lg w-12 h-12 flex items-center justify-center">
                <span className="text-2xl font-bold">2</span>
              </div>
              {completedSteps.step2 && (
                <CheckCircle className="h-6 w-6 text-green-300" />
              )}
            </div>
            <h3 className="font-bold text-lg mb-2">Escolha um template</h3>
            <p className="text-blue-100 text-sm mb-4">
              Dashboards prontos para seu negócio
            </p>
            {canAccessStep2 ? (
              <Link
                to="/dashboards"
                className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Criar Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white/30 text-white/50 rounded-lg cursor-not-allowed font-semibold">
                <LayoutDashboard className="h-4 w-4" />
                <span>Complete o Passo 1</span>
              </div>
            )}
          </div>

          {/* Passo 3 */}
          <div className={`bg-white/10 rounded-xl p-6 transition-all ${
            canAccessStep3 ? 'hover:bg-white/20' : 'opacity-50 cursor-not-allowed'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/30 rounded-lg w-12 h-12 flex items-center justify-center">
                <span className="text-2xl font-bold">3</span>
              </div>
              {completedSteps.step3 && (
                <CheckCircle className="h-6 w-6 text-green-300" />
              )}
            </div>
            <h3 className="font-bold text-lg mb-2">Receba insights</h3>
            <p className="text-blue-100 text-sm mb-4">
              IA analisa e sugere ações automaticamente
            </p>
            {canAccessStep3 ? (
              <Link
                to="/insights"
                className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Ver Insights</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white/30 text-white/50 rounded-lg cursor-not-allowed font-semibold">
                <BarChart3 className="h-4 w-4" />
                <span>Complete os Passos 1 e 2</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-100">Progresso geral</span>
            <span className="text-sm font-semibold">
              {Math.round((Object.values(completedSteps).filter(Boolean).length / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${(Object.values(completedSteps).filter(Boolean).length / 3) * 100}%` }}
            />
          </div>
          
          {/* Success Message */}
          {Object.values(completedSteps).filter(Boolean).length === 3 && (
            <div className="mt-4 bg-green-500 rounded-lg p-4 text-center animate-pulse">
              <p className="font-bold text-lg">🎉 Parabéns! Você completou todos os passos!</p>
              <p className="text-sm text-green-100 mt-1">
                Agora você está pronto para aproveitar todo o poder do InsightFlow BI
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Atividade Recente</h2>
          <Link to="/settings" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Configurações</span>
          </Link>
        </div>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Nenhuma atividade ainda</p>
          <p className="text-sm mt-2">Conecte uma fonte de dados para começar</p>
        </div>
      </div>
    </div>
  )
}
