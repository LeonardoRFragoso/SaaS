import { Database, Sparkles, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Home() {
  // Verificar se usuário está logado
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Transforme suas planilhas em
            <span className="text-blue-600 dark:text-blue-400"> decisões inteligentes</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Plataforma de Business Intelligence que conecta automaticamente às suas fontes de dados
            e gera dashboards interativos com insights de IA.
          </p>
          
          {/* CTAs - Diferentes para logado e não logado */}
          {isLoggedIn ? (
            <div className="flex justify-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold text-lg shadow-lg transition-colors"
              >
                <span>Ir para Meu Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/demo"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors"
              >
                Ver Demo
              </Link>
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold text-lg shadow-lg transition-colors"
              >
                Teste Grátis por 14 dias
              </Link>
              <Link
                to="/demo"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors"
              >
                Ver Demo
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 dark:bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Conexão Automática
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Conecte Google Sheets, Excel e outras fontes em minutos. Sincronização automática em tempo real.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 dark:bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Insights com IA
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              IA analisa seus dados e gera insights automáticos, detecta anomalias e sugere ações.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 dark:bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboards Interativos
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Visualize seus dados com gráficos modernos e interativos. Templates prontos para usar.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">5 min</div>
              <div className="text-gray-600 dark:text-gray-300">Setup completo</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">R$ 79</div>
              <div className="text-gray-600 dark:text-gray-300">A partir de /mês</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Suporte disponível</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
