import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Mail, MessageSquare, Calendar, Lock, Download } from 'lucide-react'
import UpgradeModal from '../components/UpgradeModal'

// Mock data
const mockReports: any[] = []

export default function Reports() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Mock - será substituído por dados reais
  const currentPlan = 'free'
  const reportsLimit = 0 // Free não tem relatórios agendados
  const canSchedule = currentPlan !== 'free'

  const handleCreateReport = () => {
    if (!canSchedule) {
      setShowUpgradeModal(true)
      return
    }
    setShowCreateModal(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
          <p className="text-gray-600">
            Agende envios automáticos de dashboards
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-1">
            Plano: <span className="font-semibold capitalize">{currentPlan}</span>
          </p>
          <p className="text-sm text-gray-600">
            Relatórios: <span className="font-semibold">{mockReports.length}/{reportsLimit || '0'}</span>
          </p>
        </div>
      </div>

      {/* Free Plan Warning */}
      {!canSchedule && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-start space-x-4">
            <Lock className="h-12 w-12 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">
                Relatórios Automáticos - Recurso Premium
              </h2>
              <p className="text-blue-100 mb-4 text-lg">
                Agende envios automáticos de dashboards por email e WhatsApp.
                Disponível a partir do plano Starter.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <Mail className="h-6 w-6 mb-2" />
                  <p className="font-semibold mb-1">Envio por Email</p>
                  <p className="text-sm text-blue-100">Relatórios automáticos na sua caixa de entrada</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <Calendar className="h-6 w-6 mb-2" />
                  <p className="font-semibold mb-1">Agendamento Flexível</p>
                  <p className="text-sm text-blue-100">Diário, semanal, mensal ou personalizado</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <p className="font-semibold mb-1">WhatsApp (Pro)</p>
                  <p className="text-sm text-blue-100">Receba relatórios direto no WhatsApp</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/pricing"
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold transition-colors"
                >
                  Ver Planos
                </Link>
                <Link
                  to="/demo"
                  className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 font-bold transition-colors"
                >
                  Ver Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Options (Available for Free) */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Exportar Dashboards
        </h2>
        <p className="text-gray-600 mb-6">
          Você pode exportar seus dashboards manualmente em PDF
          {currentPlan === 'free' && ' (com marca d\'água)'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Exportar em PDF</h3>
                <p className="text-sm text-gray-600">
                  {currentPlan === 'free' ? 'Com marca d\'água' : 'Sem marca d\'água'}
                </p>
              </div>
            </div>
            <Link
              to="/dashboards"
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Ir para Dashboards
            </Link>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 opacity-60">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                  <span>Envio Automático</span>
                  <Lock className="h-4 w-4 text-gray-400" />
                </h3>
                <p className="text-sm text-gray-600">Plano Starter ou superior</p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="block w-full text-center px-4 py-2 bg-gray-200 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
            >
              Requer Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Scheduled Reports (Only for paid plans) */}
      {canSchedule && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Relatórios Agendados
            </h2>
            <button
              onClick={handleCreateReport}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Criar Relatório
            </button>
          </div>

          {mockReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum relatório agendado
              </h3>
              <p className="text-gray-600 mb-6">
                Crie seu primeiro relatório automático
              </p>
              <button
                onClick={handleCreateReport}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Criar Relatório
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mockReports.map((report: any) => (
                <div
                  key={report.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{report.name}</h3>
                        <p className="text-sm text-gray-600">
                          {report.frequency} • {report.delivery_method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        report.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {report.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        Último envio: {report.last_sent_at || 'Nunca'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Relatórios Automáticos"
        currentPlan={currentPlan}
        requiredPlan="starter"
      />
    </div>
  )
}
