'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  HelpCircle,
  ShieldCheck,
  ChefHat,
  Star,
  Zap,
  Mail
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildAuthMetadata, syncProfileAfterSignup } from '@/lib/signup';
import { persistAuthSession } from '@/lib/profile';

type View = 'signup' | 'login';

export default function ChefSignup() {
  const router = useRouter();
  const [view, setView] = useState<View>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: buildAuthMetadata({
            role: 'chef',
            fullName: formData.name,
            phone: formData.phone,
            specialty: formData.specialty
          })
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Este e-mail já está cadastrado. Faça login.');
        }
        throw new Error(authError.message || 'Erro ao criar conta.');
      }

      if (authData.user) {
        const sync = await syncProfileAfterSignup(authData.session?.access_token, {
          role: 'chef',
          fullName: formData.name,
          phone: formData.phone,
          specialty: formData.specialty,
          email: formData.email,
        });

        if (!sync.ok && !authData.session) {
          setError('Conta criada! Confirme o e-mail se necessário e faça login.');
          router.push('/login?signup=success&tipo=chef');
          return;
        }

        if (authData.session?.access_token) {
          persistAuthSession(authData.session.access_token, {
            role: 'chef',
            full_name: formData.name,
          });
          router.push('/portal/chef');
          return;
        }

        router.push('/login?signup=success&tipo=chef');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-['Plus_Jakarta_Sans'] text-white overflow-hidden flex flex-col md:flex-row">
      
      {/* HEADER LOGO ABSOLUTO (TOP LEFT) */}
      <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-50">
        <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="font-black text-white text-3xl lg:text-4xl tracking-tighter drop-shadow-lg" style={{ textShadow: "0 0 25px currentColor" }} data-glow="true">feira.casa</span>
          <span className="font-extrabold tracking-tighter text-orange-500 text-3xl lg:text-4xl drop-shadow-lg" style={{ textShadow: "0 0 25px currentColor" }} data-glow="true">restaurantes & chefs</span>
        </Link>
      </div>
      
      {/* BACKGROUND FULLSCREEN */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg/chef_bg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#2a0505]/85 backdrop-blur-[2px]" />
      </div>

      {/* LADO ESQUERDO: TEXTO */}
      <div className="relative z-10 hidden md:flex flex-col w-1/2 p-12 lg:p-16 justify-between">
        <div className="mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">PROGRAMA DE CURADORIA</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extralight tracking-tight mb-6 leading-[1.1]" style={{ color: "#ffffff" }}>
            Compartilhe sua arte. <br />
            <span className="font-black text-orange-500">Inspire sabores.</span>
          </h1>
          <p className="text-lg font-medium max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            Descubra os ingredientes mais frescos da feira para suas criações e ofereça suas receitas exclusivas para nossa comunidade.
          </p>
        </div>

        <div className="mt-auto pb-10">
          <div className="bg-[#1a0505]/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-md shadow-2xl flex gap-12">
            <div>
              <p className="text-3xl font-black" style={{ color: "#ffffff" }}>100+</p>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">CHEFS ATIVOS</p>
            </div>
            <div>
              <p className="text-3xl font-black" style={{ color: "#ffffff" }}>Zero</p>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">TAXA DE ADESÃO</p>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col h-screen overflow-y-auto">
        


        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 max-w-[540px] w-full mx-auto pb-20">
          
          {/* Card do Formulário */}
          <div className="bg-[#0a0202]/80 backdrop-blur-xl p-8 sm:p-12 rounded-[32px] border border-white/10 shadow-2xl">
            


            <div className="animate-in fade-in duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "#ffffff" }}>Aplicação para Chef</h2>
                <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Preencha seus dados para avaliação.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 text-red-200 text-sm font-bold rounded-xl border border-red-500/30 flex items-center gap-2">
                  <HelpCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Nome Completo / Artístico</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="Ex: Chef Claude"
                    className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Especialidade / Cozinha</label>
                  <input
                    type="text" name="specialty" value={formData.specialty} onChange={handleChange}
                    placeholder="Ex: Francesa, Contemporânea..."
                    className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>E-mail Corporativo</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="contato@chef.com"
                    className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>WhatsApp</label>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Senha Segura</label>
                    <input
                      type="password" name="password" value={formData.password} onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                      required minLength={6}
                    />
                  </div>
                </div>

                <div className="hidden">
                  <input type="password" name="confirmPassword" value={formData.password} readOnly />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-[18px] font-black text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 shadow-lg shadow-orange-500/20"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Quero me tornar um Chef Partner ->'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-[11px] font-bold font-extrabold" style={{ color: "#ffffff" }}>
                  Já é um Chef parceiro?{' '}
                  <Link href="/login" className="text-orange-500 hover:text-white transition-colors uppercase tracking-widest ml-1">
                    Acesse a Cozinha
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
