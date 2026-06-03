'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  HelpCircle,
  ShieldCheck,
  Store,
  MapPin,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { supabase, supabaseAdmin, getTableName } from '@/lib/supabase';

type View = 'signup' | 'confirm' | 'login' | 'forgot';

export default function CadastroFeirantePage() {
  const router = useRouter();
  const [view, setView] = useState<View>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    bancaName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ─── Cadastro ──────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // 1. Criar usuário no Supabase Auth
      // user_type 'vendor' é reconhecido pelo trigger handle_new_user
      // que insere automaticamente em mktplace_feira_partners
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            user_type: 'vendor',
            banca_name: formData.bancaName,
            business_name: formData.bancaName
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          throw new Error('Este e-mail já está cadastrado. Faça login.');
        }
        throw new Error(authError.message || 'Erro ao criar conta.');
      }

      // Inserir diretamente na tabela de feirantes (fallback para quando o trigger
      // do Supabase não está configurado ou o signUp retornou user sem session)
      if (authData.user) {
        const { error: partnerError } = await supabaseAdmin
          .from(getTableName('producers'))
          .upsert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.name,
            phone: formData.phone,
            business_name: formData.bancaName,
            stall_name: formData.bancaName,
            user_type: 'vendor',
            status: 'pending'
          }, { onConflict: 'id' });

        if (partnerError) {
          // Se falhou provavelmente o trigger já inseriu — não é erro crítico
          console.warn('[Cadastro] upsert partners:', partnerError.message);
        }
      }

      // Tentar login automático imediato (funciona se "Email Confirmations" estiver desabilitado no Supabase)
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (!loginError && loginData.session) {
        // Login automático funcionou — redireciona direto
        localStorage.setItem('user_role', 'feirante');
        localStorage.setItem('user_name', formData.name);
        localStorage.setItem('user_id', authData.user?.id || '');
        document.cookie = 'feira_role=feirante; path=/; max-age=86400; SameSite=Lax';
        router.push('/portal/feirante');
      } else {
        // Email confirmation está habilitado no Supabase — mostrar tela de confirmação
        setView('confirm');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password ───────────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setLoading(true);
    setError('');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${origin}/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); } else { setForgotSent(true); }
  };

  // ─── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (
          authError.message.includes('Email not confirmed') ||
          authError.message.includes('email_not_confirmed')
        ) {
          throw new Error('E-mail ainda não confirmado. Verifique sua caixa de entrada e clique no link de ativação.');
        }
        if (
          authError.message.includes('Invalid login credentials') ||
          authError.message.includes('invalid_credentials')
        ) {
          throw new Error('E-mail ou senha incorretos. Verifique os dados e tente novamente.');
        }
        throw new Error('Erro ao fazer login. Tente novamente.');
      }

      if (!authData.user) throw new Error('Usuário não encontrado.');

      // Verificar se existe na tabela de feirantes (user_type 'vendor')
      const { data: partner } = await supabaseAdmin
        .from(getTableName('producers'))
        .select('id, full_name, status, user_type')
        .or(`id.eq.${authData.user.id},user_id.eq.${authData.user.id}`)
        .maybeSingle();

      if (!partner) {
        await supabase.auth.signOut();
        throw new Error('Conta não encontrada como feirante. Verifique seu cadastro ou use o e-mail correto.');
      }

      localStorage.setItem('user_role', 'feirante');
      localStorage.setItem('user_name', partner?.full_name || authData.user.user_metadata?.full_name || '');
      localStorage.setItem('user_id', authData.user.id);
      document.cookie = 'feira_role=feirante; path=/; max-age=86400; SameSite=Lax';

      router.push('/portal/feirante');
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9f8] flex flex-col font-['Be_Vietnam_Pro'] text-[#404940]">
      {/* Header */}
      <header className="w-full px-10 py-8 flex justify-between items-center bg-transparent">
        <Link href="/" className="text-2xl font-bold text-[#125d30] font-['Plus_Jakarta_Sans']">
          feira.casa
        </Link>
        <div className="bg-white p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-sm">
          <HelpCircle size={22} className="text-[#707a6f]" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-6 pb-12">
        <div
          style={{ display: 'flex', flexDirection: 'row', minHeight: '700px' }}
          className="w-full max-w-[1100px] bg-white rounded-[40px] overflow-hidden shadow-2xl border border-gray-100"
        >
          {/* Lado esquerdo: imagem */}
          <div style={{ flex: '1', position: 'relative', overflow: 'hidden' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#125d30]/95 via-[#125d30]/60 to-[#125d30]/30 z-10" />
            <img
              src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1000&auto=format&fit=crop"
              alt="Feira Livre"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 p-12 flex flex-col justify-between text-white">
              <div>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest mb-6 inline-block">
                  Canal do Produtor
                </span>
                <h1 className="text-[48px] font-black leading-[1] mb-6 font-['Plus_Jakarta_Sans'] tracking-tight">
                  Sua banca <br /> agora é digital.
                </h1>
                <p className="text-lg opacity-90 max-w-[380px] font-medium leading-relaxed">
                  Aumente suas vendas conectando sua produção diretamente com milhares de famílias na sua região.
                </p>
              </div>
              <div className="space-y-6 bg-black/10 backdrop-blur-xl p-8 rounded-[32px] border border-white/10">
                {[
                  { icon: Store, color: 'bg-green-500', title: 'Gestão Simplificada', desc: 'Controle estoque e pedidos em um só lugar.' },
                  { icon: MapPin, color: 'bg-blue-500', title: 'Logística Integrada', desc: 'Nós cuidamos da entrega para você.' },
                  { icon: CheckCircle2, color: 'bg-orange-500', title: 'Pagamento Garantido', desc: 'Receba direto na sua conta, sem complicações.' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black">{title}</p>
                      <p className="text-xs opacity-70">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lado direito: formulário */}
          <div style={{ flex: '1' }} className="p-10 md:p-16 flex flex-col justify-center bg-white">
            <div className="max-w-[420px] mx-auto w-full">

              {/* ── CADASTRO ── */}
              {view === 'signup' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-[36px] font-black text-[#125d30] mb-2 font-['Plus_Jakarta_Sans'] tracking-tighter">
                    Comece a vender
                  </h2>
                  <p className="text-[#707a6f] text-sm mb-10 font-medium">
                    Cadastre sua banca e receba pedidos hoje mesmo.
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nome da Banca / Produtor</label>
                      <input
                        type="text" name="bancaName" value={formData.bancaName} onChange={handleChange}
                        placeholder="Ex: Sítio Sol Nascente"
                        className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-green-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Seu Nome Completo</label>
                      <input
                        type="text" name="name" value={formData.name} onChange={handleChange}
                        className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-green-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail</label>
                        <input
                          type="email" name="email" value={formData.email} onChange={handleChange}
                          className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-green-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">WhatsApp</label>
                        <input
                          type="tel" name="phone" value={formData.phone} onChange={handleChange}
                          className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-green-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Senha</label>
                        <input
                          type="password" name="password" value={formData.password} onChange={handleChange}
                          className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-green-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirmar</label>
                        <input
                          type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                          className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-green-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required minLength={6}
                        />
                      </div>
                    </div>

                    <button
                      type="submit" disabled={loading}
                      className="w-full bg-[#125d30] text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-60"
                    >
                      {loading ? <Loader2 size={24} className="animate-spin" /> : 'Criar minha banca digital'}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-sm font-bold text-gray-400">
                      Já é parceiro?{' '}
                      <button onClick={() => setView('login')} className="text-[#125d30] font-black hover:underline ml-1">
                        Acesse sua conta
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* ── CONFIRMAÇÃO DE E-MAIL ── */}
              {view === 'confirm' && (
                <div className="animate-in fade-in zoom-in-95 duration-500 text-center space-y-8">
                  <div className="w-20 h-20 bg-green-50 rounded-[28px] flex items-center justify-center mx-auto">
                    <Mail size={40} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-[32px] font-black text-gray-900 font-['Plus_Jakarta_Sans'] tracking-tighter mb-3">
                      Confirme seu e-mail
                    </h2>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      Enviamos um link de ativação para<br />
                      <span className="font-black text-gray-900">{formData.email}</span>
                    </p>
                  </div>
                  <div className="p-6 bg-green-50 rounded-[24px] border border-green-100 text-left space-y-3">
                    <p className="text-sm font-black text-green-800">Como ativar sua conta:</p>
                    <ol className="space-y-2 text-sm text-green-700 font-medium">
                      <li>1. Abra o e-mail que enviamos para você</li>
                      <li>2. Clique no botão <b>"Confirmar cadastro"</b></li>
                      <li>3. Volte aqui e faça login</li>
                    </ol>
                  </div>
                  <button
                    onClick={() => setView('login')}
                    className="w-full bg-[#125d30] text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Já confirmei, fazer login
                  </button>
                  <p className="text-xs text-gray-400 font-medium">
                    Não recebeu o e-mail? Verifique a pasta de spam ou{' '}
                    <button onClick={handleSignup as any} className="text-[#125d30] font-black hover:underline">
                      tente novamente
                    </button>
                    .
                  </p>
                </div>
              )}

              {/* ── RECUPERAR SENHA ── */}
              {view === 'forgot' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-[36px] font-black text-[#125d30] mb-2 font-['Plus_Jakarta_Sans'] tracking-tighter">
                    Recuperar senha
                  </h2>
                  <p className="text-[#707a6f] text-sm mb-10 font-medium">
                    Digite seu e-mail para receber o link de redefinição.
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  {forgotSent ? (
                    <div className="flex flex-col items-center text-center gap-4 py-6">
                      <div className="w-16 h-16 bg-green-50 rounded-[20px] flex items-center justify-center">
                        <Mail size={28} className="text-[#125d30]" />
                      </div>
                      <p className="font-black text-gray-800">E-mail enviado!</p>
                      <p className="text-sm text-gray-500 font-medium">
                        Verifique sua caixa de entrada em <strong>{forgotEmail}</strong> e clique no link para criar uma nova senha.
                      </p>
                      <button onClick={() => setView('login')} className="text-sm font-black text-[#125d30] hover:underline mt-2">
                        ← Voltar ao login
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail cadastrado</label>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="Digite seu e-mail"
                          className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-green-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                      <button
                        type="submit" disabled={loading}
                        className="w-full bg-[#125d30] text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                      >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : 'Enviar link de recuperação'}
                      </button>
                      <button type="button" onClick={() => setView('login')} className="w-full text-sm font-bold text-gray-400 hover:underline">
                        ← Voltar ao login
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ── LOGIN ── */}
              {view === 'login' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <h2 className="text-[36px] font-black text-[#125d30] mb-2 font-['Plus_Jakarta_Sans'] tracking-tighter">
                    Acessar Painel
                  </h2>
                  <p className="text-[#707a6f] text-sm mb-10 font-medium">
                    Gerencie seus produtos e pedidos.
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail</label>
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        className="w-full bg-gray-50 rounded-[18px] px-6 py-5 border-2 border-transparent focus:border-green-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1 pr-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Senha</label>
                        <button type="button" onClick={() => { setError(''); setForgotSent(false); setForgotEmail(formData.email); setView('forgot'); }} className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">
                          Esqueci a senha
                        </button>
                      </div>
                      <input
                        type="password" name="password" value={formData.password} onChange={handleChange}
                        className="w-full bg-gray-50 rounded-[18px] px-6 py-5 border-2 border-transparent focus:border-green-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit" disabled={loading}
                      className="w-full bg-[#125d30] text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-60"
                    >
                      {loading ? <Loader2 size={24} className="animate-spin" /> : 'Entrar no painel'}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-sm font-bold text-gray-400">
                      Ainda não tem cadastro?{' '}
                      <button onClick={() => setView('signup')} className="text-[#125d30] font-black hover:underline ml-1">
                        Comece agora
                      </button>
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-12 py-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center bg-white/50 backdrop-blur-md">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-[#125d30] text-xl font-['Plus_Jakarta_Sans'] tracking-tighter">feira.casa</span>
          <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">© 2024 Canal do Produtor — Fortalecendo a economia local.</p>
        </div>
        <div className="flex items-center gap-10">
          <nav className="flex gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-[#125d30] transition-colors">Vantagens</Link>
            <Link href="#" className="hover:text-[#125d30] transition-colors">Taxas</Link>
            <Link href="#" className="hover:text-[#125d30] transition-colors">Suporte</Link>
          </nav>
          <div className="text-gray-200">
            <ShieldCheck size={20} />
          </div>
        </div>
      </footer>
    </div>
  );
}
