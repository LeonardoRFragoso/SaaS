import { Link, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">InsightFlow BI</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <>
                  <Link
                    to="/pricing"
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                  >
                    Planos
                  </Link>
                  <span className="text-gray-600 dark:text-gray-300">Olá, {user.full_name || user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/pricing"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Planos
                  </Link>
                  <Link
                    to="/demo"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Demo
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Começar Grátis
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Outlet />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 mt-24 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>© 2024 InsightFlow BI. Todos os direitos reservados.</p>
            <p className="mt-2 text-sm">
              Status: <span className="text-green-600 dark:text-green-400 font-semibold">🟢 Em Desenvolvimento</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
