'use client';

import React, { useState } from 'react';
import { 
  Megaphone, 
  ChevronRight, 
  Plus, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Image as ImageIcon,
  Gift,
  Bell,
  Mail,
  Layers,
  Activity,
  ArrowUpRight,
  Target,
  BarChart3,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function AdminMarketingPage() {
  const [canais, setCanais] = useState([
    { id: 1, label: 'E-mail Marketing', icon: Mail, status: '98% entrega', active: true },
    { id: 2, label: 'WhatsApp Bot', icon: Megaphone, status: 'Conectado', active: true },
    { id: 3, label: 'SMS Gateway', icon: Bell, status: 'Pausado', active: false },
  ]);

  const toggleCanal = (id: number) => {
    setCanais(canais.map(c => 
      c.id === id ? { ...c, active: !c.active, status: !c.active ? 'Conectado' : 'Pausado' } : c
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/overview" className="hover:text-green-700 transition-colors">Admin</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Marketing & Growth</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Marketing & Mídia</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Gerencie campanhas, impulsione feirantes e monitore o engajamento do consumidor em tempo real.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2">
            <Plus size={20} />
            Lançar Campanha
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Alcance Mensal', value: '45.2k', change: '+12%', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'CTR Médio', value: '3.8%', change: '+0.5%', icon: MousePointer2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Conversão', value: '2.4%', change: '+1.2%', icon: Target, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Verba Utilizada', value: 'R$ 8.4k', change: '84%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
             <div className="flex justify-between items-start">
                <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
                   <stat.icon size={20} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-400'}`}>
                   {stat.change}
                </span>
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900 leading-none mt-1">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Campaigns */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <Activity size={24} className="text-green-700" />
                    Campanhas Ativas
                 </h3>
                 <button className="text-sm font-black text-green-700 hover:underline">Ver Todas</button>
              </div>

              <div className="space-y-6">
                 {[
                   { name: 'Festival do Morango 2024', reach: '12.4k', clicks: '842', status: 'Rodando', type: 'Sazonal' },
                   { name: 'Primeira Compra Frete Grátis', reach: '28.1k', clicks: '1.2k', status: 'Sempre Ativa', type: 'Conversão' },
                   { name: 'Expansão Rio de Janeiro', reach: '8.2k', clicks: '415', status: 'Agendada', type: 'Regional' },
                 ].map((camp, i) => (
                   <div key={i} className="p-6 bg-gray-50 rounded-[32px] border border-transparent hover:border-green-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-700 shadow-sm">
                            <Megaphone size={24} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-900">{camp.name}</p>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-[8px] font-black uppercase tracking-widest">{camp.status}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-8">
                         <div className="text-right">
                            <p className="text-xs font-black text-gray-900">{camp.reach}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Alcance</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-black text-gray-900">{camp.clicks}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cliques</p>
                         </div>
                         <button className="p-3 bg-white rounded-xl text-gray-300 hover:text-green-700 transition-colors border border-gray-100 shadow-sm opacity-0 group-hover:opacity-100">
                            <ChevronRight size={18} />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Quick Actions Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#1b1c19] p-10 rounded-[40px] text-white space-y-6 group cursor-pointer hover:scale-[1.02] transition-all">
                 <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center text-blue-400">
                    <ImageIcon size={32} />
                 </div>
                 <div>
                    <h4 className="text-xl font-black">Banners & Mídia</h4>
                    <p className="text-sm opacity-50 font-medium leading-relaxed mt-2">Configure os banners rotativos da Home, categorias e cupons visuais.</p>
                 </div>
                 <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-xs font-black uppercase tracking-widest">12 ativos</span>
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6 group cursor-pointer hover:scale-[1.02] transition-all">
                 <div className="w-16 h-16 bg-orange-50 rounded-[24px] flex items-center justify-center text-orange-600">
                    <Bell size={32} />
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-gray-900">Notificações Push</h4>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed mt-2">Envie alertas em massa para usuários sobre feiras acontecendo agora.</p>
                 </div>
                 <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Central de Alertas</span>
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-orange-600" />
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Channels & Support */}
        <div className="lg:col-span-4 space-y-8">
           {/* Communication Channels */}
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-4">CANAIS DE COMUNICAÇÃO</h4>
              <div className="space-y-4">
                 {canais.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-green-700 transition-all">
                             <channel.icon size={18} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-gray-900">{channel.label}</p>
                             <p className={`text-[10px] font-bold uppercase ${channel.active ? 'text-green-600' : 'text-gray-400'}`}>{channel.status}</p>
                          </div>
                       </div>
                       <div 
                         onClick={() => toggleCanal(channel.id)}
                         className={`w-10 h-5 rounded-full relative p-1 transition-all cursor-pointer ${channel.active ? 'bg-green-600' : 'bg-gray-200'}`}
                       >
                          <div className={`w-3 h-3 bg-white rounded-full transition-all ${channel.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Growth Tip */}
           <div className="bg-green-700 p-10 rounded-[40px] text-white space-y-6 relative overflow-hidden">
              <div className="relative z-10">
                 <h4 className="text-xl font-black leading-tight">Insight de Crescimento</h4>
                 <p className="text-sm opacity-80 font-medium leading-relaxed mt-4">
                    Usuários que recebem notificações sobre feiras próximas (raio 5km) possuem uma taxa de conversão 3.5x maior que a média.
                 </p>
                 <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white text-white hover:text-green-700 font-black rounded-2xl text-xs uppercase tracking-widest transition-all border border-white/20">
                    Configurar Geo-Push
                 </button>
              </div>
              <Activity size={180} className="absolute -bottom-10 -right-10 opacity-5 -rotate-12" />
           </div>
        </div>
      </div>

    </div>
  );
}
