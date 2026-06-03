'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Share2,
  Phone,
  MapPin,
  FileText,
  Link as LinkIcon,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  Send,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
  Building2,
} from 'lucide-react';

// Ícone Instagram customizado (não existe no lucide-react)
const InstagramIcon = ({ size = 22 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────
type TabId = 'institucional' | 'header' | 'social' | 'contato' | 'regiao' | 'empresa';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// TABS CONFIG
// ──────────────────────────────────────────────────────────────────────────────
const tabs: Tab[] = [
  { id: 'empresa', label: 'Empresa', icon: Building2, description: 'Dados da empresa e textos do rodapé' },
  { id: 'institucional', label: 'Sobre nós', icon: FileText, description: 'Textos da página institucional' },
  { id: 'header', label: 'Links do Header', icon: LinkIcon, description: 'Links do topo do site' },
  { id: 'social', label: 'Redes Sociais', icon: Share2, description: 'URLs das redes sociais' },
  { id: 'contato', label: 'Contato', icon: Phone, description: 'Informações de contato' },
  { id: 'regiao', label: 'Região & Raio', icon: MapPin, description: 'Configuração de área de cobertura' },
];

// ──────────────────────────────────────────────────────────────────────────────
// FIELD COMPONENTS
// ──────────────────────────────────────────────────────────────────────────────
function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-[11px] font-black text-[#707a6b] uppercase tracking-widest">{label}</label>
        {description && <p className="text-[11px] text-[#9da89a] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-[#f5f4ef] border border-transparent focus:border-[#0e6b17]/30 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-medium outline-none transition-all';

const textareaCls =
  'w-full bg-[#f5f4ef] border border-transparent focus:border-[#0e6b17]/30 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-medium outline-none transition-all resize-none h-28';

// ──────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────────────────────────────────────
export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('empresa');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // ── Load settings ──────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/site-settings');
      const json = await res.json();
      if (json.success) setSettings(json.data ?? {});
    } catch {
      // silently fail — use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ── Change handler ─────────────────────────────────────────────────────────
  const set = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  async function handleEmpresaCep(raw: string) {
    const formatted = (await import('@/lib/cep')).formatCep(raw);
    set('empresa_cep', formatted);
    const data = await (await import('@/lib/cep')).fetchCep(formatted);
    if (data) {
      set('empresa_logradouro', data.logradouro);
      set('empresa_bairro', data.bairro);
      set('empresa_cidade_estado', `${data.localidade} - ${data.uf}`);
    }
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      setStatus(json.success ? 'success' : 'error');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
      setTimeout(() => setStatus('idle'), 3500);
    }
  };

  const g = (key: string, fallback = '') => settings[key] ?? fallback;

  // ──────────────────────────────────────────────────────────────────────────
  // TAB CONTENTS
  // ──────────────────────────────────────────────────────────────────────────
  const renderEmpresa = () => (
    <div className="space-y-8">
      <div className="bg-[#f0faf1] border border-[#0e6b17]/10 rounded-[28px] p-6">
        <div className="flex items-start gap-3">
          <Building2 size={20} className="text-green-600 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-[#1b1c19] leading-relaxed">
            Dados cadastrais da empresa <strong>Feira.Casa</strong>. Estas informações são usadas em documentos, notas fiscais e no rodapé do site.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Razão Social">
          <input className={inputCls} value={g('empresa_razao_social')} onChange={e => set('empresa_razao_social', e.target.value)} placeholder="Ex: Feira Casa Tecnologia Ltda" />
        </Field>
        <Field label="CNPJ">
          <input className={inputCls} value={g('empresa_cnpj')} onChange={e => set('empresa_cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
        </Field>
        <Field label="E-mail Comercial">
          <input className={inputCls} type="email" value={g('empresa_email')} onChange={e => set('empresa_email', e.target.value)} placeholder="contato@feira.casa" />
        </Field>
        <Field label="Telefone Comercial">
          <input className={inputCls} type="tel" value={g('empresa_telefone')} onChange={e => set('empresa_telefone', e.target.value)} placeholder="+55 (62) 9999-0000" />
        </Field>
        <Field label="CEP">
          <input className={inputCls} value={g('empresa_cep')} onChange={e => handleEmpresaCep(e.target.value)} placeholder="00000-000" maxLength={9} />
        </Field>
        <Field label="Logradouro">
          <input className={inputCls} value={g('empresa_logradouro')} onChange={e => set('empresa_logradouro', e.target.value)} placeholder="Rua, Avenida, etc." />
        </Field>
        <Field label="Número">
          <input className={inputCls} value={g('empresa_numero')} onChange={e => set('empresa_numero', e.target.value)} placeholder="123" />
        </Field>
        <Field label="Complemento">
          <input className={inputCls} value={g('empresa_complemento')} onChange={e => set('empresa_complemento', e.target.value)} placeholder="Sala, Andar (opcional)" />
        </Field>
        <Field label="Bairro">
          <input className={inputCls} value={g('empresa_bairro')} onChange={e => set('empresa_bairro', e.target.value)} />
        </Field>
        <Field label="Cidade / Estado">
          <input className={inputCls} value={g('empresa_cidade_estado')} onChange={e => set('empresa_cidade_estado', e.target.value)} placeholder="Ex: Quirinópolis - GO" />
        </Field>
      </div>

      <div className="border-t border-gray-100 pt-8 space-y-6">
        <p className="text-[11px] font-black text-[#1b1c19] uppercase tracking-[0.2em]">Textos do Rodapé (Footer)</p>
        <Field label="Tagline / Descrição" description="Texto abaixo do logo no footer">
          <textarea className={textareaCls} value={g('footer_tagline', 'Levando o frescor das melhores feiras livres diretamente para sua casa, apoiando produtores locais.')} onChange={e => set('footer_tagline', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Texto Copyright" description="Ex: © 2024 feira.casa - Cultivando conexões reais.">
            <input className={inputCls} value={g('footer_copyright', '© 2024 feira.casa - Cultivando conexões reais.')} onChange={e => set('footer_copyright', e.target.value)} />
          </Field>
          <Field label="Feito com ❤️ por..." description="Nome exibido no crédito do rodapé">
            <input className={inputCls} value={g('footer_made_by', 'Antigravity')} onChange={e => set('footer_made_by', e.target.value)} placeholder="Ex: Antigravity" />
          </Field>
        </div>
      </div>
    </div>
  );

  const renderInstitucional = () => (
    <div className="space-y-6">
      <Field label="Título da Página" description="Aparece como H1 na página /sobre">
        <input className={inputCls} value={g('sobre_titulo')} onChange={(e) => set('sobre_titulo', e.target.value)} />
      </Field>
      <Field label="Subtítulo / Hero" description="Frase de destaque abaixo do título">
        <textarea className={textareaCls} value={g('sobre_subtitulo')} onChange={(e) => set('sobre_subtitulo', e.target.value)} />
      </Field>
      <Field label="Título da Seção Missão">
        <input className={inputCls} value={g('sobre_missao_titulo')} onChange={(e) => set('sobre_missao_titulo', e.target.value)} />
      </Field>
      <Field label="Parágrafo 1 — Missão">
        <textarea className={textareaCls} value={g('sobre_missao_texto1')} onChange={(e) => set('sobre_missao_texto1', e.target.value)} />
      </Field>
      <Field label="Parágrafo 2 — Missão">
        <textarea className={textareaCls} value={g('sobre_missao_texto2')} onChange={(e) => set('sobre_missao_texto2', e.target.value)} />
      </Field>
    </div>
  );

  const renderHeader = () => (
    <div className="space-y-8">
      <p className="text-sm text-[#707a6b] font-medium">
        Links exibidos na barra superior do site (topbar do Header).
      </p>

      {[
        { prefix: 'header_link_feirante', title: 'Link: Seja um Feirante' },
        { prefix: 'header_link_chef', title: 'Link: Restaurantes & Chefs' },
        { prefix: 'header_link_b2b', title: 'Link: Comprador Atacadista' },
      ].map(({ prefix, title }) => (
        <div key={prefix} className="bg-[#f9f8f3] rounded-[28px] p-6 space-y-4">
          <p className="text-[11px] font-black text-[#1b1c19] uppercase tracking-[0.2em]">{title}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Texto do Link">
              <input
                className={inputCls}
                value={g(`${prefix}_label`)}
                onChange={(e) => set(`${prefix}_label`, e.target.value)}
              />
            </Field>
            <Field label="URL de Destino">
              <input
                className={inputCls}
                placeholder="/cadastro/..."
                value={g(`${prefix}_href`)}
                onChange={(e) => set(`${prefix}_href`, e.target.value)}
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSocial = () => (
    <div className="space-y-6">
      <p className="text-sm text-[#707a6b] font-medium">
        URLs das redes sociais exibidas no rodapé (Footer) do site.
      </p>

      {[
        { key: 'social_instagram', label: 'Instagram', icon: InstagramIcon, placeholder: 'https://instagram.com/feiracasa', color: '#E1306C' },
        { key: 'social_whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: 'https://wa.me/5511999999999', color: '#25D366' },
        { key: 'social_telegram', label: 'Telegram', icon: Send, placeholder: 'https://t.me/feiracasa', color: '#229ED9' },
      ].map(({ key, label, icon: Icon, placeholder, color }) => (
        <div key={key} className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: `${color}18`, color }}
          >
            <Icon size={22} />
          </div>
          <div className="flex-1">
            <Field label={label}>
              <input
                className={inputCls}
                type="url"
                placeholder={placeholder}
                value={g(key)}
                onChange={(e) => set(key, e.target.value)}
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContato = () => (
    <div className="space-y-6">
      <Field label="E-mail de Contato" description="Exibido na página /contato e no footer">
        <input
          className={inputCls}
          type="email"
          value={g('contato_email')}
          onChange={(e) => set('contato_email', e.target.value)}
        />
      </Field>
      <Field label="Telefone / WhatsApp">
        <input
          className={inputCls}
          type="tel"
          value={g('contato_telefone')}
          onChange={(e) => set('contato_telefone', e.target.value)}
        />
      </Field>
      <Field label="Endereço" description="Cidade e estado exibidos no footer">
        <input
          className={inputCls}
          value={g('contato_endereco')}
          onChange={(e) => set('contato_endereco', e.target.value)}
        />
      </Field>
    </div>
  );

  const renderRegiao = () => {
    const radius = parseInt(g('regiao_raio_padrao', '15'), 10) || 15;
    return (
      <div className="space-y-8">
        <div className="bg-[#f0faf1] border border-[#0e6b17]/10 rounded-[28px] p-6">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-black text-[#1b1c19]">Raio de Busca Padrão</p>
              <p className="text-[12px] text-[#707a6b] mt-1 leading-relaxed">
                Quando o usuário clicar em <strong>"Sua Região"</strong> no header, o sistema usará
                a geolocalização do browser e buscará feiras dentro deste raio (em km).
              </p>
            </div>
          </div>
        </div>

        <Field label="Raio padrão (km)" description="Valor entre 5 e 100 km">
          <div className="space-y-4">
            {/* Slider visual */}
            <div className="flex items-center gap-6">
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={radius}
                onChange={(e) => set('regiao_raio_padrao', e.target.value)}
                className="flex-1 accent-[#0e6b17] h-2 cursor-pointer"
              />
              <div className="bg-green-600 text-white rounded-2xl px-5 py-3 text-xl font-black min-w-[90px] text-center">
                {radius} km
              </div>
            </div>

            {/* Presets rápidos */}
            <div className="flex gap-3 flex-wrap">
              {[5, 10, 15, 20, 30, 50].map((v) => (
                <button
                  key={v}
                  onClick={() => set('regiao_raio_padrao', String(v))}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    radius === v
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-[#f5f4ef] text-[#707a6b] hover:bg-[#e8f5e9] hover:text-green-600'
                  }`}
                >
                  {v} km
                </button>
              ))}
            </div>
          </div>
        </Field>

        {/* Preview visual do raio */}
        <div className="relative flex items-center justify-center mt-4">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#0e6b17]/20 animate-pulse" />
            <div
              className="absolute rounded-full bg-green-600/5 border border-[#0e6b17]/20 transition-all duration-500"
              style={{
                width: `${Math.min(100, (radius / 100) * 100)}%`,
                height: `${Math.min(100, (radius / 100) * 100)}%`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <MapPin size={28} className="text-green-600" />
              <span className="text-xs font-black text-green-600 mt-1">Sua Feira</span>
              <span className="text-[10px] text-[#9da89a] font-medium">{radius} km ao redor</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabContent: Record<TabId, () => React.ReactNode> = {
    empresa: renderEmpresa,
    institucional: renderInstitucional,
    header: renderHeader,
    social: renderSocial,
    contato: renderContato,
    regiao: renderRegiao,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400 mb-3">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span>Configurações</span>
            <ChevronRight size={14} />
            <span className="text-green-600 font-bold">Site</span>
          </div>
          <h1 className="text-[40px] font-black text-[#1b1c19] leading-tight tracking-tight">
            Configurações do Site
          </h1>
          <p className="text-[#707a6b] font-medium mt-1">
            Edite textos, links, redes sociais e raio de cobertura exibidos publicamente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:shadow-md transition-all"
            title="Recarregar"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Status feedback */}
      {status !== 'idle' && (
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold animate-in fade-in duration-300 ${
            status === 'success'
              ? 'bg-green-50 text-green-700 border border-green-100'
              : 'bg-red-50 text-red-600 border border-red-100'
          }`}
        >
          {status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {status === 'success'
            ? 'Configurações salvas com sucesso! As alterações já estão no ar.'
            : 'Erro ao salvar. Verifique a conexão e tente novamente.'}
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">

        {/* Tab nav */}
        <div className="border-b border-gray-50 px-8 pt-8 overflow-x-auto">
          <div className="flex gap-1 min-w-max pb-[-1px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-bold transition-all border-b-2 ${
                    isActive
                      ? 'bg-[#f9f8f3] text-green-600 border-[#0e6b17]'
                      : 'text-gray-400 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={32} className="animate-spin text-green-600" />
              <p className="text-sm font-bold text-[#707a6b]">Carregando configurações...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              {tabContent[activeTab]()}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
