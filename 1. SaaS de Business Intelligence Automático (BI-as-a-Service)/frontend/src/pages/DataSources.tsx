import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Database, FileSpreadsheet, Upload, Link as LinkIcon, Lock, CheckCircle, XCircle, RefreshCw, Trash2, BarChart3, Table } from 'lucide-react'
import UpgradeModal from '../components/UpgradeModal'
import { dataSourceService, type DataSource } from '../services/dataSourceService'

const sourceTypes = [
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Conecte suas planilhas do Google',
    icon: FileSpreadsheet,
    color: 'green',
    available: true,
  },
  {
    id: 'excel_online',
    name: 'Excel Online',
    description: 'Conecte planilhas do Microsoft 365',
    icon: FileSpreadsheet,
    color: 'blue',
    available: true,
  },
  {
    id: 'csv_upload',
    name: 'Upload CSV',
    description: 'Faça upload de arquivos CSV',
    icon: Upload,
    color: 'purple',
    available: true,
  },
  {
    id: 'database',
    name: 'Banco de Dados',
    description: 'MySQL, PostgreSQL, SQL Server',
    icon: Database,
    color: 'orange',
    available: false, // Requer Pro
  },
  {
    id: 'api',
    name: 'API REST',
    description: 'Conecte via API personalizada',
    icon: LinkIcon,
    color: 'indigo',
    available: false, // Requer Pro
  },
]

export default function DataSources() {
  const navigate = useNavigate()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedSource, setSelectedSource] = useState('')
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  
  // Mock - será substituído por dados reais do usuário
  const currentPlan = 'free'
  const dataSourceLimit = 1
  const dataSourcesCount = dataSources.length
  const maxRows = 5000

  // Carregar fontes de dados
  useEffect(() => {
    loadDataSources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDataSources = async () => {
    try {
      setLoading(true)
      const data = await dataSourceService.list()
      console.log('Fontes de dados carregadas:', data)
      
      // O backend retorna um objeto paginado: { count, next, previous, results }
      setDataSources(data.results)
    } catch (error) {
      console.error('Erro ao carregar fontes:', error)
      setDataSources([]) // Em caso de erro, definir como array vazio
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar a fonte "${name}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      await dataSourceService.delete(id)
      await loadDataSources()
    } catch (error) {
      console.error('Erro ao deletar fonte:', error)
      alert('Erro ao deletar fonte de dados')
    }
  }

  const handleConnect = (sourceId: string, available: boolean) => {
    if (!available) {
      setSelectedSource(sourceId)
      setShowUpgradeModal(true)
      return
    }

    if (dataSourcesCount >= dataSourceLimit) {
      setShowUpgradeModal(true)
      return
    }

    setSelectedSource(sourceId)
    setShowConnectModal(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fontes de Dados</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Conecte suas planilhas e bancos de dados
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Plano: <span className="font-semibold capitalize">{currentPlan}</span>
          </p>
          <p className="text-sm text-gray-600">
            Fontes: <span className="font-semibold">{dataSourcesCount}/{dataSourceLimit}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Máx. {maxRows.toLocaleString('pt-BR')} linhas
          </p>
        </div>
      </div>

      {/* Limit Warning */}
      {dataSourcesCount >= dataSourceLimit && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                Limite de fontes de dados atingido
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                Você atingiu o limite de {dataSourceLimit} fonte de dados no plano Free.
                Faça upgrade para conectar mais fontes.
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

      {/* Source Types */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Conectar Nova Fonte
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sourceTypes.map((source) => {
            const Icon = source.icon
            return (
              <button
                key={source.id}
                onClick={() => handleConnect(source.id, source.available)}
                className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-left transition-all ${
                  source.available
                    ? 'hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 border-2 border-transparent cursor-pointer'
                    : 'opacity-60 cursor-not-allowed border-2 border-gray-200 dark:border-gray-700'
                }`}
              >
                {!source.available && (
                  <div className="absolute top-4 right-4">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div className={`bg-${source.color}-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 text-${source.color}-600`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{source.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{source.description}</p>
                {!source.available && (
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                    Plano Pro
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Connected Sources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Fontes Conectadas
          </h2>
          {dataSources.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {dataSources.length} de {dataSourceLimit} fonte{dataSourceLimit > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <RefreshCw className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300">Carregando fontes de dados...</p>
          </div>
        ) : dataSources.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Database className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma fonte conectada
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Conecte sua primeira fonte de dados para começar a criar dashboards
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dataSources.map((source) => (
              <div
                key={source.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 dark:bg-green-500/20 p-3 rounded-lg">
                      <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{source.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{source.source_type}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {source.row_count.toLocaleString('pt-BR')} linhas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {source.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-semibold">
                          {source.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Última sincronização: {source.last_synced_at || 'Nunca'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(source.id, source.name)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                      title="Deletar fonte"
                    >
                      <Trash2 className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    </button>
                  </div>
                </div>
                
                {/* Botões de ação */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <button
                    onClick={() => navigate(`/dashboards?datasource=${source.id}`)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Criar Dashboard com esta Fonte</span>
                  </button>
                  <button
                    onClick={() => window.open(`/datasources/${source.id}/data`, '_blank')}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    <Table className="h-5 w-5" />
                    <span>Ver e Editar Dados</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <ConnectModal
          sourceType={selectedSource}
          onClose={() => setShowConnectModal(false)}
          onSuccess={loadDataSources}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={selectedSource ? `Conectar ${selectedSource}` : 'Conectar mais fontes'}
        currentPlan={currentPlan}
        requiredPlan="starter"
      />
    </div>
  )
}

// Modal de Conexão
function ConnectModal({ sourceType, onClose, onSuccess }: { 
  sourceType: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    file: null as File | null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploadResponse, setUploadResponse] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      let response: any = null
      
      if (sourceType === 'csv_upload' && formData.file) {
        response = await dataSourceService.uploadCSV(formData.name, formData.file)
      } else if (sourceType === 'google_sheets' && formData.url) {
        response = await dataSourceService.connectGoogleSheets(formData.name, formData.url)
      } else if (sourceType === 'excel_online' && formData.url) {
        response = await dataSourceService.connectGoogleSheets(formData.name, formData.url)
      }

      // Armazenar resposta e mostrar sucesso
      setUploadResponse(response)
      setSuccess(true)
      
      // Se o backend criou um dashboard automaticamente, redirecionar
      if (response && response.dashboard_created) {
        setError('') // Limpar erro
        // Aguardar 2.5 segundos para usuário ler a mensagem
        setTimeout(() => {
          window.location.href = `/dashboards/${response.dashboard_id}`
        }, 2500)
      } else {
        // Aguardar um pouco para o usuário ver a mensagem
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao conectar fonte de dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Conectar {sourceType === 'google_sheets' ? 'Google Sheets' : sourceType === 'excel_online' ? 'Excel Online' : 'CSV'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sourceType === 'csv_upload' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da fonte
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Vendas 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arquivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Máximo 5.000 linhas no plano Free
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da fonte
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Planilha de Vendas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL da planilha
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://docs.google.com/spreadsheets/..."
                />
                <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    ⚠️ Plano Free: A planilha precisa estar pública
                  </p>
                  <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-4 list-decimal">
                    <li>Abra sua planilha no Google Sheets</li>
                    <li>Clique em <strong>"Compartilhar"</strong> (canto superior direito)</li>
                    <li>Em "Acesso geral", selecione <strong>"Qualquer pessoa com o link"</strong></li>
                    <li>Copie a URL e cole aqui</li>
                  </ol>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                    💡 <strong>Planos Starter+:</strong> Conecte planilhas privadas via OAuth2 sem torná-las públicas
                  </p>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-sm text-green-800 dark:text-green-300 font-semibold">
                  {uploadResponse?.dashboard_created 
                    ? '🎉 Dashboard criado automaticamente!' 
                    : 'Fonte de dados conectada com sucesso! ✅'
                  }
                </p>
              </div>
              {uploadResponse?.dashboard_created && (
                <div className="mt-2 pl-7">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Dashboard: <strong>{uploadResponse.dashboard_name}</strong>
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Template: <strong>{uploadResponse.dashboard_template === 'sales' ? 'Vendas' : 'Financeiro'}</strong>
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Redirecionando para o dashboard em 2 segundos...
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || success}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors disabled:opacity-50 bg-white dark:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {success ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Conectado!
                </>
              ) : loading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Conectar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
