'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck, MapPin, Plus, Search, Edit2, Eye,
  DollarSign, Package, Navigation, X,
  CheckCircle2, AlertCircle, Clock, Building2,
  Hash, ArrowLeft, ArrowRight, Info, ToggleLeft, ToggleRight
} from 'lucide-react';
import Modal from '@/components/admin/Modal';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type FreteType = 'distancia' | 'fixo' | 'retirada';

interface FeiraCEP {
  cep: string;
  feiraId: string;
  feiraNome: string;
  diasSemana: string[];
  horarioAbertura: string;
  horarioFechamento: string;
  bairro?: string;
}

interface CidadeFrete {
  id: string;
  estado: string;
  cidade: string;
  tipo: FreteType;
  precoPorKm?: number;
  raioMaxKm?: number;
  taxaMinima?: number;
  valorFixo?: number;
  instrucoes?: string;
  ceps: FeiraCEP[];
  ativo: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const TIPO_CONFIG: Record<FreteType, { label: string; icon: React.ElementType; bg: string; color: string; desc: string }> = {
  distancia: { label: 'Por Distância', icon: Navigation, bg: 'bg-blue-50', color: 'text-blue-700', desc: 'Cobrança por km rodado' },
  fixo:      { label: 'Frete Fixo',    icon: DollarSign, bg: 'bg-green-50', color: 'text-green-700', desc: 'Valor único por entrega' },
  retirada:  { label: 'Retirada',      icon: Package,    bg: 'bg-purple-50', color: 'text-purple-700', desc: 'Cliente retira no local' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function freightLabel(c: CidadeFrete) {
  if (c.tipo === 'distancia') return `R$ ${c.precoPorKm?.toFixed(2).replace('.', ',')}/km · raio ${c.raioMaxKm}km · mín R$${c.taxaMinima?.toFixed(0)}`;
  if (c.tipo === 'fixo')      return `R$ ${c.valorFixo?.toFixed(2).replace('.', ',')} por entrega`;
  return c.instrucoes ?? '—';
}

// ─── Form blank ───────────────────────────────────────────────────────────────

const BLANK_FORM = { estado: '', cidade: '', tipo: '' as FreteType | '', precoPorKm: '', raioMaxKm: '', taxaMinima: '', valorFixo: '', instrucoes: '' };
const BLANK_CEP  = { cep: '', feiraNome: '', diasSemana: [] as string[], horarioAbertura: '07:00', horarioFechamento: '13:00', bairro: '' };

// ─── Component ────────────────────────────────────────────────────────────────

export default function GestaoFretePage() {
  const [cidades, setCidades] = useState<CidadeFrete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCidades() {
      const { data } = await supabase.from('mktplace_feira_city_freight').select('*');
      if (data) {
        setCidades(data.map(d => ({
          id: d.id,
          estado: d.estado,
          cidade: d.cidade,
          tipo: d.tipo as FreteType,
          precoPorKm: d.preco_por_km,
          raioMaxKm: d.raio_max_km,
          taxaMinima: d.taxa_minima,
          valorFixo: d.valor_fixo,
          instrucoes: d.instrucoes,
          ceps: d.ceps || [],
          ativo: d.ativo
        })));
      }
      setLoading(false);
    }
    loadCidades();
  }, []);

  const [search, setSearch]   = useState('');
  const [tipoFilter, setTipoFilter] = useState<FreteType | 'todos'>('todos');

  const [viewCidade, setViewCidade] = useState<CidadeFrete | null>(null);
  const [editCidade, setEditCidade] = useState<CidadeFrete | null>(null);
  const [addOpen, setAddOpen]       = useState(false);

  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState(BLANK_FORM);
  const [cepEntries, setCepEntries] = useState<FeiraCEP[]>([]);
  const [newCep, setNewCep]     = useState(BLANK_CEP);

  // ── derived ───

  const filtered = cidades.filter(c => {
    const q = search.toLowerCase();
    return (
      (!q || c.cidade.toLowerCase().includes(q) || c.estado.toLowerCase().includes(q)) &&
      (tipoFilter === 'todos' || c.tipo === tipoFilter)
    );
  });

  const totalCeps = cidades.reduce((a, c) => a + c.ceps.length, 0);
  const ativas    = cidades.filter(c => c.ativo).length;

  // ── actions ───

  const toggleAtivo = async (id: string) => {
    const c = cidades.find(x => x.id === id);
    if (!c) return;
    setCidades(prev => prev.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c));
    await supabase.from('mktplace_feira_city_freight').update({ ativo: !c.ativo }).eq('id', id);
  };

  const openAdd = () => {
    setForm(BLANK_FORM); setCepEntries([]); setNewCep(BLANK_CEP); setStep(0); setAddOpen(true);
  };

  const openEdit = (c: CidadeFrete) => {
    setForm({
      estado: c.estado, cidade: c.cidade, tipo: c.tipo,
      precoPorKm: c.precoPorKm?.toString() ?? '', raioMaxKm: c.raioMaxKm?.toString() ?? '',
      taxaMinima: c.taxaMinima?.toString() ?? '', valorFixo: c.valorFixo?.toString() ?? '',
      instrucoes: c.instrucoes ?? '',
    });
    setCepEntries([...c.ceps]);
    setStep(0);
    setEditCidade(c);
  };

  const handleSave = async () => {
    if (!form.estado || !form.cidade || !form.tipo) return;
    const base: Omit<CidadeFrete, 'id'> = {
      estado: form.estado, cidade: form.cidade, tipo: form.tipo as FreteType,
      precoPorKm:  form.tipo === 'distancia' ? parseFloat(form.precoPorKm)  : undefined,
      raioMaxKm:   form.tipo === 'distancia' ? parseFloat(form.raioMaxKm)   : undefined,
      taxaMinima:  form.tipo === 'distancia' ? parseFloat(form.taxaMinima)  : undefined,
      valorFixo:   form.tipo === 'fixo'      ? parseFloat(form.valorFixo)   : undefined,
      instrucoes:  form.tipo === 'retirada'  ? form.instrucoes              : undefined,
      ceps: cepEntries, ativo: true,
    };
    
    const dbPayload = {
      estado: base.estado,
      cidade: base.cidade,
      tipo: base.tipo,
      preco_por_km: base.precoPorKm,
      raio_max_km: base.raioMaxKm,
      taxa_minima: base.taxaMinima,
      valor_fixo: base.valorFixo,
      instrucoes: base.instrucoes,
      ceps: base.ceps,
      ativo: base.ativo
    };

    if (editCidade) {
      setCidades(prev => prev.map(c => c.id === editCidade.id ? { id: c.id, ...base } : c));
      setEditCidade(null);
      await supabase.from('mktplace_feira_city_freight').update(dbPayload).eq('id', editCidade.id);
    } else {
      const { data } = await supabase.from('mktplace_feira_city_freight').insert(dbPayload).select().single();
      if (data) {
        setCidades(prev => [...prev, { ...base, id: data.id }]);
      }
      setAddOpen(false);
    }
  };

  const addCepEntry = () => {
    if (!newCep.cep || !newCep.feiraNome) return;
    setCepEntries(prev => [...prev, { ...newCep, feiraId: `f_${Date.now()}` }]);
    setNewCep(BLANK_CEP);
  };

  const removeCepEntry = (cep: string) => setCepEntries(prev => prev.filter(c => c.cep !== cep));

  const toggleDia = (dia: string) =>
    setNewCep(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia],
    }));

  // ── shared form UI (add + edit share same state) ──

  const FormUI = (
    <div className="space-y-6">
      {/* Progress steps */}
      <div className="flex gap-2">
        {['Localização', 'Tipo de Frete', 'Parâmetros', 'Zonas CEP'].map((s, i) => (
          <div key={s} className="flex-1 text-center">
            <div className={`h-1.5 rounded-full mb-1.5 transition-colors ${i <= step ? 'bg-[#125d30]' : 'bg-gray-100'}`} />
            <p className={`text-[9px] font-black uppercase tracking-widest ${i === step ? 'text-[#125d30]' : 'text-gray-400'}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Step 0 — Localização */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Estado (UF)</label>
            <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold">
              <option value="">Selecione...</option>
              {ESTADOS.map(uf => <option key={uf}>{uf}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Cidade</label>
            <input type="text" value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))}
              placeholder="Ex: São Paulo"
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
          </div>
          <div className="p-4 bg-blue-50 rounded-[20px] flex gap-3">
            <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 font-medium">Todas as feiras dessa cidade compartilharão esta mesma tabela de frete. O roteamento por CEP define qual feira pertence a qual zona.</p>
          </div>
        </div>
      )}

      {/* Step 1 — Tipo */}
      {step === 1 && (
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(TIPO_CONFIG) as [FreteType, (typeof TIPO_CONFIG)[FreteType]][]).map(([key, cfg]) => (
            <button key={key} onClick={() => setForm(f => ({ ...f, tipo: key }))}
              className={`p-4 rounded-[20px] border-2 text-left transition-all ${form.tipo === key ? 'border-[#125d30] bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}>
              <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center mb-3`}>
                <cfg.icon size={18} className={cfg.color} />
              </div>
              <p className="font-black text-gray-900 text-sm">{cfg.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{cfg.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2 — Parâmetros */}
      {step === 2 && (
        <div className="space-y-4">
          {form.tipo === 'distancia' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Preço por km (R$)</label>
                  <input type="number" step="0.01" value={form.precoPorKm} onChange={e => setForm(f => ({ ...f, precoPorKm: e.target.value }))}
                    placeholder="2.50" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Raio máximo (km)</label>
                  <input type="number" value={form.raioMaxKm} onChange={e => setForm(f => ({ ...f, raioMaxKm: e.target.value }))}
                    placeholder="15" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Taxa mínima (R$)</label>
                <input type="number" step="0.01" value={form.taxaMinima} onChange={e => setForm(f => ({ ...f, taxaMinima: e.target.value }))}
                  placeholder="8.00" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
              </div>
            </>
          )}
          {form.tipo === 'fixo' && (
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Valor fixo por entrega (R$)</label>
              <input type="number" step="0.01" value={form.valorFixo} onChange={e => setForm(f => ({ ...f, valorFixo: e.target.value }))}
                placeholder="12.00" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
            </div>
          )}
          {form.tipo === 'retirada' && (
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Instruções de retirada</label>
              <textarea value={form.instrucoes} onChange={e => setForm(f => ({ ...f, instrucoes: e.target.value }))}
                rows={3} placeholder="Descreva como o cliente deve retirar o pedido..."
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold resize-none" />
            </div>
          )}

          {/* Business rules */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-[20px] space-y-2">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5"><Info size={12} /> Regras de cobrança</p>
            <div className="text-xs text-amber-800 space-y-1.5">
              <p className="flex gap-2"><CheckCircle2 size={13} className="text-green-600 shrink-0 mt-0.5" /><span><strong>Mesmo dia + mesmo horário + mesmo CEP</strong> → 1 frete único (compartilhado)</span></p>
              <p className="flex gap-2"><AlertCircle  size={13} className="text-amber-600 shrink-0 mt-0.5" /><span><strong>Mesmo dia + horários diferentes</strong> (ex: 07–13h e 17–20h) + CEP diferente → 2 fretes cobrados</span></p>
              <p className="flex gap-2"><Clock        size={13} className="text-blue-600 shrink-0 mt-0.5"  /><span><strong>Dias de entrega diferentes</strong> → fretes completamente independentes</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Zonas CEP */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 font-medium">Vincule cada feira desta cidade ao seu CEP de localização. O sistema calcula o frete pelo CEP de destino do cliente usando a tabela desta cidade.</p>

          {cepEntries.length > 0 && (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {cepEntries.map(entry => (
                <div key={entry.cep} className="flex items-center gap-3 p-3 bg-gray-50 rounded-[16px]">
                  <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={13} className="text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm">{entry.cep}{entry.bairro ? ` · ${entry.bairro}` : ''}</p>
                    <p className="text-[11px] text-gray-400 truncate">{entry.feiraNome} · {entry.diasSemana.join(', ')} · {entry.horarioAbertura}–{entry.horarioFechamento}</p>
                  </div>
                  <button onClick={() => removeCepEntry(entry.cep)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add zone */}
          <div className="p-4 bg-gray-50 rounded-[20px] space-y-3 border border-dashed border-gray-200">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nova Zona</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CEP *</label>
                <input type="text" value={newCep.cep} onChange={e => setNewCep(p => ({ ...p, cep: e.target.value }))}
                  placeholder="00000-000" maxLength={9}
                  className="w-full mt-1 px-3 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-green-600/30 outline-none text-sm font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bairro</label>
                <input type="text" value={newCep.bairro} onChange={e => setNewCep(p => ({ ...p, bairro: e.target.value }))}
                  placeholder="Nome do bairro"
                  className="w-full mt-1 px-3 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-green-600/30 outline-none text-sm font-bold" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome da Feira *</label>
              <input type="text" value={newCep.feiraNome} onChange={e => setNewCep(p => ({ ...p, feiraNome: e.target.value }))}
                placeholder="Ex: Feira do Bairro X"
                className="w-full mt-1 px-3 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-green-600/30 outline-none text-sm font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Dias de Funcionamento</label>
              <div className="flex gap-1.5 flex-wrap">
                {DIAS.map(d => (
                  <button key={d} onClick={() => toggleDia(d)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${newCep.diasSemana.includes(d) ? 'bg-[#125d30] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Abertura</label>
                <input type="time" value={newCep.horarioAbertura} onChange={e => setNewCep(p => ({ ...p, horarioAbertura: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-green-600/30 outline-none text-sm font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fechamento</label>
                <input type="time" value={newCep.horarioFechamento} onChange={e => setNewCep(p => ({ ...p, horarioFechamento: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-green-600/30 outline-none text-sm font-bold" />
              </div>
            </div>
            <button onClick={addCepEntry} disabled={!newCep.cep || !newCep.feiraNome}
              className="w-full py-2.5 bg-[#125d30] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-800 transition-all disabled:opacity-40">
              <Plus size={14} /> Adicionar Zona
            </button>
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex justify-between pt-1">
        {step > 0
          ? <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-[16px] font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-all">
              <ArrowLeft size={14} /> Voltar
            </button>
          : <div />
        }
        {step < 3
          ? <button
              onClick={() => setStep(s => s + 1)}
              disabled={(step === 0 && (!form.estado || !form.cidade)) || (step === 1 && !form.tipo)}
              className="px-5 py-2.5 bg-[#125d30] text-white rounded-[16px] font-bold text-sm flex items-center gap-2 hover:bg-green-800 transition-all disabled:opacity-40">
              Próximo <ArrowRight size={14} />
            </button>
          : <button onClick={handleSave}
              className="px-5 py-2.5 bg-[#125d30] text-white rounded-[16px] font-bold text-sm flex items-center gap-2 hover:bg-green-800 transition-all shadow-lg">
              <CheckCircle2 size={14} /> Salvar
            </button>
        }
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Gestão de Frete</h1>
          <p className="text-gray-500 font-medium mt-1">Configure tabelas de frete por cidade e vincule feiras por CEP.</p>
        </div>
        <button onClick={openAdd}
          className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-green-800 transition-all shadow-lg shadow-green-900/10 shrink-0">
          <Plus size={16} /> Nova Cidade
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cidades',       value: cidades.length, sub: `${ativas} ativas`,          icon: Building2, bg: 'bg-green-50',  color: 'text-green-700'  },
          { label: 'Zonas CEP',     value: totalCeps,      sub: 'áreas mapeadas',            icon: Hash,      bg: 'bg-blue-50',   color: 'text-blue-600'   },
          { label: 'Feiras Cobertas', value: cidades.reduce((a,c) => a + c.ceps.length, 0), sub: 'na rede toda', icon: MapPin, bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Tipos de Frete', value: 3,             sub: 'distância · fixo · retirada', icon: Truck,  bg: 'bg-orange-50', color: 'text-orange-600' },
        ].map(({ label, value, sub, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}><Icon size={18} className={color} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
              <p className="text-xl font-black text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Business rules panel */}
      <div className="bg-amber-50 border border-amber-100 rounded-[24px] p-6">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Info size={17} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-black text-amber-900 mb-3">Regras de Cobrança de Frete — Como o Sistema Calcula</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex gap-2.5 p-3 bg-white/60 rounded-[16px]">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-black mb-0.5">1 Frete Único</p>
                  <p>Mesmo dia <strong>+</strong> mesmo horário <strong>+</strong> mesmo CEP → frete compartilhado entre as feiras do feirante</p>
                </div>
              </div>
              <div className="flex gap-2.5 p-3 bg-white/60 rounded-[16px]">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-black mb-0.5">2 Fretes Cobrados</p>
                  <p>Mesmo dia <strong>+</strong> horários diferentes (ex: 07–13h / 17–20h) <strong>+</strong> CEPs diferentes</p>
                </div>
              </div>
              <div className="flex gap-2.5 p-3 bg-white/60 rounded-[16px]">
                <Clock size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-black mb-0.5">Fretes Independentes</p>
                  <p>Dias diferentes de entrega → cada dia tem seu frete calculado separadamente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cidade ou estado..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-[16px] outline-none text-sm font-bold focus:border-green-600/30" />
        </div>
        {(['todos', 'distancia', 'fixo', 'retirada'] as const).map(t => (
          <button key={t} onClick={() => setTipoFilter(t)}
            className={`px-4 py-2.5 rounded-[16px] text-sm font-bold transition-all ${tipoFilter === t ? 'bg-[#125d30] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            {t === 'todos' ? 'Todos' : TIPO_CONFIG[t].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                {['Cidade / Estado', 'Tipo de Frete', 'Configuração', 'Zonas CEP', 'Feiras', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(cidade => {
                const cfg = TIPO_CONFIG[cidade.tipo];
                return (
                  <tr key={cidade.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-7 py-5">
                      <p className="font-black text-gray-900 text-sm">{cidade.cidade}</p>
                      <p className="text-[11px] font-bold text-gray-400">{cidade.estado}</p>
                    </td>
                    <td className="px-7 py-5">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black w-fit ${cfg.bg} ${cfg.color}`}>
                        <cfg.icon size={12} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-7 py-5 max-w-[200px]">
                      <p className="text-sm font-bold text-gray-700 truncate">{freightLabel(cidade)}</p>
                    </td>
                    <td className="px-7 py-5">
                      <p className="font-black text-gray-900 text-sm">{cidade.ceps.length}</p>
                      <p className="text-[11px] text-gray-400">
                        {cidade.ceps.slice(0, 2).map(c => c.cep).join(' · ')}{cidade.ceps.length > 2 ? ' …' : ''}
                      </p>
                    </td>
                    <td className="px-7 py-5">
                      <p className="font-black text-gray-900">{cidade.ceps.length}</p>
                    </td>
                    <td className="px-7 py-5">
                      <button onClick={() => toggleAtivo(cidade.id)} className="flex items-center gap-1.5 transition-all group">
                        {cidade.ativo
                          ? <><ToggleRight size={24} className="text-green-600" /><span className="text-xs font-black text-green-700">Ativa</span></>
                          : <><ToggleLeft  size={24} className="text-gray-400"  /><span className="text-xs font-black text-gray-400">Inativa</span></>}
                      </button>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex gap-2">
                        <button onClick={() => setViewCidade(cidade)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openEdit(cidade)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-[#125d30] hover:bg-green-50 transition-all">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-7 py-16 text-center text-gray-400 font-bold">
                    Nenhuma cidade encontrada com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Nova Configuração de Frete">
        {FormUI}
      </Modal>

      {/* MODAL: Edit */}
      <Modal isOpen={!!editCidade} onClose={() => setEditCidade(null)} title={`Editar — ${editCidade?.cidade ?? ''}, ${editCidade?.estado ?? ''}`}>
        {FormUI}
      </Modal>

      {/* MODAL: View */}
      <Modal isOpen={!!viewCidade} onClose={() => setViewCidade(null)} title={viewCidade ? `${viewCidade.cidade}, ${viewCidade.estado}` : ''}>
        {viewCidade && (() => {
          const cfg = TIPO_CONFIG[viewCidade.tipo];
          return (
            <div className="space-y-5">
              {/* Freight type card */}
              <div className={`p-4 ${cfg.bg} rounded-[20px] flex items-center gap-4`}>
                <div className={`w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center shrink-0`}>
                  <cfg.icon size={22} className={cfg.color} />
                </div>
                <div>
                  <p className={`font-black text-sm ${cfg.color}`}>{cfg.label}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{freightLabel(viewCidade)}</p>
                </div>
              </div>

              {/* Business rule reminder */}
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                {[
                  { icon: CheckCircle2, color: 'text-green-600', label: 'Mesmo CEP + hora', value: '1 frete' },
                  { icon: AlertCircle,  color: 'text-amber-600', label: 'Horas diferentes', value: '2 fretes' },
                  { icon: Clock,        color: 'text-blue-600',  label: 'Dias diferentes',  value: 'Independentes' },
                ].map(({ icon: Icon, color, label, value }) => (
                  <div key={label} className="p-3 bg-gray-50 rounded-[14px] text-center">
                    <Icon size={14} className={`${color} mx-auto mb-1`} />
                    <p className="font-bold text-gray-500">{label}</p>
                    <p className="font-black text-gray-900 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* CEP zones */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Zonas CEP vinculadas ({viewCidade.ceps.length})</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {viewCidade.ceps.map(entry => (
                    <div key={entry.cep} className="p-4 bg-gray-50 rounded-[16px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-gray-900 text-sm">{entry.cep}</p>
                            {entry.bairro && <span className="text-[10px] font-black text-gray-400 bg-gray-200/70 px-2 py-0.5 rounded-full">{entry.bairro}</span>}
                          </div>
                          <p className="text-xs font-bold text-gray-600 mt-0.5">{entry.feiraNome}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex gap-1 justify-end flex-wrap">
                            {entry.diasSemana.map(d => (
                              <span key={d} className="text-[9px] font-black bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md">{d}</span>
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 flex items-center gap-1 justify-end">
                            <Clock size={9} />{entry.horarioAbertura}–{entry.horarioFechamento}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => { setViewCidade(null); openEdit(viewCidade); }}
                className="w-full py-3 bg-[#125d30] text-white rounded-[20px] font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-all">
                <Edit2 size={16} /> Editar Configuração
              </button>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
