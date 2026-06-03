'use client';

import React from 'react';
import { 
  Truck, 
  ChevronRight, 
  MapPin, 
  Navigation, 
  Package, 
  Zap, 
  Activity, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  ExternalLink,
  Map as MapIcon,
  Plus,
  Search,
  Filter,
  BarChart3,
  Globe,
  Settings2,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminLogisticaDashboardPage() {
  const [entregasAtivas, setEntregasAtivas] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      // Fetch active orders (status in pendente, pago, enviado)
      const { data: orders } = await supabase
        .from('mktplace_feira_orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          address:mktplace_feira_addresses(city, neighborhood)
        `)
        .in('status', ['pendente', 'pago', 'enviado'])
        .order('created_at', { ascending: false });

      if (orders) {
        setEntregasAtivas(orders.map(o => {
          const createdAt = new Date(o.created_at);
          const priority = o.total_amount > 100 ? 'Alta' : 'Normal';
          
          // Cálculo simulado de ETA: Normal = +120min, Alta = +60min
          const etaMinutes = priority === 'Alta' ? 60 : 120;
          const etaDate = new Date(createdAt.getTime() + etaMinutes * 60000);
          
          const formatTime = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          return {
            id: `#${o.id.split('-')[0].toUpperCase()}`,
            status: o.status === 'pendente' ? 'Pendente' : o.status === 'pago' ? 'Preparando' : 'Em Rota',
            city: o.address ? `${Array.isArray(o.address) ? o.address[0]?.city : (o.address as any).city} - ${Array.isArray(o.address) ? o.address[0]?.neighborhood : (o.address as any).neighborhood}` : 'Endereço não informado',
            platform: 'Sistema Próprio',
            eta: `${formatTime(etaDate)} (aprox)`,
            priority,
          };
        }));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/overview" className="hover:text-green-700 transition-colors">Admin</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Logística Global</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Monitoramento Logístico</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Visão em tempo real das operações de entrega, roteamento inteligente e saúde das integrações regionais.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/logistica/integracoes" className="px-8 py-4 bg-white border border-gray-200 rounded-[24px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
            <Zap size={20} className="text-green-700" />
            Configurar Hub
          </Link>
          <button className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2">
            <MapPin size={20} />
            Ver Mapa de Rotas
          </button>
        </div>
      </div>

      {/* Real-time Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Entregas Hoje', value: '342', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tempo Médio', value: '24 min', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Entregadores', value: '86', icon: Navigation, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Sucesso', value: '99.2%', icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
             <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl w-fit`}>
                <stat.icon size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900 leading-none mt-1">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Real-time Orders Feed */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-[#1b1c19] p-10 rounded-[40px] text-white shadow-xl shadow-gray-900/20 relative overflow-hidden group">
              <div className="flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                       <Activity size={24} className="text-green-400 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black">Live Delivery Feed</h3>
                 </div>
                 <div className="flex gap-2">
                    <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/30">{entregasAtivas.length} em trânsito</span>
                 </div>
              </div>

              <div className="mt-10 space-y-4 relative z-10">
                 {loading ? (
                    <div className="p-10 text-center text-green-400/50">Carregando pedidos...</div>
                 ) : entregasAtivas.length === 0 ? (
                    <div className="p-10 text-center text-green-400/50 font-bold">Nenhum pedido em andamento no momento.</div>
                 ) : entregasAtivas.map((ent, i) => (
                    <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all group/item">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-green-400">
                             <Package size={20} />
                          </div>
                          <div>
                             <div className="flex items-center gap-3">
                                <p className="text-lg font-black">{ent.id}</p>
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-md text-[8px] font-black uppercase">{ent.status}</span>
                             </div>
                             <p className="text-xs opacity-50 font-medium">{ent.city} • {ent.platform}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right">
                             <p className="text-xs font-black">{ent.eta}</p>
                             <p className="text-[10px] opacity-40 font-bold uppercase">Previsão</p>
                          </div>
                          <button className="p-3 bg-white/10 rounded-xl hover:bg-white hover:text-black transition-all opacity-0 group-hover/item:opacity-100">
                             <Navigation size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
              <Activity size={220} className="absolute -bottom-20 -right-20 opacity-5 group-hover:scale-110 transition-transform duration-1000" />
           </div>

           {/* Regional Metrics */}
           <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-gray-900">Performance por Cidade</h3>
                 <Link href="/admin/logistica/metricas" className="text-sm font-black text-green-700 hover:underline">Ver BI Completo</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { city: 'São Paulo', volume: '1.2k', health: '98%', icon: Globe },
                   { city: 'Rio de Janeiro', volume: '840', health: '92%', icon: Globe },
                 ].map((reg, i) => (
                    <div key={i} className="p-8 bg-gray-50 rounded-[32px] space-y-6">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <reg.icon size={20} className="text-blue-600" />
                             <p className="text-lg font-black text-gray-900">{reg.city}</p>
                          </div>
                          <span className="text-xs font-black text-green-700 bg-green-50 px-2 py-1 rounded-lg">{reg.health}</span>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                             <span>Volume Mensal</span>
                             <span>{reg.volume}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600 w-[80%] rounded-full"></div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Strategic Modules */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-4">CONTROLE ESTRATÉGICO</p>
              {[
                { label: 'Gestão de Rotas', icon: Navigation, desc: 'Otimize trajetos e zonas de entrega.', href: '/admin/logistica/rotas' },
                { label: 'Performance & Métricas', icon: BarChart3, desc: 'Análise de SLAs e tempos médios.', href: '/admin/logistica/metricas' },
                { label: 'Configurações Globais', icon: Settings2, desc: 'Taxas de frete e regras regionais.', href: '/admin/logistica/config' },
              ].map((mod, i) => (
                 <Link key={i} href={mod.href} className="block group">
                    <div className="p-6 bg-gray-50 rounded-[32px] hover:bg-green-700 hover:text-white transition-all flex items-center justify-between group-hover:shadow-xl group-hover:scale-[1.02]">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-2xl text-gray-400 group-hover:text-green-700 transition-all">
                             <mod.icon size={20} />
                          </div>
                          <div>
                             <p className="text-sm font-black leading-tight">{mod.label}</p>
                             <p className="text-[10px] font-medium opacity-60 mt-1">{mod.desc}</p>
                          </div>
                       </div>
                       <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                 </Link>
              ))}
           </div>

           {/* Integration Hub Promo */}
           <div className="bg-[#125d30] p-10 rounded-[40px] text-white space-y-6 relative overflow-hidden group">
              <div className="relative z-10">
                 <h4 className="text-xl font-black leading-tight">Hub Regional Ativo</h4>
                 <p className="text-sm opacity-80 font-medium leading-relaxed mt-4">
                    Sua operação em <b>São Paulo</b> está utilizando iFood e PicknGo simultaneamente para otimizar a velocidade de entrega.
                 </p>
                 <Link href="/admin/logistica/integracoes" className="mt-8 block text-center py-4 bg-white/10 hover:bg-white text-white hover:text-green-700 font-black rounded-2xl text-xs uppercase tracking-widest transition-all border border-white/20">
                    Gerenciar Integrações
                 </Link>
              </div>
              <Zap size={140} className="absolute -bottom-10 -right-10 opacity-10 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
           </div>
        </div>
      </div>

    </div>
  );
}
