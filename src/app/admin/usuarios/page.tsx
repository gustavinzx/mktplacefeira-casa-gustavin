'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Eye,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Ban,
  X,
  MapPin,
  LogIn
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getTableName } from '@/lib/supabase';
import Modal from '@/components/admin/Modal';
import { useToast } from '@/components/Toast';
import { Loader2 } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string;
  status: string;
  region?: string;
}

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  // Invite Modal States
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('cliente');
  const [isInviting, setIsInviting] = useState(false);


  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(getTableName('profiles'))
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter.toLowerCase();
    // Assuming status logic or adding a default
    const matchesStatus = statusFilter === 'All Statuses' || 'active' === statusFilter.toLowerCase();
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInviteUser = async () => {
    if (!inviteName || !inviteEmail) {
      return showToast('Preencha nome e e-mail para enviar o convite.', 'error');
    }
    setIsInviting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ full_name: inviteName, email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        setInviteName('');
        setInviteEmail('');
        setIsModalOpen(false);
        showToast('Convite enviado com sucesso!', 'success');
      } else {
        showToast('Erro: ' + data.error, 'error');
      }
    } catch {
      showToast('Erro de conexão', 'error');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[32px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">Gestão de Usuários & Perfis</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium max-w-2xl">
            Controle níveis de acesso e gerencie contas globais de usuários em todas as regiões.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-[#30852f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/10 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          Criar Novo Usuário
        </button>
      </div>

      {/* Filters Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Papel / Role</label>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-green-500/20"
          >
            <option>All Roles</option>
            <option value="cliente">Cliente</option>
            <option value="feirante">Feirante</option>
            <option value="chef">Chef</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-green-500/20"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Região</label>
          <select className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-green-500/20">
            <option>Global</option>
            <option>São Paulo, SP</option>
            <option>Rio de Janeiro, RJ</option>
            <option>Belo Horizonte, MG</option>
          </select>
        </div>

        <div className="flex items-end">
          <button 
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('All Roles');
              setStatusFilter('All Statuses');
            }}
            className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <X size={18} />
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Pesquisar por nome, email ou ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none text-sm font-medium transition-all shadow-sm focus:ring-2 focus:ring-green-500/10"
        />
      </div>

      {/* Data Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuário</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Papel / Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Região</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-gray-400">Carregando diretório...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-300">
                        <Search size={40} />
                      </div>
                      <p className="text-sm font-bold text-gray-400">Nenhum usuário encontrado com os filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-green-50/30 dark:hover:bg-green-900/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden border-2 border-white dark:border-gray-900 shadow-sm shrink-0">
                          <img 
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`} 
                            alt={user.full_name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 dark:text-white truncate">{user.full_name || 'Usuário Sem Nome'}</p>
                          <p className="text-xs text-gray-400 font-medium truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-green-50 text-green-700' :
                        user.role === 'feirante' ? 'bg-orange-50 text-orange-700' :
                        user.role === 'chef' ? 'bg-red-50 text-red-700' :
                        user.role === 'cliente' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <MapPin size={14} className="text-gray-300" />
                        {user.region || 'São Paulo, SP'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Ativo
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2.5 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-green-700 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all" title="Ver Perfil">
                          <Eye size={18} />
                        </button>
                        <button className="p-2.5 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all" title="Gerenciar Permissões">
                          <Settings2 size={18} />
                        </button>
                        <button className="p-2.5 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-red-600 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all" title="Bloquear Usuário">
                          <Ban size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-400 font-medium">
            Mostrando <span className="text-gray-900 dark:text-white font-black">1-{filteredUsers.length}</span> de <span className="text-gray-900 dark:text-white font-black">{users.length}</span> usuários
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-green-600 disabled:opacity-50 transition-all shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-green-600 text-white text-sm font-black shadow-lg shadow-green-900/20">1</button>
            <button className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 text-gray-500 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">2</button>
            <button className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 text-gray-500 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">3</button>
            <span className="text-gray-300 px-1 font-black">...</span>
            <button className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-green-600 transition-all shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Role Quick Reference Section */}
      <div className="mt-12">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Guia Rápido de Papéis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#30852f]/5 p-8 rounded-[32px] border border-[#30852f]/10 group hover:border-[#30852f]/30 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#30852f] text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-900/10">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-black text-green-600">Controle Admin</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Acesso total a configurações do sistema, registros financeiros e lista mestre de usuários.
            </p>
          </div>
          
          <div className="bg-[#fc6c29]/5 p-8 rounded-[32px] border border-[#fc6c29]/10 group hover:border-[#fc6c29]/30 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#fc6c29] text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/10">
                <Settings2 size={20} />
              </div>
              <h4 className="font-black text-[#a63b00]">Portal do Feirante</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Gestão de catálogo de produtos, níveis de estoque e cumprimento direto de pedidos.
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-[32px] border border-transparent group hover:border-gray-200 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-900/10">
                <Users size={20} />
              </div>
              <h4 className="font-black text-gray-700 dark:text-gray-300">Cliente Padrão</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Compra de produtos, rastreio de pedidos e gestão de perfil pessoal e endereços.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Criar Novo Usuário (Simplificado) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Convidar Novo Usuário"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome Completo</label>
            <input 
              type="text" 
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20" 
              placeholder="Ex: João da Silva" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">E-mail Profissional</label>
            <input 
              type="email" 
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20" 
              placeholder="joao@email.com" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Atribuir Papel (Role)</label>
            <select 
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="cliente">Cliente</option>
              <option value="feirante">Feirante</option>
              <option value="chef">Chef</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              onClick={() => setIsModalOpen(false)}
              disabled={isInviting}
              className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleInviteUser}
              disabled={isInviting}
              className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isInviting && <Loader2 size={16} className="animate-spin" />}
              {isInviting ? 'Enviando...' : 'Enviar Convite'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
