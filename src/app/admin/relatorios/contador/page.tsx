'use client';

import React, { useState } from 'react';
import { 
  ChevronRight, 
  Send, 
  Download, 
  ChevronDown, 
  FileText, 
  Eye, 
  ArrowUpRight,
  TrendingUp,
  Info,
  Check,
  Truck,
  Store,
  DollarSign,
  X
} from 'lucide-react';

export default function AdminRelatorioContadorPage() {
  const [selectedFormat, setSelectedFormat] = useState('CSV');
  const [activeTab, setActiveTab] = useState('notas');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    faturamentoTotal: 0,
    vendasB2C: 0,
    vendasB2B: 0,
    repassesLogistica: 0,
    repassesFeirantes: 0,
    receitaPlataforma: 0
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('/api/admin/contador')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setTransactions(json.data.transactions || []);
          if (json.data.metrics) {
            setMetrics(json.data.metrics);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[11px] font-black text-green-700 uppercase tracking-widest mb-2">CONTABILIDADE & FISCAL</p>
          <h2 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Relatório para Contador</h2>
          <p className="text-[16px] text-gray-500 font-medium max-w-2xl">Consolidação de dados fiscais e faturamento para exportação mensal.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-8 py-4 bg-gray-100 border border-gray-200 rounded-[24px] font-bold text-gray-900 hover:bg-gray-200 transition-all">
            <Send size={20} />
            Enviar para Contador
          </button>
          <button className="flex items-center gap-3 px-8 py-4 bg-[#fc6c29] text-white rounded-[24px] font-bold shadow-lg shadow-orange-900/10 hover:bg-[#e65a1d] transition-all">
            <Download size={20} />
            Exportar Tudo
          </button>
        </div>
      </div>

      {/* Filters & Format Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Período de Apuração */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
            <h3 className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Período de Apuração</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MÊS</p>
              <div className="relative group">
                <select className="w-full pl-4 pr-10 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none appearance-none font-bold text-sm">
                  <option>Setembro 2023</option>
                  <option>Agosto 2023</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-green-700" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TIPO DE DADO</p>
              <div className="relative group">
                <select className="w-full pl-4 pr-10 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none appearance-none font-bold text-sm">
                  <option>Faturamento Bruto</option>
                  <option>Imposto Devido</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-green-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Impostos Checkboxes */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
            <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center text-green-700">
              <Check size={14} strokeWidth={4} />
            </div>
            Impostos
          </h3>
          <div className="space-y-4">
            {[
              { label: 'ICMS / ST', checked: true },
              { label: 'PIS / COFINS', checked: true },
              { label: 'ISS Retido', checked: false }
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                  item.checked ? 'bg-green-700 border-green-700 text-white' : 'border-gray-200 group-hover:border-green-600'
                }`}>
                  {item.checked && <Check size={12} strokeWidth={4} />}
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Formato Selection */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Formato</h3>
          <div className="flex gap-2 mb-6">
            {['PDF', 'CSV', 'XML'].map((fmt) => (
              <button 
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`flex-1 py-3 rounded-xl font-black text-xs tracking-widest transition-all ${
                  selectedFormat === fmt 
                    ? 'bg-green-800 text-white shadow-lg shadow-green-900/10' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-medium text-gray-400 leading-relaxed italic">
            Arquivo pronto para integração com softwares contábeis (Alterdata, Domínio).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Faturamento Total */}
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[32px] border-l-8 border-green-700 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">FATURAMENTO TOTAL</p>
            <div className="p-2 bg-green-50 rounded-lg text-green-700">
              <Download size={20} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{fmt(metrics.faturamentoTotal)}</h3>
          <div className="flex items-center gap-1.5 text-xs font-black text-green-600">
            <TrendingUp size={16} />
            Dados atualizados do sistema
          </div>
        </div>

        {/* Vendas B2C */}
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[32px] border-l-8 border-orange-500 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">VENDAS B2C (CPF)</p>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Info size={20} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{fmt(metrics.vendasB2C)}</h3>
          <p className="text-xs font-bold text-gray-400">{metrics.faturamentoTotal ? Math.round((metrics.vendasB2C / metrics.faturamentoTotal) * 100) : 0}% do volume total</p>
        </div>

        {/* Vendas B2B */}
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[32px] border-l-8 border-green-800 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">VENDAS B2B (CNPJ)</p>
            <div className="p-2 bg-green-50 rounded-lg text-green-800">
              <FileText size={20} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{fmt(metrics.vendasB2B)}</h3>
          <p className="text-xs font-bold text-gray-400">{metrics.faturamentoTotal ? Math.round((metrics.vendasB2B / metrics.faturamentoTotal) * 100) : 0}% do volume total</p>
        </div>

        {/* Repasses Logística */}
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[32px] border-l-8 border-blue-500 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">REPASSES LOGÍSTICA</p>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Truck size={20} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{fmt(metrics.repassesLogistica)}</h3>
          <p className="text-xs font-bold text-gray-400">Pagamentos a transportadoras</p>
        </div>

        {/* Repasses Feirantes/Parceiros */}
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[32px] border-l-8 border-purple-500 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">REPASSES FEIRANTES</p>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Store size={20} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{fmt(metrics.repassesFeirantes)}</h3>
          <p className="text-xs font-bold text-gray-400">Total líquido pago a parceiros</p>
        </div>

        {/* Receita da Plataforma */}
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[32px] border-l-8 border-yellow-500 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">RECEITA (LUCRO FEIRA.CASA)</p>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <DollarSign size={20} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{fmt(metrics.receitaPlataforma)}</h3>
          <p className="text-xs font-bold text-gray-400">Comissões + Mensalidades + Spread Frete</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-100 dark:border-gray-800 pb-px">
        <button
          onClick={() => setActiveTab('notas')}
          className={`pb-4 px-2 font-black text-sm transition-all border-b-2 ${
            activeTab === 'notas' 
              ? 'border-green-700 text-green-700' 
              : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Notas Fiscais
        </button>
        <button
          onClick={() => setActiveTab('pagamentos')}
          className={`pb-4 px-2 font-black text-sm transition-all border-b-2 ${
            activeTab === 'pagamentos' 
              ? 'border-green-700 text-green-700' 
              : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pagamentos e Repasses
        </button>
      </div>

      {/* Main Table */}
      {activeTab === 'notas' && (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Detalhamento de Notas por Categoria</h3>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-black uppercase">{transactions.length} NOTAS GERADAS</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-[10px] font-black uppercase">PROCESSAMENTO OK</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">DATA/HORA</th>
                  <th className="px-6 py-5">SÉRIE / Nº NOTA</th>
                  <th className="px-6 py-5">CLIENTE / TIPO</th>
                  <th className="px-6 py-5">VALOR BRUTO</th>
                  <th className="px-6 py-5">BASE CÁLCULO ICMS</th>
                  <th className="px-6 py-5">ALÍQUOTA</th>
                  <th className="px-6 py-5">IMPOSTO DEVIDO</th>
                  <th className="px-8 py-5 text-right">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {transactions.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
                    <td className="px-8 py-6 text-sm font-medium text-gray-500">{row.date}</td>
                    <td className="px-6 py-6 text-sm font-black text-gray-900 dark:text-white">{row.note}</td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">{row.client}</p>
                      <p className="text-[10px] font-black text-orange-600 uppercase">{row.type}</p>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-500">{row.value}</td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-500">{row.base}</td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-500">{row.aliq}</td>
                    <td className="px-6 py-6 text-sm font-black text-red-600">{row.tax}</td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => setSelectedTransaction(row)} className="p-2 text-gray-400 hover:text-green-700 transition-all">
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-400 italic">Mostrando todos os lançamentos contábeis reais.</p>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-green-700 transition-all">
                <ChevronRight size={18} className="rotate-180" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-700 text-white font-black text-sm">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-green-700 transition-all font-black text-sm">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-green-700 transition-all font-black text-sm">3</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-green-700 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pagamentos' && (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Detalhamento de Transações (Repasses)</h3>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-[10px] font-black uppercase">SPLIT CONFIGURADO</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">DATA/HORA</th>
                  <th className="px-6 py-5">TRANSAÇÃO</th>
                  <th className="px-6 py-5">VALOR TOTAL</th>
                  <th className="px-6 py-5">TAXA FEIRA.CASA (12%)</th>
                  <th className="px-6 py-5">FRETE / LOGÍSTICA</th>
                  <th className="px-6 py-5">REPASSE FEIRANTE</th>
                  <th className="px-8 py-5 text-right">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {transactions.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
                    <td className="px-8 py-6 text-sm font-medium text-gray-500">{row.date}</td>
                    <td className="px-6 py-6 text-sm font-black text-gray-900 dark:text-white">{row.trans}</td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-900 dark:text-white">{row.value}</td>
                    <td className="px-6 py-6 text-sm font-bold text-yellow-600">{row.fee}</td>
                    <td className="px-6 py-6 text-sm font-bold text-blue-600">{row.shipping}</td>
                    <td className="px-6 py-6 text-sm font-black text-green-700">{row.repasse}</td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => setSelectedTransaction(row)} className="p-2 text-gray-400 hover:text-green-700 transition-all">
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-400 italic">Mostrando todas as liquidações no período.</p>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-green-700 transition-all">
                <ChevronRight size={18} className="rotate-180" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-700 text-white font-black text-sm">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-green-700 transition-all font-black text-sm">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-green-700 transition-all font-black text-sm">3</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-green-700 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Box */}
      <div className="p-8 bg-green-50 dark:bg-green-900/10 rounded-[32px] border border-green-100 dark:border-green-900/20 flex gap-6 items-start">
        <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
          <Info size={28} />
        </div>
        <div>
          <h4 className="text-lg font-black text-green-800 dark:text-green-400 mb-2 leading-none">Aviso Importante</h4>
          <p className="text-sm font-medium text-green-700 dark:text-green-500 leading-relaxed max-w-5xl">
            Este relatório utiliza a base de dados sincronizada com a <span className="font-bold">SEFAZ</span>. Eventuais cancelamentos de notas devem ser validados diretamente no portal nacional antes do envio definitivo para o <span className="font-bold">SPED Fiscal</span>.
          </p>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTransaction(null)} />
          <div className="relative w-[80vw] h-[80vh] bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
            {/* Modal Header */}
            <header className="h-20 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between px-8 bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/20">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Raio-X da Transação</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedTransaction.trans} • {selectedTransaction.date}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"
              >
                <X size={24} />
              </button>
            </header>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30 dark:bg-gray-900/50">
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header Info */}
                <div className="grid grid-cols-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CLIENTE</p>
                    <p className="text-base font-black text-gray-900 dark:text-white">{selectedTransaction.client}</p>
                    <p className="text-xs font-bold text-green-700 mt-0.5">{selectedTransaction.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nº DA NOTA FISCAL (SÉRIE)</p>
                    <p className="text-base font-black text-gray-900 dark:text-white">{selectedTransaction.note}</p>
                  </div>
                </div>

                {/* Tributação & Valor Bruto */}
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
                    Composição Fiscal (SEFAZ)
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">VALOR BRUTO PAGO</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white">{selectedTransaction.value}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">BASE DE CÁLCULO</p>
                      <p className="text-xl font-black text-gray-500">{selectedTransaction.base}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ALÍQUOTA ICMS</p>
                      <p className="text-xl font-black text-gray-500">{selectedTransaction.aliq}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/20 shadow-sm">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">IMPOSTO DEVIDO</p>
                      <p className="text-xl font-black text-red-600">{selectedTransaction.tax}</p>
                    </div>
                  </div>
                </div>

                {/* Split Financeiro */}
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                    Liquidação / Split Financeiro
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TAXA PLATAFORMA (12%)</p>
                      <p className="text-xl font-black text-yellow-600">{selectedTransaction.fee}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">CUSTO LOGÍSTICA</p>
                      <p className="text-xl font-black text-blue-600">{selectedTransaction.shipping}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/20 shadow-sm">
                      <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">REPASSE FEIRANTE (LÍQUIDO)</p>
                      <p className="text-xl font-black text-purple-700">{selectedTransaction.repasse}</p>
                    </div>
                  </div>
                </div>

                {/* Lucro Feira.Casa */}
                <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-200 dark:border-green-900/30 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="text-lg font-black text-green-800 dark:text-green-400 mb-1">LUCRO (FEIRA.CASA)</h4>
                    <p className="text-xs font-bold text-green-700 dark:text-green-500">Taxa retida na venda + markup de frete e serviços nesta transação.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-green-700">{selectedTransaction.profit}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
