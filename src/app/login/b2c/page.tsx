'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  ChevronRight, 
  LogIn, 
  UserPlus, 
  HelpCircle,
  Shield,
  Info,
  Phone
} from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';

export default function B2CAuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login State
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Signup State
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from(getTableName('profiles'))
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          localStorage.setItem('user_role', profile.user_type);
          localStorage.setItem('user_name', profile.full_name);
          router.push('/');
        }
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.name,
            phone: signupData.phone,
            user_type: 'customer'
          }
        }
      });

      if (authError) throw authError;

      setSuccess('Conta criada com sucesso! Você já pode fazer login.');
      setActiveTab('login');
      setLoginData({ email: signupData.email, password: '' });
    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf9f4] text-[#1b1c19] font-['Plus_Jakarta_Sans'] min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md shadow-sm border-b border-stone-100">
        <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform cursor-pointer">
          <span className="text-2xl font-bold tracking-tight text-[#0e6b17]">feira.casa</span>
        </Link>
        <div className="flex items-center gap-4">
          <HelpCircle size={20} className="text-stone-500 hover:text-[#0e6b17] transition-colors cursor-pointer" />
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-5 md:px-20">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl overflow-hidden shadow-sm border border-[#bfcab9]/30">
          
          {/* Visual Branding Side */}
          <div className="hidden md:block relative overflow-hidden bg-[#30852f]">
            <img 
              alt="Horta orgânica" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEo4QDOzSCJ90Ni1lv45iTYu1TStHTyKFuZoT-mjXI_jYxI6bU2bsAPPqMeP_yKeyEyYXEvdcIek9FKuZ-ThVqG-gCldV-epUWIItq_bztmoL7jtjS5_2XzbhlgU2eWWQGze8q4Tfr6FHkhXDLN67zSuR1XrGks_h9y_zoYtkhWIUcPIfn4ym0YlByVGPNWLO4WHi3xv8G8OxBpNnVcgASFTjmGGEJK9IVUX8WQaswYfgc5tAbWAn6PSKAqLeOO65YGMTWSIVeSMc"
            />
            <div className="relative z-10 p-16 flex flex-col justify-end h-full text-[#f8fff0]">
              <h1 className="text-[48px] font-extrabold mb-6 leading-tight">Frescor direto do campo.</h1>
              <p className="text-lg opacity-90 max-w-md">Bem-vindo de volta! Acesse sua conta para continuar escolhendo o melhor da feira livre no conforto da sua casa.</p>
            </div>
            <div className="absolute top-0 right-0 p-6">
              <div className="bg-[#fc6c29] text-[#5a1c00] px-4 py-1 rounded-full text-xs font-semibold shadow-sm">
                Colhido hoje
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-10 md:p-16 flex flex-col justify-center bg-white">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-[#bfcab9]/30 mb-10">
              <button 
                onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                className={`pb-4 px-2 font-bold text-lg transition-all relative ${activeTab === 'login' ? 'text-[#0e6b17]' : 'text-[#707a6b] hover:text-[#1b1c19]'}`}
              >
                Acesse sua conta
                {activeTab === 'login' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#0e6b17] rounded-full" />}
              </button>
              <button 
                onClick={() => { setActiveTab('signup'); setError(''); setSuccess(''); }}
                className={`pb-4 px-2 font-bold text-lg transition-all relative ${activeTab === 'signup' ? 'text-[#0e6b17]' : 'text-[#707a6b] hover:text-[#1b1c19]'}`}
              >
                Criar conta
                {activeTab === 'signup' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#0e6b17] rounded-full" />}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100">
                {success}
              </div>
            )}

            {activeTab === 'login' ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-[32px] font-bold text-[#0e6b17] mb-1">Bem-vindo!</h2>
                  <p className="text-[#40493c]">Que bom ver você por aqui novamente!</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#bfcab9]/30 rounded-xl font-semibold text-[#40493c] hover:bg-[#f5f4ef] transition-all active:scale-95 group">
                    <img alt="Google" className="w-5 h-5" src="https://www.google.com/favicon.ico" />
                    <span className="text-sm">Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#bfcab9]/30 rounded-xl font-semibold text-[#40493c] hover:bg-[#f5f4ef] transition-all active:scale-95 group">
                    <Shield size={20} />
                    <span className="text-sm">Apple</span>
                  </button>
                </div>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#bfcab9]/50"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="px-4 bg-white text-[#707a6b]">ou use seu e-mail</span></div>
                </div>

                <form className="space-y-6" onSubmit={handleLoginSubmit}>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1b1c19] uppercase tracking-wider" htmlFor="email">E-mail ou CPF</label>
                    <input 
                      className="w-full px-4 py-3 rounded-lg border border-[#bfcab9] focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] bg-[#f5f4ef] transition-all outline-none text-base placeholder:text-[#707a6b]/60" 
                      id="email" 
                      name="email"
                      type="text"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Digite seu e-mail ou CPF" 
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-[#1b1c19] uppercase tracking-wider" htmlFor="password">Senha</label>
                      <a className="text-xs text-[#a63b00] hover:text-[#0e6b17] transition-colors underline underline-offset-4" href="#">Esqueceu a senha?</a>
                    </div>
                    <input 
                      className="w-full px-4 py-3 rounded-lg border border-[#bfcab9] focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] bg-[#f5f4ef] transition-all outline-none text-base" 
                      id="password" 
                      name="password"
                      type="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••" 
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input className="w-5 h-5 rounded border-[#707a6b] text-[#0e6b17] focus:ring-[#0e6b17] cursor-pointer" id="remember" type="checkbox"/>
                    <label className="ml-2 text-sm text-[#40493c] cursor-pointer select-none" htmlFor="remember">Lembrar de mim</label>
                  </div>

                  <button 
                    className="w-full bg-[#0e6b17] text-[#ffffff] py-4 rounded-xl text-lg font-bold shadow-md hover:bg-[#126e19] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 group" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        Entrar na feira
                        <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-[32px] font-bold text-[#0e6b17] mb-1">Crie sua conta</h2>
                  <p className="text-[#40493c]">Comece a colher o melhor hoje mesmo!</p>
                </div>

                <form className="space-y-5" onSubmit={handleSignupSubmit}>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1b1c19] uppercase tracking-wider" htmlFor="signup-name">Seu nome</label>
                    <input 
                      className="w-full px-4 py-3 rounded-lg border border-[#bfcab9] focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] bg-[#f5f4ef] transition-all outline-none text-sm placeholder:text-[#707a6b]/60" 
                      id="signup-name" 
                      name="name"
                      type="text"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      placeholder="Nome e sobrenome" 
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1b1c19] uppercase tracking-wider" htmlFor="signup-email">E-mail</label>
                    <input 
                      className="w-full px-4 py-3 rounded-lg border border-[#bfcab9] focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] bg-[#f5f4ef] transition-all outline-none text-sm" 
                      id="signup-email" 
                      name="email"
                      type="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1b1c19] uppercase tracking-wider" htmlFor="signup-phone">WhatsApp</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-[#40493c]"><Phone size={16} /></span>
                      <input 
                        className="w-full pl-10 px-4 py-3 rounded-lg border border-[#bfcab9] focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] bg-[#f5f4ef] transition-all outline-none text-sm" 
                        id="signup-phone" 
                        name="phone"
                        type="tel"
                        value={signupData.phone}
                        onChange={handleSignupChange}
                        placeholder="(00) 00000-0000" 
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#1b1c19] uppercase tracking-wider" htmlFor="signup-password">Senha</label>
                      <input 
                        className="w-full px-4 py-3 rounded-lg border border-[#bfcab9] focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] bg-[#f5f4ef] transition-all outline-none text-sm" 
                        id="signup-password" 
                        name="password"
                        type="password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        placeholder="••••••••" 
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#1b1c19] uppercase tracking-wider" htmlFor="signup-confirm">Confirmar</label>
                      <input 
                        className="w-full px-4 py-3 rounded-lg border border-[#bfcab9] focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] bg-[#f5f4ef] transition-all outline-none text-sm" 
                        id="signup-confirm" 
                        name="confirmPassword"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        placeholder="••••••••" 
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[#40493c]">
                    <Info size={14} />
                    <span className="text-[11px] font-medium">As senhas devem ter pelo menos 6 caracteres.</span>
                  </div>

                  <button 
                    className="w-full bg-[#0e6b17] text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-[#126e19] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-4" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        Criar minha conta
                        <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-[#707a6b] leading-relaxed">
                    Ao criar uma conta, você concorda com as <a href="#" className="font-bold text-[#a63b00] hover:underline">Condições de Uso</a> e o <a href="#" className="font-bold text-[#a63b00] hover:underline">Aviso de Privacidade</a> da feira.casa.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-stone-50 border-t border-stone-200">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-[#0e6b17]">feira.casa</span>
          <p className="text-sm text-stone-500">© 2024 Feira Viva - Conectando o campo à sua mesa.</p>
        </div>
        <nav className="flex gap-6">
          <a className="text-stone-500 hover:text-[#0e6b17] underline transition-all text-sm cursor-pointer" href="#">Termos de Uso</a>
          <a className="text-stone-500 hover:text-[#0e6b17] underline transition-all text-sm cursor-pointer" href="#">Privacidade</a>
          <a className="text-stone-500 hover:text-[#0e6b17] underline transition-all text-sm cursor-pointer" href="#">Suporte</a>
        </nav>
      </footer>
    </div>
  );
}
