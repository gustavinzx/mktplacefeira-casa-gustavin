'use client';

import React, { useState, useEffect } from 'react';
import { Users, Store, Map, Search, Filter, Plus, UserCheck, UserX, Loader2 } from 'lucide-react';

export default function CadastrosPage() {
  const [stats, setStats] = useState<any>({ total: 0, cliente: 0, feirante: 0, admin: 0 });
  const [activeTab, setActiveTab] = useState('Todos');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/cadastros')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoadingUsers(true);
    const roleMap: Record<string, string> = {
      'Todos': 'Todos',
      'Feirantes': 'feirante',
      'Clientes': 'cliente',
      'Administradores': 'admin'
    };
    
    const roleQuery = roleMap[activeTab] || 'Todos';

    fetch(`/api/admin/cadastros?role=${roleQuery}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.data);
        }
        setLoadingUsers(false);
      });
  }, [activeTab]);
  const tabs = [
    { label: 'Todos', count: stats.total, icon: Users },
    { label: 'Feirantes', count: stats.feirante, icon: Store },
    { label: 'Clientes', count: stats.cliente, icon: Users },
    { label: 'Administradores', count: stats.admin, icon: Map },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* PAGE HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-black text-[#1b1c19] font-sans tracking-tight">Gerenciamento de Cadastros</h2>
          <p className="text-[#707a6f] font-medium">Controle e validação de todos os perfis do ecossistema feira.casa.</p>
        </div>
        <button className="bg-green-600 text-white px-8 py-4 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#0a4f11] transition-all shadow-lg shadow-[#0e6b17]/20">
          <Plus size={20} />
          <span>Novo Cadastro Manual</span>
        </button>
      </div>

      {/* TABS / FILTERS */}
      <div className="flex flex-wrap gap-4">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.label;
          return (
            <button 
              key={i} 
              onClick={() => setActiveTab(tab.label)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all flex items-center gap-3 ${isActive ? 'bg-[#1b1c19] text-white border-[#1b1c19]' : 'bg-white text-[#707a6f] border-[#bfc9bd]/30 hover:border-[#0e6b17] hover:text-green-600'}`}
            >
              {Icon && <Icon size={18} />}
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-[#f6f6f2] text-[#707a6f]'}`}>{loading ? '...' : tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* TABLE LIST PREVIEW */}
      <div className="bg-white rounded-[32px] border border-[#bfc9bd]/20 shadow-sm overflow-hidden">
        <div className="p-8 flex justify-between items-center border-b border-[#f6f6f2]">
          <div className="relative w-full max-w-[320px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707a6f]" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome ou e-mail..." 
              className="w-full bg-[#fbfaf5] border-none rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#0e6b17]/10"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-[#707a6f] font-bold text-sm hover:text-green-600">
            <Filter size={18} />
            Filtrar por Status
          </button>
        </div>
        
        {loadingUsers ? (
          <div className="p-20 flex justify-center text-gray-400">
            <Loader2 size={32} className="animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#fbfaf5] flex items-center justify-center text-[#bfc9bd]">
              <Users size={40} />
            </div>
            <div>
              <h4 className="text-xl font-black font-sans">Nenhum cadastro encontrado</h4>
              <p className="text-[#707a6f] font-medium max-w-sm mx-auto mt-2">Não há usuários registrados para esta categoria.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Usuário</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contato</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status / KYC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users
                  .filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
                  .map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-gray-400">{user.full_name?.charAt(0) || user.email.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{user.full_name || 'Sem nome'}</p>
                          <p className="text-[11px] font-bold text-gray-400">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-gray-900">{user.email}</p>
                      <p className="text-[11px] font-bold text-gray-400">{user.phone || 'Sem telefone'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {user.role === 'feirante' ? (
                        user.mktplace_feira_producers?.[0]?.is_verified ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-black text-green-700 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                            <UserCheck size={14} /> KYC Aprovado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[11px] font-black text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full w-fit">
                            <UserX size={14} /> Aguardando KYC
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] font-bold text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
