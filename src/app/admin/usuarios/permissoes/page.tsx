'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronRight,
  Check,
  X,
  Save,
  Info,
  Layout,
  Store,
  Truck,
  DollarSign,
  Megaphone,
  Activity,
  Settings,
  AlertCircle,
  Plus,
  Search,
  Users,
  UserCheck,
  ExternalLink,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { supabase, getTableName } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

export default function AdminAdvancedPermissionsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', color: '#125d30' });
  const [isCreating, setIsCreating] = useState(false);

  const PRESET_COLORS = ['#125d30', '#ea580c', '#2563eb', '#7c3aed', '#db2777', '#0891b2', '#64748b', '#1c1917'];

  const modules = [
    { key: 'dashboard', name: 'Dashboard & Overview' },
    { key: 'usuarios', name: 'Usuários & Perfis' },
    { key: 'feirantes', name: 'Gestão de Feirantes' },
    { key: 'logistica', name: 'Logística & Hub' },
    { key: 'financeiro', name: 'Financeiro & ERP' },
    { key: 'marketing', name: 'Marketing & CRM' },
    { key: 'configuracoes', name: 'Configurações do Sistema' },
  ];

  const actions = [
    { key: 'view', name: 'Visualizar' },
    { key: 'create', name: 'Criar' },
    { key: 'edit', name: 'Editar' },
    { key: 'delete', name: 'Excluir' },
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (selectedRole?.id) loadVendorsForRole(selectedRole.id);
  }, [selectedRole?.id]);

  async function loadRoles() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      const json = await res.json();
      if (json.success) {
        setRoles(json.data);
        if (json.data.length > 0) {
          setSelectedRole(json.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function loadVendorsForRole(roleId: string) {
    setVendorsLoading(true);
    const { data } = await supabase
      .from(getTableName('producers'))
      .select('id, stall_name as name, type, email, status')
      .eq('role_id', roleId);
    setVendors(data || []);
    setVendorsLoading(false);
  }

  async function deleteRole(role: any) {
    try {
      const res = await fetch(`/api/admin/roles?id=${role.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) {
        showToast('Erro ao excluir: ' + json.error, 'error');
        return;
      }
      const updated = roles.filter(r => r.id !== role.id);
      setRoles(updated);
      if (selectedRole?.id === role.id) setSelectedRole(updated[0] ?? null);
      showToast('Perfil excluído.', 'success');
    } catch (error: any) {
      showToast('Erro ao excluir: ' + error.message, 'error');
    }
  }

  async function unlinkVendorRole(vendorId: string) {
    await supabase
      .from(getTableName('producers'))
      .update({ role_id: null })
      .eq('id', vendorId);
    setVendors(vendors.filter(v => v.id !== vendorId));
  }

  async function handleCreateRole() {
    if (!newRole.name.trim()) return;
    setIsCreating(true);
    const defaultPerms: Record<string, any> = {};
    modules.forEach(m => {
      defaultPerms[m.key] = { view: false, create: false, edit: false, delete: false };
    });
    
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRole, permissions: defaultPerms, is_active: true })
      });
      const result = await res.json();
      
      if (result.success) {
        await loadRoles(); // Recarrega
        setNewRole({ name: '', description: '', color: '#125d30' });
        setShowNewRole(false);
      } else {
        showToast('Erro ao criar perfil: ' + result.error, 'error');
      }
    } catch (e: any) {
      showToast('Erro ao criar perfil: ' + e.message, 'error');
    }
    setIsCreating(false);
  }

  const togglePermission = (moduleKey: string, actionKey: string) => {
    if (!selectedRole || selectedRole.permissions?.all) return;

    const currentPerms = selectedRole.permissions || {};
    const modulePerms = currentPerms[moduleKey] || {};
    
    // Se modulePerms for um booleano (legado), transformamos em objeto
    const normalizedModulePerms = typeof modulePerms === 'boolean' 
      ? { view: modulePerms, create: modulePerms, edit: modulePerms, delete: modulePerms }
      : modulePerms;

    const updatedModulePerms = {
      ...normalizedModulePerms,
      [actionKey]: !normalizedModulePerms[actionKey]
    };

    setSelectedRole({
      ...selectedRole,
      permissions: {
        ...currentPerms,
        [moduleKey]: updatedModulePerms
      }
    });
  };

  async function handleSave() {
    if (!selectedRole) return;
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRole)
      });
      const result = await res.json();
      
      if (result.success) {
        setRoles(roles.map(r => r.id === selectedRole.id ? selectedRole : r));
        showToast('Permissões atualizadas com sucesso!', 'success');
      } else {
        showToast('Erro ao salvar: ' + result.error, 'error');
      }
    } catch (e: any) {
      showToast('Erro ao salvar: ' + e.message, 'error');
    }
    
    setIsSaving(false);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/usuarios" className="hover:text-green-700 transition-colors">Usuários</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Matriz de Permissões Detalhada</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Gestão de Permissões</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Configure o que cada perfil pode ver e realizar dentro do ecossistema Feira.Casa. Gerencie a visibilidade de módulos em desenvolvimento.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSave}
            disabled={isSaving || !selectedRole}
            className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar: Profiles */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">SELECIONE O PERFIL</p>
                <button
                  onClick={() => setShowNewRole(v => !v)}
                  className="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center hover:bg-green-100 transition-all"
                  title="Novo perfil"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Inline create form */}
              {showNewRole && (
                <div className="p-5 bg-gray-50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    placeholder="Nome do perfil"
                    value={newRole.name}
                    onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Descrição (opcional)"
                    value={newRole.description}
                    onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cor</p>
                    <div className="flex gap-2 flex-wrap">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setNewRole({ ...newRole, color: c })}
                          className={`w-7 h-7 rounded-lg transition-all ${newRole.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleCreateRole}
                      disabled={isCreating || !newRole.name.trim()}
                      className="flex-1 py-2.5 bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-800 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {isCreating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
                      Criar
                    </button>
                    <button
                      onClick={() => setShowNewRole(false)}
                      className="px-4 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-black hover:bg-gray-50 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                 {loading ? (
                    Array(5).fill(0).map((_, i) => (
                       <div key={i} className="w-full h-12 bg-gray-50 rounded-xl animate-pulse"></div>
                    ))
                 ) : (
                    roles.map((p) => (
                      <div
                        key={p.id}
                        className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          selectedRole?.id === p.id ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedRole(p)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }}></div>
                          <span className="truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {selectedRole?.id === p.id && <ChevronRight size={16} className="opacity-70" />}
                          <button
                            onClick={e => { e.stopPropagation(); deleteRole(p); }}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                              selectedRole?.id === p.id
                                ? 'text-white/60 hover:text-white hover:bg-white/20 active:bg-white/30'
                                : 'text-gray-300 hover:text-red-500 hover:bg-red-50 active:bg-red-100'
                            }`}
                            title="Excluir perfil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                 )}
              </div>
           </div>

           {/* Info Card */}
           <div className="p-8 bg-blue-50/50 rounded-[40px] border border-blue-100 space-y-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                <Info size={20} />
              </div>
              <p className="text-xs font-medium text-blue-700/80 leading-relaxed">
                As permissões são atômicas. Se um usuário não tiver permissão de <b>Visualizar</b>, ele não verá o módulo na sidebar.
              </p>
           </div>
        </div>

        {/* Main Area: Detailed Matrix */}
        <div className="lg:col-span-9">
           {selectedRole ? (
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: selectedRole.color }}>
                          <ShieldCheck size={24} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-gray-900">{selectedRole.name}</h3>
                          <p className="text-xs text-gray-400 font-medium">Defina o nível de controle para cada módulo operacional.</p>
                       </div>
                    </div>
                    {selectedRole.permissions?.all && (
                       <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100">
                          ACESSO TOTAL ATIVADO
                       </span>
                    )}
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50/50">
                          <tr>
                             <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Módulo</th>
                             {actions.map(action => (
                                <th key={action.key} className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                   {action.name}
                                </th>
                             ))}
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {modules.map((module) => {
                             const isAll = selectedRole.permissions?.all;
                             const modulePerms = selectedRole.permissions?.[module.key] || {};
                             
                             return (
                                <tr key={module.key} className="hover:bg-gray-50/30 transition-all group">
                                   <td className="px-10 py-6">
                                      <p className="text-sm font-black text-gray-900">{module.name}</p>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">mktplace_feira_{module.key}</p>
                                   </td>
                                   {actions.map(action => {
                                      // Normalização para lidar com legados ou booleanos
                                      const isActionActive = isAll || (
                                        typeof modulePerms === 'boolean' 
                                          ? modulePerms 
                                          : modulePerms[action.key]
                                      );

                                      return (
                                         <td key={action.key} className="px-6 py-6 text-center">
                                            <button 
                                               onClick={() => togglePermission(module.key, action.key)}
                                               disabled={isAll}
                                               className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${
                                                  isActionActive 
                                                     ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' 
                                                     : 'bg-white text-gray-200 border border-gray-100 hover:border-gray-200'
                                               } ${isAll ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                            >
                                               {isActionActive ? <Check size={18} strokeWidth={4} /> : <X size={18} strokeWidth={4} />}
                                            </button>
                                         </td>
                                      );
                                   })}
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>
                 </div>

                 <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <AlertCircle size={18} className="text-orange-500" />
                       <p className="text-xs font-bold text-gray-500 italic">As alterações entrarão em vigor após clicar em "Salvar Alterações".</p>
                    </div>
                    <button 
                       onClick={handleSave}
                       disabled={isSaving}
                       className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-100 transition-all flex items-center gap-2"
                    >
                       Confirmar Configurações
                    </button>
                 </div>
              </div>
           ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                 <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-300 mx-auto shadow-sm">
                       <ShieldCheck size={40} />
                    </div>
                    <p className="text-gray-400 font-bold">Selecione um perfil para configurar as permissões detalhadas.</p>
                 </div>
              </div>
           )}

           {/* Feirantes com este Perfil */}
           {selectedRole && (
             <div className="mt-8 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                     <Users size={20} />
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-gray-900">Feirantes com este Perfil</h3>
                     <p className="text-xs text-gray-400 font-medium">
                       {vendorsLoading ? 'Carregando...' : `${vendors.length} feirante(s) vinculado(s) ao perfil "${selectedRole.name}"`}
                     </p>
                   </div>
                 </div>
                 <Link
                   href="/admin/gestao/feirantes"
                   className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                 >
                   <ExternalLink size={12} /> Gestão de Feirantes
                 </Link>
               </div>

               {vendorsLoading ? (
                 <div className="p-8 space-y-3">
                   {Array(3).fill(0).map((_, i) => (
                     <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
                   ))}
                 </div>
               ) : vendors.length === 0 ? (
                 <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
                   <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                     <UserCheck size={28} />
                   </div>
                   <p className="text-sm font-bold text-gray-400">Nenhum feirante vinculado a este perfil ainda.</p>
                   <Link
                     href="/admin/gestao/feirantes"
                     className="text-[11px] font-black text-green-700 uppercase tracking-widest hover:underline flex items-center gap-1"
                   >
                     Vincular via Gestão de Feirantes <ExternalLink size={12} />
                   </Link>
                 </div>
               ) : (
                 <div className="divide-y divide-gray-50">
                   {vendors.map((vendor) => (
                     <div key={vendor.id} className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/40 transition-all group">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                           <Store size={18} />
                         </div>
                         <div>
                           <p className="text-sm font-black text-gray-900">{vendor.name || `Feirante #${vendor.id}`}</p>
                           <div className="flex items-center gap-3 mt-0.5">
                             {vendor.type && (
                               <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${vendor.type === 'Atacadista' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                 {vendor.type}
                               </span>
                             )}
                             {vendor.email && <p className="text-xs text-gray-400 font-medium">{vendor.email}</p>}
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <Link
                           href={`/admin/gestao/feirantes/${vendor.id}`}
                           className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-100 transition-all flex items-center gap-1"
                         >
                           Ver Perfil <ExternalLink size={11} />
                         </Link>
                         <button
                           onClick={() => unlinkVendorRole(vendor.id)}
                           className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-red-50 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
                         >
                           Desvincular
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}
        </div>
      </div>

    </div>
  );
}
