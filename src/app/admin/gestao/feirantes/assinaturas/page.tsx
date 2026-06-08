'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, ChevronRight, CreditCard, Calendar, ArrowUpRight,
  CheckCircle2, AlertCircle, MoreVertical, Plus, Zap, DollarSign,
  Package, Store, UserCheck, Settings2, RefreshCw, Database,
  Search, X, Loader2, Edit2, Trash2, Save,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

type Subscription = {
  id: string;
  vendor_name: string | null;
  user_id: string | null;
  status: 'ativo' | 'inadimplente' | 'cancelado' | 'trial';
  billing_value: number;
  next_billing_date: string | null;
  created_at: string;
  plan: { id: string; name: string } | null;
};

const STATUS_LABELS: Record<string, string> = {
  ativo: 'Ativo',
  inadimplente: 'Inadimplente',
  cancelado: 'Cancelado',
  trial: 'Trial',
};

const STATUS_STYLES: Record<string, string> = {
  ativo: 'bg-green-50 text-green-700',
  inadimplente: 'bg-red-50 text-red-600',
  cancelado: 'bg-gray-100 text-gray-400',
  trial: 'bg-blue-50 text-blue-600',
};

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

type ImplTemplate = {
  id: string;
  name: string;
  category: string;
  items_count: number;
  auto_config: boolean;
};

type TemplateForm = {
  id?: string;
  name: string;
  category: string;
  items_count: number;
  auto_config: boolean;
};

export default function AdminFeiranteAssinaturasPage() {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [templates, setTemplates] = useState<ImplTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState<TemplateForm | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mktplace_feira_subscriptions')
        .select('id, vendor_name, user_id, status, billing_value, next_billing_date, created_at, plan:plan_id(id, name)')
        .order('created_at', { ascending: false });
      if (data) setSubscriptions(data as any);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const { data } = await supabase
        .from('mktplace_feira_impl_templates')
        .select('*')
        .order('created_at');
      if (data) setTemplates(data);
    } catch (e) { console.error(e); }
    finally { setLoadingTemplates(false); }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openNewTemplate = () => {
    setTemplateForm({ name: '', category: '', items_count: 0, auto_config: false });
    setIsTemplateModalOpen(true);
  };

  const openEditTemplate = (t: ImplTemplate) => {
    setTemplateForm({ id: t.id, name: t.name, category: t.category, items_count: t.items_count, auto_config: t.auto_config });
    setIsTemplateModalOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    await supabase.from('mktplace_feira_impl_templates').delete().eq('id', id);
    fetchTemplates();
    showToast('Template removido com sucesso.', 'success');
  };

  const handleSaveTemplate = async () => {
    if (!templateForm || !templateForm.name.trim() || !templateForm.category.trim()) return;
    setSavingTemplate(true);
    try {
      const payload = {
        name: templateForm.name.trim(),
        category: templateForm.category.trim(),
        items_count: templateForm.items_count,
        auto_config: templateForm.auto_config,
      };
      if (templateForm.id) {
        await supabase.from('mktplace_feira_impl_templates').update(payload).eq('id', templateForm.id);
      } else {
        await supabase.from('mktplace_feira_impl_templates').insert(payload);
      }
      setIsTemplateModalOpen(false);
      fetchTemplates();
    } catch (e: any) {
      showToast('Erro ao salvar: ' + e.message, 'error');
    } finally {
      setSavingTemplate(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    setOpenMenuId(null);
    try {
      await supabase
        .from('mktplace_feira_subscriptions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      fetchSubscriptions();
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const mrr = subscriptions
    .filter(s => s.status === 'ativo')
    .reduce((sum, s) => sum + (s.billing_value || 0), 0);
  const activeCount = subscriptions.filter(s => s.status === 'ativo').length;
  const inadimCount = subscriptions.filter(s => s.status === 'inadimplente').length;
  const totalCount = subscriptions.length;
  const activePercent = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  const filtered = subscriptions.filter(s => {
    const matchStatus = statusFilter === 'todos' || s.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (s.vendor_name ?? '').toLowerCase().includes(q)
      || (s.plan?.name ?? '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/gestao/feirantes" className="hover:text-green-700 transition-colors">Gestão de Feirantes</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Assinaturas</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Assinaturas</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Controle de planos, recorrências e faturamento de mensalidades dos feirantes do ecossistema.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchSubscriptions} className="p-4 bg-white border border-gray-200 rounded-[20px] text-gray-400 hover:text-green-700 hover:border-green-700 transition-all shadow-sm">
            <RefreshCw size={18} />
          </button>
          <Link href="/admin/financeiro/planos"
            className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2">
            <CreditCard size={20} />
            Gerenciar Planos
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-2xl w-fit"><DollarSign size={24} /></div>
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Receita Recorrente (MRR)</p>
              <h3 className="text-4xl font-black text-gray-900">{loading ? '—' : fmt(mrr)}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-green-700">
              <ArrowUpRight size={14} />
              <span>{activeCount} assinaturas ativas</span>
            </div>
          </div>
          <Zap size={100} className="absolute -bottom-6 -right-6 text-gray-50 opacity-50 group-hover:text-green-50 transition-colors" />
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
          <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl w-fit"><CheckCircle2 size={24} /></div>
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Assinaturas Ativas</p>
            <h3 className="text-4xl font-black text-gray-900">{loading ? '—' : activeCount}</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium">{activePercent}% da base total de feirantes</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl w-fit"><AlertCircle size={24} /></div>
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Pendências Financeiras</p>
            <h3 className="text-4xl font-black text-gray-900">{loading ? '—' : inadimCount}</h3>
          </div>
          <button onClick={() => setStatusFilter('inadimplente')}
            className="text-xs text-red-600 font-black uppercase tracking-widest hover:underline">
            Ver Inadimplentes
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-black text-gray-900">Gestão de Assinantes</h2>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar feirante ou plano..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl outline-none text-sm font-medium shadow-sm focus:border-green-600/30 transition-all w-64" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex gap-2">
              {['todos', 'ativo', 'inadimplente', 'cancelado', 'trial'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    statusFilter === s
                      ? 'bg-[#125d30] text-white shadow-sm'
                      : 'bg-white border border-gray-100 text-gray-500 hover:border-green-300'
                  }`}>
                  {s === 'todos' ? 'Todos' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 size={24} className="animate-spin" />
              <span className="font-bold text-sm">Carregando assinaturas...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Feirante</th>
                  <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Plano Atual</th>
                  <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                  <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Próx. Cobrança</th>
                  <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(sub => (
                  <tr key={sub.id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-gray-900">{sub.vendor_name || '—'}</p>
                      {sub.user_id && <p className="text-[10px] text-gray-400 font-mono mt-0.5">{sub.user_id.slice(0, 8)}…</p>}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-gray-700">{sub.plan?.name || '—'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-gray-900">{fmt(sub.billing_value)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Calendar size={14} />
                        {fmtDate(sub.next_billing_date)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[sub.status]}`}>
                        {STATUS_LABELS[sub.status]}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      {updatingId === sub.id ? (
                        <Loader2 size={18} className="animate-spin text-gray-400 ml-auto" />
                      ) : (
                        <div className="relative inline-block">
                          <button onClick={() => setOpenMenuId(openMenuId === sub.id ? null : sub.id)}
                            className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                            <MoreVertical size={18} />
                          </button>
                          {openMenuId === sub.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-10 w-44">
                              {['ativo', 'inadimplente', 'cancelado', 'trial']
                                .filter(s => s !== sub.status)
                                .map(s => (
                                  <button key={s} onClick={() => updateStatus(sub.id, s)}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors capitalize">
                                    Marcar como {STATUS_LABELS[s]}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center text-gray-300">
                      <FileText size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-bold text-gray-400">
                        {subscriptions.length === 0 ? 'Nenhuma assinatura cadastrada ainda.' : 'Nenhuma assinatura encontrada para este filtro.'}
                      </p>
                      {statusFilter !== 'todos' && (
                        <button onClick={() => setStatusFilter('todos')} className="mt-3 text-xs text-[#125d30] font-black hover:underline">
                          Ver todas
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          <div className="px-8 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">{filtered.length} de {subscriptions.length} assinaturas</p>
            <p className="text-xs text-gray-400 font-medium">MRR: {fmt(mrr)}</p>
          </div>
        </div>
      </div>

      {/* Implementation Models */}
      <div className="space-y-8 bg-[#fbfaf5] p-12 rounded-[50px] border border-[#efeee9]">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-[#125d30] mb-2">
              <Settings2 size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tight">Modelos de Implantação e Carga Automática</h2>
            </div>
            <p className="text-gray-600 font-medium leading-relaxed">
              Configure como as novas bancas são criadas. O feirante recebe a loja pronta com itens pré-cadastrados, perfis mapeados e configurações de PDV.
            </p>
          </div>
          <button onClick={openNewTemplate}
            className="px-6 py-3 bg-white border border-[#efeee9] text-gray-900 rounded-2xl font-bold hover:shadow-md transition-all flex items-center gap-2 whitespace-nowrap">
            <Plus size={18} /> Novo Template
          </button>
        </div>

        {loadingTemplates ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-3">
            <Loader2 size={20} className="animate-spin" />
            <span className="font-bold text-sm">Carregando templates...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {templates.map(t => (
              <div key={t.id} className="bg-white p-8 rounded-[32px] border border-[#efeee9] shadow-sm hover:shadow-xl hover:border-green-200 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Database size={24} /></div>
                  <div className="flex items-center gap-2">
                    {t.auto_config && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 px-2 py-1 rounded-md uppercase tracking-wider">
                        <UserCheck size={12} /> Auto-Setup Ativo
                      </span>
                    )}
                  </div>
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2">{t.name}</h4>
                <p className="text-sm text-gray-400 font-medium mb-6">Categoria: <span className="text-gray-700">{t.category}</span></p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3"><Package size={18} className="text-gray-400" /><span className="text-xs font-bold text-gray-600">Carga de Itens</span></div>
                    <span className="text-sm font-black text-gray-900">{t.items_count} itens</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3"><Store size={18} className="text-gray-400" /><span className="text-xs font-bold text-gray-600">Configuração de PDV</span></div>
                    <span className="text-xs font-black text-green-600 uppercase tracking-widest">Pronto</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditTemplate(t)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                    <Edit2 size={14} /> Editar
                  </button>
                  <button onClick={() => handleDeleteTemplate(t.id)}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <div onClick={openNewTemplate}
              className="border-2 border-dashed border-gray-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center group hover:border-[#125d30]/30 transition-all cursor-pointer bg-white/50">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="text-gray-300 group-hover:text-[#125d30]" size={32} />
              </div>
              <h5 className="font-black text-gray-400 group-hover:text-[#125d30]">Criar Novo Modelo</h5>
              <p className="text-xs text-gray-400 mt-2 font-medium">Defina um novo conjunto de itens e configurações padrão.</p>
            </div>
          </div>
        )}

        <div className="bg-blue-600 rounded-[32px] p-10 text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="relative z-10 flex-1 min-w-0">
            <h4 className="text-xl font-black mb-3">Por que usar Modelos de Implantação?</h4>
            <p className="text-white/80 text-sm font-medium leading-relaxed">
              Nossa pesquisa mostra que feirantes preferem começar com uma loja já populada. Ao assinar um plano, o sistema carrega automaticamente os itens do catálogo mestre baseado no perfil dele.
            </p>
          </div>
          <div className="flex gap-4 relative z-10 shrink-0">
            <div className="text-center px-6 py-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
              <p className="text-2xl font-black">94%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Retenção Inicial</p>
            </div>
            <div className="text-center px-6 py-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
              <p className="text-2xl font-black">-15h</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tempo de Setup</p>
            </div>
          </div>
          <Zap size={200} className="absolute -bottom-20 -left-20 text-white/5" />
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {openMenuId && (
        <div className="fixed inset-0 z-[5]" onClick={() => setOpenMenuId(null)} />
      )}

      {/* Modal Novo/Editar Template */}
      {isTemplateModalOpen && templateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">
                {templateForm.id ? 'Editar Template' : 'Novo Template'}
              </h2>
              <button onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5">
              {/* Nome */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Template</label>
                <input type="text" placeholder="Ex: Hortifruti Padrão"
                  value={templateForm.name}
                  onChange={e => setTemplateForm(f => f ? { ...f, name: e.target.value } : f)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-black outline-none focus:ring-2 focus:ring-green-500/20" />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Categoria</label>
                <input type="text" placeholder="Ex: Verduras e Frutas"
                  value={templateForm.category}
                  onChange={e => setTemplateForm(f => f ? { ...f, category: e.target.value } : f)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20" />
              </div>

              {/* Nº de Itens */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Número de Itens na Carga</label>
                <input type="number" min="0" placeholder="0"
                  value={templateForm.items_count}
                  onChange={e => setTemplateForm(f => f ? { ...f, items_count: Number(e.target.value) } : f)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20" />
              </div>

              {/* Auto-Setup toggle */}
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-sm font-black text-gray-900">Auto-Setup Ativo</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Aplica este template automaticamente ao ativar o plano</p>
                </div>
                <button type="button"
                  onClick={() => setTemplateForm(f => f ? { ...f, auto_config: !f.auto_config } : f)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${templateForm.auto_config ? 'bg-[#125d30]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${templateForm.auto_config ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="flex gap-4 px-8 pb-8">
              <button onClick={() => setIsTemplateModalOpen(false)}
                className="flex-1 py-4 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveTemplate}
                disabled={savingTemplate || !templateForm.name.trim() || !templateForm.category.trim()}
                className="flex-1 py-4 bg-[#125d30] text-white rounded-xl font-bold hover:bg-[#0e4d27] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                {savingTemplate ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {savingTemplate ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
