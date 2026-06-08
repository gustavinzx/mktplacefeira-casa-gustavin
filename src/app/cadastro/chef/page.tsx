'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  HelpCircle,
  ShieldCheck,
  ChefHat,
  Utensils,
  Star,
  Zap,
  Mail
} from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';
import { upsertData } from '@/lib/database';

export default function CadastroChefPage() {
  const router = useRouter();
  const [view, setView] = useState<'signup' | 'login' | 'forgot'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: '',
    specialty: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            user_type: 'chef',
            specialty: formData.specialty
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        await upsertData('partners', {
          id: data.user.id,
          email: formData.email,
          full_name: formData.name,
          phone: formData.phone,
          specialty: formData.specialty,
          user_type: 'chef'
        });
      }

      setSuccess('Seja bem-vindo, Chef! Sua conta foi criada.');
      setView('login');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Verifique seu e-mail para ativar a conta antes de fazer login.');
        }
        throw authError;
      }

      if (authData.user) {
        let { data: profile } = await supabase
          .from(getTableName('profiles'))
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (!profile) {
           await upsertData('profiles', {
            id: authData.user.id,
            email: authData.user.email || formData.email,
            full_name: authData.user.user_metadata?.full_name || '',
            user_type: 'chef'
          });
          profile = {
             user_type: 'chef',
             full_name: authData.user.user_metadata?.full_name || ''
          };
        }

        if (profile) {
          localStorage.setItem('user_role', profile.user_type);
          localStorage.setItem('user_name', profile.full_name);
          router.push('/admin/crm/restaurantes'); // Example redirect
        }
      }
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcfc] flex flex-col font-['Be_Vietnam_Pro'] text-[#404940]">
      {/* Header */}
      <header className="w-full px-10 py-8 flex justify-between items-center bg-transparent">
        <Link href="/" className="text-2xl font-bold text-[#e11d48] font-['Plus_Jakarta_Sans']">
          feira.casa
        </Link>
        <div className="bg-white p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-sm">
          <HelpCircle size={22} className="text-[#707a6f]" />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center px-6 pb-12">
        <div 
          style={{ display: 'flex', flexDirection: 'row', minHeight: '700px' }}
          className="w-full max-w-[1100px] bg-white rounded-[40px] overflow-hidden shadow-2xl border border-rose-100"
        >
          
          {/* LADO ESQUERDO: IMAGEM & BENEFÍCIOS */}
          <div style={{ flex: '1', position: 'relative', overflow: 'hidden' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-rose-900/95 via-rose-900/60 to-rose-900/30 z-10" />
            
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745a30d3?q=80&w=1000&auto=format&fit=crop" 
              alt="Chef Gourmet" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Content Over Image */}
            <div className="absolute inset-0 z-20 p-12 flex flex-col justify-between text-white">
              <div>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest mb-6 inline-block">
                  Comunidade de Chefs
                </span>
                <h1 className="text-[48px] font-black leading-[1] mb-6 font-['Plus_Jakarta_Sans'] tracking-tight">
                  Insumos Reais <br /> para Chefs Reais.
                </h1>
                <p className="text-lg opacity-90 max-w-[380px] font-medium leading-relaxed">
                  Tenha acesso direto aos melhores produtores e destaque suas receitas para milhares de pessoas.
                </p>
              </div>

              <div className="space-y-6 bg-black/10 backdrop-blur-xl p-8 rounded-[32px] border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white">
                    <ChefHat size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black">Curadoria Premium</p>
                    <p className="text-xs opacity-70">Produtos selecionados para alta gastronomia.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                    <Star size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black">Seu Perfil em Destaque</p>
                    <p className="text-xs opacity-70">Suas receitas e serviços visíveis para todos.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black">Logística Expressa</p>
                    <p className="text-xs opacity-70">Receba seus insumos com prioridade máxima.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: FORMULÁRIO */}
          <div style={{ flex: '1' }} className="p-10 md:p-16 flex flex-col justify-center bg-white">
            <div className="max-w-[420px] mx-auto w-full">
              {view === 'signup' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-[36px] font-black text-[#e11d48] mb-2 font-['Plus_Jakarta_Sans'] tracking-tighter">
                    Entre para o Time
                  </h2>
                  <p className="text-[#707a6f] text-sm mb-10 font-medium">
                    Crie seu perfil de Chef e acesse benefícios exclusivos.
                  </p>

                  {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100">{error}</div>}

                  <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Sua Especialidade</label>
                      <input 
                        type="text" 
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        placeholder="Ex: Cozinha Contemporânea, Confeitaria..."
                        className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-rose-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nome Completo</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-rose-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail Profissional</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-rose-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">WhatsApp</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-rose-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Senha</label>
                        <input 
                          type="password" 
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-rose-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirmar</label>
                        <input 
                          type="password" 
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-rose-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#e11d48] text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-rose-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                    >
                      {loading ? <Loader2 size={24} className="animate-spin" /> : 'Criar meu perfil de Chef'}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-sm font-bold text-gray-400">
                      Já é um Chef parceiro? <button onClick={() => setView('login')} className="text-[#e11d48] font-black hover:underline ml-1">Acesse sua conta</button>
                    </p>
                  </div>
                </div>
              )}

              {view === 'forgot' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-[36px] font-black text-[#e11d48] mb-2 font-['Plus_Jakarta_Sans'] tracking-tighter">
                    Recuperar senha
                  </h2>
                  <p className="text-[#707a6f] text-sm mb-10 font-medium">
                    Digite seu e-mail para receber o link de redefinição.
                  </p>

                  {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100">{error}</div>}

                  {forgotSent ? (
                    <div className="flex flex-col items-center text-center gap-4 py-6">
                      <div className="w-16 h-16 bg-rose-50 rounded-[20px] flex items-center justify-center">
                        <Mail size={28} className="text-[#e11d48]" />
                      </div>
                      <p className="font-black text-gray-800">E-mail enviado!</p>
                      <p className="text-sm text-gray-500 font-medium">
                        Verifique sua caixa de entrada em <strong>{forgotEmail}</strong> e clique no link para criar uma nova senha.
                      </p>
                      <button onClick={() => setView('login')} className="text-sm font-black text-[#e11d48] hover:underline mt-2">
                        ← Voltar ao login
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail profissional</label>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="chef@seuprojeto.com"
                          className="w-full bg-gray-50 rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-rose-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                      <button
                        type="submit" disabled={loading}
                        className="w-full bg-[#e11d48] text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-rose-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
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

              {view === 'login' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <h2 className="text-[36px] font-black text-[#e11d48] mb-2 font-['Plus_Jakarta_Sans'] tracking-tighter">
                    Bem-vindo, Chef
                  </h2>
                  <p className="text-[#707a6f] text-sm mb-10 font-medium">
                    Acesse seu portal gourmet.
                  </p>

                  {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100">{error}</div>}
                  {success && <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm font-bold rounded-xl border border-green-100">{success}</div>}

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-50 rounded-[18px] px-6 py-5 border-2 border-transparent focus:border-rose-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1 pr-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Senha</label>
                        <button type="button" onClick={() => { setError(''); setForgotSent(false); setForgotEmail(formData.email); setView('forgot'); }} className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline">Esqueci a senha</button>
                      </div>
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-gray-50 rounded-[18px] px-6 py-5 border-2 border-transparent focus:border-rose-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#e11d48] text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-rose-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                    >
                      {loading ? <Loader2 size={24} className="animate-spin" /> : 'Entrar no Portal'}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-sm font-bold text-gray-400">
                      Novo por aqui? <button onClick={() => setView('signup')} className="text-[#e11d48] font-black hover:underline ml-1">Cadastre-se</button>
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-12 py-10 border-t border-rose-50 flex flex-col md:flex-row justify-between items-center bg-white/50 backdrop-blur-md">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-[#e11d48] text-xl font-['Plus_Jakarta_Sans'] tracking-tighter">feira.casa</span>
          <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">© 2024 Portal do Chef - Insumos de origem com alma.</p>
        </div>
        
        <div className="flex items-center gap-10">
          <nav className="flex gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <Link href="/" className="hover:text-[#e11d48] transition-colors">Produtos</Link>
            <Link href="/" className="hover:text-[#e11d48] transition-colors">Receitas</Link>
            <Link href="/" className="hover:text-[#e11d48] transition-colors">Suporte</Link>
          </nav>
          <div className="text-rose-100">
            <ShieldCheck size={20} />
          </div>
        </div>
      </footer>
    </div>
  );
}
