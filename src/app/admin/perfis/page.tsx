'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Lock, 
  Key, 
  ChevronRight, 
  Plus, 
  Settings2, 
  ShieldAlert,
  UserCheck,
  Store,
  ShoppingBag,
  Truck,
  ChefHat,
  Search,
  MoreVertical,
  Activity
} from 'lucide-react';

export default function AdminPerfisPage() {
  const perfis = [
    { title: 'Super Admin', desc: 'Acesso total e irrestrito ao sistema.', users: '3', status: 'Compliance 100%', icon: ShieldCheck, color: 'green' },
    { title: 'Feirante', desc: 'Gestão de banca, produtos e vendas locais.', users: '1.2k', status: 'Compliance 94%', icon: Store, color: 'orange' },
    { title: 'Cliente / Usuário B2C', desc: 'Compras, pedidos e gestão de perfil pessoal.', users: '45k', status: 'Público', icon: ShoppingBag, color: 'blue' },
    { title: 'Franqueado (Delivery)', desc: 'Monitoramento regional, frotas e aprovações.', users: '24', status: 'Compliance 98%', icon: UserCheck, color: 'green' },
    { title: 'Logística', desc: 'Monitoramento de frotas, rotas e entregadores.', users: '15', status: 'Compliance 100%', icon: Truck, color: 'blue' },
    { title: 'Chef Gourmet', desc: 'Receitas, compras patrocinadas e serviços exclusivos.', users: '8', status: 'Compliance 100%', icon: ChefHat, color: 'orange' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#b7ffc1] text-green-700 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <span className="text-[12px] font-black text-green-700 uppercase tracking-widest">Acessos & Segurança</span>
          </div>
          <h2 className="text-[36px] font-black text-gray-900 tracking-tight leading-tight">Gestão de Perfis</h2>
          <p className="text-[16px] font-medium text-[#404940] mt-1">Configure os níveis de acesso e privilégios para cada tipo de usuário no ecossistema.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-[#bfc9bd]/30 rounded-2xl text-[14px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all">
            <Lock size={18} className="text-green-700" />
            Permissões Globais
          </button>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-green-700 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest shadow-xl shadow-green-900/20 hover:bg-[#2d7a44] transition-all">
            <Plus size={18} />
            Novo Perfil
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-8 rounded-[40px] border border-[#bfc9bd]/20 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-green-700 shadow-sm border border-[#bfc9bd]/10">
            <Users size={32} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#707a6f] uppercase tracking-widest">Total Usuários</p>
            <h3 className="text-[28px] font-black text-gray-900">46,285</h3>
          </div>
        </div>
        <div className="bg-gray-50 p-8 rounded-[40px] border border-[#bfc9bd]/20 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#904d00] shadow-sm border border-[#bfc9bd]/10">
            <ShieldAlert size={32} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#707a6f] uppercase tracking-widest">Pendentes</p>
            <h3 className="text-[28px] font-black text-gray-900">12 Contas</h3>
          </div>
        </div>
        <div className="bg-green-700 p-8 rounded-[40px] text-white flex items-center gap-6 shadow-xl shadow-green-900/10">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-white backdrop-blur-md">
            <Activity size={32} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Compliance</p>
            <h3 className="text-[28px] font-black">98% Global</h3>
          </div>
        </div>
      </div>

      {/* Perfis Grid */}
      <div className="bg-white p-10 rounded-[40px] border border-[#bfc9bd]/20 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-gray-900">Níveis de Acesso Definidos</h3>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bfc9bd]" />
            <input 
              type="text" 
              placeholder="Pesquisar perfil..." 
              className="pl-12 pr-4 py-3 bg-gray-50 border border-[#bfc9bd]/20 rounded-2xl text-[13px] font-bold outline-none focus:ring-2 focus:ring-[#0b612e]/10 w-64"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perfis.map((perfil, i) => (
            <div key={i} className="p-8 bg-gray-50 rounded-[32px] border border-[#bfc9bd]/10 hover:border-[#0b612e]/30 hover:bg-white transition-all group cursor-pointer shadow-sm hover:shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${
                  perfil.color === 'green' ? 'bg-[#b7ffc1] text-green-700' :
                  perfil.color === 'orange' ? 'bg-[#ffdcc3] text-[#904d00]' :
                  'bg-[#f0f7ff] text-[#0066ff]'
                }`}>
                  <perfil.icon size={24} />
                </div>
                <button className="text-[#bfc9bd] hover:text-gray-900">
                  <MoreVertical size={20} />
                </button>
              </div>
              <h4 className="text-[20px] font-black text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{perfil.title}</h4>
              <p className="text-[14px] font-medium text-[#404940] mb-8 leading-relaxed line-clamp-2">{perfil.desc}</p>
              
              <div className="flex justify-between items-center pt-6 border-t border-[#bfc9bd]/10">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-[#707a6f] uppercase tracking-widest">Usuários</span>
                  <span className="text-[15px] font-black text-gray-900">{perfil.users}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black text-[#707a6f] uppercase tracking-widest">Status</span>
                  <p className={`text-[12px] font-black ${perfil.color === 'green' ? 'text-green-700' : 'text-[#904d00]'}`}>{perfil.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Section */}
      <div className="bg-gray-50 p-10 rounded-[40px] border border-[#bfc9bd]/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-green-700">
            <Settings2 size={20} />
          </div>
          <h3 className="text-xl font-black text-gray-900">Logs Recentes de Segurança</h3>
        </div>
        <div className="space-y-4">
          {[
            { log: 'Alterado por Admin_Carlos em "Logística"', time: 'Hoje, 14:32', type: 'Update' },
            { log: 'Novo perfil "Feirante Atacadista" criado por Admin_Sistemas', time: 'Ontem, 09:15', type: 'Create' },
            { log: 'Acesso negado para usuário 4281 (IP: 192.168.1.1)', time: 'Ontem, 18:45', type: 'Security' },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-[#bfc9bd]/10">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  log.type === 'Security' ? 'bg-[#ba1a1a]' : 'bg-green-700'
                }`} />
                <p className="text-[14px] font-bold text-gray-900">{log.log}</p>
              </div>
              <span className="text-[12px] font-medium text-[#707a6f]">{log.time}</span>
            </div>
          ))}
        </div>
        <button className="w-full mt-8 py-4 text-[12px] font-black text-green-700 uppercase tracking-widest hover:underline">Ver todos os logs do sistema</button>
      </div>

    </div>
  );
}
