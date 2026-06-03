'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ArrowLeft, Tent, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildAuthMetadata, syncProfileAfterSignup } from '@/lib/signup';
import { persistAuthSession } from '@/lib/profile';

export default function VendorSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    cnpj: '',
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

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
            category: formData.category,
            cnpj: formData.cnpj,
          }),
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const sync = await syncProfileAfterSignup(authData.session?.access_token, {
          role: 'feirante',
          fullName: formData.fullName,
          phone: formData.phone,
          businessName: formData.businessName,
          category: formData.category,
          cnpj: formData.cnpj,
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
      console.error('Erro no cadastro:', err);
      setError(err.message || 'Erro ao processar seu cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Plus_Jakarta_Sans'] relative bg-[#fdf8f4]">
      {/* Padrão geométrico sutil (esteira/palha/xadrez terroso) */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #78350f 25%, transparent 25%, transparent 75%, #78350f 75%, #78350f), repeating-linear-gradient(45deg, #78350f 25%, transparent 25%, transparent 75%, #78350f 75%, #78350f)`,
          backgroundPosition: `0 0, 10px 10px`,
          backgroundSize: `20px 20px`
        }}
      />
      
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <Link href="/" className="text-2xl font-extrabold text-[#c2410c] tracking-tighter">
          feira.casa
        </Link>
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-orange-100 text-orange-800 text-xs font-bold uppercase tracking-widest">
          <Tent size={14} />
          Área do Feirante
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 z-10 py-24">
        <div className="w-full max-w-xl bg-white rounded-[32px] shadow-2xl shadow-orange-900/5 border border-orange-100 overflow-hidden relative">
          
          <div className="bg-gradient-to-br from-[#f97316] to-[#c2410c] p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Tent size={120} />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30 shadow-inner">
                <Tent size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">Sua barraca, seu negócio.</h1>
              <p className="text-orange-100 font-medium max-w-sm">Junte-se a mais de <strong className="text-white">500 feirantes</strong> vendendo no digital.</p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="flex gap-4 mb-8">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${step === 1 ? 'border-[#f97316] text-[#c2410c]' : 'border-gray-100 text-gray-400'}`}
              >
                1. Sua Barraca
              </button>
              <button 
                type="button" 
                onClick={() => { if (formData.businessName) setStep(2); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${step === 2 ? 'border-[#f97316] text-[#c2410c]' : 'border-gray-100 text-gray-400'}`}
              >
                2. Seus Dados
              </button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-100">{error}</div>}

            <form onSubmit={handleNext} className="space-y-5">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Nome da Banca / Barraca</label>
                    <input 
                      name="businessName" value={formData.businessName} onChange={handleChange} 
                      placeholder="Ex: Barraca do Zé das Frutas" 
                      className="w-full px-4 py-3 bg-[#fdf8f4] border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-gray-800 font-medium"
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Especialidade</label>
                      <select 
                        name="category" value={formData.category} onChange={handleChange} 
                        className="w-full px-4 py-3 bg-[#fdf8f4] border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-gray-800 font-medium"
                        required
                      >
                        <option value="">Selecione...</option>
                        <option>Frutas</option>
                        <option>Legumes e Verduras</option>
                        <option>Carnes e Peixes</option>
                        <option>Pastéis e Salgados</option>
                        <option>Queijos e Laticínios</option>
                        <option>Artesanato</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">CNPJ (Opcional)</label>
                      <input 
                        name="cnpj" value={formData.cnpj} onChange={handleChange} 
                        placeholder="00.000.000/0000-00" 
                        className="w-full px-4 py-3 bg-[#fdf8f4] border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-gray-800 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg text-sm font-medium text-orange-900 border border-orange-100/50">
                      <TrendingUp size={20} className="text-orange-500 shrink-0" />
                      Aumente suas vendas online
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg text-sm font-medium text-orange-900 border border-orange-100/50">
                      <Users size={20} className="text-orange-500 shrink-0" />
                      Fidelize seus clientes
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Nome Completo</label>
                    <input 
                      name="fullName" value={formData.fullName} onChange={handleChange} 
                      placeholder="Como você se chama?" 
                      className="w-full px-4 py-3 bg-[#fdf8f4] border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-gray-800 font-medium"
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">E-mail</label>
                      <input 
                        type="email" name="email" value={formData.email} onChange={handleChange} 
                        placeholder="seu@email.com" 
                        className="w-full px-4 py-3 bg-[#fdf8f4] border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-gray-800 font-medium"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">WhatsApp</label>
                      <input 
                        type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                        placeholder="(00) 00000-0000" 
                        className="w-full px-4 py-3 bg-[#fdf8f4] border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-gray-800 font-medium"
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Senha de Acesso</label>
                    <input 
                      type="password" name="password" value={formData.password} onChange={handleChange} 
                      placeholder="Mínimo 8 caracteres" 
                      className="w-full px-4 py-3 bg-[#fdf8f4] border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-gray-800 font-medium"
                      required 
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-[#f97316] text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:bg-[#ea580c] transition-all flex justify-center items-center gap-3 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      {step === 1 ? 'Próximo Passo' : 'Abrir minha Barraca Digital'}
                      {step === 1 ? <ArrowRight size={20} /> : <CheckCircle2 size={20} />}
                    </>
                  )}
                </button>
              </div>

              {step === 2 && (
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors py-2"
                >
                  <ArrowLeft size={16} /> Voltar para Banca
                </button>
              )}

              <p className="text-center text-sm text-gray-500 font-medium pt-4 border-t border-gray-100 mt-6">
                Já é parceiro da feira? <Link href="/login" className="text-[#c2410c] font-bold hover:underline">Entrar na conta</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
