'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Eye, Edit2, Trash2, ToggleLeft, ToggleRight,
  Image, ArrowUp, ArrowDown, Monitor, Layers, DollarSign,
  CheckCircle2, X, Info, ChevronRight, ExternalLink,
  RefreshCw, Smartphone, Globe,
} from 'lucide-react';
import Modal from '@/components/admin/Modal';
import {
  DEFAULT_BANNERS, DEFAULT_PACKAGES,
  ANUNCIANTE_CONFIG, BADGE_STYLES,
} from '@/lib/ads-data';
import type { AdBanner, AdPackage, AdBannerType, AnuncianteType, BannerPlataforma } from '@/lib/ads-data';

type Tab = 'rotacao' | 'slots' | 'pacotes';

const FIXED_SLOTS = [
  { id: 's1', posicao: 'Sidebar Superior', dimensao: '300×250px', anunciante: 'FazendaOrg',    valorMensal: 900,  impressoes: 22100, ctr: 3.1, ativo: true,  vigenciaFim: '2026-05-31' },
  { id: 's2', posicao: 'Sidebar Inferior', dimensao: '300×250px', anunciante: '—',              valorMensal: 0,    impressoes: 0,     ctr: 0,   ativo: false, vigenciaFim: '' },
  { id: 's3', posicao: 'Footer Banner',    dimensao: '1200×90px', anunciante: 'NutriChef',     valorMensal: 650,  impressoes: 31400, ctr: 1.8, ativo: true,  vigenciaFim: '2026-05-28' },
  { id: 's4', posicao: 'Popup Homepage',   dimensao: '600×400px', anunciante: '—',              valorMensal: 0,    impressoes: 0,     ctr: 0,   ativo: false, vigenciaFim: '' },
  { id: 's5', posicao: 'Mid-Content',      dimensao: '728×90px',  anunciante: 'Mercado Fresco', valorMensal: 480,  impressoes: 14200, ctr: 2.2, ativo: true,  vigenciaFim: '2026-05-20' },
];

const BADGE_TYPE_OPTIONS: { value: AdBannerType; label: string }[] = [
  { value: 'oferta',      label: 'Oferta do Dia (laranja)' },
  { value: 'patrocinado', label: 'Patrocinado (escuro)'    },
  { value: 'destaque',    label: 'Destaque (verde)'        },
  { value: 'novo',        label: 'Novo (azul)'             },
];

const TIPO_OPTIONS: { value: AnuncianteType; label: string }[] = [
  { value: 'feirante',    label: 'Feirante'    },
  { value: 'chef',        label: 'Chef'        },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'atacadista',  label: 'Atacadista'  },
];

const BLANK_FORM = {
  titulo: '', subtitulo: '', cta: 'Saiba Mais', badge: 'PATROCINADO',
  badgeType: 'patrocinado' as AdBannerType, imageUrl: '', linkUrl: '',
  anunciante: '', anuncianteType: 'feirante' as AnuncianteType,
  isAd: true, vigenciaFim: '', packageId: '',
  plataforma: 'web' as BannerPlataforma,
};

const PLATAFORMA_CONFIG: Record<BannerPlataforma, {
  label: string; icon: React.ElementType; bg: string; text: string; border: string;
  specs: { label: string; dim: string }[];
}> = {
  web: {
    label: 'Web (Desktop)', icon: Monitor,
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200',
    specs: [
      { label: 'Hero Rotativo', dim: '1200 × 400 px' },
      { label: 'Sidebar', dim: '300 × 250 px' },
      { label: 'Rodapé', dim: '1200 × 90 px' },
      { label: 'Mid-content', dim: '728 × 90 px' },
    ],
  },
  mobile: {
    label: 'Mobile (App)', icon: Smartphone,
    bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200',
    specs: [
      { label: 'Card no Feed', dim: '375 × 200 px' },
      { label: 'Story', dim: '375 × 812 px' },
      { label: 'Notificação', dim: '360 × 64 px' },
      { label: 'Rodapé App', dim: '320 × 50 px' },
    ],
  },
  ambos: {
    label: 'Web + Mobile', icon: Globe,
    bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200',
    specs: [
      { label: 'Hero Web', dim: '1200 × 400 px' },
      { label: 'Feed Mobile', dim: '375 × 200 px' },
      { label: 'Sidebar Web', dim: '300 × 250 px' },
      { label: 'Notif. App', dim: '360 × 64 px' },
    ],
  },
};

export default function AdminBannersPage() {
  const [tab, setTab]         = useState<Tab>('rotacao');
  const [banners, setBanners] = useState<AdBanner[]>(DEFAULT_BANNERS);
  const [slots, setSlots]     = useState(FIXED_SLOTS);
  const [packages]            = useState<AdPackage[]>(DEFAULT_PACKAGES);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const [editBanner, setEditBanner]       = useState<AdBanner | null>(null);
  const [addOpen, setAddOpen]             = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<AdBanner | null>(null);
  const [form, setForm] = useState(BLANK_FORM);

  useEffect(() => {
    fetch('/api/ads/banners')
      .then(r => r.json())
      .then(d => {
        const activeIds = new Set((d.banners as AdBanner[]).map(b => b.id));
        setBanners(DEFAULT_BANNERS.map(b => ({ ...b, ativo: activeIds.has(b.id) })));
      })
      .catch(() => {});
  }, []);

  const syncToApi = async (updated: AdBanner[]) => {
    setSyncing(true);
    try {
      await fetch('/api/ads/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: updated }),
      });
      setLastSync(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } finally {
      setSyncing(false);
    }
  };

  const toggleBanner = (id: string) => {
    const updated = banners.map(b => b.id === id ? { ...b, ativo: !b.ativo } : b);
    setBanners(updated);
    syncToApi(updated);
  };

  const moveBanner = (id: string, dir: 1 | -1) => {
    const idx = banners.findIndex(b => b.id === id);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= banners.length) return;
    const arr = [...banners];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    const reordered = arr.map((b, i) => ({ ...b, ordem: i }));
    setBanners(reordered);
    syncToApi(reordered);
  };

  const deleteBanner = (id: string) => {
    const updated = banners.filter(b => b.id !== id);
    setBanners(updated);
    syncToApi(updated);
    setDeleteTarget(null);
  };

  const openAdd = () => { setForm(BLANK_FORM); setAddOpen(true); };

  const openEdit = (b: AdBanner) => {
    setForm({
      titulo: b.titulo, subtitulo: b.subtitulo, cta: b.cta,
      badge: b.badge, badgeType: b.badgeType, imageUrl: b.imageUrl,
      linkUrl: b.linkUrl, anunciante: b.anunciante ?? '',
      anuncianteType: b.anuncianteType ?? 'feirante',
      isAd: b.isAd, vigenciaFim: b.vigenciaFim ?? '', packageId: b.packageId ?? '',
      plataforma: b.plataforma ?? 'web',
    });
    setEditBanner(b);
  };

  const handleSave = () => {
    let updated: AdBanner[];
    if (editBanner) {
      updated = banners.map(b => b.id === editBanner.id ? { ...b, ...form } : b);
    } else {
      updated = [...banners, {
        ...form, id: `ad-${Date.now()}`, ativo: true,
        ordem: banners.length, impressoes: 0, cliques: 0,
      }];
    }
    setBanners(updated);
    syncToApi(updated);
    setEditBanner(null);
    setAddOpen(false);
  };

  const activeCount   = banners.filter(b => b.ativo).length;
  const totalImp      = banners.reduce((a, b) => a + (b.impressoes ?? 0), 0);
  const totalRevenue  = slots.filter(s => s.ativo).reduce((a, s) => a + s.valorMensal, 0);

  // ── Shared form UI ──────────────────────────────────────────────────────────
  const BannerForm = (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Título *</label>
        <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
          placeholder="Ex: Orgânicos certificados direto do campo"
          className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
      </div>
      <div>
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Subtítulo</label>
        <input value={form.subtitulo} onChange={e => setForm(f => ({ ...f, subtitulo: e.target.value }))}
          placeholder="Uma frase de apoio ao título"
          className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Texto do botão (CTA)</label>
          <input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))}
            placeholder="Ver Banca"
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">URL de destino</label>
          <input value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
            placeholder="/feirantes/minha-banca"
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">URL da imagem (1200×400px ideal)</label>
        <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
          placeholder="https://..."
          className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
        {form.imageUrl && (
          <div className="mt-2 rounded-xl overflow-hidden h-24 bg-gray-100">
            <img src={form.imageUrl} className="w-full h-full object-cover" alt="preview" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Tipo de badge</label>
          <select value={form.badgeType} onChange={e => setForm(f => ({ ...f, badgeType: e.target.value as AdBannerType }))}
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold">
            {BADGE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Texto do badge</label>
          <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
            placeholder="PATROCINADO"
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-[20px]">
        <button onClick={() => setForm(f => ({ ...f, isAd: !f.isAd }))} className="shrink-0">
          {form.isAd ? <ToggleRight size={28} className="text-green-600" /> : <ToggleLeft size={28} className="text-gray-400" />}
        </button>
        <div>
          <p className="font-black text-gray-900 text-sm">Anúncio pago</p>
          <p className="text-xs text-gray-400">Exibe badge "Anúncio" e crédito do anunciante no canto</p>
        </div>
      </div>
      {form.isAd && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Nome do anunciante</label>
            <input value={form.anunciante} onChange={e => setForm(f => ({ ...f, anunciante: e.target.value }))}
              placeholder="FazendaOrg" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Tipo de anunciante</label>
            <select value={form.anuncianteType} onChange={e => setForm(f => ({ ...f, anuncianteType: e.target.value as AnuncianteType }))}
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold">
              {TIPO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Pacote vinculado</label>
            <select value={form.packageId} onChange={e => setForm(f => ({ ...f, packageId: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold">
              <option value="">Sem pacote</option>
              {packages.map(p => <option key={p.id} value={p.id}>{p.nome} — R${p.preco}/{p.duracao}d</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Vigência até</label>
            <input type="date" value={form.vigenciaFim} onChange={e => setForm(f => ({ ...f, vigenciaFim: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-green-600/30 focus:bg-white outline-none text-sm font-bold" />
          </div>
        </div>
      )}
      {/* Platform selector */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Plataforma</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(PLATAFORMA_CONFIG) as [BannerPlataforma, typeof PLATAFORMA_CONFIG['web']][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const selected = form.plataforma === key;
            return (
              <button key={key} type="button"
                onClick={() => setForm(f => ({ ...f, plataforma: key }))}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-[16px] border-2 transition-all ${
                  selected ? `${cfg.border} ${cfg.bg}` : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}>
                <Icon size={18} className={selected ? cfg.text : 'text-gray-400'} />
                <span className={`text-xs font-black ${selected ? cfg.text : 'text-gray-500'}`}>{cfg.label}</span>
              </button>
            );
          })}
        </div>
        {/* Specs hint */}
        <div className={`mt-2 p-3 rounded-[14px] border ${PLATAFORMA_CONFIG[form.plataforma].border} ${PLATAFORMA_CONFIG[form.plataforma].bg}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${PLATAFORMA_CONFIG[form.plataforma].text}`}>Dimensões para esta plataforma</p>
          <div className="grid grid-cols-2 gap-1">
            {PLATAFORMA_CONFIG[form.plataforma].specs.map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold ${PLATAFORMA_CONFIG[form.plataforma].text}`}>{s.label}:</span>
                <code className="text-[10px] font-black bg-white/60 px-1.5 py-0.5 rounded">{s.dim}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={!form.titulo || !form.imageUrl}
        className="w-full py-3 bg-[#125d30] text-white rounded-[20px] font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-all shadow-lg disabled:opacity-40">
        <CheckCircle2 size={16} /> {editBanner ? 'Salvar Alterações' : 'Criar Banner'}
      </button>
    </div>
  );

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Banners & Ads</h1>
          <p className="text-gray-500 font-medium mt-1">
            Gerencie a rotação hero, slots fixos e pacotes publicitários.
            {lastSync && <span className="ml-2 text-[11px] text-green-600 font-black">✓ Publicado às {lastSync}</span>}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => syncToApi(banners)} disabled={syncing}
            className="px-4 py-3 bg-white border border-gray-200 rounded-[20px] font-bold text-sm text-gray-700 flex items-center gap-2 hover:border-gray-400 transition-all shadow-sm">
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Publicando…' : 'Publicar Homepage'}
          </button>
          <button onClick={openAdd}
            className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-green-800 transition-all shadow-lg">
            <Plus size={16} /> Novo Anúncio
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Na Rotação',        value: `${activeCount} banner${activeCount !== 1 ? 's' : ''}`, sub: `de ${banners.length} cadastrados`, icon: Monitor,    bg: 'bg-green-50',  color: 'text-green-700'  },
          { label: 'Impressões (total)',value: totalImp.toLocaleString('pt-BR'),                         sub: 'todos os banners',                icon: Eye,         bg: 'bg-blue-50',   color: 'text-blue-600'   },
          { label: 'Receita de Slots',  value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,             sub: 'slots fixos/mês',                 icon: DollarSign,  bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Pacotes',           value: packages.length,                                          sub: 'disponíveis para venda',          icon: Layers,      bg: 'bg-orange-50', color: 'text-orange-600' },
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

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-[20px] w-fit">
        {([
          { id: 'rotacao', label: 'Rotação Hero', icon: Monitor },
          { id: 'slots',   label: 'Slots Fixos',  icon: Image  },
          { id: 'pacotes', label: 'Pacotes',       icon: Layers },
        ] as { id: Tab; label: string; icon: React.ElementType }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-[16px] font-bold text-sm flex items-center gap-2 transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Rotação Hero ─────────────────────────────────────────────────── */}
      {tab === 'rotacao' && (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-900">Banners no Hero Rotativo</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Ordem define a sequência de rotação na homepage. Use ↑↓ para reordenar.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-black text-green-700">{activeCount} ativo{activeCount !== 1 ? 's' : ''} agora</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {banners.map((b, idx) => {
              const cfg = b.anuncianteType ? ANUNCIANTE_CONFIG[b.anuncianteType] : null;
              const isExpired = b.vigenciaFim ? new Date(b.vigenciaFim) < new Date() : false;
              const ctr = b.impressoes && b.cliques ? ((b.cliques / b.impressoes) * 100).toFixed(1) : null;
              return (
                <div key={b.id} className={`px-7 py-5 flex items-center gap-4 transition-colors hover:bg-gray-50/30 ${!b.ativo ? 'opacity-50' : ''}`}>
                  {/* Order controls */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <button onClick={() => moveBanner(b.id, -1)} disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-colors">
                      <ArrowUp size={14} />
                    </button>
                    <span className="text-[11px] font-black text-gray-400">{idx + 1}</span>
                    <button onClick={() => moveBanner(b.id, 1)} disabled={idx === banners.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-colors">
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-24 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <img src={b.imageUrl} className="w-full h-full object-cover" alt={b.titulo} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-gray-900 text-sm truncate max-w-[240px]">{b.titulo}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${BADGE_STYLES[b.badgeType]}`}>{b.badge}</span>
                      {cfg && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>}
                      {b.plataforma && (() => {
                        const pc = PLATAFORMA_CONFIG[b.plataforma];
                        const Icon = pc.icon;
                        return (
                          <span className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                            <Icon size={9} /> {pc.label}
                          </span>
                        );
                      })()}
                      {isExpired && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">EXPIRADO</span>}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {b.anunciante ? `${b.anunciante} · ` : ''}
                      {(b.impressoes ?? 0).toLocaleString('pt-BR')} impressões
                      {ctr ? ` · ${ctr}% CTR` : ''}
                      {b.vigenciaFim ? ` · até ${new Date(b.vigenciaFim).toLocaleDateString('pt-BR')}` : ''}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setPreviewBanner(b)} title="Preview"
                      className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => openEdit(b)} title="Editar"
                      className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-[#125d30] hover:bg-green-50 transition-all">
                      <Edit2 size={14} />
                    </button>
                    {b.isAd && (
                      <button onClick={() => setDeleteTarget(b.id)} title="Remover"
                        className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                    <button onClick={() => toggleBanner(b.id)} title={b.ativo ? 'Desativar' : 'Ativar'}>
                      {b.ativo
                        ? <ToggleRight size={26} className="text-green-600" />
                        : <ToggleLeft  size={26} className="text-gray-400"  />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: Slots Fixos ──────────────────────────────────────────────────── */}
      {tab === 'slots' && (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-50">
            <h2 className="font-black text-gray-900">Slots de Publicidade Fixa</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Posições permanentes (sidebar, footer, popup, mid-content) — não fazem parte da rotação hero.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  {['Posição', 'Dimensão', 'Anunciante', 'R$/mês', 'Impressões', 'CTR', 'Vigência', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {slots.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-7 py-5"><p className="font-black text-gray-900 text-sm">{s.posicao}</p></td>
                    <td className="px-7 py-5"><span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{s.dimensao}</span></td>
                    <td className="px-7 py-5"><p className="text-sm font-bold text-gray-700">{s.anunciante}</p></td>
                    <td className="px-7 py-5">
                      {s.valorMensal > 0
                        ? <p className="font-black text-green-700">R$ {s.valorMensal.toLocaleString('pt-BR')}</p>
                        : <p className="font-bold text-gray-300">Vago</p>}
                    </td>
                    <td className="px-7 py-5"><p className="font-black text-gray-900">{s.impressoes.toLocaleString('pt-BR')}</p></td>
                    <td className="px-7 py-5"><p className="font-bold text-gray-600">{s.ctr > 0 ? `${s.ctr}%` : '—'}</p></td>
                    <td className="px-7 py-5"><p className="text-sm font-bold text-gray-500">{s.vigenciaFim ? new Date(s.vigenciaFim).toLocaleDateString('pt-BR') : '—'}</p></td>
                    <td className="px-7 py-5">
                      <button onClick={() => setSlots(prev => prev.map(ss => ss.id === s.id ? { ...ss, ativo: !ss.ativo } : ss))}>
                        {s.ativo
                          ? <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-green-50 text-green-700"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Ativo</span>
                          : <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-gray-100 text-gray-400">Vago</span>}
                      </button>
                    </td>
                    <td className="px-7 py-5">
                      <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-[#125d30] hover:bg-green-50 transition-all">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Pacotes ─────────────────────────────────────────────────────── */}
      {tab === 'pacotes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map(pkg => (
            <div key={pkg.id} className={`relative bg-white rounded-[28px] border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${pkg.destaque ? 'border-[#125d30]' : 'border-gray-100'}`}>
              {pkg.destaque && (
                <div className="bg-[#125d30] text-white text-[10px] font-black uppercase tracking-widest text-center py-2 flex items-center justify-center gap-1">
                  <span>⭐</span> Mais Popular
                </div>
              )}
              <div className={`p-6 ${pkg.cor}`}>
                <p className="font-black text-gray-900 text-lg">{pkg.nome}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{pkg.descricao}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-3xl font-black text-gray-900">R$ {pkg.preco.toLocaleString('pt-BR')}</span>
                  <span className="text-sm text-gray-400 font-bold mb-0.5">/ {pkg.duracao} dias</span>
                </div>
                <p className="text-[11px] font-black text-gray-500 mt-1 uppercase tracking-widest">
                  {pkg.impressoesGarantidas.toLocaleString('pt-BR')} impressões garantidas
                </p>
              </div>
              <div className="p-6 space-y-4">
                <ul className="space-y-2">
                  {pkg.beneficios.map(b => (
                    <li key={b} className="flex gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Para quem</p>
                  <div className="flex gap-1 flex-wrap">
                    {pkg.publicoAlvo.map(t => {
                      const cfg = ANUNCIANTE_CONFIG[t];
                      return <span key={t} className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>;
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Posições incluídas</p>
                  {pkg.slots.map(s => (
                    <span key={s} className="flex items-center gap-1 text-[11px] font-bold text-gray-400 mb-1">
                      <Monitor size={10} /> {s}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-3 bg-[#125d30] text-white rounded-[16px] font-bold text-sm hover:bg-green-800 transition-all">
                    Ativar / Vender
                  </button>
                  <button className="p-3 bg-gray-50 rounded-[16px] text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Add / Edit banner */}
      <Modal isOpen={addOpen || !!editBanner} onClose={() => { setAddOpen(false); setEditBanner(null); }}
        title={editBanner ? `Editar — ${(editBanner.anunciante ?? editBanner.titulo).substring(0, 30)}` : 'Novo Anúncio / Banner'}>
        {BannerForm}
      </Modal>

      {/* MODAL: Preview */}
      <Modal isOpen={!!previewBanner} onClose={() => setPreviewBanner(null)} title="Preview do Banner">
        {previewBanner && (
          <div className="space-y-4">
            <div className="relative rounded-[20px] overflow-hidden bg-gray-100" style={{ aspectRatio: '3/1' }}>
              <img src={previewBanner.imageUrl} className="w-full h-full object-cover" alt={previewBanner.titulo} />
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right,rgba(0,0,0,.7) 0%,rgba(0,0,0,.3) 60%,transparent 100%)' }} />
              <div className="absolute inset-0 flex items-center px-8 py-6">
                <div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${BADGE_STYLES[previewBanner.badgeType]}`}>{previewBanner.badge}</span>
                  <p className="font-black text-white text-xl mt-2 leading-tight max-w-xs">{previewBanner.titulo}</p>
                  <p className="text-white/70 text-xs mt-1 max-w-xs">{previewBanner.subtitulo}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 bg-white text-gray-900 rounded-full font-bold text-sm">
                    {previewBanner.cta} <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>
            <a href={previewBanner.linkUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-[#125d30] hover:underline">
              <ExternalLink size={14} /> Testar link de destino
            </a>
          </div>
        )}
      </Modal>

      {/* MODAL: Delete confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remover Banner">
        <div className="space-y-5">
          <div className="p-4 bg-red-50 border border-red-100 rounded-[20px] flex gap-3">
            <Info size={16} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">Este banner será removido da rotação. O anunciante não será notificado automaticamente.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-[20px] font-bold hover:bg-gray-200 transition-all">Cancelar</button>
            <button onClick={() => deleteTarget && deleteBanner(deleteTarget)} className="flex-1 py-3 bg-red-600 text-white rounded-[20px] font-bold hover:bg-red-700 transition-all">Remover</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
