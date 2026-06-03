'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Server, Lock, Eye, EyeOff, Save, Loader2,
  CheckCircle2, XCircle, Send, RefreshCw, AlertTriangle,
  ShieldCheck, Zap, FileText, Bell, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type Encryption = 'TLS' | 'SSL' | 'none';
type TabId = 'servidor' | 'templates' | 'logs';

interface SmtpConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  encryption: Encryption;
  from_email: string;
  from_name: string;
}

interface EmailTemplate {
  key: string;
  label: string;
  description: string;
  subject: string;
  enabled: boolean;
  icon: React.ElementType;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'smtp_config';

const DEFAULT_CONFIG: SmtpConfig = {
  host: '',
  port: '587',
  user: '',
  password: '',
  encryption: 'TLS',
  from_email: '',
  from_name: 'Feira.Casa',
};

const PORT_PRESETS = [
  { label: '25 — SMTP padrão', value: '25' },
  { label: '465 — SSL', value: '465' },
  { label: '587 — TLS (recomendado)', value: '587' },
  { label: '2525 — Alternativo', value: '2525' },
];

const TEMPLATES: EmailTemplate[] = [
  { key: 'boas_vindas', label: 'Boas-vindas', description: 'Enviado após novo cadastro', subject: 'Bem-vindo à Feira.Casa! 🌿', enabled: true, icon: Mail },
  { key: 'confirmacao_pedido', label: 'Confirmação de Pedido', description: 'Enviado após finalizar compra', subject: 'Seu pedido foi confirmado — Feira.Casa', enabled: true, icon: CheckCircle2 },
  { key: 'status_entrega', label: 'Atualização de Entrega', description: 'Enviado a cada mudança de status', subject: 'Atualização do seu pedido #{{id}}', enabled: true, icon: Zap },
  { key: 'recuperacao_senha', label: 'Recuperação de Senha', description: 'Link para redefinir senha', subject: 'Redefinir senha — Feira.Casa', enabled: true, icon: Lock },
  { key: 'novo_feirante', label: 'Aprovação de Feirante', description: 'Notifica o feirante quando aprovado', subject: 'Sua conta foi aprovada na Feira.Casa!', enabled: false, icon: ShieldCheck },
  { key: 'resumo_semanal', label: 'Resumo Semanal (Admin)', description: 'Relatório de métricas enviado ao admin', subject: 'Resumo da semana — Feira.Casa Admin', enabled: false, icon: FileText },
];

const TABS = [
  { id: 'servidor' as TabId, label: 'Servidor SMTP', icon: Server },
  { id: 'templates' as TabId, label: 'Templates de E-mail', icon: FileText },
  { id: 'logs' as TabId, label: 'Histórico de Envios', icon: Bell },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SmtpConfigPage() {
  const [activeTab, setActiveTab] = useState<TabId>('servidor');
  const [config, setConfig] = useState<SmtpConfig>(DEFAULT_CONFIG);
  const [templates, setTemplates] = useState<EmailTemplate[]>(TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [testResult, setTestResult] = useState<'idle' | 'ok' | 'err'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);

  const isConfigured = !!(config.host && config.user && config.from_email);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('mktplace_feira_admin_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (error) {
      console.error('[SMTP load error]', error);
      setLoadError(`Erro ao carregar configurações: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data?.value) {
      const saved = data.value as { smtp?: SmtpConfig; templates?: Record<string, boolean> };
      if (saved.smtp) setConfig({ ...DEFAULT_CONFIG, ...saved.smtp });
      if (saved.templates) {
        setTemplates(t => t.map(tmpl => ({
          ...tmpl,
          enabled: saved.templates![tmpl.key] ?? tmpl.enabled,
        })));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (): Promise<boolean> => {
    setSaving(true);
    const templateMap = Object.fromEntries(templates.map(t => [t.key, t.enabled]));
    const { error } = await supabase
      .from('mktplace_feira_admin_settings')
      .upsert(
        { key: SETTINGS_KEY, value: { smtp: config, templates: templateMap }, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    setSaving(false);
    if (error) {
      console.error('[SMTP save error]', error);
      showToast(`Erro ao salvar: ${error.message}`, 'err');
      return false;
    }
    showToast('Configurações SMTP salvas com sucesso!');
    return true;
  };

  const handleTest = async () => {
    if (!testEmail.trim() || !isConfigured) return;
    setTesting(true);
    setTestResult('idle');

    // Salva config atual antes de testar para garantir que a API usa os dados mais recentes
    const saved = await handleSave();
    if (!saved) { setTesting(false); return; }

    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: testEmail.trim(),
        subject: '✅ Teste de SMTP — Feira.Casa',
        html: `<p style="font-family:sans-serif;font-size:16px;color:#1b1c19">
          Parabéns! 🎉 Seu servidor SMTP está configurado corretamente.<br/><br/>
          <strong>Servidor:</strong> ${config.host}:${config.port} (${config.encryption})<br/>
          <strong>Remetente:</strong> ${config.from_name} &lt;${config.from_email}&gt;
        </p>`,
      }),
    });

    const json = await res.json();
    const ok = res.ok && json.ok;
    setTestResult(ok ? 'ok' : 'err');
    setTesting(false);
    showToast(
      ok ? `E-mail de teste enviado para ${testEmail}` : `Falha: ${json.error || 'Erro desconhecido'}`,
      ok ? 'ok' : 'err'
    );
  };

  const set = (k: keyof SmtpConfig, v: string) => setConfig(c => ({ ...c, [k]: v }));

  return (
    <div className="min-h-screen bg-[#f8f9f8] p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[36px] font-black text-gray-900 leading-none">Configuração de E-mail</h1>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                isConfigured
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}>
                {isConfigured
                  ? <><CheckCircle2 size={12} /> Configurado</>
                  : <><XCircle size={12} /> Não configurado</>
                }
              </span>
            </div>
            <p className="text-gray-500 font-medium">Configure o servidor SMTP e os templates de e-mail transacional.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-[20px] font-bold shadow hover:bg-green-800 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
            Salvar configurações
          </button>
        </div>

        {/* Supabase Hook Banner */}
        <div className="bg-gradient-to-r from-[#0e6b17]/10 to-blue-50 border border-[#0e6b17]/20 rounded-[24px] p-6 flex gap-4 items-start">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Zap size={18} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 mb-1">Para OTP, recuperação de senha e e-mails de confirmação:</p>
            <p className="text-sm text-gray-600 font-medium mb-3">
              Configure o <strong>Auth Hook "Send Email"</strong> no painel do Supabase para que todos os e-mails de autenticação usem este servidor SMTP.
            </p>
            <div className="bg-white rounded-[14px] border border-gray-100 p-4 space-y-2 text-xs font-mono text-gray-700">
              <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-2">Passos no Supabase Dashboard:</p>
              <p>1. Acesse <strong>Authentication → Hooks</strong></p>
              <p>2. Clique em <strong>"Add Hook"</strong> → tipo <strong>"Send Email"</strong></p>
              <p>3. URL: <code className="bg-gray-100 px-2 py-0.5 rounded-lg">{typeof window !== 'undefined' ? window.location.origin : 'https://seu-dominio.com'}/api/auth/email-hook</code></p>
              <p>4. Método: <strong>POST</strong> — Salve e ative o hook</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-[20px] p-1.5 shadow-sm w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-sm font-bold transition-all ${
                  active ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loadError && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-[20px]">
            <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-red-700 mb-1">Erro ao conectar com o banco de dados</p>
              <p className="text-sm text-red-600 font-medium">{loadError}</p>
              <p className="text-xs text-red-500 mt-2">Verifique se a migration <code className="bg-red-100 px-1 rounded">migration_admin_settings.sql</code> foi executada no Supabase.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-green-700" />
          </div>
        ) : (
          <>
            {/* ── TAB: Servidor ── */}
            {activeTab === 'servidor' && (
              <div className="space-y-6">
                {/* Credenciais do servidor */}
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8 space-y-6">
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Server size={18} className="text-green-600" />
                    Credenciais do Servidor
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Host */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Servidor SMTP (Host)</label>
                      <input
                        type="text"
                        placeholder="smtp.exemplo.com"
                        value={config.host}
                        onChange={e => set('host', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[18px] outline-none font-bold text-sm transition-all"
                      />
                    </div>

                    {/* Port */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Porta</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={config.port}
                          onChange={e => set('port', e.target.value)}
                          className="w-28 px-5 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[18px] outline-none font-bold text-sm transition-all"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {PORT_PRESETS.map(p => (
                            <button
                              key={p.value}
                              onClick={() => set('port', p.value)}
                              className={`px-3 py-2 rounded-xl text-xs font-black transition-all border ${
                                config.port === p.value
                                  ? 'bg-green-600 text-white border-[#0e6b17]'
                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-green-600'
                              }`}
                            >
                              {p.value}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Encryption */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Criptografia</label>
                      <select
                        value={config.encryption}
                        onChange={e => set('encryption', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[18px] outline-none font-bold text-sm transition-all appearance-none"
                      >
                        <option value="TLS">TLS (recomendado)</option>
                        <option value="SSL">SSL</option>
                        <option value="none">Sem criptografia</option>
                      </select>
                    </div>

                    {/* User */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Usuário SMTP</label>
                      <input
                        type="text"
                        placeholder="usuario@exemplo.com"
                        value={config.user}
                        onChange={e => set('user', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[18px] outline-none font-bold text-sm transition-all"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••••••"
                          value={config.password}
                          onChange={e => set('password', e.target.value)}
                          className="w-full px-5 py-4 pr-12 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[18px] outline-none font-bold text-sm transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identidade do remetente */}
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8 space-y-6">
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Mail size={18} className="text-green-600" />
                    Identidade do Remetente
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome do Remetente</label>
                      <input
                        type="text"
                        placeholder="Feira.Casa"
                        value={config.from_name}
                        onChange={e => set('from_name', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[18px] outline-none font-bold text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Remetente (From)</label>
                      <input
                        type="email"
                        placeholder="noreply@feira.casa"
                        value={config.from_email}
                        onChange={e => set('from_email', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[18px] outline-none font-bold text-sm transition-all"
                      />
                    </div>
                  </div>

                  {config.from_name && config.from_email && (
                    <div className="bg-[#f6f8f5] border border-[#bfc9bd]/30 rounded-[16px] p-4 flex items-center gap-3">
                      <Mail size={16} className="text-green-600 shrink-0" />
                      <p className="text-sm text-gray-600 font-medium">
                        Os e-mails serão enviados como: <strong className="text-gray-900">{config.from_name} &lt;{config.from_email}&gt;</strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Testar conexão */}
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8 space-y-5">
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Send size={18} className="text-green-600" />
                    Testar Conexão
                  </h2>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Enviar e-mail de teste para</label>
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={testEmail}
                        onChange={e => setTestEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[18px] outline-none font-bold text-sm transition-all"
                      />
                    </div>
                    <button
                      onClick={handleTest}
                      disabled={testing || !testEmail.trim()}
                      className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-[18px] font-bold hover:bg-gray-700 transition-all disabled:opacity-40 shrink-0"
                    >
                      {testing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {testing ? 'Enviando…' : 'Enviar Teste'}
                    </button>
                  </div>

                  {testResult !== 'idle' && (
                    <div className={`flex items-center gap-3 p-4 rounded-[16px] ${
                      testResult === 'ok' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {testResult === 'ok'
                        ? <CheckCircle2 size={18} className="text-green-700 shrink-0" />
                        : <XCircle size={18} className="text-red-600 shrink-0" />
                      }
                      <p className={`text-sm font-bold ${testResult === 'ok' ? 'text-green-800' : 'text-red-700'}`}>
                        {testResult === 'ok'
                          ? `E-mail enviado com sucesso para ${testEmail}`
                          : 'Falha na conexão. Verifique as credenciais e tente novamente.'
                        }
                      </p>
                    </div>
                  )}

                  {!isConfigured && (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-[16px]">
                      <AlertTriangle size={16} className="text-yellow-600 shrink-0" />
                      <p className="text-sm font-medium text-yellow-800">Configure o servidor e salve antes de enviar um e-mail de teste.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: Templates ── */}
            {activeTab === 'templates' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 font-medium">Ative ou desative o envio automático de cada tipo de e-mail transacional.</p>

                {templates.map((tmpl, idx) => {
                  const Icon = tmpl.icon;
                  return (
                    <div key={tmpl.key} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 flex items-center gap-5">
                      <div className="w-11 h-11 bg-[#f0f7f0] rounded-2xl flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900">{tmpl.label}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{tmpl.description}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1 truncate">Assunto: {tmpl.subject}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button className="text-xs text-gray-400 hover:text-green-600 font-bold flex items-center gap-1 transition-colors">
                          Editar <ChevronRight size={12} />
                        </button>
                        <button
                          onClick={() => setTemplates(t => t.map((x, i) => i === idx ? { ...x, enabled: !x.enabled } : x))}
                          className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${tmpl.enabled ? 'bg-green-600' : 'bg-gray-200'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${tmpl.enabled ? 'translate-x-6' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-[#f6f8f5] border border-[#bfc9bd]/30 rounded-[20px] p-5 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 font-medium">
                    Os templates são enviados via servidor SMTP configurado. Certifique-se de que o servidor esteja ativo antes de ativar os envios automáticos.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: Logs ── */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center">
                    <h2 className="font-black text-gray-900">Histórico de Envios</h2>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">
                      <RefreshCw size={13} /> Atualizar
                    </button>
                  </div>

                  {/* Empty state */}
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center mb-4">
                      <Mail size={28} className="text-gray-300" />
                    </div>
                    <p className="font-black text-gray-400 text-lg">Nenhum envio registrado</p>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Os logs de e-mails enviados aparecerão aqui.</p>
                  </div>
                </div>

                <div className="bg-[#f6f8f5] border border-[#bfc9bd]/30 rounded-[20px] p-5 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 font-medium">
                    Para registrar logs de envio, será necessário uma API Route em <code className="bg-white px-1.5 py-0.5 rounded-lg font-mono text-xs">/api/email/send</code> que grave cada disparo no banco de dados.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-[20px] shadow-2xl text-white font-bold text-sm transition-all animate-in slide-in-from-bottom-4 duration-200 ${
          toast.type === 'ok' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'ok' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
