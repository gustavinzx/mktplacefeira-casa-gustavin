'use client';

import React, { useState } from 'react';
import {
  Target, ChevronRight, Plus, Users, TrendingUp, MapPin, Store, ChefHat,
  Truck, Lightbulb, Activity, Search, MessageCircle, Calendar, Clock,
  Briefcase, Phone, Mail, MessageSquare, ArrowRight, ArrowLeft, X,
  Check, Trash2, Send, BellRing, LayoutGrid, List, CalendarClock,
  Zap, MoreHorizontal, CheckCircle2, Star, Hash, UserPlus, Filter,
  Megaphone, AlarmClock, Building2,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadType = 'feirante' | 'restaurante' | 'franqueado' | 'delivery' | 'atacadista';
type LeadStage = 'novo' | 'contato' | 'proposta' | 'negociacao' | 'onboarding' | 'convertido';
type ActionChannel = 'call' | 'email' | 'whatsapp' | 'meeting' | 'note';

interface HistoryEntry {
  id: string;
  date: string;
  action: string;
  channel: ActionChannel;
}

interface Lead {
  id: string;
  name: string;
  type: LeadType;
  stage: LeadStage;
  city: string;
  phone: string;
  email: string;
  category: string;
  source: string;
  score: number;
  lastContact: string;
  nextContact?: string;
  notes: string;
  history: HistoryEntry[];
}

interface Disparo {
  id: string;
  channel: 'email' | 'whatsapp';
  target: string;
  message: string;
  scheduledAt: string;
  status: 'agendado' | 'enviado' | 'cancelado';
  count: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGES: { id: LeadStage; label: string; colorBg: string; colorText: string; dotColor: string }[] = [
  { id: 'novo',       label: 'Novo Lead',         colorBg: 'bg-gray-100',   colorText: 'text-gray-700',   dotColor: 'bg-gray-400'   },
  { id: 'contato',    label: 'Contato Feito',      colorBg: 'bg-blue-100',   colorText: 'text-blue-700',   dotColor: 'bg-blue-500'   },
  { id: 'proposta',   label: 'Proposta Enviada',   colorBg: 'bg-yellow-100', colorText: 'text-yellow-700', dotColor: 'bg-yellow-500' },
  { id: 'negociacao', label: 'Negociação',         colorBg: 'bg-orange-100', colorText: 'text-orange-700', dotColor: 'bg-orange-500' },
  { id: 'onboarding', label: 'Onboarding',         colorBg: 'bg-purple-100', colorText: 'text-purple-700', dotColor: 'bg-purple-500' },
  { id: 'convertido', label: '✓ Convertido',       colorBg: 'bg-green-100',  colorText: 'text-green-700',  dotColor: 'bg-green-500'  },
];

const TYPE_LABEL: Record<LeadType, string> = {
  feirante:   'Feirante',
  restaurante:'Restaurante',
  franqueado: 'Franqueado',
  delivery:   'Delivery',
  atacadista: 'Atacadista',
};

const TYPE_COLOR: Record<LeadType, string> = {
  feirante:   'bg-green-100 text-green-700',
  restaurante:'bg-orange-100 text-orange-700',
  franqueado: 'bg-blue-100 text-blue-700',
  delivery:   'bg-purple-100 text-purple-700',
  atacadista: 'bg-gray-100 text-gray-700',
};

const CHANNEL_ICON: Record<ActionChannel, React.ElementType> = {
  call: Phone, email: Mail, whatsapp: MessageSquare, meeting: Calendar, note: Hash,
};

const CHANNEL_COLOR: Record<ActionChannel, string> = {
  call:     'bg-green-50 text-green-600',
  email:    'bg-blue-50 text-blue-600',
  whatsapp: 'bg-emerald-50 text-emerald-600',
  meeting:  'bg-purple-50 text-purple-600',
  note:     'bg-gray-50 text-gray-600',
};

// ─── Helper Components ────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const c = score >= 8.5 ? 'bg-green-100 text-green-700' : score >= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${c} flex items-center gap-1`}><Star size={10} fill="currentColor" />{score.toFixed(1)}</span>;
}

function TypeBadge({ type }: { type: LeadType }) {
  return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${TYPE_COLOR[type]}`}>{TYPE_LABEL[type]}</span>;
}

function StageBadge({ stage }: { stage: LeadStage }) {
  const s = STAGES.find(x => x.id === stage)!;
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${s.colorBg} ${s.colorText}`}>{s.label}</span>;
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────

function LeadDetailModal({ lead, onClose, onUpdate }: { lead: Lead; onClose: () => void; onUpdate: (l: Lead) => void }) {
  const [tab, setTab] = useState<'info' | 'followup' | 'disparos'>('followup');
  const [action, setAction] = useState('');
  const [channel, setChannel] = useState<ActionChannel>('note');
  const [nextDate, setNextDate] = useState(lead.nextContact ?? '');
  const [newStage, setNewStage] = useState<LeadStage>(lead.stage);

  const addHistory = async () => {
    if (!action.trim()) return;
    const updated: Lead = {
      ...lead,
      stage: newStage,
      nextContact: nextDate || lead.nextContact,
      lastContact: 'Agora',
      history: [
        { id: Math.random().toString(36).substring(7), date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), action, channel },
        ...lead.history,
      ],
    };
    onUpdate(updated);
    setAction('');
  };

  const Icon = CHANNEL_ICON[channel];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-[80vw] h-[80vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="flex-none px-10 py-7 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#125d30] flex items-center justify-center text-white text-xl font-black">
              {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-black text-gray-900 leading-none">{lead.name}</h3>
                <TypeBadge type={lead.type} />
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-medium text-gray-400"><MapPin size={12} />{lead.city}</span>
                <ScoreBadge score={lead.score} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${lead.phone}`} className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl font-bold text-sm hover:bg-green-100 transition-colors">
              <Phone size={16} /> Ligar
            </a>
            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors">
              <MessageSquare size={16} /> WhatsApp
            </a>
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors">
              <Mail size={16} /> E-mail
            </a>
            <button onClick={onClose} className="ml-2 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-none flex gap-1 px-10 pt-4 pb-0 border-b border-gray-100">
          {[
            { id: 'followup', label: 'Follow-up & Timeline', icon: CalendarClock },
            { id: 'info', label: 'Dados do Lead', icon: Briefcase },
            { id: 'disparos', label: 'Disparos', icon: Send },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 ${tab === t.id ? 'text-[#125d30] border-[#125d30] bg-green-50/50' : 'text-gray-400 border-transparent hover:text-gray-700'}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex">

          {/* Follow-up tab */}
          {tab === 'followup' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Timeline */}
              <div className="flex-1 overflow-y-auto p-8 border-r border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">Histórico de Interações</p>
                {lead.history.length === 0 && (
                  <div className="text-center text-gray-400 py-12">
                    <Clock size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="font-medium">Nenhuma interação registrada.</p>
                  </div>
                )}
                <div className="space-y-0">
                  {lead.history.map((h, i) => {
                    const Ic = CHANNEL_ICON[h.channel];
                    return (
                      <div key={h.id} className="flex gap-4 relative">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${CHANNEL_COLOR[h.channel]}`}>
                            <Ic size={16} />
                          </div>
                          {i < lead.history.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1 min-h-[20px]" />}
                        </div>
                        <div className="pb-5">
                          <p className="text-sm font-bold text-gray-900 leading-snug">{h.action}</p>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">{h.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Register action + move stage */}
              <div className="w-[360px] shrink-0 p-8 overflow-y-auto space-y-6 bg-[#fbfaf5]/50">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Registrar Ação</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['call', 'email', 'whatsapp', 'meeting', 'note'] as ActionChannel[]).map(c => {
                      const Ic = CHANNEL_ICON[c];
                      return (
                        <button key={c} onClick={() => setChannel(c)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${channel === c ? CHANNEL_COLOR[c] + ' ring-2 ring-current/20' : 'bg-white border border-gray-100 text-gray-500 hover:border-gray-300'}`}>
                          <Ic size={13} /> {c === 'call' ? 'Ligação' : c === 'email' ? 'E-mail' : c === 'whatsapp' ? 'WhatsApp' : c === 'meeting' ? 'Reunião' : 'Nota'}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    value={action}
                    onChange={e => setAction(e.target.value)}
                    placeholder="Descreva o que aconteceu nesta interação..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Agendar Próximo Contato</label>
                  <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mover para Etapa</label>
                  <select value={newStage} onChange={e => setNewStage(e.target.value as LeadStage)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#125d30]/50">
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <button onClick={addHistory} disabled={!action.trim()}
                  className="w-full py-4 bg-[#125d30] text-white rounded-2xl font-black text-sm hover:bg-[#0e4d27] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <Check size={16} /> Salvar Interação
                </button>
              </div>
            </div>
          )}

          {/* Info tab */}
          {tab === 'info' && (
            <div className="flex-1 overflow-y-auto p-10">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
                {[
                  { label: 'Telefone', value: lead.phone },
                  { label: 'E-mail', value: lead.email },
                  { label: 'Cidade', value: lead.city },
                  { label: 'Categoria', value: lead.category },
                  { label: 'Fonte', value: lead.source },
                  { label: 'Score', value: `${lead.score}/10` },
                  { label: 'Etapa Atual', value: STAGES.find(s => s.id === lead.stage)?.label ?? '' },
                  { label: 'Último Contato', value: lead.lastContact },
                  { label: 'Próximo Contato', value: lead.nextContact ?? '—' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                    <p className="text-sm font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
                {lead.notes && (
                  <div className="col-span-2 lg:col-span-3 bg-yellow-50 rounded-2xl p-5">
                    <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block mb-2">Observações</span>
                    <p className="text-sm font-medium text-gray-700">{lead.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Disparos tab */}
          {tab === 'disparos' && (
            <div className="flex-1 overflow-y-auto p-10">
              <div className="max-w-2xl space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Disparos para este lead</p>
                <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
                  <Send size={32} className="mx-auto mb-3 text-gray-200" />
                  <p className="font-medium text-sm">Nenhum disparo individual registrado.</p>
                  <button className="mt-4 px-5 py-2.5 bg-[#125d30] text-white rounded-xl font-bold text-sm hover:bg-green-800 transition-colors">
                    Agendar Disparo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Novo Lead Wizard Modal ───────────────────────────────────────────────────

const EMPTY_FORM = { name: '', type: 'feirante' as LeadType, city: '', phone: '', email: '', category: '', source: 'Site', score: '7.0', notes: '', nextContact: '' };

function NovoLeadModal({ onClose, onSave }: { onClose: () => void; onSave: (l: Lead) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [firstAction, setFirstAction] = useState('');
  const [firstChannel, setFirstChannel] = useState<ActionChannel>('note');

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canNext1 = form.name.trim() && form.city.trim() && form.phone.trim();
  const canNext2 = form.category.trim();

  const handleSave = () => {
    const lead: Lead = {
      id: Math.random().toString(36).substring(7),
      name: form.name,
      type: form.type,
      stage: 'novo',
      city: form.city,
      phone: form.phone,
      email: form.email,
      category: form.category,
      source: form.source,
      score: parseFloat(form.score) || 7,
      lastContact: 'Agora',
      nextContact: form.nextContact || undefined,
      notes: form.notes,
      history: firstAction.trim()
        ? [{ id: Math.random().toString(36).substring(7), date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), action: firstAction, channel: firstChannel }]
        : [],
    };
    onSave(lead);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-[80vw] h-[80vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="flex-none px-10 pt-10 pb-6 border-b border-gray-100 relative">
          <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"><X size={22} /></button>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-6">Novo Lead de Expansão</h3>
          <div className="flex gap-4 mb-2">
            {[1, 2, 3].map(s => <div key={s} className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= s ? 'bg-[#125d30]' : 'bg-gray-100'}`} />)}
          </div>
          <div className="flex justify-between px-1">
            {['1. Identificação', '2. Contexto', '3. Primeiro Follow-up'].map((l, i) => (
              <span key={l} className={`text-xs font-black uppercase tracking-widest ${step >= i + 1 ? 'text-[#125d30]' : 'text-gray-400'}`}>{l}</span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#fbfaf5]/30">

          {step === 1 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-400">
              <div>
                <h4 className="text-2xl font-black text-gray-900 mb-1">Quem é este lead?</h4>
                <p className="text-gray-500 font-medium">Dados básicos de identificação e contato.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Tipo de Lead</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(TYPE_LABEL) as [LeadType, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => set('type', key)}
                      className={`p-4 rounded-[16px] border-2 text-center font-black text-sm transition-all ${form.type === key ? 'border-[#125d30] bg-green-50 text-[#125d30]' : 'border-gray-100 bg-white text-gray-500 hover:border-green-200'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { key: 'name', label: 'Nome / Empresa', ph: 'Ex: Sítio Vale Verde' },
                { key: 'city', label: 'Cidade / Estado', ph: 'Ex: Campinas/SP' },
                { key: 'phone', label: 'Telefone', ph: '(11) 99999-9999' },
                { key: 'email', label: 'E-mail', ph: 'contato@email.com' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{f.label}</label>
                  <input type="text" placeholder={f.ph} value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                    className="w-full bg-white rounded-[16px] px-5 py-4 border border-gray-100 focus:border-[#125d30]/50 outline-none font-bold text-base text-gray-900 shadow-sm" />
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-400">
              <div>
                <h4 className="text-2xl font-black text-gray-900 mb-1">Contexto do Lead</h4>
                <p className="text-gray-500 font-medium">Categoria, origem e pontuação inicial.</p>
              </div>
              {[
                { key: 'category', label: 'Categoria / Segmento', ph: 'Ex: Orgânicos, Alta Gastronomia...' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{f.label}</label>
                  <input type="text" placeholder={f.ph} value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                    className="w-full bg-white rounded-[16px] px-5 py-4 border border-gray-100 focus:border-[#125d30]/50 outline-none font-bold text-base text-gray-900 shadow-sm" />
                </div>
              ))}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Fonte de Captação</label>
                <div className="grid grid-cols-4 gap-3">
                  {['Site', 'Indicação', 'Cold Call', 'Feira Presencial'].map(s => (
                    <button key={s} onClick={() => set('source', s)}
                      className={`p-3 rounded-[14px] border-2 text-center font-bold text-xs transition-all ${form.source === s ? 'border-[#125d30] bg-green-50 text-[#125d30]' : 'border-gray-100 bg-white text-gray-500 hover:border-green-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Score Inicial (1–10)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="10" step="0.5" value={form.score} onChange={e => set('score', e.target.value)} className="flex-1 accent-[#125d30]" />
                  <span className="w-14 text-center font-black text-xl text-gray-900">{parseFloat(form.score).toFixed(1)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Observações Iniciais</label>
                <textarea placeholder="Informações relevantes sobre este lead..." value={form.notes} onChange={e => set('notes', e.target.value)}
                  rows={3} className="w-full bg-white rounded-[16px] px-5 py-4 border border-gray-100 focus:border-[#125d30]/50 outline-none font-medium text-sm text-gray-900 shadow-sm resize-none" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-400">
              <div>
                <h4 className="text-2xl font-black text-gray-900 mb-1">Primeiro Follow-up</h4>
                <p className="text-gray-500 font-medium">Registre a primeira interação e agende o próximo contato.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Canal do Primeiro Contato</label>
                <div className="flex flex-wrap gap-2">
                  {(['call', 'email', 'whatsapp', 'meeting', 'note'] as ActionChannel[]).map(c => {
                    const Ic = CHANNEL_ICON[c];
                    return (
                      <button key={c} onClick={() => setFirstChannel(c)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${firstChannel === c ? CHANNEL_COLOR[c] + ' ring-2 ring-current/20' : 'bg-white border border-gray-100 text-gray-500 hover:border-gray-300'}`}>
                        <Ic size={15} /> {c === 'call' ? 'Ligação' : c === 'email' ? 'E-mail' : c === 'whatsapp' ? 'WhatsApp' : c === 'meeting' ? 'Reunião' : 'Nota'}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">O que aconteceu neste contato?</label>
                <textarea placeholder="Ex: Primeiro contato feito por telefone. Demonstrou interesse no plano premium." value={firstAction} onChange={e => setFirstAction(e.target.value)}
                  rows={3} className="w-full bg-white rounded-[16px] px-5 py-4 border border-gray-100 focus:border-[#125d30]/50 outline-none font-medium text-sm text-gray-900 shadow-sm resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Data do Próximo Contato</label>
                <input type="date" value={form.nextContact} onChange={e => set('nextContact', e.target.value)}
                  className="w-full bg-white rounded-[16px] px-5 py-4 border border-gray-100 focus:border-[#125d30]/50 outline-none font-bold text-base text-gray-900 shadow-sm" />
              </div>
              {/* Preview */}
              <div className="bg-green-50 border border-green-200 rounded-[24px] p-6">
                <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-3">Resumo do Lead</p>
                <h5 className="font-black text-xl text-gray-900">{form.name}</h5>
                <p className="text-sm text-gray-500 mt-1">{TYPE_LABEL[form.type]} · {form.category} · {form.city}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs font-bold text-gray-500">Score: <span className="text-gray-900">{parseFloat(form.score).toFixed(1)}</span></span>
                  <span className="text-xs font-bold text-gray-500">Fonte: <span className="text-gray-900">{form.source}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none px-10 py-6 border-t border-gray-100 bg-white flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
              <ArrowLeft size={18} /> Voltar
            </button>
          ) : <div />}
          {step < 3 ? (
            <button disabled={step === 1 ? !canNext1 : !canNext2} onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm bg-[#1b1c19] text-white hover:bg-black transition-colors disabled:opacity-50">
              Próxima Etapa <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={handleSave}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm bg-[#125d30] text-white hover:bg-green-800 transition-colors shadow-lg shadow-green-900/20 min-w-[200px] justify-center">
              <UserPlus size={16} /> Adicionar Lead
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Novo Disparo Modal ───────────────────────────────────────────────────────

function NovoDisparoModal({ onClose }: { onClose: () => void }) {
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('whatsapp');
  const [segment, setSegment] = useState('feirante');
  const [message, setMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const SEGMENTS = [
    'Todos os Feirantes', 'Feirantes em Negociação', 'Feirantes — Novos Leads',
    'Restaurantes (B2B)', 'Franqueados Prospects', 'Delivery Partners',
  ];

  const TEMPLATES = {
    whatsapp: [
      { label: 'Promoção de Fechamento', text: 'Olá {{nome}}! Temos uma oferta especial hoje para fechar o plano Premium. Posso te contar mais detalhes? 🌿' },
      { label: 'Reengajamento', text: 'Olá {{nome}}, tudo bem? Notei que você se cadastrou há alguns dias mas ainda não finalizou seu perfil. Posso te ajudar? 😊' },
      { label: 'Boas-vindas', text: 'Olá {{nome}}, seja bem-vindo à Feira.Casa! 🎉 Estou disponível para qualquer dúvida sobre como começar a vender.' },
    ],
    email: [
      { label: 'Proposta Formal', text: 'Assunto: Proposta de parceria — Feira.Casa\n\nOlá {{nome}},\n\nSegue em anexo nossa proposta de parceria para integrar sua banca...' },
      { label: 'Newsletter Quinzenal', text: 'Assunto: Novidades Feira.Casa — {{mes}}\n\nOlá {{nome}},\n\nVeja o que aconteceu na plataforma nos últimos 15 dias...' },
    ],
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-[80vw] h-[80vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        <div className="flex-none px-10 py-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Novo Disparo</h3>
            <p className="text-gray-500 font-medium mt-1">Agende um envio em massa para o seu pipeline.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-3xl mx-auto grid grid-cols-5 gap-8">
            <div className="col-span-3 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Canal</label>
                <div className="flex gap-3">
                  <button onClick={() => setChannel('whatsapp')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[16px] border-2 font-black text-sm transition-all ${channel === 'whatsapp' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-500 hover:border-emerald-200'}`}>
                    <MessageSquare size={18} /> WhatsApp
                  </button>
                  <button onClick={() => setChannel('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[16px] border-2 font-black text-sm transition-all ${channel === 'email' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-500 hover:border-blue-200'}`}>
                    <Mail size={18} /> E-mail
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Segmento Alvo</label>
                <select value={segment} onChange={e => setSegment(e.target.value)}
                  className="w-full bg-white rounded-[16px] px-5 py-4 border border-gray-100 focus:border-[#125d30]/50 outline-none font-bold text-base text-gray-900 shadow-sm">
                  {SEGMENTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Mensagem</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Use {{nome}}, {{cidade}}, {{categoria}} para personalizar..."
                  rows={6} className="w-full bg-white rounded-[16px] px-5 py-4 border border-gray-100 focus:border-[#125d30]/50 outline-none font-medium text-sm text-gray-900 shadow-sm resize-none" />
                <p className="text-xs text-gray-400 font-medium">Variáveis: {'{{nome}}'} {'{{cidade}}'} {'{{categoria}}'}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Agendar para</label>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                  className="w-full bg-white rounded-[16px] px-5 py-4 border border-gray-100 focus:border-[#125d30]/50 outline-none font-bold text-base text-gray-900 shadow-sm" />
              </div>

              <button onClick={onClose}
                className="w-full py-4 bg-[#125d30] text-white rounded-2xl font-black text-sm hover:bg-green-800 transition-all flex items-center justify-center gap-2">
                <Send size={18} /> Agendar Disparo
              </button>
            </div>

            <div className="col-span-2 space-y-5">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Templates Rápidos</p>
              {TEMPLATES[channel].map((t, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-5 cursor-pointer hover:bg-green-50 hover:border-green-200 border border-gray-100 transition-all"
                  onClick={() => setMessage(t.text)}>
                  <p className="text-xs font-black text-gray-700 mb-2">{t.label}</p>
                  <p className="text-xs text-gray-500 font-medium line-clamp-3">{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'kanban',    label: 'Kanban',         icon: LayoutGrid   },
  { id: 'lista',     label: 'Lista',          icon: List         },
  { id: 'followups', label: 'Follow-ups',     icon: CalendarClock },
  { id: 'disparos',  label: 'Disparos',       icon: Send         },
];

export default function AdminCRMPage() {
  const [activeTab, setActiveTab] = useState<'kanban' | 'lista' | 'followups' | 'disparos'>('kanban');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [disparos, setDisparos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadCRM() {
      const { data: leadsData } = await supabase.from('mktplace_feira_crm_leads').select('*').order('created_at', { ascending: false });
      const { data: campsData } = await supabase.from('mktplace_feira_crm_campaigns').select('*').order('created_at', { ascending: false });
      
      if (leadsData) {
        setLeads(leadsData.map(l => ({
          id: l.id,
          name: l.name,
          type: l.type as LeadType,
          stage: l.status.toLowerCase() as LeadStage,
          city: l.metadata?.city || '—',
          phone: l.phone || '',
          email: l.email || '',
          category: l.metadata?.category || '—',
          source: l.metadata?.source || '—',
          score: l.metadata?.score || 5.0,
          lastContact: l.last_contact ? new Date(l.last_contact).toLocaleDateString('pt-BR') : '—',
          nextContact: l.metadata?.nextContact || '',
          notes: l.metadata?.notes || '',
          history: l.history || [],
        })));
      }
      
      if (campsData) {
        setDisparos(campsData.map(c => ({
          id: c.id,
          channel: c.audience?.includes('whatsapp') ? 'whatsapp' : 'email',
          target: c.audience || '',
          message: c.name || '', // simplified
          scheduledAt: c.scheduled_for ? new Date(c.scheduled_for).toLocaleDateString('pt-BR') : '—',
          status: c.status as any,
          count: c.sent || 0,
        })));
      }
      setLoading(false);
    }
    loadCRM();
  }, []);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [novoLeadOpen, setNovoLeadOpen] = useState(false);
  const [novoDisparoOpen, setNovoDisparoOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<LeadType | 'todos'>('todos');

  // ── Drag & Drop state ──────────────────────────────────────────────────────
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);
  const dragCounter = React.useRef<Record<string, number>>({});

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggingId(leadId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverStage(null);
    dragCounter.current = {};
  };

  const handleColumnDragEnter = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    dragCounter.current[stage] = (dragCounter.current[stage] || 0) + 1;
    setDragOverStage(stage);
  };

  const handleColumnDragLeave = (e: React.DragEvent, stage: LeadStage) => {
    dragCounter.current[stage] = (dragCounter.current[stage] || 0) - 1;
    if (dragCounter.current[stage] <= 0) {
      dragCounter.current[stage] = 0;
      setDragOverStage(prev => prev === stage ? null : prev);
    }
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;
    setLeads(prev => prev.map(l =>
      l.id === leadId
        ? { ...l, stage: targetStage, lastContact: 'Agora' }
        : l
    ));
    supabase.from('mktplace_feira_crm_leads').update({ status: targetStage }).eq('id', leadId);
    setDraggingId(null);
    setDragOverStage(null);
    dragCounter.current = {};
  };
  // ────────────────────────────────────────────────────────────────────────────

  const updateLead = async (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedLead(updated);
    await supabase.from('mktplace_feira_crm_leads').update({
      status: updated.stage,
      metadata: { city: updated.city, category: updated.category, source: updated.source, score: updated.score, nextContact: updated.nextContact, notes: updated.notes },
      history: updated.history
    }).eq('id', updated.id);
  };

  const addLead = async (l: Lead) => {
    // Optimistic UI update
    setLeads(prev => [l, ...prev]);
    setNovoLeadOpen(false);

    // Save to database
    try {
      await supabase.from('mktplace_feira_crm_leads').insert([{
        id: l.id,
        name: l.name,
        type: l.type,
        status: l.stage,
        phone: l.phone,
        email: l.email,
        history: l.history,
        metadata: {
          city: l.city,
          category: l.category,
          source: l.source,
          score: l.score,
          nextContact: l.nextContact,
          notes: l.notes
        }
      }]);
    } catch (err) {
      console.error('Erro ao salvar lead no banco:', err);
    }
  };

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.city.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'todos' || l.type === typeFilter;
    return matchSearch && matchType;
  });

  const followupLeads = leads
    .filter(l => l.nextContact)
    .sort((a, b) => (a.nextContact ?? '').localeCompare(b.nextContact ?? ''));

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">CRM & Pipeline</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie leads de feirantes, B2B, franqueados e delivery em tempo real.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setNovoDisparoOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-[20px] font-bold text-sm hover:border-[#125d30] hover:text-[#125d30] transition-all">
            <Send size={16} /> Novo Disparo
          </button>
          <button onClick={() => setNovoLeadOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#125d30] text-white rounded-[20px] font-bold text-sm hover:bg-green-800 transition-all shadow-lg shadow-green-900/10 active:scale-95">
            <Plus size={18} /> Novo Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Leads Ativos', value: String(leads.filter(l => l.stage !== 'convertido').length), icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Convertidos', value: String(leads.filter(l => l.stage === 'convertido').length), icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Follow-ups Hoje', value: String(followupLeads.length), icon: AlarmClock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Disparos Agendados', value: String(disparos.filter(d => d.status === 'agendado').length), icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} ${s.color} shrink-0`}><s.icon size={20} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-2xl font-black text-gray-900 leading-none mt-0.5">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === t.id ? 'bg-white text-[#125d30] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* Search + Filter (list/kanban) */}
        {(activeTab === 'kanban' || activeTab === 'lista') && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-[#125d30]/50 transition-all w-52" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
              className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none text-gray-600 focus:border-[#125d30]/50">
              <option value="todos">Todos os tipos</option>
              {(Object.entries(TYPE_LABEL) as [LeadType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── KANBAN TAB ── */}
      {activeTab === 'kanban' && (
        <div className="overflow-x-auto pb-4 -mx-2 px-2">
          <div className="flex gap-4 min-w-max">
            {STAGES.map(stage => {
              const stageLeads = filtered.filter(l => l.stage === stage.id);
              const isOver = dragOverStage === stage.id;
              return (
                <div key={stage.id} className="w-[260px] shrink-0"
                  onDragEnter={e => handleColumnDragEnter(e, stage.id as LeadStage)}
                  onDragLeave={e => handleColumnDragLeave(e, stage.id as LeadStage)}
                  onDragOver={handleColumnDragOver}
                  onDrop={e => handleDrop(e, stage.id as LeadStage)}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`} />
                      <span className="text-xs font-black text-gray-700">{stage.label}</span>
                    </div>
                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                  </div>

                  <div className={`space-y-3 min-h-[60px] rounded-[24px] transition-colors duration-150 ${isOver ? 'bg-green-50 ring-2 ring-[#125d30]/30' : ''}`}
                    style={{ padding: isOver ? '8px' : undefined }}>
                    {stageLeads.map(lead => {
                      const isDragging = draggingId === lead.id;
                      return (
                        <div key={lead.id}
                          draggable
                          onDragStart={e => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => { if (!isDragging) setSelectedLead(lead); }}
                          className={`bg-white rounded-[20px] border p-4 transition-all group select-none
                            ${isDragging ? 'opacity-40 scale-95 border-[#125d30]/30 shadow-none cursor-grabbing' : 'border-gray-100 cursor-grab hover:shadow-lg hover:border-gray-200 active:cursor-grabbing'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <TypeBadge type={lead.type} />
                            <ScoreBadge score={lead.score} />
                          </div>
                          <h4 className="font-black text-gray-900 text-sm leading-snug mb-1">{lead.name}</h4>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mb-3">
                            <MapPin size={10} /> {lead.city}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                              <Clock size={10} /> {lead.lastContact}
                            </span>
                            {lead.nextContact && (
                              <span className="flex items-center gap-1 text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                <BellRing size={9} /> {lead.nextContact}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-black hover:bg-green-100 transition-colors">
                              <Phone size={11} /> Ligar
                            </a>
                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition-colors">
                              <MessageSquare size={11} /> Zap
                            </a>
                          </div>
                        </div>
                      );
                    })}
                    {stageLeads.length === 0 && (
                      <div className={`border-2 border-dashed rounded-[20px] p-6 text-center transition-colors ${isOver ? 'border-[#125d30]/40 bg-green-50/50 text-[#125d30]' : 'border-gray-100 text-gray-300'}`}>
                        <p className="text-xs font-bold">{isOver ? 'Soltar aqui' : 'Vazio'}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LISTA TAB ── */}
      {activeTab === 'lista' && (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Nome / Tipo', 'Cidade', 'Categoria', 'Fonte', 'Etapa', 'Score', 'Próximo Contato', 'Ações'].map(h => (
                    <th key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-6 py-4 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr key={lead.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-gray-900">{lead.name}</p>
                      <TypeBadge type={lead.type} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{lead.city}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{lead.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{lead.source}</td>
                    <td className="px-6 py-4"><StageBadge stage={lead.stage} /></td>
                    <td className="px-6 py-4"><ScoreBadge score={lead.score} /></td>
                    <td className="px-6 py-4">
                      {lead.nextContact
                        ? <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600"><AlarmClock size={12} />{lead.nextContact}</span>
                        : <span className="text-xs text-gray-300 font-medium">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a href={`tel:${lead.phone}`} className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all" title="Ligar"><Phone size={14} /></a>
                        <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all" title="WhatsApp"><MessageSquare size={14} /></a>
                        <a href={`mailto:${lead.email}`} className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all" title="E-mail"><Mail size={14} /></a>
                        <button onClick={() => setSelectedLead(lead)} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all" title="Detalhes / Follow-up"><ChevronRight size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="p-12 text-center text-gray-400 font-medium">Nenhum lead encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FOLLOW-UPS TAB ── */}
      {activeTab === 'followups' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {followupLeads.length === 0 ? (
            <div className="col-span-2 bg-white rounded-[32px] border border-gray-100 p-16 text-center text-gray-400">
              <CalendarClock size={48} className="mx-auto mb-4 text-gray-200" />
              <h3 className="font-black text-xl text-gray-700">Nenhum follow-up agendado.</h3>
              <p className="text-sm font-medium mt-2">Registre interações nos leads para agendar próximos contatos.</p>
            </div>
          ) : followupLeads.map(lead => (
            <div key={lead.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 flex items-center gap-5 hover:border-orange-200 transition-all group cursor-pointer"
              onClick={() => setSelectedLead(lead)}>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-lg shrink-0">
                {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-black text-gray-900 truncate">{lead.name}</h4>
                  <TypeBadge type={lead.type} />
                </div>
                <p className="text-xs font-medium text-gray-400 flex items-center gap-1"><MapPin size={11} />{lead.city}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                    <BellRing size={11} /> Contato em {lead.nextContact}
                  </span>
                  <StageBadge stage={lead.stage} />
                </div>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all"><Phone size={16} /></a>
                <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"><MessageSquare size={16} /></a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DISPAROS TAB ── */}
      {activeTab === 'disparos' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setNovoDisparoOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#125d30] text-white rounded-[18px] font-bold text-sm hover:bg-green-800 transition-all shadow-sm">
              <Plus size={16} /> Novo Disparo
            </button>
          </div>
          {disparos.map(d => (
            <div key={d.id} className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6 flex items-start gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${d.channel === 'whatsapp' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                {d.channel === 'whatsapp' ? <MessageSquare size={20} /> : <Mail size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-black text-gray-900 text-sm">{d.channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'} → {d.target}</p>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    d.status === 'agendado' ? 'bg-blue-100 text-blue-700' :
                    d.status === 'enviado' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-600'
                  }`}>{d.status}</span>
                </div>
                <p className="text-xs font-medium text-gray-500 line-clamp-2 mb-2">{d.message}</p>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                  <span className="flex items-center gap-1"><AlarmClock size={11} /> {d.scheduledAt}</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {d.count} destinatários</span>
                </div>
              </div>
              {d.status === 'agendado' && (
                <div className="flex gap-2 shrink-0">
                  <button className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"><MoreHorizontal size={16} /></button>
                  <button className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={updateLead} />}
      {novoLeadOpen && <NovoLeadModal onClose={() => setNovoLeadOpen(false)} onSave={addLead} />}
      {novoDisparoOpen && <NovoDisparoModal onClose={() => setNovoDisparoOpen(false)} />}
    </div>
  );
}
