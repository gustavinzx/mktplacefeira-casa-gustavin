'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, CheckCircle2, XCircle,
  Settings2, Database, UserCheck, Package, Store, RefreshCw,
  Zap, CreditCard, Tag, History, X, ArrowRight, ArrowLeft,
  Check, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  targetProfile: 'feirante' | 'chef' | 'comprador_b2b' | 'comprador_b2c';
  price: number;
  recurrence: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  gracePeriodDays: number;
  features: string[];
  isActive: boolean;
}

function mapPlan(p: any): SubscriptionPlan {
  return {
    id: p.id,
    name: p.name,
    targetProfile: p.target_profile,
    price: Number(p.price),
    recurrence: p.recurrence,
    gracePeriodDays: p.grace_period_days,
    features: p.features ?? [],
    isActive: p.is_active,
  };
}

const IMPLEMENTATION_TEMPLATES = [
  { id: 't1', name: 'Hortifruti Padrão', itemsCount: 45, category: 'Verduras e Frutas', autoConfig: true },
  { id: 't2', name: 'Empório & Grãos', itemsCount: 120, category: 'Mercearia', autoConfig: true },
  { id: 't3', name: 'Laticínios e Queijos', itemsCount: 30, category: 'Frios', autoConfig: false },
];

const TABS = [
  { id: 'planos', label: 'Planos', icon: CreditCard },
  { id: 'modelos', label: 'Modelos de Implantação', icon: Database },
  { id: 'historico', label: 'Histórico de Assinaturas', icon: History, wip: true },
];

const PROFILE_LABEL: Record<string, string> = {
  feirante: 'Feirante',
  chef: 'Chef/Restaurante',
  comprador_b2b: 'Comprador B2B',
  comprador_b2c: 'Usuário Padrão',
};

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

// ── Wizard Modal ──────────────────────────────────────────────────────────────

interface WizardModalProps {
  onClose: () => void;
  onSave: (plan: Partial<SubscriptionPlan> & { id?: string }) => void;
  saving: boolean;
  initialData?: SubscriptionPlan | null;
}

function PlanoWizardModal({ onClose, onSave, saving, initialData }: WizardModalProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>(
    initialData ?? { name: '', targetProfile: 'feirante', price: 0, recurrence: 'mensal', gracePeriodDays: 0, features: [''], isActive: true }
  );

  const set = (field: keyof SubscriptionPlan, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const setFeature = (i: number, v: string) => {
    const arr = [...(formData.features ?? [])];
    arr[i] = v;
    set('features', arr);
  };

  const canNext1 = !!(formData.name?.trim() && formData.targetProfile);
  const canNext2 = formData.price !== undefined && formData.recurrence;

  const handleSave = () => {
    const cleaned = (formData.features ?? []).filter(f => f.trim());
    if (!cleaned.length) { showToast('Adicione pelo menos um benefício.', 'info'); return; }
    onSave({ ...formData, features: cleaned, id: initialData?.id });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-[80vw] h-[80vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header + Stepper */}
        <div className="flex-none px-10 pt-10 pb-6 border-b border-gray-100 bg-white relative">
          <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
            <X size={22} />
          </button>
          <h3 className="text-3xl font-black text-[#1b1c19] tracking-tight mb-6">
            {initialData ? 'Editar Plano' : 'Novo Plano de Assinatura'}
          </h3>
          <div className="flex gap-4 mb-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-2 rounded-full transition-colors duration-300 ${step >= s ? 'bg-[#125d30]' : 'bg-gray-100'}`} />
            ))}
          </div>
          <div className="flex justify-between px-1">
            {['1. Identidade', '2. Precificação', '3. Benefícios'].map((l, i) => (
              <span key={l} className={`text-xs font-black uppercase tracking-widest ${step >= i + 1 ? 'text-[#125d30]' : 'text-gray-400'}`}>{l}</span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#fbfaf5]/30">

          {step === 1 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-400">
              <div>
                <h4 className="text-2xl font-black text-[#1b1c19] mb-1">Identidade do Plano</h4>
                <p className="text-[#707a6f] font-medium">Defina o nome e para qual perfil de usuário este plano se destina.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#707a6f]">Nome do Plano</label>
                <input type="text" value={formData.name ?? ''} onChange={e => set('name', e.target.value)}
                  placeholder="Ex: Plano Premium Feirante"
                  className="w-full bg-white rounded-[16px] px-5 py-4 border border-[#efeee9] focus:border-[#125d30]/50 outline-none font-bold text-lg text-[#1b1c19] shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#707a6f]">Perfil Alvo</label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(PROFILE_LABEL).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => set('targetProfile', key)}
                      className={`p-5 rounded-[20px] border-2 text-left transition-all ${formData.targetProfile === key ? 'border-[#125d30] bg-green-50' : 'border-[#efeee9] bg-white hover:border-green-200'}`}>
                      <p className={`font-black text-base ${formData.targetProfile === key ? 'text-[#125d30]' : 'text-[#1b1c19]'}`}>{label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-400">
              <div>
                <h4 className="text-2xl font-black text-[#1b1c19] mb-1">Precificação & Carência</h4>
                <p className="text-[#707a6f] font-medium">Defina o valor, recorrência e período de carência (dias grátis).</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#707a6f]">Valor (R$)</label>
                  <input type="number" min="0" step="0.01" value={formData.price ?? 0}
                    onChange={e => set('price', Number(e.target.value))}
                    className="w-full bg-white rounded-[16px] px-5 py-4 border border-[#efeee9] focus:border-[#125d30]/50 outline-none font-bold text-lg text-[#1b1c19] shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#707a6f]">Carência (dias grátis)</label>
                  <input type="number" min="0" value={formData.gracePeriodDays ?? 0}
                    onChange={e => set('gracePeriodDays', Number(e.target.value))}
                    className="w-full bg-white rounded-[16px] px-5 py-4 border border-[#efeee9] focus:border-[#125d30]/50 outline-none font-bold text-lg text-[#1b1c19] shadow-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#707a6f]">Recorrência</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['mensal', 'trimestral', 'semestral', 'anual'] as const).map(r => (
                    <button key={r} type="button" onClick={() => set('recurrence', r)}
                      className={`p-4 rounded-[16px] border-2 text-center capitalize font-black text-sm transition-all ${formData.recurrence === r ? 'border-[#125d30] bg-green-50 text-[#125d30]' : 'border-[#efeee9] bg-white text-[#707a6f] hover:border-green-200'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-[24px] border border-[#efeee9] shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[#707a6f] mb-3">Resumo do Plano</p>
                <h5 className="font-black text-xl text-[#1b1c19]">{formData.name || '—'}</h5>
                <p className="text-sm text-[#707a6f] font-medium mt-1">{PROFILE_LABEL[formData.targetProfile ?? 'feirante']} · {formData.recurrence}</p>
                <p className="text-2xl font-black text-[#125d30] mt-3">{fmt(formData.price ?? 0)}<span className="text-sm font-medium text-[#707a6f]">/{formData.recurrence}</span></p>
                {(formData.gracePeriodDays ?? 0) > 0 && (
                  <p className="text-xs font-bold text-orange-600 mt-2 bg-orange-50 inline-block px-2 py-1 rounded-lg">{formData.gracePeriodDays} dias grátis</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-400">
              <div>
                <h4 className="text-2xl font-black text-[#1b1c19] mb-1">Recursos & Benefícios</h4>
                <p className="text-[#707a6f] font-medium">Liste os benefícios que o assinante terá acesso com este plano.</p>
              </div>
              <div className="space-y-3">
                {(formData.features ?? ['']).map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check size={16} className="text-[#125d30] shrink-0" />
                    <input type="text" value={f} onChange={e => setFeature(i, e.target.value)}
                      placeholder={`Benefício ${i + 1}`}
                      className="flex-1 bg-white rounded-[14px] px-4 py-3 border border-[#efeee9] focus:border-[#125d30]/50 outline-none font-medium text-sm text-[#1b1c19] shadow-sm" />
                    {(formData.features?.length ?? 0) > 1 && (
                      <button type="button" onClick={() => set('features', (formData.features ?? []).filter((_, idx) => idx !== i))}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => set('features', [...(formData.features ?? []), ''])}
                  className="flex items-center gap-2 text-sm font-bold text-[#125d30] hover:text-green-800 mt-2">
                  <Plus size={16} /> Adicionar Benefício
                </button>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-[24px] p-6">
                <p className="text-xs font-black uppercase tracking-widest text-green-600 mb-3">Pré-visualização</p>
                <h5 className="font-black text-xl text-[#1b1c19]">{formData.name}</h5>
                <p className="text-sm text-[#707a6f] mt-1">{PROFILE_LABEL[formData.targetProfile ?? 'feirante']} · {formData.recurrence}</p>
                <p className="text-2xl font-black text-[#125d30] mt-2">{fmt(formData.price ?? 0)}</p>
                <ul className="mt-4 space-y-1">
                  {(formData.features ?? []).filter(f => f.trim()).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#1b1c19] font-medium">
                      <Check size={14} className="text-[#125d30]" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none px-10 py-6 border-t border-gray-100 bg-white flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm bg-gray-100 text-[#707a6f] hover:bg-gray-200 transition-colors">
              <ArrowLeft size={18} /> Voltar
            </button>
          ) : <div />}
          {step < 3 ? (
            <button disabled={step === 1 ? !canNext1 : !canNext2} onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm bg-[#1b1c19] text-white hover:bg-black transition-colors disabled:opacity-50">
              Próxima Etapa <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm bg-[#125d30] text-white hover:bg-green-800 transition-colors shadow-lg shadow-green-900/20 min-w-[200px] justify-center disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              {saving ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Criar Plano'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPlanosPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('planos');

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mktplace_feira_subscription_plans')
        .select('*')
        .order('price');
      if (data) setPlans(data.map(mapPlan));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleSavePlan = async (plan: Partial<SubscriptionPlan> & { id?: string }) => {
    setSaving(true);
    try {
      const payload = {
        name: plan.name,
        target_profile: plan.targetProfile,
        price: plan.price,
        recurrence: plan.recurrence,
        grace_period_days: plan.gracePeriodDays,
        features: plan.features,
        is_active: plan.isActive ?? true,
      };
      if (plan.id) {
        await supabase.from('mktplace_feira_subscription_plans').update(payload).eq('id', plan.id);
      } else {
        await supabase.from('mktplace_feira_subscription_plans').insert(payload);
      }
      setIsModalOpen(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (e: any) {
      showToast('Erro ao salvar: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (plan: SubscriptionPlan) => { setEditingPlan(plan); setIsModalOpen(true); };
  const openNew = () => { setEditingPlan(null); setIsModalOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Desativar este plano? Assinantes existentes não serão afetados.')) return;
    await supabase.from('mktplace_feira_subscription_plans').update({ is_active: false }).eq('id', id);
    fetchPlans();
  };

  const handleReactivate = async (id: string) => {
    await supabase.from('mktplace_feira_subscription_plans').update({ is_active: true }).eq('id', id);
    fetchPlans();
  };

  const filtered = plans.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Planos & Assinaturas</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie os pacotes de assinatura e modelos de implantação para cada perfil.</p>
        </div>
        {activeTab === 'planos' && (
          <div className="flex gap-3">
            <button onClick={fetchPlans} className="p-4 bg-white border border-gray-200 rounded-[20px] text-gray-400 hover:text-green-700 hover:border-green-700 transition-all shadow-sm">
              <RefreshCw size={18} />
            </button>
            <button onClick={openNew}
              className="flex items-center gap-2 px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-sm hover:bg-green-800 transition-all active:scale-95">
              <Plus size={18} /> Novo Plano
            </button>
          </div>
        )}
        {activeTab === 'modelos' && (
          <button className="flex items-center gap-2 px-8 py-4 bg-white border border-[#efeee9] text-gray-900 rounded-[24px] font-bold shadow-sm hover:shadow-md transition-all">
            <Plus size={18} /> Novo Template
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} disabled={tab.wip}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id ? 'bg-white text-[#125d30] shadow-sm' : 'text-gray-500 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}>
            <tab.icon size={16} /> {tab.label}
            {tab.wip && <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">WIP</span>}
          </button>
        ))}
      </div>

      {/* ── Tab: Planos ── */}
      {activeTab === 'planos' && (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Buscar planos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium focus:border-[#125d30]/30 transition-colors" />
            </div>
            <p className="text-xs font-bold text-gray-400">{filtered.length} planos</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 size={24} className="animate-spin" />
              <span className="font-bold text-sm">Carregando planos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <th className="p-5 pl-8">Nome do Plano</th>
                    <th className="p-5">Perfil</th>
                    <th className="p-5">Valor</th>
                    <th className="p-5">Recorrência</th>
                    <th className="p-5">Carência</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 pr-8 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-[#1b1c19]">
                  {filtered.map(plan => (
                    <tr key={plan.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 pl-8 font-black text-[#125d30]">{plan.name}</td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-green-50 text-[#125d30] rounded-xl text-xs font-black">
                          {PROFILE_LABEL[plan.targetProfile]}
                        </span>
                      </td>
                      <td className="p-5 font-bold">{fmt(plan.price)}</td>
                      <td className="p-5 capitalize font-medium text-gray-600">{plan.recurrence}</td>
                      <td className="p-5 font-medium text-gray-600">{plan.gracePeriodDays > 0 ? `${plan.gracePeriodDays} dias` : 'Sem carência'}</td>
                      <td className="p-5">
                        {plan.isActive
                          ? <span className="flex items-center gap-1.5 text-green-600 text-xs font-black"><CheckCircle2 size={14} /> Ativo</span>
                          : <span className="flex items-center gap-1.5 text-red-500 text-xs font-black"><XCircle size={14} /> Inativo</span>}
                      </td>
                      <td className="p-5 pr-8">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(plan)} className="p-2 text-gray-400 hover:text-[#125d30] hover:bg-green-50 rounded-xl transition-colors" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          {plan.isActive ? (
                            <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Desativar">
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <button onClick={() => handleReactivate(plan.id)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors" title="Reativar">
                              <RefreshCw size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400 font-medium">
                        {searchTerm ? 'Nenhum plano encontrado para essa busca.' : 'Nenhum plano cadastrado ainda.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Modelos de Implantação ── */}
      {activeTab === 'modelos' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Settings2 size={24} /></div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Modelos de Implantação e Carga Automática</h2>
                <p className="text-gray-500 font-medium mt-1 max-w-2xl">
                  Configure como as novas bancas são criadas. O feirante recebe a loja pronta com itens pré-cadastrados, perfis mapeados e configurações de PDV.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {IMPLEMENTATION_TEMPLATES.map(t => (
                <div key={t.id} className="bg-[#fbfaf5] p-7 rounded-[32px] border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Database size={22} /></div>
                    {t.autoConfig && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                        <UserCheck size={11} /> Auto-Setup
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-black text-gray-900 mb-1">{t.name}</h4>
                  <p className="text-xs text-gray-400 font-medium mb-5">Categoria: <span className="text-gray-700">{t.category}</span></p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                      <span className="flex items-center gap-2 text-xs font-bold text-gray-500"><Package size={14} className="text-gray-400" /> Carga de Itens</span>
                      <span className="text-sm font-black text-gray-900">{t.itemsCount} itens</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                      <span className="flex items-center gap-2 text-xs font-bold text-gray-500"><Store size={14} className="text-gray-400" /> Config PDV</span>
                      <span className="text-xs font-black text-green-600 uppercase tracking-widest">Pronto</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-white text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">Editar Itens</button>
                    <button className="p-2.5 bg-[#125d30] text-white rounded-xl hover:bg-green-800 transition-colors"><RefreshCw size={16} /></button>
                  </div>
                </div>
              ))}
              <div className="border-2 border-dashed border-gray-200 rounded-[32px] p-7 flex flex-col items-center justify-center text-center group hover:border-[#125d30]/30 cursor-pointer transition-all bg-white">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="text-gray-300 group-hover:text-[#125d30]" size={28} />
                </div>
                <h5 className="font-black text-gray-400 group-hover:text-[#125d30] text-sm">Criar Novo Modelo</h5>
                <p className="text-xs text-gray-400 mt-1 font-medium">Defina itens e configurações padrão.</p>
              </div>
            </div>
          </div>
          <div className="bg-[#125d30] rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">Por que usar Modelos de Implantação?</h4>
              <p className="text-white/80 text-sm font-medium max-w-xl">
                Feirantes preferem começar com uma loja já populada. Ao assinar, o sistema carrega os itens do catálogo mestre automaticamente, focando o feirante na gestão física.
              </p>
            </div>
            <div className="flex gap-4 relative z-10 shrink-0">
              <div className="text-center px-6 py-4 bg-white/10 rounded-2xl border border-white/20">
                <p className="text-2xl font-black">94%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Retenção Inicial</p>
              </div>
              <div className="text-center px-6 py-4 bg-white/10 rounded-2xl border border-white/20">
                <p className="text-2xl font-black">-15h</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tempo de Setup</p>
              </div>
            </div>
            <Zap size={160} className="absolute -bottom-16 -left-16 text-white/5" />
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <PlanoWizardModal
          onClose={() => { setIsModalOpen(false); setEditingPlan(null); }}
          onSave={handleSavePlan}
          saving={saving}
          initialData={editingPlan}
        />
      )}
    </div>
  );
}
