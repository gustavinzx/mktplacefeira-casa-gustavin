'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import {
  X, MapPin, Building2, Truck, Handshake, Hash, AlertCircle,
  Webhook, KeyRound, Link2, CheckCircle2, XCircle, Loader2,
  Zap, Package, Car, Globe, ShieldCheck, RefreshCcw, Info,
} from 'lucide-react';
import { syncDeliveryZone, type DeliveryZone } from '@/lib/database';

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

const TIPOS_FRETE = [
  { value: 'distancia', label: 'Por Distância', desc: 'Calculado por faixas de km' },
  { value: 'fixo',      label: 'Fixo',          desc: 'Taxa única para toda a cidade' },
  { value: 'retirada',  label: 'Retirada',       desc: 'Cliente retira na feira' },
  { value: 'consulta',  label: 'Sob Consulta',   desc: 'Valor definido após o pedido' },
];

const PARCEIROS: {
  value: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  badge?: string;
}[] = [
  { value: 'pickn',   label: 'PicknGo',          desc: 'API de entregas sob demanda integrada ao motor de rotas.', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', badge: 'API Direta' },
  { value: 'loggi',   label: 'Loggi Express',     desc: 'Logística express para e-commerce. Rastreio em tempo real.', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'uber',    label: 'Uber Direct',        desc: 'Entregas via rede Uber Connect. Alta disponibilidade.', icon: Car, color: 'text-gray-900', bg: 'bg-gray-100' },
  { value: 'ifood',   label: 'iFood Delivery',     desc: 'Parceria com entregadores da rede iFood.', icon: Globe, color: 'text-red-600', bg: 'bg-red-50' },
  { value: 'propria', label: 'API Própria (n8n)',  desc: 'Dispara um webhook n8n a cada novo pedido para despacho customizado.', icon: Webhook, color: 'text-purple-600', bg: 'bg-purple-50', badge: 'Webhook n8n' },
];

interface Props {
  onClose: () => void;
  onCreated?: (zone: DeliveryZone) => void;
  initialData?: DeliveryZone;
}

export function NovaZonaModal({ onClose, onCreated, initialData }: Props) {
  const [mounted, setMounted] = React.useState(false);
  const [form, setForm] = React.useState({
    cidade: initialData?.cidade || '',
    cep:    initialData?.cep    || '',
    estado: initialData?.estado || '',
    tiposFrete: (initialData?.tipos_frete || []) as string[],
    parceiro:   initialData?.parceiro || '',
  });

  // n8n webhook config (only used when parceiro === 'propria')
  const [webhook, setWebhook] = React.useState({
    url:         '',
    authType:    'none' as 'none' | 'basic' | 'header' | 'bearer',
    username:    '',   // Basic Auth: username
    secret:      '',   // Basic Auth: password / Bearer: token / Header: value
    headerName:  'x-api-key',  // custom header name
  });
  const [webhookStatus, setWebhookStatus] = React.useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const [saving, setSaving] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    // Restore saved webhook config if editing an existing zone with API própria
    if (initialData?.cidade && initialData?.parceiro === 'propria') {
      try {
        const configs = JSON.parse(localStorage.getItem('fc_webhook_configs') || '{}');
        const saved = configs[initialData.cidade];
        if (saved) setWebhook(saved);
      } catch {}
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => { setMounted(false); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  if (!mounted) return null;

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }));

  const formatCep = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  async function handleCepChange(raw: string) {
    const formatted = formatCep(raw);
    setForm(p => ({ ...p, cep: formatted }));
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(p => ({
            ...p,
            cidade: p.cidade || data.localidade,
            estado: p.estado || data.uf,
          }));
        }
      } catch {}
    }
  }

  const toggleFrete = (v: string) =>
    setForm(p => ({
      ...p,
      tiposFrete: p.tiposFrete.includes(v)
        ? p.tiposFrete.filter(x => x !== v)
        : [...p.tiposFrete, v],
    }));

  const buildAuthHeaders = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (webhook.authType === 'basic' && webhook.username) {
      const encoded = btoa(`${webhook.username}:${webhook.secret}`);
      h['Authorization'] = `Basic ${encoded}`;
    } else if (webhook.authType === 'bearer' && webhook.secret) {
      h['Authorization'] = `Bearer ${webhook.secret}`;
    } else if (webhook.authType === 'header' && webhook.headerName && webhook.secret) {
      h[webhook.headerName] = webhook.secret;
    }
    return h;
  };

  const testWebhook = async () => {
    if (!webhook.url) return;
    setWebhookStatus('testing');
    try {
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ test: true, source: 'feira.casa', cidade: form.cidade }),
      });
      setWebhookStatus(res.ok ? 'ok' : 'fail');
    } catch {
      setWebhookStatus('fail');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErro(null);

    // Persist webhook config to localStorage so it survives page reloads
    // (webhook_* columns don't exist in DB — stored client-side keyed by cidade)
    if (form.parceiro === 'propria' && webhook.url) {
      try {
        const existing = JSON.parse(localStorage.getItem('fc_webhook_configs') || '{}');
        existing[form.cidade.trim()] = {
          url:        webhook.url,
          authType:   webhook.authType,
          username:   webhook.username,
          secret:     webhook.secret,
          headerName: webhook.headerName,
        };
        localStorage.setItem('fc_webhook_configs', JSON.stringify(existing));
      } catch {}
    }

    const result = await syncDeliveryZone({
      id:          initialData?.id,
      cidade:      form.cidade.trim(),
      estado:      form.estado,
      cep:         form.cep,
      tipos_frete: form.tiposFrete,
      parceiro:    form.parceiro,
    });

    setSaving(false);

    if (!result.success) {
      setErro(result.error ?? 'Erro ao salvar. Tente novamente.');
      return;
    }

    onCreated?.(result.data!);
    onClose();
  };

  const isValid =
    form.cidade.trim() &&
    form.cep.length >= 9 &&
    form.estado &&
    form.tiposFrete.length > 0 &&
    form.parceiro &&
    (form.parceiro !== 'propria' || webhook.url.startsWith('http'));

  const inputCls = "w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-green-600/30 focus:bg-white rounded-2xl outline-none font-semibold text-sm text-gray-900 transition-all placeholder:text-gray-300";
  const selectCls = `${inputCls} appearance-none cursor-pointer`;

  const selectedPartner = PARCEIROS.find(p => p.value === form.parceiro);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 99998,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Dialog — 80vw × 80vh */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="zona-modal-title"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          width: '80vw', height: '80vh',
          display: 'flex', flexDirection: 'column',
          background: 'white',
          borderRadius: '2.5rem',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-10 py-7 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-700 shrink-0">
              <MapPin size={22} />
            </div>
            <div>
              <h2 id="zona-modal-title" className="text-xl font-black text-gray-900 leading-tight">
                {initialData ? 'Editar Zona de Entrega' : 'Nova Zona de Entrega'}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {initialData
                  ? `Editando configurações de ${initialData.cidade}`
                  : 'Configure a cidade, frete e parceiro logístico'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body — 2-column grid ── */}
        <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-gray-100 min-h-0">

          {/* ── Left: form ── */}
          <div className="overflow-y-auto p-10 space-y-6">

            {/* Cidade + UF */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  <Building2 size={11} /> Cidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo"
                  value={form.cidade}
                  onChange={set('cidade')}
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  <MapPin size={11} /> Estado (UF)
                </label>
                <select value={form.estado} onChange={set('estado')} className={selectCls}>
                  <option value="">Selecione...</option>
                  {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>

            {/* CEP */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                <Hash size={11} /> CEP Base da Cidade
              </label>
              <input
                type="text"
                placeholder="00000-000"
                value={form.cep}
                onChange={e => handleCepChange(e.target.value)}
                className={inputCls}
                maxLength={9}
              />
            </div>

            {/* Tipos de Frete */}
            <div className="space-y-3">
              <label className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                <Truck size={11} /> Tipos de Frete Habilitados
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS_FRETE.map(t => {
                  const active = form.tiposFrete.includes(t.value);
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => toggleFrete(t.value)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        active
                          ? 'bg-green-700 border-green-700 text-white shadow-sm'
                          : 'bg-gray-50 border-transparent text-gray-500 hover:border-green-600/20'
                      }`}
                    >
                      <p className="text-xs font-black leading-none">{t.label}</p>
                      <p className={`text-[10px] mt-1 font-medium ${active ? 'text-green-100' : 'text-gray-400'}`}>{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parceiro */}
            <div className="space-y-3">
              <label className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                <Handshake size={11} /> Parceiro Logístico
              </label>
              <div className="space-y-2">
                {PARCEIROS.map(p => {
                  const Icon = p.icon;
                  const active = form.parceiro === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, parceiro: p.value }))}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                        active
                          ? 'border-green-700 bg-green-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-9 h-9 ${p.bg} ${p.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${active ? 'text-green-800' : 'text-gray-800'}`}>{p.label}</span>
                          {p.badge && (
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${active ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">{p.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${active ? 'border-green-700 bg-green-700' : 'border-gray-300'}`}>
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right: partner info + n8n webhook ── */}
          <div className="overflow-y-auto p-10 space-y-6 bg-gray-50/40">

            {/* Info card */}
            <div className="p-5 bg-blue-50 border border-blue-100 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-blue-700">
                <Info size={14} />
                <span className="text-[11px] font-black uppercase tracking-widest">Sobre a Zona de Entrega</span>
              </div>
              <p className="text-[12px] text-blue-700 font-medium leading-relaxed">
                Após criar a zona, você configura feiras, tabela de preços por distância e regras de frota nas configurações detalhadas de cada cidade.
              </p>
            </div>

            {/* Partner detail card — changes based on selection */}
            {selectedPartner ? (
              <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${selectedPartner.bg} ${selectedPartner.color} rounded-2xl flex items-center justify-center`}>
                    <selectedPartner.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{selectedPartner.label}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Parceiro Selecionado</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{selectedPartner.desc}</p>
                {selectedPartner.value !== 'propria' && (
                  <div className="flex items-center gap-2 pt-1">
                    <ShieldCheck size={14} className="text-green-600" />
                    <span className="text-[11px] font-bold text-green-700">Integração gerenciada pela Feira.Casa</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-white border border-dashed border-gray-200 rounded-3xl text-center space-y-2">
                <Handshake size={28} className="text-gray-200 mx-auto" />
                <p className="text-xs font-bold text-gray-400">Selecione um parceiro logístico ao lado</p>
              </div>
            )}

            {/* ── n8n Webhook Panel — only when propria ── */}
            {form.parceiro === 'propria' && (
              <div className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-purple-50 border-b border-purple-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Webhook size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-purple-900">Webhook n8n</p>
                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Configuração de Despacho</p>
                  </div>
                  {webhookStatus === 'ok' && (
                    <div className="ml-auto flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Conectado</span>
                    </div>
                  )}
                  {webhookStatus === 'fail' && (
                    <div className="ml-auto flex items-center gap-1.5 text-red-500">
                      <XCircle size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Falhou</span>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-5">
                  {/* URL */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Link2 size={11} /> URL do Webhook
                    </label>
                    <input
                      type="url"
                      placeholder="https://seu-n8n.com/webhook/..."
                      value={webhook.url}
                      onChange={e => { setWebhookStatus('idle'); setWebhook(w => ({ ...w, url: e.target.value })); }}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-300 focus:bg-white rounded-2xl outline-none font-medium text-sm text-gray-900 transition-all placeholder:text-gray-300"
                    />
                  </div>

                  {/* Auth type */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <KeyRound size={11} /> Autenticação
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {([
                        { v: 'none',   l: 'Sem Auth'  },
                        { v: 'basic',  l: 'Basic Auth' },
                        { v: 'header', l: 'Header'     },
                        { v: 'bearer', l: 'Bearer'     },
                      ] as const).map(t => (
                        <button
                          key={t.v}
                          type="button"
                          onClick={() => { setWebhookStatus('idle'); setWebhook(w => ({ ...w, authType: t.v })); }}
                          className={`py-2.5 rounded-xl text-[10px] font-black border-2 transition-all ${
                            webhook.authType === t.v
                              ? 'border-purple-600 bg-purple-600 text-white'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-purple-200'
                          }`}
                        >
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Basic Auth: username + password */}
                  {webhook.authType === 'basic' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Usuário</label>
                        <input
                          type="text"
                          placeholder="Ex: apikey"
                          value={webhook.username}
                          onChange={e => setWebhook(w => ({ ...w, username: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-300 focus:bg-white rounded-2xl outline-none font-medium text-sm text-gray-900 transition-all placeholder:text-gray-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Senha / API Key</label>
                        <input
                          type="password"
                          placeholder="••••••••••••••••"
                          value={webhook.secret}
                          onChange={e => setWebhook(w => ({ ...w, secret: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-300 focus:bg-white rounded-2xl outline-none font-medium text-sm text-gray-900 transition-all placeholder:text-gray-400"
                        />
                      </div>
                      <p className="text-[10px] text-purple-500 font-medium">
                        Enviado como <code className="bg-purple-50 px-1.5 py-0.5 rounded font-mono">Authorization: Basic base64(usuário:senha)</code>
                      </p>
                    </div>
                  )}

                  {/* Custom Header */}
                  {webhook.authType === 'header' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Nome do Header</label>
                        <input
                          type="text"
                          placeholder="Ex: x-api-key"
                          value={webhook.headerName}
                          onChange={e => setWebhook(w => ({ ...w, headerName: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-300 focus:bg-white rounded-2xl outline-none font-mono text-sm text-gray-900 transition-all placeholder:text-gray-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Valor</label>
                        <input
                          type="password"
                          placeholder="••••••••••••••••"
                          value={webhook.secret}
                          onChange={e => setWebhook(w => ({ ...w, secret: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-300 focus:bg-white rounded-2xl outline-none font-medium text-sm text-gray-900 transition-all placeholder:text-gray-400"
                        />
                      </div>
                      <p className="text-[10px] text-purple-500 font-medium">
                        Enviado como <code className="bg-purple-50 px-1.5 py-0.5 rounded font-mono">{webhook.headerName || 'header'}: valor</code>
                      </p>
                    </div>
                  )}

                  {/* Bearer token */}
                  {webhook.authType === 'bearer' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Bearer Token</label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={webhook.secret}
                        onChange={e => setWebhook(w => ({ ...w, secret: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-300 focus:bg-white rounded-2xl outline-none font-medium text-sm text-gray-900 transition-all placeholder:text-gray-400"
                      />
                      <p className="text-[10px] text-purple-500 font-medium">
                        Enviado como <code className="bg-purple-50 px-1.5 py-0.5 rounded font-mono">Authorization: Bearer token</code>
                      </p>
                    </div>
                  )}

                  {/* Test button */}
                  <button
                    type="button"
                    onClick={testWebhook}
                    disabled={!webhook.url || webhookStatus === 'testing'}
                    className="w-full py-3 bg-purple-50 border-2 border-purple-100 text-purple-700 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-purple-100 hover:border-purple-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {webhookStatus === 'testing'
                      ? <><Loader2 size={14} className="animate-spin" /> Testando...</>
                      : <><RefreshCcw size={14} /> Testar Conexão</>
                    }
                  </button>

                  {/* Payload preview */}
                  <div className="bg-gray-900 rounded-2xl p-4 text-[11px] font-mono leading-relaxed space-y-1">
                    <p className="text-gray-500 font-sans text-[10px] uppercase tracking-widest mb-2">Payload + Headers enviados ao n8n:</p>
                    {webhook.authType !== 'none' && (
                      <p className="text-gray-400">
                        <span className="text-purple-300">
                          {webhook.authType === 'basic'  && 'Authorization'}
                          {webhook.authType === 'bearer' && 'Authorization'}
                          {webhook.authType === 'header' && (webhook.headerName || 'x-api-key')}
                        </span>
                        {': '}
                        <span className="text-yellow-300">
                          {webhook.authType === 'basic'  && 'Basic ••••••••'}
                          {webhook.authType === 'bearer' && 'Bearer ••••••••'}
                          {webhook.authType === 'header' && '••••••••'}
                        </span>
                      </p>
                    )}
                    <span className="text-yellow-300">{'{'}</span>{'\n'}
                    {'  '}<span className="text-blue-300">"evento"</span>{': '}<span className="text-green-300">"novo_pedido"</span>{',\n'}
                    {'  '}<span className="text-blue-300">"cidade"</span>{': '}<span className="text-green-300">"{form.cidade || 'cidade'}"</span>{',\n'}
                    {'  '}<span className="text-blue-300">"pedido_id"</span>{': '}<span className="text-orange-300">"PED-XXXX"</span>{',\n'}
                    {'  '}<span className="text-blue-300">"origem"</span>{': '}<span className="text-green-300">"feira.casa"</span>{'\n'}
                    <span className="text-yellow-300">{'}'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Checklist */}
            <div className="p-5 bg-white border border-gray-100 rounded-3xl space-y-3 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Checklist</p>
              {[
                { label: 'Cidade preenchida',      ok: !!form.cidade.trim() },
                { label: 'Estado selecionado',     ok: !!form.estado },
                { label: 'CEP base informado',     ok: form.cep.length >= 9 },
                { label: 'Frete configurado',      ok: form.tiposFrete.length > 0 },
                { label: 'Parceiro selecionado',   ok: !!form.parceiro },
                ...(form.parceiro === 'propria'
                  ? [{ label: 'Webhook URL válida', ok: webhook.url.startsWith('http') }]
                  : []),
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.ok ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                    <CheckCircle2 size={12} />
                  </div>
                  <span className={`text-xs font-bold ${item.ok ? 'text-gray-700' : 'text-gray-400'}`}>{item.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Error ── */}
        {erro && (
          <div className="mx-10 mb-2 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-2xl text-xs font-semibold text-red-600 shrink-0">
            <AlertCircle size={14} className="shrink-0" />
            {erro}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-10 py-6 border-t border-gray-100 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-gray-400 font-medium">
            {isValid
              ? '✓ Pronto para criar a zona'
              : 'Preencha todos os campos obrigatórios'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className="px-10 py-3.5 bg-[#125d30] hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-green-900/10"
            >
              {saving
                ? <><Loader2 size={16} className="animate-spin" /> Salvando...</>
                : <><MapPin size={16} /> {initialData ? 'Salvar Alterações' : 'Criar Zona de Entrega'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
