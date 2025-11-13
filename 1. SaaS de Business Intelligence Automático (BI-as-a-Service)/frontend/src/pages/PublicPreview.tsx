import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { dashboardService } from '../services/dashboardService'

export default function PublicPreview() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError('Token não fornecido.')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const res = await dashboardService.getPublic(token)
        setData(res)
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Não foi possível carregar a pré-visualização.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-14 w-14 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Carregando pré‑visualização...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700 max-w-lg w-full text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-800 dark:text-gray-100 font-semibold mb-2">{error}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Peça um novo link ao criador do dashboard.</p>
          <Link to="/pricing" className="text-blue-600 hover:underline">Conheça os planos</Link>
        </div>
      </div>
    )
  }

  const kpis = data?.kpis || {}
  const charts = data?.charts || {}
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Pré‑visualização pública com marca d'água. Válida por tempo limitado.
          </p>
          <Link to="/pricing" className="text-sm text-blue-700 dark:text-blue-300 underline font-semibold">
            Fazer upgrade
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Faturamento</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {(kpis.total_revenue || 0).toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Clientes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.total_customers || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ticket Médio</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {(kpis.avg_ticket || 0).toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução */}
          {charts.sales_evolution?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Evolução</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.sales_evolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Categorias */}
          {charts.category_sales?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Categorias</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={charts.category_sales} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {charts.category_sales.map((_e: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Marca d'água */}
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          Prévia gerada pelo InsightFlow BI — exportações sem marca d’água no plano pago.
        </div>
      </div>
    </div>
  )
}

