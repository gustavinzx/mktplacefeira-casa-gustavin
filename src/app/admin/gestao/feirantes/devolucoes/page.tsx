'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight, AlertCircle, CheckCircle2, Clock, ArrowRight,
  MessageSquare, ShieldAlert, Package, User, Search, Store,
  Plus, X, Loader2, Save, Send, RefreshCw, History,
  Trash2, ChevronDown, UserCheck, Shield,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type AuthorType = 'cliente' | 'feirante' | 'admin' | 'franqueado';

type Message = {
  author_name: string;
  author_type: AuthorType;
  text: string;
  created_at: string;
};

type Devolucao = {
  id: string;
  order_number: string;
  customer_name: string;
  vendor_name: string;
  reason: string;
  description: string | null;
  severity: 'Alta' | 'Media' | 'Baixa';
  status: 'pendente' | 'em_analise' | 'aprovado' | 'resolvido' | 'rejeitado';
  refund_amount: number | null;
  resolution_notes: string | null;
  messages: Message[];
  assigned_to_name: string | null;
  customer_user_id: string | null;
  vendor_user_id: string | null;
  created_at: string;
  updated_at: string;
};

type NewForm = {
  order_number: string;
  customer_name: string;
  vendor_name: string;
  reason: string;
  description: string;
  severity: 'Alta' | 'Media' | 'Baixa';
};

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em Análise', aprovado: 'Aprovado',
  resolvido: 'Resolvido', rejeitado: 'Rejeitado',
};
const STATUS_STYLE: Record<string, string> = {
  pendente: 'bg-orange-50 text-orange-600', em_analise: 'bg-blue-50 text-blue-600',
  aprovado: 'bg-green-50 text-green-700', resolvido: 'bg-emerald-50 text-emerald-700',
  rejeitado: 'bg-red-50 text-red-600',
};
const SEV_STYLE: Record<string, string> = {
  Alta: 'bg-red-50 text-red-600', Media: 'bg-yellow-50 text-yellow-600', Baixa: 'bg-gray-50 text-gray-400',
};

// Chat bubble styles per author
const BUBBLE: Record<AuthorType, { wrap: string; bubble: string; badge: string }> = {
  cliente:    { wrap: 'justify-start', bubble: 'bg-gray-100 text-gray-900',           badge: 'bg-gray-200 text-gray-600' },
  feirante:   { wrap: 'justify-start', bubble: 'bg-orange-50 text-orange-900 border border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  admin:      { wrap: 'justify-end',   bubble: 'bg-[#125d30] text-white',             badge: 'bg-green-800 text-green-100' },
  franqueado: { wrap: 'justify-end',   bubble: 'bg-purple-600 text-white',            badge: 'bg-purple-700 text-purple-100' },
};

const AUTHOR_ICON: Record<AuthorType, React.ReactNode> = {
  cliente:    <User size={10} />,
  feirante:   <Store size={10} />,
  admin:      <Shield size={10} />,
  franqueado: <UserCheck size={10} />,
};

const REASONS = [
  'Produto Avariado', 'Item Faltante', 'Divergência de Peso', 'Embalagem Aberta',
  'Produto Vencido', 'Produto Errado', 'Qualidade Insatisfatória', 'Outro',
];

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtCurrency(v: number | null) {
  if (!v) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

// ── Chat thread component ─────────────────────────────────────────────────────

function ChatThread({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!messages?.length) return (
    <div className="flex items-center justify-center py-16 text-gray-300">
      <div className="text-center">
        <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-bold">Nenhuma mensagem ainda</p>
        <p className="text-xs mt-1 font-medium">O chat reúne cliente, feirante, admin e franqueado.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {messages.map((msg, i) => {
        const s = BUBBLE[msg.author_type] ?? BUBBLE.admin;
        return (
          <div key={i} className={`flex ${s.wrap}`}>
            <div className="max-w-[70%]">
              <div className={`flex items-center gap-1.5 mb-1.5 ${msg.author_type === 'admin' || msg.author_type === 'franqueado' ? 'justify-end' : 'justify-start'}`}>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${s.badge}`}>
                  {AUTHOR_ICON[msg.author_type]} {msg.author_name}
                </span>
              </div>
              <div className={`px-5 py-3.5 rounded-2xl ${s.bubble}`}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-2 font-medium opacity-50`}>{fmtDate(msg.created_at)}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

// ── Ticket Detail Modal ───────────────────────────────────────────────────────

function TicketModal({ ticket, onClose, onUpdate }: {
  ticket: Devolucao; onClose: () => void; onUpdate: () => Promise<void>;
}) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'info' | 'resolution' | 'messages'>('info');
  const [status, setStatus] = useState(ticket.status);
  const [severity, setSeverity] = useState(ticket.severity);
  const [refundAmount, setRefundAmount] = useState(String(ticket.refund_amount ?? ''));
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolution_notes ?? '');
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to_name ?? '');
  const [newMsg, setNewMsg] = useState('');
  const [sendAs, setSendAs] = useState<'admin' | 'franqueado'>('admin');
  const [saving, setSaving] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>(ticket.messages ?? []);

  const handleSaveResolution = async () => {
    setSaving(true);
    try {
      await supabase.from('mktplace_feira_devolucoes').update({
        status, severity,
        refund_amount: refundAmount ? Number(refundAmount) : null,
        resolution_notes: resolutionNotes || null,
        assigned_to_name: assignedTo || null,
        updated_at: new Date().toISOString(),
      }).eq('id', ticket.id);
      await onUpdate();
    } catch (e: any) { showToast('Erro: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleSendMessage = async () => {
    if (!newMsg.trim()) return;
    setSendingMsg(true);
    try {
      const msg: Message = {
        author_name: sendAs === 'admin' ? 'Admin' : 'Franqueado',
        author_type: sendAs,
        text: newMsg.trim(),
        created_at: new Date().toISOString(),
      };
      const updated = [...localMessages, msg];
      await supabase.from('mktplace_feira_devolucoes').update({
        messages: updated, updated_at: new Date().toISOString(),
      }).eq('id', ticket.id);
      setLocalMessages(updated);
      setNewMsg('');
      await onUpdate();
    } catch (e: any) { showToast('Erro: ' + e.message, 'error'); }
    finally { setSendingMsg(false); }
  };

  const participantes = [
    { label: 'Cliente', name: ticket.customer_name, type: 'cliente' as AuthorType, icon: User },
    { label: 'Feirante', name: ticket.vendor_name, type: 'feirante' as AuthorType, icon: Store },
    { label: 'Responsável', name: ticket.assigned_to_name || 'Não atribuído', type: 'admin' as AuthorType, icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden" style={{ width: '80vw', height: '80vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-gray-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg font-black text-gray-900">Pedido {ticket.order_number}</span>
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLE[ticket.status]}`}>{STATUS_LABEL[ticket.status]}</span>
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${SEV_STYLE[ticket.severity]}`}>
                  Prioridade {ticket.severity === 'Media' ? 'Média' : ticket.severity}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Aberto em {fmtDate(ticket.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all"><X size={20} /></button>
        </div>

        {/* Participantes strip */}
        <div className="flex items-center gap-6 px-8 py-3 bg-gray-50/60 border-b border-gray-100 shrink-0">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Participantes:</span>
          {participantes.map(p => (
            <div key={p.label} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${BUBBLE[p.type].badge}`}>
                <p.icon size={10} />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.label}: </span>
                <span className="text-xs font-bold text-gray-700">{p.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-8 border-b border-gray-100 shrink-0">
          {[
            { id: 'info', label: 'Informações', icon: Package },
            { id: 'resolution', label: 'Resolução', icon: CheckCircle2 },
            { id: 'messages', label: `Chat (${localMessages.length})`, icon: MessageSquare },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 py-4 text-sm font-black transition-all relative ${tab === t.id ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'}`}>
              <t.icon size={16} /> {t.label}
              {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700 rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* ── Info ── */}
          {tab === 'info' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
                {[
                  { label: 'Cliente (B2C)', value: ticket.customer_name, icon: User },
                  { label: 'Feirante', value: ticket.vendor_name, icon: Store },
                  { label: 'Motivo da Devolução', value: ticket.reason, icon: AlertCircle },
                  { label: 'Nº do Pedido', value: ticket.order_number, icon: Package },
                ].map(f => (
                  <div key={f.label} className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <f.icon size={11} /> {f.label}
                    </p>
                    <p className="text-sm font-black text-gray-900">{f.value}</p>
                  </div>
                ))}
                {ticket.description && (
                  <div className="md:col-span-2 bg-amber-50 border border-amber-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Descrição do Problema (cliente)</p>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{ticket.description}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aberto em</p>
                  <p className="text-sm font-black text-gray-900">{fmtDate(ticket.created_at)}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Última Atualização</p>
                  <p className="text-sm font-black text-gray-900">{fmtDate(ticket.updated_at)}</p>
                </div>
                {ticket.refund_amount && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Valor do Estorno</p>
                    <p className="text-lg font-black text-green-700">{fmtCurrency(ticket.refund_amount)}</p>
                  </div>
                )}
                {ticket.resolution_notes && (
                  <div className={`${ticket.refund_amount ? '' : 'md:col-span-2'} bg-blue-50 border border-blue-100 rounded-2xl p-5`}>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Notas de Resolução</p>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{ticket.resolution_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Resolution ── */}
          {tab === 'resolution' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-2xl space-y-6">
                {/* Atribuição */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Atribuído a</label>
                  <input type="text" placeholder="Ex: Admin Central / Franqueado SP"
                    value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20" />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Status do Ticket</label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(STATUS_LABEL).map(([key, label]) => (
                      <button key={key} type="button" onClick={() => setStatus(key as any)}
                        className={`py-3 rounded-2xl text-sm font-black transition-all border-2 ${status === key ? 'border-[#125d30] bg-green-50 text-[#125d30]' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-green-200'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prioridade */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Prioridade</label>
                  <div className="flex gap-3">
                    {(['Alta', 'Media', 'Baixa'] as const).map(s => (
                      <button key={s} type="button" onClick={() => setSeverity(s)}
                        className={`flex-1 py-3 rounded-2xl text-sm font-black transition-all border-2 ${severity === s ? 'border-[#125d30] bg-green-50 text-[#125d30]' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-green-200'}`}>
                        {s === 'Media' ? 'Média' : s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estorno */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valor do Estorno (R$)</label>
                  <input type="number" min="0" step="0.01" placeholder="0,00"
                    value={refundAmount} onChange={e => setRefundAmount(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20" />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Notas de Resolução</label>
                  <textarea rows={5} placeholder="Descreva como o caso foi ou será resolvido..."
                    value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 resize-none" />
                </div>

                <button onClick={handleSaveResolution} disabled={saving}
                  className="w-full py-4 bg-[#125d30] text-white rounded-2xl font-black hover:bg-[#0e4d27] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Salvando...' : 'Salvar Resolução'}
                </button>
              </div>
            </div>
          )}

          {/* ── Chat ── */}
          {tab === 'messages' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Legend */}
              <div className="flex items-center gap-4 px-8 py-2.5 bg-gray-50/50 border-b border-gray-100 shrink-0">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Legenda:</span>
                {(['cliente', 'feirante', 'admin', 'franqueado'] as AuthorType[]).map(t => (
                  <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${BUBBLE[t].badge}`}>
                    {AUTHOR_ICON[t]} {t}
                  </span>
                ))}
              </div>

              {/* Thread */}
              <div className="flex-1 overflow-y-auto p-6">
                <ChatThread messages={localMessages} />
              </div>

              {/* Send bar */}
              <div className="shrink-0 px-6 pb-6 pt-3 border-t border-gray-100">
                {/* Author selector */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responder como:</span>
                  {(['admin', 'franqueado'] as const).map(role => (
                    <button key={role} type="button" onClick={() => setSendAs(role)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sendAs === role
                        ? role === 'admin' ? 'bg-[#125d30] text-white' : 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {role === 'admin' ? <Shield size={12} /> : <UserCheck size={12} />}
                      {role === 'admin' ? 'Admin' : 'Franqueado'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input type="text"
                    placeholder={`Mensagem como ${sendAs === 'admin' ? 'Admin' : 'Franqueado'}...`}
                    value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="flex-1 px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20" />
                  <button onClick={handleSendMessage} disabled={sendingMsg || !newMsg.trim()}
                    className={`px-6 py-3.5 text-white rounded-2xl font-black transition-colors flex items-center gap-2 disabled:opacity-60 ${sendAs === 'admin' ? 'bg-[#125d30] hover:bg-[#0e4d27]' : 'bg-purple-600 hover:bg-purple-700'}`}>
                    {sendingMsg ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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

// ── New Ticket Modal ──────────────────────────────────────────────────────────

function NewTicketModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const { showToast } = useToast();
  const [form, setForm] = useState<NewForm>({
    order_number: '', customer_name: '', vendor_name: '',
    reason: REASONS[0], description: '', severity: 'Media',
  });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof NewForm, v: any) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.order_number.trim() && form.customer_name.trim() && form.vendor_name.trim();

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await supabase.from('mktplace_feira_devolucoes').insert({
        order_number: form.order_number.trim(),
        customer_name: form.customer_name.trim(),
        vendor_name: form.vendor_name.trim(),
        reason: form.reason,
        description: form.description.trim() || null,
        severity: form.severity,
        status: 'pendente',
        messages: [],
      });
      onSave();
    } catch (e: any) { showToast('Erro: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden" style={{ width: '80vw', height: '80vh' }}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900">Registrar Devolução Manualmente</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">Normalmente tickets chegam do portal B2C. Use este form para registros manuais.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                O feirante vinculado receberá uma cópia informativa e poderá participar do chat de resolução através do portal dele.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nº do Pedido</label>
                <input type="text" placeholder="Ex: #7482" value={form.order_number}
                  onChange={e => set('order_number', e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Prioridade</label>
                <div className="flex gap-2">
                  {(['Alta', 'Media', 'Baixa'] as const).map(s => (
                    <button key={s} type="button" onClick={() => set('severity', s)}
                      className={`flex-1 py-3.5 rounded-2xl text-xs font-black transition-all border-2 ${form.severity === s ? 'border-[#125d30] bg-green-50 text-[#125d30]' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-green-200'}`}>
                      {s === 'Media' ? 'Média' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Cliente (B2C)</label>
                <input type="text" placeholder="Ex: João Silva" value={form.customer_name}
                  onChange={e => set('customer_name', e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Feirante</label>
                <input type="text" placeholder="Ex: Sítio Sol Nascente" value={form.vendor_name}
                  onChange={e => set('vendor_name', e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Motivo da Devolução</label>
              <select value={form.reason} onChange={e => set('reason', e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20">
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição detalhada (opcional)</label>
              <textarea rows={4} placeholder="Descreva o problema em detalhes..."
                value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 resize-none" />
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preview do Ticket</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-black text-gray-900">{form.order_number || '#—'}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${SEV_STYLE[form.severity]}`}>Prioridade {form.severity === 'Media' ? 'Média' : form.severity}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-orange-50 text-orange-600">Pendente</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-3">
                <span className="flex items-center gap-1"><User size={10} /> {form.customer_name || 'Cliente'}</span>
                <span className="flex items-center gap-1"><Store size={10} /> {form.vendor_name || 'Feirante'}</span>
                <span className="flex items-center gap-1"><AlertCircle size={10} /> {form.reason}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 px-8 pb-8 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !valid}
            className="flex-1 py-4 bg-[#125d30] text-white rounded-xl font-black hover:bg-[#0e4d27] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Registrando...' : 'Registrar Devolução'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminFeiranteDevolucoesPage() {
  const { showToast } = useToast();
  const [devolucoes, setDevolucoes] = useState<Devolucao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [severityFilter, setSeverityFilter] = useState('todos');
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Devolucao | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const fetchDevolucoes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mktplace_feira_devolucoes')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setDevolucoes(data as Devolucao[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDevolucoes(); }, [fetchDevolucoes]);

  const handleDelete = async (id: string) => {
    await supabase.from('mktplace_feira_devolucoes').delete().eq('id', id);
    fetchDevolucoes();
    showToast('Ticket excluído com sucesso.', 'success');
  };

  const pendentes = devolucoes.filter(d => d.status === 'pendente').length;
  const emAnalise = devolucoes.filter(d => d.status === 'em_analise').length;
  const today = new Date().toDateString();
  const resolvidosHoje = devolucoes.filter(d => d.status === 'resolvido' && new Date(d.updated_at).toDateString() === today).length;

  const activeStatuses = ['pendente', 'em_analise', 'aprovado'];
  const base = showHistorico ? devolucoes : devolucoes.filter(d => activeStatuses.includes(d.status));
  const filtered = base.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.order_number.toLowerCase().includes(q) || d.customer_name.toLowerCase().includes(q) || d.vendor_name.toLowerCase().includes(q) || d.reason.toLowerCase().includes(q);
    return matchSearch && (statusFilter === 'todos' || d.status === statusFilter) && (severityFilter === 'todos' || d.severity === severityFilter);
  });

  const openTicket = (ticket: Devolucao) => setSelectedTicket(ticket);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/gestao/feirantes" className="hover:text-green-700 transition-colors">Gestão de Feirantes</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Devoluções & Reclamações</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Devoluções</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Tickets abertos por clientes B2C · Feirante participa do chat · Admin/Franqueado resolve
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchDevolucoes} className="p-4 bg-white border border-gray-200 rounded-[20px] text-gray-400 hover:text-green-700 hover:border-green-700 transition-all shadow-sm">
            <RefreshCw size={18} />
          </button>
          <button onClick={() => setShowHistorico(h => !h)}
            className={`px-6 py-4 rounded-[24px] font-bold border transition-all flex items-center gap-2 ${showHistorico ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}>
            <History size={18} />
            {showHistorico ? 'Ocultar Histórico' : 'Ver Histórico'}
          </button>
          <button onClick={() => setIsNewModalOpen(true)}
            className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2">
            <Plus size={20} /> Nova Devolução
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Pendentes', value: loading ? '—' : String(pendentes).padStart(2, '0'), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', onClick: () => setStatusFilter('pendente') },
          { label: 'Em Análise', value: loading ? '—' : String(emAnalise).padStart(2, '0'), icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', onClick: () => setStatusFilter('em_analise') },
          { label: 'Resolvidos (Hoje)', value: loading ? '—' : String(resolvidosHoje).padStart(2, '0'), icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50', onClick: () => { setShowHistorico(true); setStatusFilter('resolvido'); } },
          { label: 'Taxa de Estorno', value: '0.8%', icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-50', onClick: undefined },
        ].map((stat, i) => (
          <div key={i} onClick={stat.onClick}
            className={`bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4 ${stat.onClick ? 'cursor-pointer hover:shadow-md hover:border-green-200 transition-all' : ''}`}>
            <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl w-fit`}><stat.icon size={24} /></div>
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Flow info */}
      <div className="bg-gray-50 rounded-[28px] p-6 flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
        <div className="flex items-center gap-2"><User size={16} className="text-gray-400" /><span className="font-black text-gray-700">Cliente B2C</span> abre ticket</div>
        <ArrowRight size={16} className="text-gray-300" />
        <div className="flex items-center gap-2"><Store size={16} className="text-orange-400" /><span className="font-black text-orange-600">Feirante</span> recebe cópia + participa do chat</div>
        <ArrowRight size={16} className="text-gray-300" />
        <div className="flex items-center gap-2"><Shield size={16} className="text-green-600" /><span className="font-black text-green-700">Admin</span> / <UserCheck size={16} className="text-purple-600" /><span className="font-black text-purple-700">Franqueado</span> resolve</div>
      </div>

      {/* Filters + List */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-black text-gray-900">
            {showHistorico ? 'Todos os Tickets' : 'Tickets Ativos'}
            <span className="ml-3 text-sm font-bold text-gray-400">({filtered.length})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar pedido, cliente, feirante..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl outline-none text-sm font-medium shadow-sm focus:border-green-600/30 w-56 transition-all" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['todos', 'pendente', 'em_analise', 'aprovado', 'resolvido', 'rejeitado'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-[#125d30] text-white' : 'bg-white border border-gray-100 text-gray-500 hover:border-green-300'}`}>
                  {s === 'todos' ? 'Todos' : STATUS_LABEL[s]}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {['todos', 'Alta', 'Media', 'Baixa'].map(s => (
                <button key={s} onClick={() => setSeverityFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${severityFilter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100 text-gray-500 hover:border-gray-400'}`}>
                  {s === 'todos' ? 'Prioridade' : s === 'Media' ? 'Média' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 size={24} className="animate-spin" />
            <span className="font-bold text-sm">Carregando tickets...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-gray-100 p-16 text-center">
            <Package size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-bold text-gray-400">
              {devolucoes.length === 0 ? 'Nenhuma devolução registrada ainda.' : 'Nenhum ticket encontrado para este filtro.'}
            </p>
            {(statusFilter !== 'todos' || severityFilter !== 'todos' || search) && (
              <button onClick={() => { setStatusFilter('todos'); setSeverityFilter('todos'); setSearch(''); }}
                className="mt-3 text-xs text-[#125d30] font-black hover:underline">Limpar filtros</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(ticket => (
              <div key={ticket.id}
                className="bg-white p-7 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0">
                    <Package size={22} />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-black text-gray-900">Pedido {ticket.order_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${SEV_STYLE[ticket.severity]}`}>
                        {ticket.severity === 'Media' ? 'Média' : ticket.severity}
                      </span>
                      {ticket.messages?.length > 0 && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">
                          <MessageSquare size={9} /> {ticket.messages.length} msg
                        </span>
                      )}
                      {ticket.assigned_to_name && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-widest">
                          <Shield size={9} /> {ticket.assigned_to_name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <p className="text-xs font-bold text-gray-500 flex items-center gap-1"><User size={10} /> {ticket.customer_name}</p>
                      <p className="text-xs font-bold text-orange-500 flex items-center gap-1"><Store size={10} /> {ticket.vendor_name}</p>
                      <p className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={10} /> {ticket.reason}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Abertura</p>
                    <p className="text-xs font-black text-gray-700">{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${STATUS_STYLE[ticket.status]}`}>
                      {STATUS_LABEL[ticket.status]}
                    </span>
                  </div>
                  {ticket.refund_amount ? (
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estorno</p>
                      <p className="text-xs font-black text-green-700">{fmtCurrency(ticket.refund_amount)}</p>
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <button onClick={() => openTicket(ticket)} title="Chat"
                      className="p-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-2xl text-gray-400 transition-all">
                      <MessageSquare size={18} />
                    </button>
                    <button onClick={() => openTicket(ticket)} title="Detalhes"
                      className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all">
                      <ArrowRight size={18} />
                    </button>
                    <button onClick={() => handleDelete(ticket.id)} title="Excluir"
                      className="p-3 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTicket && (
        <TicketModal
          ticket={devolucoes.find(d => d.id === selectedTicket.id) ?? selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={fetchDevolucoes}
        />
      )}
      {isNewModalOpen && (
        <NewTicketModal
          onClose={() => setIsNewModalOpen(false)}
          onSave={() => { setIsNewModalOpen(false); fetchDevolucoes(); }}
        />
      )}
    </div>
  );
}
