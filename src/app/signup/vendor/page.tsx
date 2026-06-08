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
import { supabase } from '@/lib/supabase';
import { buildAuthMetadata, syncProfileAfterSignup } from '@/lib/signup';
import { persistAuthSession } from '@/lib/profile';

type View = 'signup' | 'login';

export default function VendorSignup() {
  const router = useRouter();
  const [view, setView] = useState<View>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    businessName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: buildAuthMetadata({
            role: 'feirante',
            fullName: formData.fullName,
            phone: formData.phone,
            businessName: formData.businessName,
            category: 'Geral', // Default category since the beautiful UI doesn't ask for it
            cnpj: '',
          }),
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Este e-mail já está cadastrado. Faça login.');
        }
        throw new Error(authError.message || 'Erro ao criar conta.');
      }

      if (authData.user) {
        const sync = await syncProfileAfterSignup(authData.session?.access_token, {
          role: 'feirante',
          fullName: formData.fullName,
          phone: formData.phone,
          businessName: formData.businessName,
          category: 'Geral',
          cnpj: '',
          email: formData.email,
        });

        if (!sync.ok && !authData.session) {
          setError('Conta criada! Confirme o e-mail se necessário e faça login.');
          router.push('/login?signup=success&tipo=feirante');
          return;
        }

        if (authData.session?.access_token) {
          persistAuthSession(authData.session.access_token, {
            role: 'feirante',
            full_name: formData.fullName,
          });
          router.push('/portal/feirante');
          return;
        }

        router.push('/login?signup=success&tipo=feirante');
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
          <span className="font-extrabold tracking-tighter text-[#4ade80] text-3xl lg:text-4xl drop-shadow-lg" style={{ textShadow: "0 0 25px currentColor" }} data-glow="true">feirantes</span>
        </Link>
      </div>
      
      {/* BACKGROUND FULLSCREEN */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg/vendor_bg_v2.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#022c22]/85 backdrop-blur-[2px]" />
      </div>

      {/* LADO ESQUERDO: TEXTO */}
      <div className="relative z-10 hidden md:flex flex-col w-1/2 p-12 lg:p-16 justify-between">
        <div className="mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4ade80]">CANAL DO PRODUTOR</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extralight tracking-tight mb-6 leading-[1.1]" style={{ color: "#ffffff" }}>
            Sua banca <br />
            <span className="font-black text-[#4ade80]">agora é digital.</span>
          </h1>
          <p className="text-lg font-medium max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            Aumente suas vendas conectando sua produção diretamente com milhares de famílias na sua região.
          </p>
        </div>

        <div className="mt-auto pb-10">
          <div className="bg-[#064e3b]/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-md shadow-2xl space-y-6">
            {[
              { icon: Store, color: 'text-[#4ade80]', title: 'Gestão Simplificada', desc: 'Controle estoque e pedidos em um só lugar.' },
              { icon: MapPin, color: 'text-[#60a5fa]', title: 'Logística Integrada', desc: 'Nós cuidamos da entrega para você.' },
              { icon: CheckCircle2, color: 'text-[#4ade80]', title: 'Pagamento Garantido', desc: 'Receba direto na sua conta, sem complicações.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className={`mt-1 flex items-center justify-center ${color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: "#ffffff" }}>{title}</p>
                  <p className="text-xs  font-medium mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col h-screen overflow-y-auto">
        


        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 max-w-[540px] w-full mx-auto pb-20">
          
          {/* Card do Formulário */}
          <div className="bg-[#064e3b]/40 backdrop-blur-xl p-8 sm:p-12 rounded-[32px] border border-white/10 shadow-2xl">
            


            <div className="animate-in fade-in duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "#ffffff" }}>Comece a vender</h2>
                <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Cadastre sua banca e receba pedidos hoje mesmo.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 text-red-200 text-sm font-bold rounded-xl border border-red-500/30 flex items-center gap-2">
                  <HelpCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Nome da Banca / Produtor</label>
                  <input
                    type="text" name="businessName" value={formData.businessName} onChange={handleChange}
                    placeholder="Ex: Sítio Sol Nascente"
                    className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-[#] outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Seu Nome Completo</label>
                  <input
                    type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    className="w-full bg-white rounded-[18px] px-6 py-4 border border-white/20 focus:border-[#16a34a] outline-none transition-all font-bold text-sm text-gray-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>E-mail</label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full bg-white rounded-[18px] px-6 py-4 border border-white/20 focus:border-[#16a34a] outline-none transition-all font-bold text-sm text-gray-900"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>WhatsApp</label>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full bg-white rounded-[18px] px-6 py-4 border border-white/20 focus:border-[#16a34a] outline-none transition-all font-bold text-sm text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Senha</label>
                    <input
                      type="password" name="password" value={formData.password} onChange={handleChange}
                      className="w-full bg-white rounded-[18px] px-6 py-4 border border-white/20 focus:border-[#16a34a] outline-none transition-all font-bold text-sm text-gray-900"
                      required minLength={6}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Confirmar Senha</label>
                    <input
                      type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      className="w-full bg-white rounded-[18px] px-6 py-4 border border-white/20 focus:border-[#16a34a] outline-none transition-all font-bold text-sm text-gray-900"
                      required minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-[#16a34a] text-white py-4 rounded-[18px] font-black text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 shadow-lg shadow-[#16a34a]/20"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Criar minha banca digital'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-[11px] font-bold text-white font-extrabold">
                  Já é parceiro?{' '}
                  <Link href="/login" className="text-[#4ade80] hover:text-white transition-colors uppercase tracking-widest ml-1">
                    Acesse sua conta
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
