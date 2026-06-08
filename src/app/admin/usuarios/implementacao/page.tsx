'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getTableName } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Store, 
  ChefHat, 
  MapPin, 
  Search, 
  LogIn, 
  Filter, 
  AlertTriangle 
} from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  store_name?: string;
  avatar_url?: string;
  status?: string;
  created_at: string;
}

export default function ModoImplementacaoPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vendor' | 'chef' | 'franchisee'>('vendor');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab]);

  async function fetchUsers(type: string) {
    setLoading(true);
    try {
      // Map 'vendor' to 'feirante'
      const typeFilter = type === 'vendor' ? "role.eq.feirante" : `role.eq.${type}`;
      
      const { data, error } = await supabase
        .from(getTableName('profiles'))
        .select(`
          *,
          producer:mktplace_feira_producers(stall_name)
        `)
        .or(typeFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mapped = data?.map((u: any) => ({
        ...u,
        store_name: u.producer?.[0]?.stall_name || u.producer?.stall_name
      })) || [];
      
      setUsers(mapped);
    } catch (error) {
      console.error('Erro ao buscar usuários para implantação:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleImpersonate = (user: UserProfile) => {
    
    document.cookie = `feira_role=${user.role}; path=/; max-age=86400`;

    if (user.role === 'feirante') {
      router.push('/portal/feirante');
    } else if (user.role === 'chef') {
      router.push('/portal/chef');
    } else {
      router.push('/portal/usuario');
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'vendor', label: 'Feirantes', icon: Store, desc: 'Lojas, barracas e hortifruti' },
    { id: 'chef', label: 'Chefs & Restaurantes', icon: ChefHat, desc: 'Cozinhas, pratos e menus' },
    { id: 'franchisee', label: 'Franqueados', icon: MapPin, desc: 'Operadores logísticos regionais' },
  ] as const;

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-50 text-green-700 rounded-lg">
            <LogIn size={20} />
          </div>
          <span className="text-[12px] font-black text-green-700 uppercase tracking-widest">Acesso Proxy</span>
        </div>
        <h2 className="text-[32px] font-black text-gray-900 tracking-tight leading-tight">Modo Implantação</h2>
        <p className="text-[15px] font-medium text-gray-500 mt-2 max-w-3xl">
          Selecione um parceiro de vendas e acesse o painel dele como se fosse o próprio usuário. 
          Isso permite que você configure lojas, produtos, cardápios e rotas em nome deles.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-start gap-4 p-5 rounded-[24px] border-2 text-left transition-all ${
              activeTab === tab.id 
                ? 'border-green-600 bg-green-50/50 shadow-sm' 
                : 'border-transparent bg-white hover:bg-gray-50 hover:border-gray-100 shadow-sm'
            }`}
          >
            <div className={`p-3 rounded-xl ${activeTab === tab.id ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
              <tab.icon size={22} />
            </div>
            <div>
              <h3 className={`text-[17px] font-black ${activeTab === tab.id ? 'text-green-800' : 'text-gray-900'}`}>
                {tab.label}
              </h3>
              <p className={`text-[13px] font-medium mt-1 ${activeTab === tab.id ? 'text-green-700/80' : 'text-gray-500'}`}>
                {tab.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou loja..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
          <Filter size={18} /> Filtrar
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold">Carregando parceiros...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Nenhum parceiro encontrado</h3>
            <p className="text-gray-500 font-medium">Não há parceiros desta categoria ou correspondentes à sua busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Parceiro</th>
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contato</th>
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status / Cadastro</th>
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-700 font-black text-lg">
                                {user.full_name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                          {user.store_name && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                              <Store size={10} className="text-yellow-900" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-gray-900 leading-tight">{user.full_name || 'Usuário Sem Nome'}</p>
                          {user.store_name && (
                            <p className="text-[12px] font-bold text-gray-500 mt-1">{user.store_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[14px] font-bold text-gray-700">{user.email}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                        ID: {user.id.substring(0,8)}...
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col items-start gap-1">
                        {user.status === 'blocked' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-[11px] font-black uppercase tracking-wider rounded-lg">
                            <AlertTriangle size={12} /> Bloqueado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-wider rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Ativo
                          </span>
                        )}
                        <span className="text-[12px] font-medium text-gray-400 mt-1">
                          Desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleImpersonate(user)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-700 hover:bg-[#15803d] text-white rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/20 group-hover:ring-4 ring-green-50"
                      >
                        <LogIn size={18} />
                        Implantar
                      </button>
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
