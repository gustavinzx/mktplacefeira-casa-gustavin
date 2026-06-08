'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchCep, formatCep } from '@/lib/cep';
import { supabase } from '@/lib/supabase';
import {
  User, Mail, Phone, ShieldCheck, Camera, Lock, Bell,
  Globe, CreditCard, Save, CheckCircle2, AlertCircle,
  ExternalLink, ChevronRight, LogOut, BarChart3, MapPin,
  Loader2
} from 'lucide-react';

const FIELD_CLS = 'w-full px-6 py-4 bg-white border border-[#bfc9bd]/30 rounded-2xl text-[15px] font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0b612e]/10 focus:border-[#0b612e]/30 transition-all';
const LABEL_CLS = 'text-[12px] font-black text-[#707a6f] uppercase tracking-widest ml-1';

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState('dados');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [form, setForm] = useState({
    admin_nome: '',
    admin_email: '',
    admin_whatsapp: '',
    admin_departamento: '',
    admin_cargo: '',
    admin_bio: '',
    admin_cep: '',
    admin_logradouro: '',
    admin_numero: '',
    admin_complemento: '',
    admin_bairro: '',
    admin_cidade: '',
    admin_estado: '',
    admin_cpf: '',
    admin_data_nascimento: '',
    admin_genero: '',
  });

  async function handleAdminCep(raw: string) {
    const formatted = formatCep(raw);
    set('admin_cep', formatted);
    const data = await fetchCep(formatted);
    if (data) {
      set('admin_logradouro', data.logradouro);
      set('admin_bairro', data.bairro);
      set('admin_cidade', data.localidade);
      set('admin_estado', data.uf);
    }
  }

  const [security, setSecurity] = useState({ senhaAtual: '', novaSenha: '' });
  const [notifs, setNotifs] = useState({
    emailSales: true, emailSecurity: true, pushUpdates: true,
    whatsappAlerts: false, dailyReport: true,
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      const userId = user?.id;
      const userEmail = user?.email;

      if (!userId) {
        setLoading(false);
        return;
      }

      const res = await fetch('/api/admin-profile', {
        headers: {
          'x-user-id': userId,
          'x-user-email': userEmail || ''
        }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setForm(prev => ({
          ...prev,
          admin_nome: json.data.admin_nome ?? '',
          admin_email: json.data.admin_email ?? '',
          admin_whatsapp: json.data.admin_whatsapp ?? '',
          admin_departamento: json.data.admin_departamento ?? '',
          admin_cargo: json.data.admin_cargo ?? '',
          admin_bio: json.data.admin_bio ?? '',
          admin_cep: json.data.admin_cep ?? '',
          admin_logradouro: json.data.admin_logradouro ?? '',
          admin_numero: json.data.admin_numero ?? '',
          admin_complemento: json.data.admin_complemento ?? '',
          admin_bairro: json.data.admin_bairro ?? '',
          admin_cidade: json.data.admin_cidade ?? '',
          admin_estado: json.data.admin_estado ?? '',
          admin_cpf: json.data.admin_cpf ?? '',
          admin_data_nascimento: json.data.admin_data_nascimento ?? '',
          admin_genero: json.data.admin_genero ?? '',
        }));
      }
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      const userId = user?.id;
      const userEmail = user?.email;

      const res = await fetch('/api/admin-profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId || '',
          'x-user-email': userEmail || ''
        },
        body: JSON.stringify(form),
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

  const tabs = [
    { id: 'dados', label: 'Dados Pessoais', icon: User },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'seguranca', label: 'Segurança', icon: Lock },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'preferencias', label: 'Preferências', icon: Globe },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#b7ffc1] text-green-700 rounded-lg">
              <User size={20} />
            </div>
            <span className="text-[12px] font-black text-green-700 uppercase tracking-widest">Configurações da Conta</span>
          </div>
          <h2 className="text-[36px] font-black text-gray-900 tracking-tight leading-tight">Meu Perfil</h2>
          <p className="text-[16px] font-medium text-[#404940] mt-1">Gerencie suas informações pessoais e configurações de segurança.</p>
        </div>

        {status !== 'idle' && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border animate-in fade-in zoom-in duration-300 ${
            status === 'success'
              ? 'bg-green-50 text-green-700 border-green-100'
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="text-sm font-bold">
              {status === 'success' ? 'Alterações salvas com sucesso!' : 'Erro ao salvar. Tente novamente.'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[14px] font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-green-700 text-white shadow-xl shadow-green-900/10'
                  : 'text-[#707a6f] hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
          <div className="pt-8">
            <button className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[14px] font-bold text-red-500 hover:bg-red-50 transition-all">
              <LogOut size={18} />
              Sair da Conta
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9 space-y-8">

          {/* Profile card */}
          <div className="bg-white p-10 rounded-[40px] border border-[#bfc9bd]/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <span className="px-4 py-1.5 bg-[#b7ffc1] text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-[#0b612e]/10">
                Acesso Master
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-[#fff8f5] shadow-xl relative">
                  <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center text-white border-2 border-white shadow-lg">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-gray-900">{form.admin_nome || 'Admin Central'}</h3>
                <p className="text-[#707a6f] font-medium mb-4">{form.admin_cargo || 'Administrador do Sistema'}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-[#bfc9bd]/10">
                    <Mail size={14} className="text-green-700" />
                    <span className="text-[13px] font-bold text-gray-900">{form.admin_email || 'admin@feira.casa'}</span>
                  </div>
                  {form.admin_whatsapp && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-[#bfc9bd]/10">
                      <Phone size={14} className="text-green-700" />
                      <span className="text-[13px] font-bold text-gray-900">{form.admin_whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-50 p-10 rounded-[40px] border border-[#bfc9bd]/20 space-y-10">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="animate-spin text-green-700" />
              </div>
            ) : (
              <>
                {/* ── DADOS PESSOAIS ── */}
                {activeTab === 'dados' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Nome Completo</label>
                        <input type="text" value={form.admin_nome} onChange={e => set('admin_nome', e.target.value)} className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>E-mail</label>
                        <input type="email" value={form.admin_email} onChange={e => set('admin_email', e.target.value)} className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Telefone / WhatsApp</label>
                        <input type="tel" value={form.admin_whatsapp} onChange={e => set('admin_whatsapp', e.target.value)} placeholder="+55 (62) 99999-0000" className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>CPF / Documento</label>
                        <input type="text" value={form.admin_cpf} onChange={e => set('admin_cpf', e.target.value)} placeholder="000.000.000-00" className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Data de Nascimento</label>
                        <input type="date" value={form.admin_data_nascimento} onChange={e => set('admin_data_nascimento', e.target.value)} className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Gênero</label>
                        <select value={form.admin_genero} onChange={e => set('admin_genero', e.target.value)} className={FIELD_CLS}>
                          <option value="">Selecione...</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="outro">Outro</option>
                          <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Cargo</label>
                        <input type="text" value={form.admin_cargo} onChange={e => set('admin_cargo', e.target.value)} placeholder="Ex: Gestor de Operações" className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Departamento</label>
                        <input type="text" value={form.admin_departamento} onChange={e => set('admin_departamento', e.target.value)} placeholder="Ex: Gestão de Tecnologia" className={FIELD_CLS} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={LABEL_CLS}>Biografia Curta</label>
                      <textarea
                        rows={4}
                        value={form.admin_bio}
                        onChange={e => set('admin_bio', e.target.value)}
                        placeholder="Breve descrição exibida em logs de auditoria..."
                        className={`${FIELD_CLS} resize-none`}
                      />
                    </div>
                  </div>
                )}

                {/* ── ENDEREÇO ── */}
                {activeTab === 'endereco' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>CEP</label>
                        <input type="text" value={form.admin_cep} onChange={e => handleAdminCep(e.target.value)} placeholder="00000-000" className={FIELD_CLS} maxLength={9} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className={LABEL_CLS}>Logradouro</label>
                        <input type="text" value={form.admin_logradouro} onChange={e => set('admin_logradouro', e.target.value)} placeholder="Rua, Avenida, etc." className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Número</label>
                        <input type="text" value={form.admin_numero} onChange={e => set('admin_numero', e.target.value)} placeholder="Ex: 123" className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className={LABEL_CLS}>Complemento</label>
                        <input type="text" value={form.admin_complemento} onChange={e => set('admin_complemento', e.target.value)} placeholder="Apto, Sala, etc. (opcional)" className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Bairro</label>
                        <input type="text" value={form.admin_bairro} onChange={e => set('admin_bairro', e.target.value)} className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Cidade</label>
                        <input type="text" value={form.admin_cidade} onChange={e => set('admin_cidade', e.target.value)} className={FIELD_CLS} />
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Estado (UF)</label>
                        <input type="text" value={form.admin_estado} onChange={e => set('admin_estado', e.target.value)} placeholder="GO" maxLength={2} className={FIELD_CLS} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SEGURANÇA ── */}
                {activeTab === 'seguranca' && (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="bg-white p-8 rounded-3xl border border-[#bfc9bd]/10 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-green-700">
                          <ShieldCheck size={28} />
                        </div>
                        <div>
                          <h4 className="text-[18px] font-black text-gray-900">Autenticação de Dois Fatores (2FA)</h4>
                          <p className="text-[14px] font-medium text-[#707a6f]">Proteja sua conta com uma camada extra de segurança.</p>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" id="2fa" />
                        <label htmlFor="2fa" className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-700 cursor-pointer" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-[16px] font-black text-gray-900 uppercase tracking-widest">Alterar Senha</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className={LABEL_CLS}>Senha Atual</label>
                          <input type="password" placeholder="••••••••" value={security.senhaAtual} onChange={e => setSecurity(p => ({ ...p, senhaAtual: e.target.value }))} className={FIELD_CLS} />
                        </div>
                        <div className="space-y-2">
                          <label className={LABEL_CLS}>Nova Senha</label>
                          <input type="password" placeholder="Mínimo 8 caracteres" value={security.novaSenha} onChange={e => setSecurity(p => ({ ...p, novaSenha: e.target.value }))} className={FIELD_CLS} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── NOTIFICAÇÕES ── */}
                {activeTab === 'notificacoes' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    {([
                      { id: 'emailSales', title: 'Alertas de Vendas B2B', desc: 'Receber e-mail a cada novo pedido corporativo aprovado.', icon: Mail },
                      { id: 'emailSecurity', title: 'Segurança da Conta', desc: 'Alertas sobre logins suspeitos ou trocas de senha.', icon: ShieldCheck },
                      { id: 'pushUpdates', title: 'Notificações Push', desc: 'Alertas no navegador sobre novos feirantes solicitando adesão.', icon: Bell },
                      { id: 'whatsappAlerts', title: 'Alertas via WhatsApp', desc: 'Receber resumo de alertas críticos direto no celular.', icon: Phone },
                      { id: 'dailyReport', title: 'Relatório Diário', desc: 'E-mail matinal com resumo de vendas e logística.', icon: BarChart3 },
                    ] as const).map(item => (
                      <div key={item.id} className="bg-white p-6 rounded-3xl border border-[#bfc9bd]/10 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="p-3 bg-gray-50 text-green-700 rounded-xl">
                            <item.icon size={20} />
                          </div>
                          <div>
                            <h5 className="text-[15px] font-black text-gray-900">{item.title}</h5>
                            <p className="text-[13px] font-medium text-[#707a6f]">{item.desc}</p>
                          </div>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id={item.id}
                            checked={notifs[item.id]}
                            onChange={e => setNotifs(p => ({ ...p, [item.id]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <label htmlFor={item.id} className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-700 cursor-pointer" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── PREFERÊNCIAS ── */}
                {activeTab === 'preferencias' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Idioma do Sistema</label>
                        <select className={FIELD_CLS}>
                          <option>Português (Brasil)</option>
                          <option>English (US)</option>
                          <option>Español</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Fuso Horário</label>
                        <select className={FIELD_CLS}>
                          <option>(GMT-03:00) São Paulo</option>
                          <option>(GMT-04:00) Manaus</option>
                          <option>(GMT+00:00) London</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Save */}
            <div className="pt-6 border-t border-[#bfc9bd]/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[13px] font-medium text-[#707a6f] flex items-center gap-2">
                <AlertCircle size={14} className="text-[#904d00]" />
                Algumas alterações podem exigir um novo login.
              </p>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-[14px] font-black uppercase tracking-widest transition-all shadow-xl ${
                  saving || loading
                    ? 'bg-gray-100 text-gray-400 shadow-none'
                    : 'bg-green-700 text-white shadow-green-900/20 hover:bg-[#2d7a44] hover:scale-105 active:scale-95'
                }`}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>

          {/* External links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[32px] border border-[#bfc9bd]/20 flex items-center justify-between group cursor-pointer hover:border-[#0b612e]/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ExternalLink size={20} /></div>
                <span className="text-[14px] font-black text-gray-900">Ver Logs de Auditoria</span>
              </div>
              <ChevronRight size={16} className="text-[#bfc9bd] group-hover:text-green-700 transition-all" />
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-[#bfc9bd]/20 flex items-center justify-between group cursor-pointer hover:border-[#0b612e]/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><CreditCard size={20} /></div>
                <span className="text-[14px] font-black text-gray-900">Gerenciar Assinaturas</span>
              </div>
              <ChevronRight size={16} className="text-[#bfc9bd] group-hover:text-green-700 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
