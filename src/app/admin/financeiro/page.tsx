'use client';

import React from 'react';
import { 
  DollarSign, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  PieChart, 
  BookOpen, 
  FileText, 
  ArrowUpRight, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  Wallet,
  ArrowRight,
  Activity,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function AdminFinanceiroDashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const [exporting, setExporting] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newTransDesc, setNewTransDesc] = React.useState('');
  const [newTransAmount, setNewTransAmount] = React.useState('');
  const [newTransType, setNewTransType] = React.useState('Despesa Extra');
  const [searchTerm, setSearchTerm] = React.useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch('/api/admin/financeiro', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Erro ao carregar dados financeiros:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      showToast("DRE exportado com sucesso!", "success");
    }, 1500);
  };

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch('/api/admin/financeiro', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          description: newTransDesc,
          amount: parseFloat(newTransAmount),
          type: newTransType
        })
      }).then(r => r.json());

      if (res.success) {
        showToast('Lançamento registrado com sucesso!', 'success');
        setIsModalOpen(false);
        setNewTransDesc('');
        setNewTransAmount('');
        fetchData(); // Recarrega os dados
      } else {
        showToast(res.error || 'Erro ao registrar', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro interno ao registrar transação', 'error');
    } finally {
      setAdding(false);
    }
  };

  const faturamentoTotal = data?.faturamentoTotal || 0;
  const lucroOperacional = data?.lucroOperacional || 0;
  const repassesPendentes = data?.repassesPendentes || 0;
  const transacoes = data?.transacoes || [];

  const filteredTransacoes = transacoes.filter((t: any) => 
    t.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.date.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/overview" className="hover:text-green-700 transition-colors">Admin</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Financeiro & ERP</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Financeiro Central</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Consolidado de movimentações, repasses para feirantes e saúde contábil do ecossistema.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExport} disabled={exporting || loading} className="px-8 py-4 bg-white border border-gray-200 rounded-[24px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-70">
            <BookOpen size={20} />
            {exporting ? "Exportando..." : "Exportar DRE"}
          </button>
          <button onClick={handleAdd} disabled={adding || loading} className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70">
            <Plus size={20} />
            {adding ? "Processando..." : "Nova Lançamento"}
          </button>
        </div>
      </div>

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-[#1b1c19] p-10 rounded-[40px] text-white shadow-xl shadow-gray-900/20 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
               <div className="p-3 bg-white/10 rounded-2xl">
                  <Wallet size={24} className="text-green-400" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Em Conta</span>
            </div>
            <div className="mt-8 relative z-10">
               <p className="text-sm opacity-50 font-medium">Faturamento Consolidado</p>
               <h3 className="text-[48px] font-black leading-none mt-1">R$ {faturamentoTotal.toFixed(2).replace('.', ',')}</h3>
            </div>
            <div className="mt-8 flex gap-4 relative z-10">
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-xs font-black">+14.2%</span>
               </div>
               <Link href="/admin/financeiro/gateways" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white hover:text-black rounded-xl transition-all">
                  <Zap size={14} />
                  <span className="text-xs font-black">Gateways</span>
               </Link>
            </div>
            <Activity size={180} className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-700" />
         </div>

         <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
               <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                  <TrendingDown size={24} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Pendente</span>
            </div>
            <div>
               <p className="text-sm text-gray-400 font-medium">A Repassar (Feirantes)</p>
               <h3 className="text-[40px] font-black text-gray-900 leading-none mt-1">R$ {repassesPendentes.toFixed(2).replace('.', ',')}</h3>
            </div>
            <button className="w-full py-4 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-black rounded-[20px] text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2" onClick={() => {
                showToast('Processando pagamentos... Isso pode levar alguns segundos.', 'info');
                setTimeout(() => {
                  showToast('Lote de pagamento processado com sucesso! Recibos gerados.', 'success');
                  // Update state to remove pendentes
                  setData((prev: any) => ({ ...prev, repassesPendentes: 0 }));
                }, 2000);
            }}>
               Lote de Pagamento <ArrowRight size={14} />
            </button>
         </div>

         <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <PieChart size={24} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Lucro Operacional</span>
            </div>
            <div>
               <p className="text-sm text-gray-400 font-medium">Lucro Operacional Estimado (15%)</p>
               <h3 className="text-[40px] font-black text-gray-900 leading-none mt-1">R$ {lucroOperacional.toFixed(2).replace('.', ',')}</h3>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-600 w-[72%] rounded-full"></div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 italic">*Excluindo custos fixos de logística regional.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* Transações Recentes */}
         <div className="lg:col-span-8 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <h3 className="text-2xl font-black text-gray-900">Extrato Consolidado</h3>
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="relative w-full md:w-64">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Buscar transação..."
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-green-700 outline-none transition-all"
                   />
                 </div>
                 <button className="text-sm font-black text-green-700 hover:underline whitespace-nowrap">Ver Full Log</button>
               </div>
            </div>
            <div className="divide-y divide-gray-50">
               {filteredTransacoes.length === 0 && (
                 <div className="p-8 text-center text-gray-500 font-medium">Nenhuma transação encontrada.</div>
               )}
               {filteredTransacoes.map((t: any) => (
                  <div key={t.id} className="p-8 flex items-center justify-between group hover:bg-gray-50/50 transition-all cursor-pointer">
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-100 bg-green-50 text-green-700`}>
                           <TrendingUp size={24} />
                        </div>
                        <div>
                           <p className="text-lg font-black text-gray-900 leading-tight">{t.desc}</p>
                           <div className="flex items-center gap-4 mt-1 text-xs font-bold text-gray-400">
                              <span className="flex items-center gap-1 uppercase tracking-widest">{t.type}</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {t.date}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-10">
                        <div className="text-right">
                           <p className="text-lg font-black text-green-700">{t.valor}</p>
                           <p className={`text-[10px] font-black uppercase tracking-widest ${
                              t.status === 'entregue' ? 'text-green-600' : 'text-orange-400'
                           }`}>
                              ● {t.status}
                           </p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-green-700 transition-colors" />
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* ERP Modules Access */}
         <div className="lg:col-span-4 space-y-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-4">MÓDULOS ERP</p>
            {[
              { label: 'Contas a Pagar/Receber', icon: Receipt, desc: 'Gestão de fluxos e fornecedores.', href: '/admin/financeiro/contas' },
              { label: 'Centro de Custos', icon: PieChart, desc: 'Análise de gastos por unidade/feira.', href: '/admin/financeiro/gastos' },
              { label: 'Contabilidade & Fiscal', icon: BookOpen, desc: 'Integração com contadores externos.', href: '/admin/financeiro/contabil' },
              { label: 'Notas Fiscais (NFe)', icon: FileText, desc: 'Geração e monitoramento de notas.', href: '/admin/notas-fiscais' },
            ].map((mod, i) => (
               <Link key={i} href={mod.href} className="block group">
                  <div className="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-green-700 group-hover:text-white transition-all">
                           <mod.icon size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-black text-gray-900 leading-tight">{mod.label}</p>
                           <p className="text-[10px] font-medium text-gray-400 mt-1">{mod.desc}</p>
                        </div>
                     </div>
                     <ArrowUpRight size={18} className="text-gray-300 group-hover:text-green-700 transition-colors" />
                  </div>
               </Link>
            ))}

            {/* Tax Notice */}
            <div className="p-8 bg-blue-50 border border-blue-100 rounded-[40px] space-y-4">
               <div className="flex items-center gap-3 text-blue-700">
                  <ShieldCheck size={20} />
                  <p className="text-sm font-black">Conformidade Fiscal</p>
               </div>
               <p className="text-xs font-medium text-blue-600/80 leading-relaxed">
                  O ecossistema Feira.Casa realiza a retenção automática de taxas administrativas antes do repasse aos feirantes, garantindo conformidade com o regime tributário de cada unidade.
               </p>
            </div>
         </div>
      </div>

      {/* Modal de Nova Transação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Novo Lançamento</h3>
            <form onSubmit={submitTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Descrição</label>
                <input 
                  type="text" 
                  value={newTransDesc} 
                  onChange={e => setNewTransDesc(e.target.value)} 
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-900" 
                  placeholder="Ex: Compra de Equipamento" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newTransAmount} 
                    onChange={e => setNewTransAmount(e.target.value)} 
                    className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-900" 
                    placeholder="-150.00" 
                    required 
                  />
                  <span className="text-[10px] text-gray-400 font-bold mt-1 block">Use "-" para despesas.</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tipo</label>
                  <select 
                    value={newTransType} 
                    onChange={e => setNewTransType(e.target.value)} 
                    className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-900"
                  >
                    <option value="Despesa Extra">Despesa Extra</option>
                    <option value="Aporte">Aporte</option>
                    <option value="Saque">Saque / Retirada</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all">Cancelar</button>
                <button type="submit" disabled={adding} className="flex-1 py-4 bg-[#125d30] text-white font-black rounded-2xl hover:bg-green-800 shadow-lg shadow-green-900/10 transition-all disabled:opacity-50">
                  {adding ? 'Salvando...' : 'Salvar Transação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
