import { useCurrentUser } from '@/hooks/useCurrentUser';
'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Phone, Mail, Lock, Check, Loader2, X,
  Store, Truck, Building2, ArrowRight, Leaf, ChefHat,
  AlertCircle, ExternalLink,
} from 'lucide-react';
import { supabase, supabaseAdmin, getTableName } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface B2CProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  cpf: string | null;
}

type ModalType = 'dados' | 'senha' | 'feirante' | 'fornecedor' | null;

const INPUT = 'w-full px-4 py-3 bg-[#f5f4ef] border border-transparent rounded-xl outline-none text-sm font-medium text-[#1b1c19] focus:border-[#125d30]/40 focus:bg-white transition-all';

export default function UsuarioPerfil() {
  const router = useRouter();
  const [profile, setProfile] = useState<B2CProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({ full_name: '', phone: '', cpf: '' });
  const [senhaForm, setSenhaForm] = useState({ current: '', new: '', confirm: '' });

  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || '' : '';

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabaseAdmin
      .from(getTableName('userb2c'))
      .select('id, email, full_name, phone, cpf')
      .eq('id', userId)
      .single()
      .then((res: any) => {
        const data = res.data;
        if (data) {
          const p = data as B2CProfile;
          setProfile(p);
          setForm({ full_name: p.full_name || '', phone: p.phone || '', cpf: p.cpf || '' });
        }
        setLoading(false);
      });
  }, [userId]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function saveDados() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabaseAdmin
      .from(getTableName('userb2c'))
      .update({ full_name: form.full_name, phone: form.phone, cpf: form.cpf })
      .eq('id', userId);
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...form } : prev);
      localStorage.setItem('user_name', form.full_name);
      showToast('Dados atualizados com sucesso!');
      setModal(null);
    }
    setSaving(false);
  }

  async function saveSenha() {
    if (senhaForm.new !== senhaForm.confirm) {
      showToast('As senhas não coincidem.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: senhaForm.new });
    if (!error) {
      showToast('Senha alterada com sucesso!');
      setModal(null);
      setSenhaForm({ current: '', new: '', confirm: '' });
    } else {
      showToast('Erro ao alterar senha.');
    }
    setSaving(false);
  }

  const initials = (profile?.full_name || '?').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-[#125d30]" size={36} />
      </div>
    );
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">

      {/* Profile header */}
      <div className="bg-white rounded-3xl border border-[#efeee9] p-8 mb-6 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-[#fc6c29] flex items-center justify-center text-white font-black text-2xl shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-[#1b1c19]">{profile?.full_name || 'Sem nome'}</h1>
          <p className="text-sm text-[#707a6f] font-medium mt-1 flex items-center gap-2">
            <Mail size={13} /> {profile?.email}
          </p>
          {profile?.phone && (
            <p className="text-sm text-[#707a6f] font-medium mt-0.5 flex items-center gap-2">
              <Phone size={13} /> {profile.phone}
            </p>
          )}
        </div>
        <button
          onClick={() => setModal('dados')}
          className="px-5 py-2.5 bg-[#125d30] text-white rounded-xl font-bold text-sm hover:bg-[#0e4a26] transition-colors"
        >
          Editar Perfil
        </button>
      </div>

      {/* Data cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-3xl border border-[#efeee9] p-6">
          <h3 className="font-black text-[#1b1c19] mb-4 flex items-center gap-2"><User size={16} className="text-[#125d30]" /> Dados Pessoais</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#707a6f] font-medium">Nome completo</span>
              <span className="font-bold text-[#1b1c19]">{profile?.full_name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#707a6f] font-medium">CPF</span>
              <span className="font-bold text-[#1b1c19]">{profile?.cpf || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#707a6f] font-medium">Telefone</span>
              <span className="font-bold text-[#1b1c19]">{profile?.phone || '—'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#efeee9] p-6">
          <h3 className="font-black text-[#1b1c19] mb-4 flex items-center gap-2"><Lock size={16} className="text-[#125d30]" /> Segurança</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#707a6f] font-medium">E-mail de acesso</span>
              <span className="font-bold text-[#1b1c19] text-xs">{profile?.email}</span>
            </div>
            <div className="pt-2 border-t border-[#efeee9]">
              <button
                onClick={() => setModal('senha')}
                className="w-full py-2.5 bg-[#f5f4ef] text-[#1b1c19] rounded-xl font-bold text-sm hover:bg-[#efeee9] transition-colors"
              >
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── UPGRADE SECTION ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-[#efeee9] p-8">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[#1b1c19]">Expanda sua conta</h2>
          <p className="text-sm text-[#707a6f] font-medium mt-1">
            Sua conta atual é de comprador. Transforme-a em muito mais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Tornar-se Feirante */}
          <div className="border-2 border-[#efeee9] rounded-2xl p-6 hover:border-[#125d30]/40 transition-all group">
            <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4">
              <Leaf size={24} className="text-[#125d30]" />
            </div>
            <h3 className="font-black text-[#1b1c19] mb-2">Seja Feirante</h3>
            <p className="text-xs text-[#707a6f] font-medium leading-relaxed mb-5">
              Venda seus produtos diretamente para consumidores locais. Monte sua banca digital em minutos.
            </p>
            <button
              onClick={() => setModal('feirante')}
              className="w-full py-2.5 bg-[#125d30] text-white rounded-xl font-bold text-sm hover:bg-[#0e4a26] transition-colors flex items-center justify-center gap-2"
            >
              Quero ser Feirante <ArrowRight size={14} />
            </button>
          </div>

          {/* Tornar-se Fornecedor */}
          <div className="border-2 border-[#efeee9] rounded-2xl p-6 hover:border-orange-400/40 transition-all group">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
              <Truck size={24} className="text-orange-500" />
            </div>
            <h3 className="font-black text-[#1b1c19] mb-2">Seja Fornecedor</h3>
            <p className="text-xs text-[#707a6f] font-medium leading-relaxed mb-5">
              Forneça insumos e produtos para feirantes e restaurantes do ecossistema Feira.Casa em atacado.
            </p>
            <button
              onClick={() => setModal('fornecedor')}
              className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              Quero ser Fornecedor <ArrowRight size={14} />
            </button>
          </div>

          {/* Ser Franqueado */}
          <div className="border-2 border-[#efeee9] rounded-2xl p-6 hover:border-blue-400/40 transition-all group">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Building2 size={24} className="text-blue-600" />
            </div>
            <h3 className="font-black text-[#1b1c19] mb-2">Seja Franqueado</h3>
            <p className="text-xs text-[#707a6f] font-medium leading-relaxed mb-5">
              Opere o Feira.Casa em sua cidade. Modelo de negócio comprovado com suporte completo da rede.
            </p>
            <a
              href="#franqueados"
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Saber mais <ExternalLink size={14} />
            </a>
          </div>

        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────── */}

      {/* Editar dados */}
      {modal === 'dados' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="bg-white w-[80vw] h-[80vh] rounded-3xl shadow-2xl relative z-10 p-8 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#1b1c19]">Editar Dados</h3>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-[#f5f4ef] rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-[#707a6f] uppercase tracking-widest block mb-1.5">Nome completo</label>
                <input className={INPUT} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#707a6f] uppercase tracking-widest block mb-1.5">Telefone / WhatsApp</label>
                <input className={INPUT} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#707a6f] uppercase tracking-widest block mb-1.5">CPF</label>
                <input className={INPUT} value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-3 bg-[#f5f4ef] text-[#707a6f] rounded-xl font-bold text-sm">Cancelar</button>
              <button onClick={saveDados} disabled={saving} className="flex-1 py-3 bg-[#125d30] text-white rounded-xl font-bold text-sm hover:bg-[#0e4a26] disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alterar senha */}
      {modal === 'senha' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="bg-white w-[80vw] h-[80vh] rounded-3xl shadow-2xl relative z-10 p-8 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#1b1c19]">Alterar Senha</h3>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-[#f5f4ef] rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-[#707a6f] uppercase tracking-widest block mb-1.5">Nova senha</label>
                <input type="password" className={INPUT} value={senhaForm.new} onChange={e => setSenhaForm(f => ({ ...f, new: e.target.value }))} />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#707a6f] uppercase tracking-widest block mb-1.5">Confirmar nova senha</label>
                <input type="password" className={INPUT} value={senhaForm.confirm} onChange={e => setSenhaForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-3 bg-[#f5f4ef] text-[#707a6f] rounded-xl font-bold text-sm">Cancelar</button>
              <button onClick={saveSenha} disabled={saving} className="flex-1 py-3 bg-[#125d30] text-white rounded-xl font-bold text-sm hover:bg-[#0e4a26] disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Feirante */}
      {modal === 'feirante' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="bg-white w-[80vw] h-[80vh] rounded-3xl shadow-2xl relative z-10 p-8 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#f0faf4] rounded-2xl flex items-center justify-center"><Leaf size={24} className="text-[#125d30]" /></div>
                <div>
                  <h3 className="text-xl font-black text-[#1b1c19]">Tornar-se Feirante</h3>
                  <p className="text-xs text-[#707a6f] font-medium">Venda direto para consumidores locais</p>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-[#f5f4ef] rounded-xl"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-6">
              {[
                'Monte sua banca digital com fotos e preços',
                'Participe de feiras e eventos na sua cidade',
                'Receba pedidos e pagamentos pelo app',
                'Logística integrada — nós cuidamos da entrega',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-[#1b1c19] font-medium">
                  <div className="w-5 h-5 bg-[#f0faf4] rounded-full flex items-center justify-center shrink-0">
                    <Check size={11} className="text-[#125d30]" strokeWidth={3} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
            <a
              href="/cadastro/feirante"
              className="w-full py-3.5 bg-[#125d30] text-white rounded-xl font-black text-sm hover:bg-[#0e4a26] transition-colors flex items-center justify-center gap-2"
            >
              Criar minha conta de Feirante <ArrowRight size={16} />
            </a>
            <p className="text-center text-[10px] text-[#707a6f] mt-3 font-medium">Você será redirecionado para o cadastro de feirante.</p>
          </div>
        </div>
      )}

      {/* Modal Fornecedor */}
      {modal === 'fornecedor' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="bg-white w-[80vw] h-[80vh] rounded-3xl shadow-2xl relative z-10 p-8 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center"><Truck size={24} className="text-orange-500" /></div>
                <div>
                  <h3 className="text-xl font-black text-[#1b1c19]">Tornar-se Fornecedor</h3>
                  <p className="text-xs text-[#707a6f] font-medium">Canal B2B — venda em atacado</p>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-[#f5f4ef] rounded-xl"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-6">
              {[
                'Forneça insumos para feirantes e restaurantes',
                'Gerencie pedidos B2B com prazo de faturamento',
                'Visibilidade para toda a rede Feira.Casa',
                'Painel dedicado com relatórios de vendas',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-[#1b1c19] font-medium">
                  <div className="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                    <Check size={11} className="text-orange-500" strokeWidth={3} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
            <div className="bg-[#f0faf4] border border-[#125d30]/20 rounded-2xl p-4 mb-5 flex items-start gap-3">
              <AlertCircle size={16} className="text-[#125d30] shrink-0 mt-0.5" />
              <p className="text-xs text-[#0e4a26] font-medium">Você será redirecionado para a plataforma de integração B2B.</p>
            </div>
            <a
              href="/cadastro/feirante"
              className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-black text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              Iniciar Cadastro <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 bg-[#125d30] text-white rounded-2xl shadow-2xl text-sm font-bold animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check size={16} />
          {toast}
        </div>
      )}

    </div>
  );
}
