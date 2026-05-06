'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Lock, ArrowRight, HelpCircle } from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profile } = await supabase
          .from(getTableName('profiles'))
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profile && profile.user_type === 'admin') {
          localStorage.setItem('user_role', 'admin');
          localStorage.setItem('user_name', profile.full_name);
          router.push('/admin');
        } else {
          setError('Acesso negado. Esta área é restrita a administradores.');
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.error('Erro no login admin:', err);
      setError('Credenciais inválidas ou erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf9f4] text-[#1b1c19] font-['Plus_Jakarta_Sans'] min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md shadow-sm border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-[#0e6b17]">feira.casa</span>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold uppercase rounded tracking-widest">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <HelpCircle size={20} className="text-stone-400 cursor-pointer hover:text-[#0e6b17]" />
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-5 md:px-20">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-sm border border-[#bfcab9]/30">
          
          {/* Visual Branding Side */}
          <div className="hidden md:block relative overflow-hidden bg-[#1b1c19]">
            <img 
              alt="Painel de Controle" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLQxC1qsBmy3p1NcwzMx_ErXDIIBhLdHG8_CmBOkuJNNLb-38ZHSEbvNmcFI-BWO6GpCprgUk6NMUn1M1Ne-fxrSXNvGEZliigxgbnyGCFIXj59wfQ37ZWwbXoEJobOAiV6POVPCxzCWF_GUtnWw-PwPuKPR9we-giq-JG8p20NaDsAV3nadAixtiNyTDRe-0lI9yC5LVXQ_VKRnHx3d_u0ecqdSSnAXz2s7sHrEt8N78kq4VaWTnYbOneHM5PZHSowDkxpc3_qrw"
            />
            <div className="relative z-10 p-16 flex flex-col justify-end h-full text-white">
              <h1 className="text-[40px] font-extrabold mb-4 leading-tight">Painel de Controle</h1>
              <p className="text-lg opacity-80 max-w-md">Gestão centralizada e segura para o campo e a cidade. Acesse as ferramentas administrativas do ecossistema feira.casa.</p>
            </div>
          </div>

          {/* Login Form Side */}
          <div className="p-10 md:p-16 flex flex-col justify-center bg-white">
            <div className="mb-10">
              <span className="inline-block px-3 py-1 bg-[#0e6b17]/10 text-[#0e6b17] rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">Acesso Restrito</span>
              <h2 className="text-[32px] font-bold text-[#1b1c19] mb-1">Login Administrativo</h2>
              <p className="text-[#40493c]">Bem-vindo de volta ao centro de operações.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 text-center">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1b1c19] mb-1" htmlFor="email">E-mail Corporativo</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-[#bfcab9] focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] bg-[#f5f4ef] transition-all outline-none text-sm" 
                  id="email" 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@feira.casa" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-[#1b1c19]" htmlFor="password">Senha de Acesso</label>
                  <a className="text-xs text-[#0e6b17] font-bold hover:underline" href="#">Redefinir senha</a>
                </div>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-[#bfcab9] focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] bg-[#f5f4ef] transition-all outline-none text-sm" 
                  id="password" 
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  required
                />
              </div>

              <button 
                className="w-full bg-[#0e6b17] text-white py-4 rounded-xl text-lg font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    <span>Entrar no Painel</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="bg-stone-50 border border-stone-100 p-4 rounded-xl flex gap-3 items-start">
                <ShieldCheck size={20} className="text-[#ba1a1a] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#1b1c19]">Ambiente Monitorado</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">Seu IP e dados de sessão são registrados para fins de auditoria e segurança.</p>
                </div>
              </div>
            </form>
            
            <div className="mt-10 pt-8 border-t border-stone-100 text-center">
              <p className="text-sm text-stone-500">
                Novo no time? <Link href="/signup" className="text-[#0e6b17] font-bold hover:underline">Primeiro Acesso</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-stone-50 border-t border-stone-200 mt-auto">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-green-800">feira.casa</span>
          <p className="text-sm text-stone-500">© 2024 Feira Viva - Conectando o campo à sua mesa.</p>
        </div>
        <nav className="flex gap-6">
          <a className="text-stone-500 hover:text-[#0e6b17] underline transition-all text-sm cursor-pointer" href="#">Termos</a>
          <a className="text-stone-500 hover:text-[#0e6b17] underline transition-all text-sm cursor-pointer" href="#">Privacidade</a>
          <a className="text-stone-500 hover:text-[#0e6b17] underline transition-all text-sm cursor-pointer" href="#">Suporte</a>
        </nav>
        <div className="flex gap-4 opacity-30 grayscale">
          <Lock size={16} className="text-stone-400" />
        </div>
      </footer>
    </div>
  );
}
