import React from 'react';
import Link from 'next/link';
import {
  DollarSign, Truck, UserCheck, Wallet, ArrowUpRight,
  TrendingUp, Clock, ChevronRight, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function FranchiseeDashboard() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.access_token;
      fetch('/api/franchisee', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setData(res.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, []);

  const faturamento = data?.faturamento || 0;
  const totalDelivery = data?.totalDelivery || 0;
  const pendingProducers = data?.pendingProducers || 0;
  const comissao = data?.comissao || 0;
  const activitiesList = data?.activities || [];
  return (
    <div className="space-y-7 pb-10">

      <div>
        <p className="text-gray-500 font-medium mt-1">
          {loading ? 'Carregando dados...' : `Bem-vindo de volta, você tem ${pendingProducers} novos feirantes para revisar hoje.`}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <DollarSign size={16} className="text-green-700" />
            </div>
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12% vs mês ant.</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Faturamento Regional</p>
          <p className="text-2xl font-black text-gray-900">R$ {faturamento.toFixed(2).replace('.', ',')}</p>
        </div>
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Truck size={16} className="text-blue-600" />
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">89% no prazo</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Delivery</p>
          <p className="text-2xl font-black text-gray-900">{totalDelivery} pedidos</p>
        </div>
        <div className="bg-white rounded-[24px] border border-red-100 p-5 shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <UserCheck size={16} className="text-red-600" />
            </div>
            <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">URGENTE</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Aguardando Aprovação</p>
          <p className="text-2xl font-black text-red-600">{String(pendingProducers).padStart(2, '0')} Novos Feirantes</p>
        </div>
        <div className="bg-[#125d30] rounded-[24px] p-5 shadow-xl shadow-green-900/20 text-white">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <Wallet size={16} className="text-white" />
          </div>
          <p className="text-[10px] font-black text-green-200 uppercase tracking-widest mb-1">Comissão do Mês</p>
          <p className="text-2xl font-black text-white">R$ {comissao.toFixed(2).replace('.', ',')}</p>
          <p className="text-[10px] text-green-200 mt-1">Previsão de pagamento em 05/10</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Atividades Recentes */}
        <div className="lg:col-span-2 bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-base font-black text-gray-900">Atividades Recentes</h2>
            <Link href="/portal/franchisee/feirantes" className="text-sm font-bold text-green-700 hover:text-green-800 flex items-center gap-1">
              Ver tudo <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  {['DATA', 'FEIRANTE', 'AÇÃO', 'STATUS'].map(h => (
                    <th key={h} className="text-left px-7 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activitiesList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-7 py-8 text-center text-gray-400 font-medium">Nenhuma atividade recente.</td>
                  </tr>
                )}
                {activitiesList.map((a: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-7 py-4 text-xs font-bold text-gray-500">{a.date}</td>
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${a.color}`}>{a.initial}</div>
                        <span className="font-bold text-gray-900 text-sm">{a.vendor}</span>
                      </div>
                    </td>
                    <td className="px-7 py-4 text-sm font-bold text-gray-600">{a.action}</td>
                    <td className="px-7 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black ${a.statusColor}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Destaque do Dia */}
        <div className="space-y-4">
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-5 pt-5 pb-2">Destaque do Dia</p>
            <div className="relative mx-4 mb-4 rounded-[20px] overflow-hidden h-36">
              <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=600" className="w-full h-full object-cover" alt="Destaque" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-[9px] font-black text-green-300 uppercase tracking-widest">Inovação Regional</span>
                <p className="text-white font-black text-sm leading-tight">Feira Noturna de Pinheiros bate recorde de entregas em 1 hora.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-green-700" />
              <p className="font-black text-gray-900 text-sm">Meta de Expansão</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-[#125d30] rounded-full" style={{ width: '72%' }} />
            </div>
            <p className="text-xs text-gray-500 font-medium">Você está a 3 novos feirantes da meta trimestral.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
