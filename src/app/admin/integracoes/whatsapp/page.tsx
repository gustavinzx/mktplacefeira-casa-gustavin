'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Wifi,
  WifiOff,
  QrCode,
  Send,
  Settings,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Phone,
  FileText,
  Eye,
  EyeOff,
  Bell,
  Plus,
  Copy,
  ChevronRight,
  MapPin,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { supabase, getTableName } from '@/lib/supabase';

type ConnectionState = 'open' | 'connecting' | 'close' | 'unknown';
type Tab = 'config' | 'instances' | 'connection' | 'templates' | 'test' | 'logs';

const EVENT_TYPE_LABELS: Record<string, string> = {
  order_confirmed: 'Pedido Confirmado',
  order_preparing: 'Pedido em Preparo',
  order_shipped: 'Saiu para Entrega',
  order_delivered: 'Pedido Entregue',
  order_cancelled: 'Pedido Cancelado',
  tracking_link: 'Link de Rastreamento',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  order_confirmed: 'bg-green-100 text-green-700',
  order_preparing: 'bg-yellow-100 text-yellow-700',
  order_shipped: 'bg-blue-100 text-blue-700',
  order_delivered: 'bg-emerald-100 text-emerald-700',
  order_cancelled: 'bg-red-100 text-red-700',
  tracking_link: 'bg-purple-100 text-purple-700',
};

export default function WhatsAppAdminPage() {
  // Config state — maps to DB columns
  const [config, setConfig] = useState({
    instance_name: 'feira-casa',
    instance_id: '',
    api_url: 'http://localhost:4000',
    admin_token: '',
    instance_token: '',
    phone_number: '',
    webhook_url: '',
  });
  const [configId, setConfigId] = useState<string | null>(null);
  const [showAdminToken, setShowAdminToken] = useState(false);
  const [showInstanceToken, setShowInstanceToken] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>('unknown');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [pairingPhone, setPairingPhone] = useState('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loadingPair, setLoadingPair] = useState(false);

  // Instances list (admin ops)
  const [instances, setInstances] = useState<any[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [newInstanceToken, setNewInstanceToken] = useState('');
  const [creatingInstance, setCreatingInstance] = useState(false);

  // Templates state
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Test message state
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testLat, setTestLat] = useState('');
  const [testLng, setTestLng] = useState('');
  const [testLocationName, setTestLocationName] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingLocation, setSendingLocation] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);

  // Active tab
  const [tab, setTab] = useState<Tab>('config');

  // Feedback
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Calls go through /api/evolution proxy to avoid CORS (browser → Next.js server → Evolution GO)
  async function instanceCall(method: string, path: string, body?: any) {
    const res = await fetch(`/api/evolution${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-evo-url': config.api_url,
        'x-evo-key': config.instance_token,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? data?.message ?? `Erro ${res.status}`);
    return data;
  }

  async function adminCall(method: string, path: string, body?: any) {
    const res = await fetch(`/api/evolution${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-evo-url': config.api_url,
        'x-evo-key': config.admin_token,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? data?.message ?? `Erro ${res.status}`);
    return data;
  }

  // ─── DB ops ───────────────────────────────────────────────────────────────

  async function loadConfig() {
    const { data } = await supabase
      .from(getTableName('whatsapp_config'))
      .select('*')
      .limit(1)
      .single();
    if (data) {
      setConfig({
        instance_name: data.instance_name ?? 'feira-casa',
        instance_id: data.instance_id ?? '',
        api_url: data.api_url ?? 'http://localhost:4000',
        admin_token: data.admin_token ?? '',
        instance_token: data.instance_token ?? '',
        phone_number: data.phone_number ?? '',
        webhook_url: data.webhook_url ?? '',
      });
      setConfigId(data.id);
    }
  }

  async function saveConfig() {
    setSavingConfig(true);
    const payload = {
      instance_name: config.instance_name,
      instance_id: config.instance_id,
      api_url: config.api_url,
      admin_token: config.admin_token,
      instance_token: config.instance_token,
      phone_number: config.phone_number,
      webhook_url: config.webhook_url,
      updated_at: new Date().toISOString(),
    };
    if (configId) {
      await supabase.from(getTableName('whatsapp_config')).update(payload).eq('id', configId);
    } else {
      const { data } = await supabase
        .from(getTableName('whatsapp_config'))
        .insert(payload)
        .select()
        .single();
      if (data) setConfigId(data.id);
    }
    setSavingConfig(false);
    showToast('Configuração salva com sucesso!');
  }

  // ─── Connection ops ───────────────────────────────────────────────────────

  async function checkConnection() {
    try {
      // GET /instance/status — instance token
      const data = await instanceCall('GET', '/instance/status');
      const state = data?.state ?? data?.status ?? 'unknown';
      if (state === 'open' || state === 'connected') setConnectionState('open');
      else if (state === 'connecting') setConnectionState('connecting');
      else setConnectionState('close');
    } catch {
      setConnectionState('unknown');
    }
  }

  async function fetchQrCode() {
    setLoadingQr(true);
    setQrCode(null);
    try {
      // GET /instance/qr — instance token
      const data = await instanceCall('GET', '/instance/qr');
      // may return { qr: "data:image/png;base64,..." } or { code: "..." }
      setQrCode(data?.qr ?? data?.code ?? null);
    } catch (e: any) {
      showToast('Erro ao buscar QR Code: ' + e.message, 'error');
    }
    setLoadingQr(false);
  }

  async function connectInstance() {
    try {
      // POST /instance/connect — instance token
      await instanceCall('POST', '/instance/connect', {
        subscribe: ['ALL'],
        webhookUrl: config.webhook_url || undefined,
      });
      showToast('Conectando... Aguarde o QR Code.');
      await fetchQrCode();
    } catch (e: any) {
      showToast('Erro ao conectar: ' + e.message, 'error');
    }
  }

  async function disconnectInstance() {
    try {
      // POST /instance/disconnect — instance token
      await instanceCall('POST', '/instance/disconnect');
      setConnectionState('close');
      showToast('Instância desconectada.');
    } catch (e: any) {
      showToast('Erro ao desconectar: ' + e.message, 'error');
    }
  }

  async function logoutInstance() {
    try {
      // DELETE /instance/logout — instance token
      await instanceCall('DELETE', '/instance/logout');
      setConnectionState('close');
      setQrCode(null);
      showToast('WhatsApp desconectado.');
    } catch (e: any) {
      showToast('Erro ao desconectar: ' + e.message, 'error');
    }
  }

  async function reconnectInstance() {
    try {
      // POST /instance/reconnect — instance token
      await instanceCall('POST', '/instance/reconnect');
      showToast('Reconectando...');
      setTimeout(checkConnection, 3000);
    } catch (e: any) {
      showToast('Erro ao reconectar: ' + e.message, 'error');
    }
  }

  async function pairByPhone() {
    if (!pairingPhone) { showToast('Informe o número para parear', 'error'); return; }
    setLoadingPair(true);
    setPairingCode(null);
    try {
      // POST /instance/pair — instance token, body: { phone: "+5511..." }
      const phone = pairingPhone.startsWith('+') ? pairingPhone : `+${pairingPhone}`;
      const data = await instanceCall('POST', '/instance/pair', { phone });
      setPairingCode(data?.code ?? data?.pairingCode ?? null);
    } catch (e: any) {
      showToast('Erro ao gerar código: ' + e.message, 'error');
    }
    setLoadingPair(false);
  }

  // ─── Admin / Instance management ─────────────────────────────────────────

  async function listInstances() {
    setLoadingInstances(true);
    try {
      // GET /instance/all — adminToken
      const data = await adminCall('GET', '/instance/all');
      setInstances(Array.isArray(data) ? data : data?.instances ?? []);
    } catch (e: any) {
      showToast('Erro ao listar instâncias: ' + e.message, 'error');
    }
    setLoadingInstances(false);
  }

  async function createInstance() {
    if (!newInstanceName) { showToast('Informe o nome da instância', 'error'); return; }
    setCreatingInstance(true);
    try {
      // POST /instance/create — adminToken, body: { instanceId?, name, token }
      const body: any = { name: newInstanceName };
      if (newInstanceToken) body.token = newInstanceToken;
      await adminCall('POST', '/instance/create', body);
      showToast('Instância criada com sucesso!');
      setNewInstanceName('');
      setNewInstanceToken('');
      await listInstances();
    } catch (e: any) {
      showToast('Erro ao criar instância: ' + e.message, 'error');
    }
    setCreatingInstance(false);
  }

  async function deleteInstance(instanceId: string) {
    try {
      // DELETE /instance/delete/:instanceId — adminToken
      await adminCall('DELETE', `/instance/delete/${instanceId}`);
      showToast('Instância excluída.');
      await listInstances();
    } catch (e: any) {
      showToast('Erro ao excluir: ' + e.message, 'error');
    }
  }

  // ─── Messaging ────────────────────────────────────────────────────────────

  async function sendTest() {
    if (!testPhone || !testMessage) {
      showToast('Preencha telefone e mensagem', 'error');
      return;
    }
    setSendingTest(true);
    try {
      // POST /send/text — instance token, body: { number, text, delay }
      await instanceCall('POST', '/send/text', {
        number: testPhone.replace(/\D/g, ''),
        text: testMessage,
        delay: 1000,
      });
      await supabase.from(getTableName('whatsapp_logs')).insert({
        phone: testPhone,
        message: testMessage,
        event_type: 'test',
        status: 'sent',
      });
      showToast('Mensagem enviada com sucesso! ✅');
      loadLogs();
    } catch (e: any) {
      await supabase.from(getTableName('whatsapp_logs')).insert({
        phone: testPhone,
        message: testMessage,
        event_type: 'test',
        status: 'failed',
        error_message: e.message,
      });
      showToast('Erro ao enviar: ' + e.message, 'error');
    }
    setSendingTest(false);
  }

  async function sendLocation() {
    if (!testPhone || !testLat || !testLng) {
      showToast('Preencha telefone, latitude e longitude', 'error');
      return;
    }
    setSendingLocation(true);
    try {
      // POST /send/location — instance token
      await instanceCall('POST', '/send/location', {
        number: testPhone.replace(/\D/g, ''),
        latitude: parseFloat(testLat),
        longitude: parseFloat(testLng),
        name: testLocationName || 'Localização do Entregador',
        delay: 1000,
      });
      await supabase.from(getTableName('whatsapp_logs')).insert({
        phone: testPhone,
        message: `[Localização] ${testLocationName || ''} lat:${testLat} lng:${testLng}`,
        event_type: 'tracking_link',
        status: 'sent',
      });
      showToast('Localização enviada! ✅');
      loadLogs();
    } catch (e: any) {
      showToast('Erro ao enviar localização: ' + e.message, 'error');
    }
    setSendingLocation(false);
  }

  // ─── Templates ────────────────────────────────────────────────────────────

  async function loadTemplates() {
    const { data } = await supabase
      .from(getTableName('whatsapp_templates'))
      .select('*')
      .order('event_type');
    setTemplates(data ?? []);
  }

  async function saveTemplate() {
    if (!editingTemplate) return;
    setSavingTemplate(true);
    if (editingTemplate.id) {
      await supabase
        .from(getTableName('whatsapp_templates'))
        .update({
          name: editingTemplate.name,
          message: editingTemplate.message,
          is_active: editingTemplate.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTemplate.id);
    } else {
      await supabase.from(getTableName('whatsapp_templates')).insert(editingTemplate);
    }
    setSavingTemplate(false);
    setEditingTemplate(null);
    loadTemplates();
    showToast('Template salvo!');
  }

  async function loadLogs() {
    const { data } = await supabase
      .from(getTableName('whatsapp_logs'))
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);
    setLogs(data ?? []);
  }

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    loadConfig();
    loadTemplates();
    loadLogs();
  }, []);

  useEffect(() => {
    if (tab === 'connection' && config.api_url && config.instance_token) {
      checkConnection();
      const interval = setInterval(checkConnection, 10000);
      return () => clearInterval(interval);
    }
  }, [tab, config.api_url, config.instance_token]);

  useEffect(() => {
    if (tab === 'instances' && config.api_url && config.admin_token) {
      listInstances();
    }
  }, [tab, config.api_url, config.admin_token]);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const connectionBadge = () => {
    switch (connectionState) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-black">
            <Wifi size={13} /> Conectado
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black">
            <Loader2 size={13} className="animate-spin" /> Conectando...
          </span>
        );
      case 'close':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-black">
            <WifiOff size={13} /> Desconectado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-black">
            <AlertTriangle size={13} /> Status Desconhecido
          </span>
        );
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'config', label: 'Configuração', icon: <Settings size={16} /> },
    { key: 'instances', label: 'Instâncias', icon: <Plus size={16} /> },
    { key: 'connection', label: 'Conexão', icon: <QrCode size={16} /> },
    { key: 'templates', label: 'Templates', icon: <FileText size={16} /> },
    { key: 'test', label: 'Mensagem de Teste', icon: <Send size={16} /> },
    { key: 'logs', label: 'Logs', icon: <Bell size={16} /> },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/marketing" className="hover:text-green-700 transition-colors">Marketing</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">WhatsApp & Notificações</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-900/20">
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">
                Integração WhatsApp
              </h1>
            </div>
          </div>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Evolution GO — Envio automático de notificações e rastreamento de pedidos
          </p>
        </div>
        <div className="flex items-center gap-3">{connectionBadge()}</div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                tab === t.key
                  ? 'border-green-700 text-green-700'
                  : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab: Configuração ── */}
      {tab === 'config' && (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 max-w-2xl space-y-6">
          <h2 className="text-lg font-black text-gray-900">Configurações da Evolution GO</h2>

          <div className="space-y-5">
            {/* URL da API */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                URL da API
              </label>
              <input
                type="text"
                value={config.api_url}
                onChange={(e) => setConfig({ ...config, api_url: e.target.value })}
                placeholder="http://localhost:4000"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all"
              />
              <p className="mt-1.5 text-xs text-gray-400 font-medium">
                Porta padrão Evolution GO: 4000
              </p>
            </div>

            {/* Admin Token */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Admin Token
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showAdminToken ? 'text' : 'password'}
                    value={config.admin_token}
                    onChange={(e) => setConfig({ ...config, admin_token: e.target.value })}
                    placeholder="Token de administrador global"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminToken(!showAdminToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showAdminToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(config.admin_token); showToast('Admin Token copiado!'); }}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  title="Copiar Admin Token"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-400 font-medium">
                Usado para criar/listar/excluir instâncias
              </p>
            </div>

            {/* Instance Token */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Instance Token
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showInstanceToken ? 'text' : 'password'}
                    value={config.instance_token}
                    onChange={(e) => setConfig({ ...config, instance_token: e.target.value })}
                    placeholder="Token da instância ativa"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowInstanceToken(!showInstanceToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showInstanceToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(config.instance_token); showToast('Instance Token copiado!'); }}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  title="Copiar Instance Token"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-400 font-medium">
                Usado para enviar mensagens, QR code, status
              </p>
            </div>

            {/* Nome da Instância */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Nome da Instância
              </label>
              <input
                type="text"
                value={config.instance_name}
                onChange={(e) => setConfig({ ...config, instance_name: e.target.value })}
                placeholder="feira-casa"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all"
              />
            </div>

            {/* Instance ID */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Instance ID
              </label>
              <input
                type="text"
                value={config.instance_id}
                onChange={(e) => setConfig({ ...config, instance_id: e.target.value })}
                placeholder="ID retornado pela API ao criar a instância"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all"
              />
              <p className="mt-1.5 text-xs text-gray-400 font-medium">
                Necessário para operações admin (info/delete)
              </p>
            </div>

            {/* Número do WhatsApp */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Número do WhatsApp
              </label>
              <input
                type="text"
                value={config.phone_number}
                onChange={(e) => setConfig({ ...config, phone_number: e.target.value })}
                placeholder="5511999999999"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all"
              />
            </div>

            {/* Webhook URL */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Webhook URL
              </label>
              <input
                type="text"
                value={config.webhook_url}
                onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
                placeholder="https://seusite.com/api/webhooks/whatsapp"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all"
              />
              <p className="mt-1.5 text-xs text-gray-400 font-medium">
                URL para receber eventos do WhatsApp (opcional)
              </p>
            </div>
          </div>

          <button
            onClick={saveConfig}
            disabled={savingConfig}
            className="flex items-center gap-2 px-8 py-4 bg-green-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all disabled:opacity-60"
          >
            {savingConfig ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {savingConfig ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      )}

      {/* ── Tab: Instâncias ── */}
      {tab === 'instances' && (
        <div className="space-y-6 max-w-3xl">
          {/* Create Instance */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-black text-gray-900 mb-6">Criar Nova Instância</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                  placeholder="ex: feira-casa"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                  Token (opcional)
                </label>
                <input
                  type="text"
                  value={newInstanceToken}
                  onChange={(e) => setNewInstanceToken(e.target.value)}
                  placeholder="Deixe vazio para gerar"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
            </div>
            <button
              onClick={createInstance}
              disabled={creatingInstance}
              className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all disabled:opacity-60"
            >
              {creatingInstance ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {creatingInstance ? 'Criando...' : 'Criar Instância'}
            </button>
          </div>

          {/* List Instances */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900">Instâncias Ativas</h2>
              <button
                onClick={listInstances}
                disabled={loadingInstances}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                <RefreshCw size={14} className={loadingInstances ? 'animate-spin' : ''} />
                Atualizar
              </button>
            </div>

            {loadingInstances ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="animate-spin text-green-700" />
              </div>
            ) : instances.length === 0 ? (
              <p className="text-sm text-gray-400 font-medium text-center py-10">
                Nenhuma instância encontrada. Verifique o Admin Token.
              </p>
            ) : (
              <div className="space-y-3">
                {instances.map((inst: any, i) => (
                  <div key={inst.id ?? inst.instanceId ?? i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="text-sm font-black text-gray-900">{inst.name ?? inst.instanceName ?? inst.id}</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{inst.id ?? inst.instanceId ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {inst.state && (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          inst.state === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {inst.state}
                        </span>
                      )}
                      <button
                        onClick={() => deleteInstance(inst.id ?? inst.instanceId)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir instância"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Conexão ── */}
      {tab === 'connection' && (
        <div className="space-y-6 max-w-2xl">
          {/* Status Card */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900">Status da Conexão</h2>
              {connectionBadge()}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={checkConnection}
                className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                <RefreshCw size={16} /> Verificar Status
              </button>
              <button
                onClick={reconnectInstance}
                className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all"
              >
                <RefreshCw size={16} /> Reconectar
              </button>
            </div>
          </div>

          {/* QR Code / Connected Panel */}
          {connectionState === 'open' ? (
            <div className="bg-white rounded-[32px] border border-green-100 shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={36} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">WhatsApp Conectado!</h3>
              {config.phone_number && (
                <p className="text-sm font-medium text-gray-500 mb-6 flex items-center justify-center gap-2">
                  <Phone size={16} /> {config.phone_number}
                </p>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={disconnectInstance}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-50 text-yellow-700 rounded-2xl font-bold text-sm hover:bg-yellow-100 transition-all"
                >
                  <WifiOff size={16} /> Desconectar
                </button>
                <button
                  onClick={logoutInstance}
                  className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all"
                >
                  <Trash2 size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
              <h3 className="text-lg font-black text-gray-900 mb-6">Conectar WhatsApp</h3>

              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={connectInstance}
                  className="flex items-center gap-2 px-5 py-3 bg-green-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all"
                >
                  <Wifi size={16} /> Conectar
                </button>
                <button
                  onClick={fetchQrCode}
                  disabled={loadingQr}
                  className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all disabled:opacity-60"
                >
                  {loadingQr ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Gerar QR Code
                </button>
              </div>

              {loadingQr && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2 size={32} className="animate-spin text-green-700" />
                  <p className="text-sm font-medium text-gray-400">Gerando QR Code...</p>
                </div>
              )}

              {!loadingQr && qrCode && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="p-4 bg-white border-4 border-green-100 rounded-2xl shadow-sm">
                    <img
                      src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                      alt="QR Code WhatsApp"
                      className="w-64 h-64 rounded-xl"
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Escaneie com o WhatsApp
                  </p>
                </div>
              )}

              {/* Phone Pairing */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-black text-gray-700 mb-4">
                  Ou conecte por código de pareamento
                </h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={pairingPhone}
                    onChange={(e) => setPairingPhone(e.target.value)}
                    placeholder="+5511999999999"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                  <button
                    onClick={pairByPhone}
                    disabled={loadingPair}
                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all disabled:opacity-60"
                  >
                    {loadingPair ? <Loader2 size={15} className="animate-spin" /> : <Phone size={15} />}
                    Parear
                  </button>
                </div>
                {pairingCode && (
                  <div className="mt-4 flex items-center gap-4 p-5 bg-green-50 border border-green-100 rounded-2xl">
                    <div>
                      <p className="text-xs font-black text-green-700 uppercase tracking-widest mb-1">
                        Código de Pareamento
                      </p>
                      <p className="text-3xl font-black text-green-800 tracking-widest">{pairingCode}</p>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(pairingCode); showToast('Código copiado!'); }}
                      className="ml-auto p-3 bg-white border border-green-200 rounded-2xl text-green-700 hover:bg-green-100 transition-all"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                )}
              </div>

              {!loadingQr && !qrCode && !pairingCode && (
                <div className="mt-6 bg-gray-50 rounded-2xl p-5">
                  <p className="text-sm font-black text-gray-700 mb-3">Como conectar:</p>
                  <ol className="space-y-2 text-sm text-gray-500 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-700 text-white rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5 font-black">1</span>
                      Clique em "Conectar" e depois "Gerar QR Code"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-700 text-white rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5 font-black">2</span>
                      Abra o WhatsApp no celular → ⋮ → Aparelhos Conectados
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-700 text-white rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5 font-black">3</span>
                      Escaneie o QR Code ou use o código de pareamento
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Templates ── */}
      {tab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-xs font-black text-blue-700 uppercase tracking-widest mb-3">
              Variáveis disponíveis
            </p>
            <div className="flex flex-wrap gap-2">
              {['{{customer_name}}', '{{order_number}}', '{{total}}', '{{address}}', '{{tracking_link}}', '{{reason}}', '{{review_link}}'].map((v) => (
                <code key={v} className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-700">
                  {v}
                </code>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setEditingTemplate({ name: '', event_type: 'order_confirmed', message: '', is_active: true })}
              className="flex items-center gap-2 px-5 py-3 bg-green-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all"
            >
              <Plus size={16} /> Novo Template
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 flex items-start gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${EVENT_TYPE_COLORS[tpl.event_type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {EVENT_TYPE_LABELS[tpl.event_type] ?? tpl.event_type}
                    </span>
                    {!tpl.is_active && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-[10px] font-bold">Inativo</span>
                    )}
                  </div>
                  <p className="text-sm font-black text-gray-900 mb-1">{tpl.name}</p>
                  <p className="text-xs text-gray-400 font-medium line-clamp-2">
                    {tpl.message.slice(0, 100)}{tpl.message.length > 100 ? '...' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setEditingTemplate({ ...tpl })}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-100 hover:text-gray-900 transition-all shrink-0"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>

          {editingTemplate && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingTemplate(null)} />
              <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-gray-100 p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-gray-900">
                    {editingTemplate.id ? 'Editar Template' : 'Novo Template'}
                  </h3>
                  <button onClick={() => setEditingTemplate(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all">
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Nome do Template</label>
                  <input type="text" value={editingTemplate.name} onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Tipo de Evento</label>
                  <select value={editingTemplate.event_type} onChange={(e) => setEditingTemplate({ ...editingTemplate, event_type: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all">
                    {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Mensagem</label>
                  <textarea value={editingTemplate.message} onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })} rows={8} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div onClick={() => setEditingTemplate({ ...editingTemplate, is_active: !editingTemplate.is_active })} className={`w-10 h-6 rounded-full transition-colors relative ${editingTemplate.is_active ? 'bg-green-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${editingTemplate.is_active ? 'left-5' : 'left-1'}`} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{editingTemplate.is_active ? 'Ativo' : 'Inativo'}</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={saveTemplate} disabled={savingTemplate} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all disabled:opacity-60">
                    {savingTemplate ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {savingTemplate ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button onClick={() => setEditingTemplate(null)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Mensagem de Teste ── */}
      {tab === 'test' && (
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
            <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-yellow-700">
              Certifique-se de que o WhatsApp está conectado antes de enviar.
            </p>
          </div>

          {/* Text message */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-5">
            <h2 className="text-lg font-black text-gray-900">Enviar Mensagem de Texto</h2>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Número de Destino</label>
              <input type="text" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="5511999999999" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all" />
              <p className="mt-1.5 text-xs text-gray-400 font-medium">55 DDD NUMERO — ex: 5511999999999</p>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Mensagem</label>
              <textarea value={testMessage} onChange={(e) => setTestMessage(e.target.value)} rows={5} placeholder="Digite a mensagem de teste..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none" />
            </div>

            {templates.length > 0 && (
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Preencher com template</p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((tpl) => (
                    <button key={tpl.id} onClick={() => setTestMessage(tpl.message)} className="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all">
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={sendTest}
              disabled={sendingTest}
              className="flex items-center gap-2 px-8 py-4 bg-green-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all disabled:opacity-60"
            >
              {sendingTest ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {sendingTest ? 'Enviando...' : 'Enviar Mensagem de Teste'}
            </button>
          </div>

          {/* Location message */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
                <MapPin size={16} />
              </div>
              <h2 className="text-lg font-black text-gray-900">Enviar Localização (Rastreamento)</h2>
            </div>
            <p className="text-xs text-gray-400 font-medium -mt-2">
              Usado para enviar a posição GPS do entregador em tempo real
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Latitude</label>
                <input type="text" value={testLat} onChange={(e) => setTestLat(e.target.value)} placeholder="-23.5505" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Longitude</label>
                <input type="text" value={testLng} onChange={(e) => setTestLng(e.target.value)} placeholder="-46.6333" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Nome do Local</label>
              <input type="text" value={testLocationName} onChange={(e) => setTestLocationName(e.target.value)} placeholder="Localização do Entregador" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 transition-all" />
            </div>

            <button
              onClick={sendLocation}
              disabled={sendingLocation}
              className="flex items-center gap-2 px-8 py-4 bg-purple-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-900/20 hover:bg-purple-800 transition-all disabled:opacity-60"
            >
              {sendingLocation ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
              {sendingLocation ? 'Enviando...' : 'Enviar Localização'}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Logs ── */}
      {tab === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={loadLogs} className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              <RefreshCw size={16} /> Atualizar
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                  <MessageSquare size={40} />
                </div>
                <p className="text-sm font-bold text-gray-400">Nenhuma mensagem registrada ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data/Hora</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefone</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                          {new Date(log.sent_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{log.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${EVENT_TYPE_COLORS[log.event_type ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
                            {EVENT_TYPE_LABELS[log.event_type ?? ''] ?? log.event_type ?? 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {log.status === 'sent' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black">
                              <Check size={10} /> Enviado
                            </span>
                          )}
                          {log.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black">
                              <X size={10} /> Falha
                            </span>
                          )}
                          {log.status === 'delivered' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black">
                              <Check size={10} /> Entregue
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-medium max-w-xs truncate">
                          {log.message.slice(0, 80)}{log.message.length > 80 ? '...' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold text-white transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${toast.type === 'success' ? 'bg-green-700' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
