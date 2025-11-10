/**
 * Sistema de Renderização Dinâmica de KPIs e Gráficos
 * Detecta automaticamente qualquer KPI ou gráfico da API e permite adicionar/remover
 */

export interface KPIConfig {
  key: string
  label: string
  value: number | string
  format: 'currency' | 'percentage' | 'number' | 'text'
  icon: string
  color: string
  description?: string
  category?: string
}

export interface ChartConfig {
  key: string
  label: string
  type: 'line' | 'bar' | 'pie' | 'histogram' | 'scatter'
  data: any[]
  priority: 'high' | 'medium' | 'low'
  description?: string
}

/**
 * Mapeamento inteligente de nomes de KPIs para configuração visual
 */
const KPI_METADATA: Record<string, Partial<KPIConfig>> = {
  // Financeiros
  total_revenue: { label: 'Faturamento', format: 'currency', icon: 'DollarSign', color: 'blue', category: 'financial' },
  valor_bruto_total: { label: 'Valor Bruto', format: 'currency', icon: 'DollarSign', color: 'indigo', category: 'financial' },
  valor_liquido_total: { label: 'Valor Líquido', format: 'currency', icon: 'DollarSign', color: 'green', category: 'financial' },
  margem_liquida: { label: 'Margem Líquida', format: 'percentage', icon: 'TrendingUp', color: 'green', category: 'financial' },
  total_descontos: { label: 'Descontos', format: 'currency', icon: 'TrendingDown', color: 'red', category: 'financial' },
  desconto_medio: { label: 'Desconto Médio', format: 'percentage', icon: 'Percent', color: 'orange', category: 'financial' },
  custo_taxas: { label: 'Custo Taxas', format: 'currency', icon: 'CreditCard', color: 'yellow', category: 'financial' },
  receita_juros: { label: 'Receita Juros', format: 'currency', icon: 'TrendingUp', color: 'green', category: 'financial' },
  
  // Clientes e Transações
  total_customers: { label: 'Clientes', format: 'number', icon: 'Users', color: 'purple', category: 'customer' },
  avg_ticket: { label: 'Ticket Médio', format: 'currency', icon: 'BarChart3', color: 'orange', category: 'customer' },
  total_quantity: { label: 'Quantidade', format: 'number', icon: 'Package', color: 'blue', category: 'product' },
  taxa_aprovacao: { label: 'Taxa Aprovação', format: 'percentage', icon: 'CheckCircle', color: 'green', category: 'payment' },
  
  // Performance
  growth_rate: { label: 'Crescimento', format: 'percentage', icon: 'TrendingUp', color: 'green', category: 'performance' },
  melhor_vendedor: { label: 'Melhor Vendedor', format: 'text', icon: 'Award', color: 'yellow', category: 'performance' },
  vendas_melhor_vendedor: { label: 'Vendas Top', format: 'currency', icon: 'Award', color: 'yellow', category: 'performance' },
  melhor_regiao: { label: 'Melhor Região', format: 'text', icon: 'MapPin', color: 'indigo', category: 'location' },
  vendas_melhor_regiao: { label: 'Vendas Região', format: 'currency', icon: 'MapPin', color: 'indigo', category: 'location' },
}

/**
 * Detecta automaticamente TODOS os KPIs da API e cria configuração
 */
export function detectKPIs(apiKPIs: Record<string, any>): KPIConfig[] {
  const kpis: KPIConfig[] = []
  
  for (const [key, value] of Object.entries(apiKPIs)) {
    // Ignorar valores null/undefined
    if (value === null || value === undefined) continue
    
    // Buscar metadata predefinida OU criar dinamicamente
    const metadata = KPI_METADATA[key] || inferKPIMetadata(key, value)
    
    kpis.push({
      key,
      label: metadata.label || formatKeyToLabel(key),
      value,
      format: metadata.format || inferFormat(key, value),
      icon: metadata.icon || 'BarChart3',
      color: metadata.color || 'gray',
      description: metadata.description,
      category: metadata.category || 'other'
    })
  }
  
  return kpis
}

/**
 * Infere metadata de um KPI desconhecido baseado em heurística
 */
function inferKPIMetadata(key: string, value: any): Partial<KPIConfig> {
  const keyLower = key.toLowerCase()
  
  // Detectar tipo baseado no nome
  if (keyLower.includes('valor') || keyLower.includes('receita') || keyLower.includes('revenue') || 
      keyLower.includes('preco') || keyLower.includes('price') || keyLower.includes('custo')) {
    return { format: 'currency', icon: 'DollarSign', color: 'blue', category: 'financial' }
  }
  
  if (keyLower.includes('taxa') || keyLower.includes('rate') || keyLower.includes('percentual') || 
      keyLower.includes('margem') || keyLower.includes('margin')) {
    return { format: 'percentage', icon: 'Percent', color: 'green', category: 'metric' }
  }
  
  if (keyLower.includes('cliente') || keyLower.includes('customer') || keyLower.includes('usuario')) {
    return { format: 'number', icon: 'Users', color: 'purple', category: 'customer' }
  }
  
  if (keyLower.includes('vendedor') || keyLower.includes('seller') || keyLower.includes('melhor')) {
    return { format: 'text', icon: 'Award', color: 'yellow', category: 'performance' }
  }
  
  if (keyLower.includes('regiao') || keyLower.includes('region') || keyLower.includes('estado')) {
    return { format: 'text', icon: 'MapPin', color: 'indigo', category: 'location' }
  }
  
  // Padrão: detectar por tipo de valor
  if (typeof value === 'number') {
    if (value > 1000) {
      return { format: 'currency', icon: 'DollarSign', color: 'blue', category: 'financial' }
    }
    return { format: 'number', icon: 'Hash', color: 'gray', category: 'metric' }
  }
  
  return { format: 'text', icon: 'Info', color: 'gray', category: 'other' }
}

/**
 * Infere formato baseado na chave e valor
 */
function inferFormat(key: string, value: any): KPIConfig['format'] {
  if (typeof value === 'string') return 'text'
  if (typeof value === 'number') {
    const keyLower = key.toLowerCase()
    if (keyLower.includes('taxa') || keyLower.includes('rate') || keyLower.includes('margem')) {
      return 'percentage'
    }
    if (keyLower.includes('valor') || keyLower.includes('preco') || keyLower.includes('receita')) {
      return 'currency'
    }
    return 'number'
  }
  return 'text'
}

/**
 * Converte key snake_case para Label Legível
 */
function formatKeyToLabel(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Formata valor de KPI para exibição
 */
export function formatKPIValue(value: number | string, format: KPIConfig['format']): string {
  if (typeof value === 'string') return value
  
  switch (format) {
    case 'currency':
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'number':
      return value.toLocaleString('pt-BR')
    default:
      return String(value)
  }
}

/**
 * Detecta automaticamente TODOS os gráficos da API
 */
export function detectCharts(apiCharts: Record<string, any>, suggestions: any[] = []): ChartConfig[] {
  const charts: ChartConfig[] = []
  
  for (const [key, data] of Object.entries(apiCharts)) {
    if (!data || (Array.isArray(data) && data.length === 0)) continue
    
    // Buscar sugestão correspondente para prioridade
    const suggestion = suggestions.find(s => s.chart_type === key)
    
    charts.push({
      key,
      label: formatKeyToLabel(key),
      type: inferChartType(key, data),
      data: Array.isArray(data) ? data : [],
      priority: suggestion?.priority || 'medium',
      description: suggestion?.reason
    })
  }
  
  return charts
}

/**
 * Infere tipo de gráfico baseado nos dados
 */
function inferChartType(key: string, data: any): ChartConfig['type'] {
  const keyLower = key.toLowerCase()
  
  if (keyLower.includes('evolution') || keyLower.includes('trend') || keyLower.includes('weekly')) {
    return 'line'
  }
  if (keyLower.includes('distribution') || keyLower.includes('histogram')) {
    return 'histogram'
  }
  if (keyLower.includes('category') || keyLower.includes('sales') || keyLower.includes('top')) {
    return 'bar'
  }
  if (keyLower.includes('analysis') || keyLower.includes('scatter')) {
    return 'scatter'
  }
  if (keyLower.includes('share') || keyLower.includes('percentage')) {
    return 'pie'
  }
  
  // Inferir por estrutura de dados
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0]
    if (first.month || first.week || first.date) return 'line'
    if (first.range || first.count) return 'histogram'
    if (first.name || first.category) return 'bar'
  }
  
  return 'bar' // padrão
}

/**
 * Cores dos ícones por categoria
 */
export const ICON_COLORS: Record<string, { bg: string; text: string }> = {
  financial: { bg: 'bg-blue-100', text: 'text-blue-600' },
  customer: { bg: 'bg-purple-100', text: 'text-purple-600' },
  product: { bg: 'bg-orange-100', text: 'text-orange-600' },
  payment: { bg: 'bg-green-100', text: 'text-green-600' },
  performance: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  location: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  metric: { bg: 'bg-teal-100', text: 'text-teal-600' },
  other: { bg: 'bg-gray-100', text: 'text-gray-600' }
}

/**
 * Obter configuração de cor por categoria ou cor especificada
 */
export function getColorConfig(category?: string, colorName?: string) {
  if (category && ICON_COLORS[category]) {
    return ICON_COLORS[category]
  }
  
  // Mapeamento de nome de cor para classes Tailwind
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600' }
  }
  
  return colorName && colorMap[colorName] ? colorMap[colorName] : ICON_COLORS.other
}
