'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ChefHat, Star, UtensilsCrossed } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildAuthMetadata, syncProfileAfterSignup } from '@/lib/signup';
import { persistAuthSession } from '@/lib/profile';

export default function ChefSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    specialty: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: buildAuthMetadata({
            role: 'chef',
            fullName: formData.fullName,
            phone: formData.phone,
            specialty: formData.specialty,
          }),
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const sync = await syncProfileAfterSignup(authData.session?.access_token, {
          role: 'chef',
          fullName: formData.fullName,
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
            full_name: formData.fullName,
          });
          router.push('/portal/chef');
          return;
        }

        router.push('/login?signup=success&tipo=chef');
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(err.message || 'Erro ao processar seu cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Plus_Jakarta_Sans'] relative overflow-hidden bg-[#0a0a0a] text-gray-200">
      
      {/* Imagem de Fundo Premium e Overlays */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1577106263724-2c8e03bfeffe?q=80&w=2000&auto=format&fit=crop" 
          alt="Fine Dining Plating" 
          className="w-full h-full object-cover opacity-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a]/80 to-[#ef4444]/20"></div>
        {/* Partículas sutis via CSS radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15)_0%,_transparent_100%)] opacity-50 pointer-events-none mix-blend-screen"></div>
      </div>
      
      <header className="relative w-full p-6 md:px-12 flex justify-between items-center z-20">
        <Link href="/" className="text-2xl font-extrabold text-[#f59e0b] tracking-tighter drop-shadow-md">
          feira.casa
        </Link>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#f59e0b]/30 text-[#f59e0b] text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <ChefHat size={14} />
          Chef Partner
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 z-10 w-full max-w-7xl mx-auto py-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Lado Esquerdo - Copywriting */}
          <div className="hidden lg:flex flex-col">
            <h1 className="text-5xl lg:text-7xl font-light text-white tracking-tight mb-6">
              Compartilhe sua arte. <br />
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] to-[#f59e0b]">Inspire sabores.</span>
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-lg mb-10 leading-relaxed">
              Descubra os ingredientes mais frescos da feira para suas criações e ofereça suas receitas exclusivas para nossa comunidade.
            </p>
            <div className="flex gap-6">
              <div className="flex flex-col gap-2">
                <Star size={24} className="text-[#f59e0b]" />
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Ingredientes Premium</span>
              </div>
              <div className="w-px h-12 bg-white/10"></div>
              <div className="flex flex-col gap-2">
                <UtensilsCrossed size={24} className="text-[#ef4444]" />
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Público Gourmet</span>
              </div>
            </div>
          </div>

          {/* Lado Direito - Formulário Glassmorphism */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-[#121212]/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
              
              {/* Efeito de brilho no topo do card */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ef4444] to-[#f59e0b]"></div>
              
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">Aplicação para Chef</h2>
                <p className="text-gray-400 text-sm">Preencha seus dados para começar.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-[#ef4444]/10 text-[#ef4444] text-sm font-bold rounded-xl border border-[#ef4444]/20 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Nome Completo / Artístico</label>
                  <input 
                    name="fullName" value={formData.fullName} onChange={handleChange} 
                    placeholder="Chef Claude Troisgros" 
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-all outline-none text-white font-medium placeholder-gray-600"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Especialidade / Cozinha</label>
                  <input 
                    name="specialty" value={formData.specialty} onChange={handleChange} 
                    placeholder="Ex: Francesa, Contemporânea, Confeitaria..." 
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-all outline-none text-white font-medium placeholder-gray-600"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">E-mail de Contato</label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} 
                    placeholder="contato@chef.com" 
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-all outline-none text-white font-medium placeholder-gray-600"
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">WhatsApp</label>
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                      placeholder="(00) 00000-0000" 
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-all outline-none text-white font-medium placeholder-gray-600"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Senha Segura</label>
                    <input 
                      type="password" name="password" value={formData.password} onChange={handleChange} 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-all outline-none text-white font-medium placeholder-gray-600"
                      required 
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white font-extrabold text-base rounded-xl shadow-[0_10px_25px_rgba(239,68,68,0.4)] hover:shadow-[0_10px_35px_rgba(245,158,11,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        Quero me tornar um Chef Partner
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 font-medium mt-6">
                  Já é um Chef parceiro? <Link href="/login" className="text-[#f59e0b] font-bold hover:text-white transition-colors">Acesse a Cozinha</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full py-8 text-center px-4">
        <p className="text-sm italic text-gray-500 font-serif">
          "A descoberta de um novo prato faz mais pela felicidade humana do que a descoberta de uma estrela." <br/> — Jean Anthelme Brillat-Savarin
        </p>
      </footer>
    </div>
  );
}
