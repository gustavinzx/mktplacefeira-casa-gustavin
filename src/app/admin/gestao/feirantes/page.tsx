'use client';

import React, { useState, useEffect } from 'react';
import {
  Store, Search, Plus, ChevronRight, MoreVertical, Star, MapPin,
  TrendingUp, CheckCircle2, Clock, ArrowUpRight, ShoppingBag,
  X, Check, Loader2, AlertTriangle, Trash2, Settings, Edit
} from 'lucide-react';
import Link from 'next/link';
import { supabase, getTableName } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DBPartner {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  cpf_cnpj: string | null;
  role: string;
  status: string;
  avatar_url: string | null;
  created_at: string;
  producer?: any;
  business_name?: string;
  specialty?: string;
  user_type?: string;
}

interface FeiranteItem {
  id: string;
  name: string;
  type: string;
  category: string;
  rating: number;
  sales: string;
  status: string;
  location: string;
  image: string;
  raw?: DBPartner;
}

interface DBFair {
  id: string;
  name: string;
  city: string;
  state: string;
  neighborhood: string;
  cep: string;
  operating_hours: string;
  operating_days: string[];
  image_url: string;
}

type ModalType = 'atacadista' | 'varejista' | null;
type Step = 1 | 2;
type FairTab = 'lista' | 'cep';

const INPUT =
  'w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all text-gray-900';
const SELECT =
  'w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-2xl outline-none appearance-none font-bold text-sm transition-all text-gray-900';

const emptyVarejista = () => ({
  name: '', cpfCnpj: '', email: '', phone: '',
  category: 'Folhas & Temperos',
  deliveryFee: '', serviceRadius: '',
  welcomeCoupon: false, image: '',
  fairIds: [] as string[],
});

const emptyAtacadista = () => ({
  name: '', fantasyName: '', cnpj: '', email: '', phone: '',
  category: 'Frutas & Legumes',
  creditLimit: '', minOrder: '', billingTerms: 'À vista', image: '',
  fairIds: [] as string[],
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDiretorioFeirantesPage() {
  const [activeTab, setActiveTab] = useState<'todos' | 'atacadistas' | 'varejistas' | 'pendentes' | 'aprovados'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingFeirante, setEditingFeirante] = useState<DBPartner | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Forms
  const [varejista, setVarejista] = useState(emptyVarejista());
  const [atacadista, setAtacadista] = useState(emptyAtacadista());

  // Fairs from DB
  const [allFairs, setAllFairs] = useState<DBFair[]>([]);
  const [fairTab, setFairTab] = useState<FairTab>('lista');
  const [cepSearch, setCepSearch] = useState('');
  const [cepCity, setCepCity] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [fairSearch, setFairSearch] = useState('');

  const [feirantesList, setFeirantesList] = useState<FeiranteItem[]>([]);
  const [loadingFeirantes, setLoadingFeirantes] = useState(true);

  // ─── Load partners from DB ─────────────────────────────────────────────────

  function mapPartner(p: DBPartner): FeiranteItem {
    const producerData = Array.isArray(p.producer) ? p.producer[0] : p.producer;
    return {
      id: p.id,
      name: producerData?.stall_name || p.full_name || 'Feirante sem nome',
      type: p.role === 'atacadista' ? 'Atacadista' : p.role === 'chef' ? 'Chef' : 'Varejista',
      category: producerData?.specialty || 'Geral',
      rating: producerData?.rating || 5.0,
      sales: '—',
      status: p.status === 'approved' ? 'Ativo' : p.status === 'pending' ? 'Pendente' : 'Suspenso',
      location: '—',
      image: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(producerData?.stall_name || p.full_name || 'F')}&background=random`,
      raw: p, // adding this so we can edit the raw DB fields
    };
  }

  async function loadPartners() {
    setLoadingFeirantes(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('mktplace_feira_profiles')
        .select('*')
        .in('role', ['feirante', 'atacadista', 'varejista'])
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const profileIds = (profilesData || []).map(p => p.id);
      
      let producersData: any[] = [];
      if (profileIds.length > 0) {
        const { data: prods } = await supabase
          .from('mktplace_feira_producers')
          .select('*')
          .in('profile_id', profileIds);
        if (prods) producersData = prods;
      }

      const mergedData = (profilesData || []).map(p => ({
        ...p,
        producer: producersData.find(prod => prod.profile_id === p.id) || null
      }));

      setFeirantesList(mergedData.map(mapPartner));
    } catch (err) {
      console.error('Error fetching partners:', err);
      setFeirantesList([]);
    } finally {
      setLoadingFeirantes(false);
    }
  }

  async function approveFeirante(id: string) {
    if (id.startsWith('local-')) {
      showToast('Feirante aprovado! (Simulado localmente)');
      setFeirantesList(prev => prev.map(f => f.id === id ? { ...f, status: 'Ativo' } : f));
      return;
    }
    try {
      const { error } = await supabase
        .from('mktplace_feira_profiles')
        .update({ status: 'approved' })
        .eq('id', id);
        
      if (error) throw error;
      
      showToast('Feirante aprovado com sucesso!');
      loadPartners();
    } catch (err: any) {
      console.error('Error approving vendor:', err);
      showToast('Erro ao aprovar feirante', 'error');
    }
  }

  // ─── Load fairs ────────────────────────────────────────────────────────────

  useEffect(() => {
    loadPartners();
    
    async function loadFairs() {
      try {
        const { data, error } = await supabase
          .from(getTableName('fairs'))
          .select('id, name, city, state, neighborhood, cep, operating_hours, operating_days, image_url')
          .eq('is_active', true)
          .order('name');
          
        if (error) throw error;
        setAllFairs((data as DBFair[]) || []);
      } catch (err) {
        console.error('Erro ao carregar feiras:', err);
      }
    }
    
    loadFairs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  async function handleDeleteVendor(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir o feirante "${name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      if (!id.startsWith('local-')) {
        const { error } = await supabase
          .from('mktplace_feira_profiles')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      setFeirantesList(prev => prev.filter(f => f.id !== id));
      showToast('Feirante excluído com sucesso!');
    } catch (err: any) {
      console.error('Error deleting vendor:', err);
      showToast('Erro ao excluir feirante', 'error');
    }
  }

  function openModal(type: ModalType) {
    setActiveModal(type);
    setStep(1);
    setFairTab('lista');
    setCepSearch('');
    setCepCity('');
    setFairSearch('');
    if (type === 'varejista') setVarejista(emptyVarejista());
    else setAtacadista(emptyAtacadista());
  }

  function closeModal() {
    setActiveModal(null);
    setStep(1);
  }

  async function lookupCep(cep: string) {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) { setCepCity(''); return; }
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) setCepCity(data.localidade || '');
      else setCepCity('');
    } catch { setCepCity(''); }
    setLoadingCep(false);
  }

  // Fairs filtered for the linking step
  const fairsByCity: DBFair[] = (() => {
    if (fairTab === 'cep' && cepCity) {
      return allFairs.filter((f) =>
        f.city.toLowerCase().includes(cepCity.toLowerCase()) ||
        (f.cep || '').startsWith(cepSearch.replace(/\D/g, '').slice(0, 5))
      );
    }
    return allFairs;
  })();

  const filteredFairs = fairsByCity.filter((f) =>
    `${f.name} ${f.city} ${f.neighborhood}`.toLowerCase().includes(fairSearch.toLowerCase())
  );

  const otherFairs = fairTab === 'cep' && cepCity
    ? allFairs.filter((f) => !fairsByCity.find((x) => x.id === f.id))
    : [];

  function toggleFair(ids: string[], id: string): string[] {
    return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  async function submitAtacadista() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/feirantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'atacadista',
          atacadista,
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showToast('Feirante Atacadista cadastrado com sucesso!');
      closeModal();
      loadPartners();
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao cadastrar atacadista', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function submitVarejista() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/feirantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'varejista',
          varejista,
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showToast('Feirante Varejista cadastrado com sucesso!');
      closeModal();
      loadPartners();
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao cadastrar varejista', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function saveFeiranteEdit() {
    if (!editingFeirante) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('mktplace_feira_profiles')
        .update({
          full_name: editingFeirante.full_name,
          email: editingFeirante.email,
          phone: editingFeirante.phone,
          cpf_cnpj: editingFeirante.cpf_cnpj,
          role: editingFeirante.role,
          status: editingFeirante.status,
        })
        .eq('id', editingFeirante.id);
        
      if (error) throw error;
      showToast('Perfil atualizado com sucesso!');
      setEditingFeirante(null);
      loadPartners();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showToast('Erro ao atualizar perfil', 'error');
    } finally {
      setSaving(false);
    }
  }

  const filteredFeirantes = feirantesList.filter((f) => {
    let matchTab = true;
    if (activeTab === 'atacadistas') matchTab = f.type === 'Atacadista';
    else if (activeTab === 'varejistas') matchTab = f.type === 'Varejista';
    else if (activeTab === 'pendentes') matchTab = f.status === 'Pendente';
    else if (activeTab === 'aprovados') matchTab = f.status === 'Ativo';

    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase()) || f.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  // ─── Fair linking step (shared) ────────────────────────────────────────────

  function FairLinkingStep({ selectedIds, onChange }: { selectedIds: string[]; onChange: (ids: string[]) => void }) {
    return (
      <div className="space-y-6">
        {/* Section header */}
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-green-700" />
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Vincular à Unidade (Feira)</h3>
        </div>

        {/* Method tabs */}
        <div className="flex gap-0 border-b border-gray-200">
          {(['lista', 'cep'] as FairTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setFairTab(t); setCepCity(''); setCepSearch(''); }}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 -mb-px ${
                fairTab === t ? 'border-green-700 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {t === 'lista' ? 'Selecionar da Lista' : 'Vincular por CEP'}
            </button>
          ))}
        </div>

        {/* CEP search */}
        {fairTab === 'cep' && (
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">CEP do Feirante</label>
            <div className="relative max-w-xs">
              <input
                type="text"
                value={cepSearch}
                onChange={(e) => { setCepSearch(e.target.value); lookupCep(e.target.value); }}
                placeholder="00000-000"
                maxLength={9}
                className={INPUT + ' pr-10'}
              />
              {loadingCep && <Loader2 size={14} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
            </div>
            {cepCity && (
              <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                <Check size={12} /> Mostrando feiras em <span className="underline">{cepCity}</span>
              </p>
            )}
            {cepSearch.replace(/\D/g, '').length === 8 && !cepCity && !loadingCep && (
              <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                <AlertTriangle size={12} /> CEP não encontrado — mostrando todas as feiras
              </p>
            )}
          </div>
        )}

        {/* Search box */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={fairSearch}
            onChange={(e) => setFairSearch(e.target.value)}
            placeholder="Filtrar por nome ou cidade..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
          />
        </div>

        {/* Selected pills */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => {
              const f = allFairs.find((x) => x.id === id);
              if (!f) return null;
              return (
                <span key={id} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                  {f.name}
                  <button type="button" onClick={() => onChange(selectedIds.filter((x) => x !== id))} className="w-4 h-4 rounded-full bg-green-200 hover:bg-green-300 flex items-center justify-center text-green-700 transition-colors">
                    <X size={10} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Fair list — nearby */}
        {filteredFairs.length === 0 && (
          <p className="text-sm text-gray-400 font-medium text-center py-6">
            {allFairs.length === 0 ? 'Nenhuma feira cadastrada. Cadastre feiras em Gestão → Cadastro de Feiras.' : 'Nenhuma feira encontrada para este filtro.'}
          </p>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {fairTab === 'cep' && cepCity && filteredFairs.length > 0 && (
            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-3">Feiras próximas</p>
          )}
          {filteredFairs.map((fair) => {
            const selected = selectedIds.includes(fair.id);
            return (
              <button
                key={fair.id}
                type="button"
                onClick={() => onChange(toggleFair(selectedIds, fair.id))}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  selected ? 'border-green-700 bg-green-50' : 'border-gray-100 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  selected ? 'bg-green-700 border-green-700' : 'border-gray-300'
                }`}>
                  {selected && <Check size={11} className="text-white" />}
                </div>
                {fair.image_url
                  ? <img src={fair.image_url} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  : <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 shrink-0"><MapPin size={18} /></div>
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black truncate ${selected ? 'text-green-800' : 'text-gray-900'}`}>{fair.name}</p>
                  <p className="text-xs text-gray-400 font-medium truncate">{fair.neighborhood ? `${fair.neighborhood}, ` : ''}{fair.city} — {fair.state}</p>
                </div>
                {fair.operating_hours && (
                  <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap hidden md:block">{fair.operating_hours}</span>
                )}
              </button>
            );
          })}

          {/* Other fairs (CEP mode, different city) */}
          {otherFairs.length > 0 && (
            <>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 mb-2">Outras regiões</p>
              {otherFairs.filter((f) => `${f.name} ${f.city}`.toLowerCase().includes(fairSearch.toLowerCase())).map((fair) => {
                const selected = selectedIds.includes(fair.id);
                return (
                  <button
                    key={fair.id}
                    type="button"
                    onClick={() => onChange(toggleFair(selectedIds, fair.id))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all opacity-70 hover:opacity-100 ${
                      selected ? 'border-green-700 bg-green-50 opacity-100' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'bg-green-700 border-green-700' : 'border-gray-300'}`}>
                      {selected && <Check size={11} className="text-white" />}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"><MapPin size={18} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate text-gray-700">{fair.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{fair.city} — {fair.state}</p>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {selectedIds.length === 0 && (
          <p className="text-xs text-amber-600 font-bold flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-4 py-3 rounded-2xl">
            <AlertTriangle size={14} /> Selecione ao menos uma feira para vincular o feirante
          </p>
        )}
      </div>
    );
  }

  // ─── Step indicator ────────────────────────────────────────────────────────

  function StepBar({ labels }: { labels: string[] }) {
    return (
      <div className="flex items-center gap-0 mb-6">
        {labels.map((label, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black transition-all ${
              step === i + 1 ? 'bg-green-700 text-white' : step > i + 1 ? 'text-green-700' : 'text-gray-300'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 font-black shrink-0 ${
                step === i + 1 ? 'bg-white text-green-700 border-white' : step > i + 1 ? 'bg-green-700 text-white border-green-700' : 'border-current'
              }`}>
                {step > i + 1 ? <Check size={12} /> : i + 1}
              </span>
              {label}
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${step > i + 1 ? 'bg-green-300' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Diretório de Feirantes</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Gerencie todos os produtores e lojistas do ecossistema.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => openModal('atacadista')} className="px-8 py-4 bg-white border border-gray-200 rounded-[24px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95">
            <Plus size={20} /> Novo Atacadista
          </button>
          <button onClick={() => openModal('varejista')} className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all flex items-center gap-2 active:scale-95">
            <Plus size={20} /> Novo Varejista
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total de Feirantes', value: loadingFeirantes ? '...' : String(feirantesList.length), change: 'Cadastrados', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Aprovações Pendentes', value: loadingFeirantes ? '...' : String(feirantesList.filter(f => f.status === 'Pendente').length), change: feirantesList.filter(f => f.status === 'Pendente').length > 0 ? 'Urgente' : 'Em dia', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Volume de Vendas (Mês)', value: loadingFeirantes ? '...' : `R$ ${(feirantesList.length * 4500).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, change: '+12% vs mês anterior', icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4 hover:shadow-xl transition-all">
            <div className="flex justify-between items-center">
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl`}><stat.icon size={24} /></div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${stat.color} ${stat.bg}`}>{stat.change}</span>
            </div>
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-6">
        <div className="order-2 lg:order-1 flex flex-wrap gap-1 lg:gap-2 p-1 bg-white border border-gray-100 rounded-[24px] w-full lg:w-fit justify-center lg:justify-start shrink-0">
          {['Todos', 'Atacadistas', 'Varejistas', 'Pendentes', 'Aprovados'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab.toLowerCase() as any)} className={`px-3 lg:px-6 py-2 lg:py-3 rounded-[20px] text-[10px] lg:text-sm font-black transition-all ${activeTab === tab.toLowerCase() ? 'bg-green-700 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}>{tab}</button>
          ))}
        </div>

        <div className="order-1 lg:order-2 w-full flex-1 relative max-w-full min-w-[200px]">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar feirante..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-16 pr-6 py-3 lg:py-4 bg-white border border-gray-100 rounded-[24px] outline-none font-bold text-sm shadow-sm focus:border-green-600/30 transition-all" />
        </div>
      </div>

      {/* Grid */}
      {loadingFeirantes && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={24} />
          <span className="font-bold text-sm">Carregando feirantes...</span>
        </div>
      )}
      {!loadingFeirantes && filteredFeirantes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <Store size={40} className="opacity-30" />
          <p className="font-bold text-sm">Nenhum feirante encontrado.</p>
          <p className="text-xs font-medium">Cadastre feirantes pelo botão acima ou via <a href="/cadastro/feirante" className="text-green-700 underline">/cadastro/feirante</a>.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {!loadingFeirantes && filteredFeirantes.map((feirante) => (
          <div key={feirante.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[32px] overflow-hidden border-4 border-gray-50 group-hover:border-green-100 transition-all">
                  <img src={feirante.image} className="w-full h-full object-cover" alt={feirante.name} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-black text-gray-900">{feirante.name}</h3>
                    {feirante.status === 'Ativo' && <CheckCircle2 size={18} className="text-green-600" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${feirante.type === 'Atacadista' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{feirante.type}</span>
                    <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1"><MapPin size={12} />{feirante.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDeleteVendor(feirante.id, feirante.name)}
                  className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Excluir Feirante"
                >
                  <Trash2 size={20} />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setOpenDropdownId(openDropdownId === feirante.id ? null : feirante.id)}
                    className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {openDropdownId === feirante.id && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                      <button 
                        onClick={() => {
                          if (feirante.raw) setEditingFeirante(feirante.raw);
                          else showToast('Dados insuficientes para editar (feirante local/simulado)', 'error');
                          setOpenDropdownId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-all flex items-center gap-2"
                      >
                        <Search size={16} /> Editar Perfil Completo
                      </button>
                      <Link 
                        href={`/admin/gestao/feirantes/menus?id=${feirante.id}`}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-all flex items-center gap-2"
                      >
                        <ShoppingBag size={16} /> Menus do Feirante
                      </Link>
                      <Link 
                        href={`/admin/gestao/feirantes/implementacao?id=${feirante.id}`}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-all flex items-center gap-2"
                      >
                        <Settings size={16} /> Modo de Implementação
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-3xl text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VENDAS</p>
                <p className="text-lg font-black text-gray-900">{feirante.sales}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-3xl text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AVALIAÇÃO</p>
                <div className="flex items-center justify-center gap-1">
                  <Star size={14} className={feirante.rating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                  <p className="text-lg font-black text-gray-900">{feirante.rating > 0 ? feirante.rating : '—'}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-3xl text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">STATUS</p>
                <p className={`text-[11px] font-black uppercase ${feirante.status === 'Ativo' ? 'text-green-700' : 'text-orange-600'}`}>{feirante.status}</p>
              </div>
            </div>
            <div className="flex gap-4">
              {feirante.status === 'Pendente' && (
                <button onClick={() => approveFeirante(feirante.id)} className="flex-1 py-4 bg-green-700 text-white rounded-[24px] font-black text-sm text-center hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Aprovar
                </button>
              )}
              <Link href={`/admin/gestao/feirantes/${feirante.id}`} className="flex-1 py-4 bg-gray-900 text-white rounded-[24px] font-black text-sm text-center hover:bg-black transition-all flex items-center justify-center gap-2">
                Gerenciar Perfil <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — ATACADISTA (2 passos)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeModal === 'atacadista' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md animate-in fade-in" onClick={closeModal} />
          <div className="bg-white w-full md:w-[80vw] max-w-6xl rounded-[40px] shadow-2xl relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300 flex flex-col my-8 max-h-[90vh]">
            {/* Header */}
            <div className="p-6 md:p-8 pb-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-[40px]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Store size={24} /></div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900">Cadastrar Feirante Atacadista</h2>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Perfil Especializado B2B</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-gray-900 hover:rotate-90 transition-all border border-gray-100 shadow-sm"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <StepBar labels={['Dados da Empresa', 'Vincular Feiras']} />

              {/* Step 1 */}
              {step === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-5">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2"><Store size={14} /> Informações da Empresa</h3>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nome do Empreendimento / Razão Social</label><input required type="text" placeholder="Ex: Sítio Sol Nascente Ltda" value={atacadista.name} onChange={(e) => setAtacadista({ ...atacadista, name: e.target.value })} className={INPUT} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nome Fantasia</label><input type="text" placeholder="Ex: Sítio Sol" value={atacadista.fantasyName} onChange={(e) => setAtacadista({ ...atacadista, fantasyName: e.target.value })} className={INPUT} /></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">CNPJ</label><input type="text" placeholder="00.000.000/0001-00" value={atacadista.cnpj} onChange={(e) => setAtacadista({ ...atacadista, cnpj: e.target.value })} className={INPUT} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">E-mail Comercial</label><input type="email" placeholder="contato@sitio.com.br" value={atacadista.email} onChange={(e) => setAtacadista({ ...atacadista, email: e.target.value })} className={INPUT} /></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Telefone / WhatsApp</label><input type="text" placeholder="(11) 99999-9999" value={atacadista.phone} onChange={(e) => setAtacadista({ ...atacadista, phone: e.target.value })} className={INPUT} /></div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Categoria Master</label>
                      <div className="relative">
                        <select value={atacadista.category} onChange={(e) => setAtacadista({ ...atacadista, category: e.target.value })} className={SELECT}>
                          {['Frutas & Legumes', 'Ovos & Aves', 'Folhas & Temperos', 'Grãos & Cereais', 'Empório B2B'].map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2"><TrendingUp size={14} /> Operação e Faturamento B2B</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Limite de Crédito (R$)</label><input type="number" placeholder="Ex: 5000" value={atacadista.creditLimit} onChange={(e) => setAtacadista({ ...atacadista, creditLimit: e.target.value })} className={INPUT} /></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Pedido Mínimo (R$)</label><input type="number" placeholder="Ex: 350" value={atacadista.minOrder} onChange={(e) => setAtacadista({ ...atacadista, minOrder: e.target.value })} className={INPUT} /></div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Prazo de Faturamento Padrão</label>
                      <div className="relative">
                        <select value={atacadista.billingTerms} onChange={(e) => setAtacadista({ ...atacadista, billingTerms: e.target.value })} className={SELECT}>
                          {['À vista', 'Faturamento 7 dias', 'Faturamento 15 dias', 'Faturamento 30 dias', 'Faturamento Quinzenal (15/30)'].map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Foto do Empreendimento (URL)</label><input type="url" placeholder="https://..." value={atacadista.image} onChange={(e) => setAtacadista({ ...atacadista, image: e.target.value })} className={INPUT} /></div>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <FairLinkingStep selectedIds={atacadista.fairIds} onChange={(ids) => setAtacadista({ ...atacadista, fairIds: ids })} />
              )}

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t border-gray-100">
                {step === 1 ? (
                  <button type="button" onClick={closeModal} className="px-8 py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-900 hover:bg-gray-50 transition-all">Cancelar</button>
                ) : (
                  <button type="button" onClick={() => setStep(1)} className="px-8 py-4 text-gray-500 font-bold hover:text-gray-800 transition-all">← Voltar</button>
                )}
                {step === 1 ? (
                  <button type="button" onClick={() => { if (!atacadista.name) { showToast('Nome é obrigatório', 'error'); return; } setStep(2); }} className="px-8 py-4 bg-[#125d30] text-white rounded-[20px] font-bold shadow-lg hover:bg-green-800 transition-all flex items-center gap-2 active:scale-95">
                    Avançar — Vincular Feiras <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="button" onClick={submitAtacadista} disabled={saving || atacadista.fairIds.length === 0} className="px-8 py-4 bg-[#125d30] text-white rounded-[20px] font-bold shadow-lg hover:bg-green-800 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    {saving ? 'Cadastrando...' : `Cadastrar Feirante B2B (${atacadista.fairIds.length} feira${atacadista.fairIds.length !== 1 ? 's' : ''})`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — VAREJISTA (2 passos)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeModal === 'varejista' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md animate-in fade-in" onClick={closeModal} />
          <div className="bg-white w-full md:w-[80vw] max-w-6xl rounded-[40px] shadow-2xl relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300 flex flex-col my-8 max-h-[90vh]">
            {/* Header */}
            <div className="p-6 md:p-8 pb-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-[40px]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-700 rounded-2xl"><ShoppingBag size={24} /></div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900">Cadastrar Feirante Varejista</h2>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Perfil Local / Venda Direta (B2C)</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-gray-900 hover:rotate-90 transition-all border border-gray-100 shadow-sm"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <StepBar labels={['Identificação', 'Vincular Feiras']} />

              {/* Step 1 */}
              {step === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-5">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2"><ShoppingBag size={14} /> Identificação do Feirante</h3>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nome do Feirante / Nome da Barraca</label><input required type="text" placeholder="Ex: Horta da Dona Maria" value={varejista.name} onChange={(e) => setVarejista({ ...varejista, name: e.target.value })} className={INPUT} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">CPF ou CNPJ</label><input type="text" placeholder="000.000.000-00" value={varejista.cpfCnpj} onChange={(e) => setVarejista({ ...varejista, cpfCnpj: e.target.value })} className={INPUT} /></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Telefone / WhatsApp</label><input type="text" placeholder="(11) 98888-8888" value={varejista.phone} onChange={(e) => setVarejista({ ...varejista, phone: e.target.value })} className={INPUT} /></div>
                    </div>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">E-mail</label><input type="email" placeholder="maria.horta@gmail.com" value={varejista.email} onChange={(e) => setVarejista({ ...varejista, email: e.target.value })} className={INPUT} /></div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Categoria de Atuação</label>
                      <div className="relative">
                        <select value={varejista.category} onChange={(e) => setVarejista({ ...varejista, category: e.target.value })} className={SELECT}>
                          {['Folhas & Temperos', 'Frutas & Legumes', 'Empório', 'Queijos & Laticínios', 'Doces & Geleias'].map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2"><MapPin size={14} /> Logística de Entrega e Benefícios</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Taxa de Entrega Local (R$)</label><input type="number" placeholder="Ex: 8.50" value={varejista.deliveryFee} onChange={(e) => setVarejista({ ...varejista, deliveryFee: e.target.value })} className={INPUT} /></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Raio de Atendimento (km)</label><input type="number" placeholder="Ex: 5" value={varejista.serviceRadius} onChange={(e) => setVarejista({ ...varejista, serviceRadius: e.target.value })} className={INPUT} /></div>
                    </div>
                    <div className="p-5 bg-gray-50 border border-gray-100 rounded-3xl flex justify-between items-center">
                      <div>
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Cupom de Boas-Vindas</p>
                        <p className="text-[11px] text-gray-400 font-bold">Oferecer cupom de 10% na primeira compra</p>
                      </div>
                      <button type="button" onClick={() => setVarejista({ ...varejista, welcomeCoupon: !varejista.welcomeCoupon })} className={`w-14 h-8 rounded-full transition-all relative p-1 shrink-0 ${varejista.welcomeCoupon ? 'bg-green-700' : 'bg-gray-200'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all ${varejista.welcomeCoupon ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Foto da Barraca (URL)</label><input type="url" placeholder="https://... (deixe vazio para avatar automático)" value={varejista.image} onChange={(e) => setVarejista({ ...varejista, image: e.target.value })} className={INPUT} /></div>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <FairLinkingStep selectedIds={varejista.fairIds} onChange={(ids) => setVarejista({ ...varejista, fairIds: ids })} />
              )}

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t border-gray-100">
                {step === 1 ? (
                  <button type="button" onClick={closeModal} className="px-8 py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-900 hover:bg-gray-50 transition-all">Cancelar</button>
                ) : (
                  <button type="button" onClick={() => setStep(1)} className="px-8 py-4 text-gray-500 font-bold hover:text-gray-800 transition-all">← Voltar</button>
                )}
                {step === 1 ? (
                  <button type="button" onClick={() => { if (!varejista.name) { showToast('Nome é obrigatório', 'error'); return; } setStep(2); }} className="px-8 py-4 bg-[#125d30] text-white rounded-[20px] font-bold shadow-lg hover:bg-green-800 transition-all flex items-center gap-2 active:scale-95">
                    Avançar — Vincular Feiras <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="button" onClick={submitVarejista} disabled={saving || varejista.fairIds.length === 0} className="px-8 py-4 bg-[#125d30] text-white rounded-[20px] font-bold shadow-lg hover:bg-green-800 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    {saving ? 'Cadastrando...' : `Cadastrar Feirante Varejo (${varejista.fairIds.length} feira${varejista.fairIds.length !== 1 ? 's' : ''})`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — EDICAO PERFIL
      ══════════════════════════════════════════════════════════════════════ */}
      {editingFeirante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md animate-in fade-in" onClick={() => setEditingFeirante(null)} />
          <div className="bg-white w-full md:w-[60vw] max-w-4xl rounded-[40px] shadow-2xl relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300 flex flex-col my-8 max-h-[90vh]">
            {/* Header */}
            <div className="p-6 md:p-8 pb-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-[40px]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl"><Edit size={24} /></div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900">Editar Perfil do Feirante</h2>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Edição Completa (Admin)</p>
                </div>
              </div>
              <button onClick={() => setEditingFeirante(null)} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-gray-900 hover:rotate-90 transition-all border border-gray-100 shadow-sm"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Razão Social / Nome da Loja</label>
                    <input type="text" value={editingFeirante.business_name || ''} onChange={(e) => setEditingFeirante({ ...editingFeirante, business_name: e.target.value })} className={INPUT} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nome Completo</label>
                    <input type="text" value={editingFeirante.full_name || ''} onChange={(e) => setEditingFeirante({ ...editingFeirante, full_name: e.target.value })} className={INPUT} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">CPF / CNPJ</label>
                    <input type="text" value={editingFeirante.cpf_cnpj || ''} onChange={(e) => setEditingFeirante({ ...editingFeirante, cpf_cnpj: e.target.value })} className={INPUT} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">E-mail</label>
                    <input type="email" value={editingFeirante.email || ''} onChange={(e) => setEditingFeirante({ ...editingFeirante, email: e.target.value })} className={INPUT} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Telefone</label>
                    <input type="text" value={editingFeirante.phone || ''} onChange={(e) => setEditingFeirante({ ...editingFeirante, phone: e.target.value })} className={INPUT} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Categoria / Especialidade</label>
                    <input type="text" value={editingFeirante.specialty || ''} onChange={(e) => setEditingFeirante({ ...editingFeirante, specialty: e.target.value })} className={INPUT} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tipo de Feirante</label>
                    <div className="relative">
                      <select value={editingFeirante.user_type || 'varejista'} onChange={(e) => setEditingFeirante({ ...editingFeirante, user_type: e.target.value })} className={SELECT}>
                        <option value="varejista">Varejista</option>
                        <option value="atacadista">Atacadista</option>
                        <option value="chef">Chef</option>
                      </select>
                      <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Status da Conta</label>
                    <div className="relative">
                      <select value={editingFeirante.status || 'pending'} onChange={(e) => setEditingFeirante({ ...editingFeirante, status: e.target.value })} className={SELECT}>
                        <option value="pending">Pendente (Aguardando Aprovação)</option>
                        <option value="approved">Ativo (Aprovado)</option>
                        <option value="suspended">Suspenso / Bloqueado</option>
                      </select>
                      <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-6 md:p-8 border-t border-gray-100 flex justify-between">
              <button type="button" onClick={() => setEditingFeirante(null)} className="px-8 py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-900 hover:bg-gray-50 transition-all">Cancelar</button>
              <button type="button" onClick={saveFeiranteEdit} disabled={saving} className="px-8 py-4 bg-blue-700 text-white rounded-[20px] font-bold shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold text-white animate-in fade-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success' ? 'bg-green-700' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
