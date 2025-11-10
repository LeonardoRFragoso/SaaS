import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, TrendingUp, DollarSign, Users, ArrowUpRight, ArrowDownRight, Calendar, Star, Quote } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const salesData = [
  { month: 'Jan', value: 45000 },
  { month: 'Fev', value: 52000 },
  { month: 'Mar', value: 48000 },
  { month: 'Abr', value: 61000 },
  { month: 'Mai', value: 55000 },
  { month: 'Jun', value: 67000 },
]

const revenueData = [
  { month: 'Jan', receita: 120000, despesa: 85000 },
  { month: 'Fev', receita: 135000, despesa: 92000 },
  { month: 'Mar', receita: 128000, despesa: 88000 },
  { month: 'Abr', receita: 152000, despesa: 95000 },
  { month: 'Mai', receita: 145000, despesa: 90000 },
  { month: 'Jun', receita: 168000, despesa: 98000 },
]

const testimonials = [
  {
    name: 'Carlos Silva',
    role: 'CEO, TechVendas',
    company: 'E-commerce',
    avatar: '👨‍💼',
    text: 'O InsightFlow BI transformou nossa tomada de decisão. Aumentamos as vendas em 30% em apenas 2 meses!',
    rating: 5,
  },
  {
    name: 'Ana Paula',
    role: 'Gerente Financeira',
    company: 'Contabilidade Prime',
    avatar: '👩‍💼',
    text: 'Antes gastávamos 10 horas por semana em relatórios. Agora tudo é automático e em tempo real.',
    rating: 5,
  },
  {
    name: 'Roberto Mendes',
    role: 'Diretor Comercial',
    company: 'Logística Express',
    avatar: '👨‍💻',
    text: 'A IA detectou problemas que nem sabíamos que existiam. ROI incrível!',
    rating: 5,
  },
]

export default function Demo() {
  const [period, setPeriod] = useState('30days')
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InsightFlow BI - Demo</span>
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard de Vendas - Demo</h1>
              <p className="text-blue-100">
                Este é um exemplo de dashboard gerado automaticamente pelo InsightFlow BI
              </p>
            </div>
            
            {/* Period Filter */}
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg p-1">
              <Calendar className="h-5 w-5 ml-2" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-transparent text-white font-semibold px-3 py-2 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="7days" className="text-gray-900">Últimos 7 dias</option>
                <option value="30days" className="text-gray-900">Últimos 30 dias</option>
                <option value="90days" className="text-gray-900">Últimos 90 dias</option>
                <option value="year" className="text-gray-900">Este ano</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI Cards - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUpRight className="h-4 w-4" />
                <span>12.5%</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Faturamento</h3>
            <p className="text-2xl font-bold text-gray-900">R$ 168.000</p>
            <p className="text-xs text-gray-500 mt-1">vs. mês anterior</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUpRight className="h-4 w-4" />
                <span>8.3%</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Lucro Líquido</h3>
            <p className="text-2xl font-bold text-gray-900">R$ 70.000</p>
            <p className="text-xs text-gray-500 mt-1">Margem de 41.7%</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center text-red-600 text-sm font-semibold">
                <ArrowDownRight className="h-4 w-4" />
                <span>3.2%</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Novos Clientes</h3>
            <p className="text-2xl font-bold text-gray-900">127</p>
            <p className="text-xs text-gray-500 mt-1">Este mês</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUpRight className="h-4 w-4" />
                <span>15.8%</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Ticket Médio</h3>
            <p className="text-2xl font-bold text-gray-900">R$ 1.323</p>
            <p className="text-xs text-gray-500 mt-1">Por cliente</p>
          </div>
        </div>

        {/* KPI Cards - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUpRight className="h-4 w-4" />
                <span>5.2%</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Taxa de Conversão</h3>
            <p className="text-2xl font-bold text-gray-900">3.8%</p>
            <p className="text-xs text-gray-500 mt-1">Visitantes → Clientes</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUpRight className="h-4 w-4" />
                <span>18.3%</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">ROI Marketing</h3>
            <p className="text-2xl font-bold text-gray-900">4.2x</p>
            <p className="text-xs text-gray-500 mt-1">Retorno sobre investimento</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-pink-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUpRight className="h-4 w-4" />
                <span>22.1%</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Taxa de Retenção</h3>
            <p className="text-2xl font-bold text-gray-900">87%</p>
            <p className="text-xs text-gray-500 mt-1">Clientes recorrentes</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Evolução de Vendas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
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
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Receitas vs Despesas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
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
                <Bar 
                  dataKey="receita" 
                  fill="#10b981" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
                <Bar 
                  dataKey="despesa" 
                  fill="#ef4444" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">💡 Insights da IA</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Atualizado há 5 minutos
            </span>
          </div>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6 py-3 bg-blue-50 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-gray-900 text-lg">🚀 Crescimento Acelerado</p>
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Alta Prioridade</span>
              </div>
              <p className="text-gray-700 mb-3">
                Suas vendas cresceram <strong>12.5%</strong> em relação ao mês anterior. Continue focando nos produtos de maior margem.
              </p>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-900 mb-1">💡 Recomendação:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Aumente o estoque dos 3 produtos mais vendidos</li>
                  <li>Crie campanhas de remarketing para clientes recentes</li>
                  <li>Considere aumentar preços em 5-8% nos produtos premium</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-yellow-500 pl-6 py-3 bg-yellow-50 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-gray-900 text-lg">⚠️ Atenção: Queda na Aquisição</p>
                <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">Ação Necessária</span>
              </div>
              <p className="text-gray-700 mb-3">
                Novos clientes caíram <strong>3.2%</strong> este mês. Detectamos queda no tráfego orgânico e conversão de anúncios.
              </p>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-900 mb-1">💡 Recomendação:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Revise suas campanhas do Google Ads (CTR caiu 1.8%)</li>
                  <li>Otimize a página de checkout (taxa de abandono: 68%)</li>
                  <li>Teste ofertas de desconto para primeiros compradores</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-6 py-3 bg-green-50 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-gray-900 text-lg">💰 Oportunidade Identificada</p>
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Oportunidade</span>
              </div>
              <p className="text-gray-700 mb-3">
                O ticket médio aumentou <strong>15.8%</strong>. Seus clientes estão comprando mais - momento ideal para upsell e cross-sell.
              </p>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-900 mb-1">💡 Recomendação:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Crie bundles de produtos complementares</li>
                  <li>Implemente programa de fidelidade (potencial: +R$ 45k/mês)</li>
                  <li>Ofereça frete grátis acima de R$ 200 (ticket atual: R$ 1.323)</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-6 py-3 bg-purple-50 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-gray-900 text-lg">📊 Padrão Sazonal Detectado</p>
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Insight Preditivo</span>
              </div>
              <p className="text-gray-700 mb-3">
                A IA detectou padrão de aumento de <strong>23%</strong> nas vendas toda segunda quinzena do mês.
              </p>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-900 mb-1">💡 Recomendação:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Programe campanhas de email para dias 15-20 de cada mês</li>
                  <li>Aumente orçamento de ads em 30% neste período</li>
                  <li>Prepare estoque extra para evitar rupturas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Empresas de todos os tamanhos estão transformando dados em resultados com o InsightFlow BI
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <div className="mb-4">
                  <Quote className="h-8 w-8 text-blue-200" />
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Gostou do que viu?</h2>
          <p className="text-xl text-blue-100 mb-6">
            Comece seu teste grátis de 14 dias e tenha dashboards como este para o seu negócio
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold text-lg transition-colors"
          >
            Começar Teste Grátis
          </Link>
        </div>
      </main>
    </div>
  )
}
