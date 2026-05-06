'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2,
  ChevronRight,
  ArrowLeft,
  Info,
  Phone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UserSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

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
            user_type: 'customer'
          }
        }
      });

      if (authError) throw authError;

      setSuccess('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => router.push('/login'), 2000);

    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf9f4] text-[#1b1c19] min-h-screen flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Simple TopBar Branding */}
      <header className="flex justify-center py-12">
        <h1 className="text-3xl font-black text-[#0e6b17] tracking-tight">feira.casa</h1>
      </header>

      <main className="flex-grow flex items-start justify-center px-4 pb-16">
        {/* Register Card */}
        <div className="w-full max-w-[400px] bg-white border border-[#bfcab9] p-6 md:p-10 rounded-xl shadow-sm">
          <h2 className="text-[32px] font-bold text-[#1b1c19] mb-6 leading-tight">Criar conta</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100 animate-in fade-in zoom-in-95">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1b1c19] block" htmlFor="name">Seu nome</label>
              <input 
                className="w-full px-3 py-2.5 rounded border border-[#bfcab9] focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all placeholder:text-[#dbdad5] text-sm" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome e sobrenome" 
                type="text"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1b1c19] block" htmlFor="email">E-mail</label>
              <input 
                className="w-full px-3 py-2.5 rounded border border-[#bfcab9] focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-sm" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                type="email"
                required
              />
            </div>

            {/* WhatsApp Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1b1c19] block" htmlFor="phone">WhatsApp</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[#40493c] flex items-center gap-1">
                  <Phone size={16} />
                </span>
                <input 
                  className="w-full pl-10 px-3 py-2.5 rounded border border-[#bfcab9] focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-sm" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000" 
                  type="tel"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1b1c19] block" htmlFor="password">Senha</label>
              <input 
                className="w-full px-3 py-2.5 rounded border border-[#bfcab9] focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-sm" 
                id="password" 
                name="password" 
                value={formData.password}
                onChange={handleChange}
                placeholder="Pelo menos 6 caracteres" 
                type="password"
                required
              />
              <div className="flex items-center gap-1 text-[#40493c]">
                <Info size={12} />
                <span className="text-[11px] font-medium">As senhas devem ter pelo menos 6 caracteres.</span>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1b1c19] block" htmlFor="confirmPassword">Confirmar senha</label>
              <input 
                className="w-full px-3 py-2.5 rounded border border-[#bfcab9] focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-sm" 
                id="confirmPassword" 
                name="confirmPassword" 
                value={formData.confirmPassword}
                onChange={handleChange}
                type="password"
                required
              />
            </div>

            {/* Primary Action */}
            <div className="pt-2">
              <button 
                className="w-full py-3 bg-[#0e6b17] text-white font-bold rounded-lg shadow-sm hover:opacity-90 active:opacity-100 transition-all text-base flex justify-center items-center gap-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Criar sua conta feira.casa'}
              </button>
            </div>

            {/* Policy Text */}
            <p className="text-[12px] leading-relaxed text-[#40493c]">
              Ao criar uma conta, você concorda com as <a className="text-[#a63b00] hover:underline font-semibold" href="#">Condições de Uso</a> e o <a className="text-[#a63b00] hover:underline font-semibold" href="#">Aviso de Privacidade</a> da feira.casa.
            </p>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#bfcab9]"></div>
              </div>
              <div className="relative flex justify-center text-[12px]">
                <span className="px-4 bg-white text-[#40493c] font-medium">Já tem uma conta?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link className="inline-flex items-center gap-1 text-base font-bold text-[#0e6b17] hover:opacity-80 transition-all" href="/login">
                Fazer login
                <ChevronRight size={18} />
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-stone-50 border-t border-stone-200 mt-12 py-10 px-6 w-full text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-6 mb-2">
          <a className="text-xs font-semibold text-stone-500 hover:text-[#0e6b17] transition-colors" href="#">Condições de Uso</a>
          <a className="text-xs font-semibold text-stone-500 hover:text-[#0e6b17] transition-colors" href="#">Aviso de Privacidade</a>
          <a className="text-xs font-semibold text-stone-500 hover:text-[#0e6b17] transition-colors" href="#">Ajuda</a>
        </div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">© 2024 feira.casa - Conectando o campo à sua mesa.</p>
      </footer>
    </div>
  );
}
