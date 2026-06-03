'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Building2, Briefcase, Receipt, CreditCard, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildAuthMetadata, syncProfileAfterSignup } from '@/lib/signup';
import { persistAuthSession } from '@/lib/profile';

export default function B2BSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: '',
    cnpj: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // CNPJ simple mask application could go here, for now it's just value assignment
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
            role: 'b2b',
            fullName: formData.businessName,
            phone: formData.phone,
            cnpj: formData.cnpj,
          }),
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const sync = await syncProfileAfterSignup(authData.session?.access_token, {
          role: 'b2b',
          fullName: formData.businessName,
          phone: formData.phone,
          cnpj: formData.cnpj,
          email: formData.email,
        });

        if (!sync.ok && !authData.session) {
          setError('Cadastro recebido! O acesso será avaliado pela nossa equipe comercial.');
          router.push('/login?signup=success&tipo=b2b');
          return;
        }

        if (authData.session?.access_token) {
          persistAuthSession(authData.session.access_token, {
            role: 'b2b',
            full_name: formData.businessName,
          });
          router.push('/b2b/faturamento');
          return;
        }

        router.push('/login?signup=success&tipo=b2b');
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(err.message || 'Erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-[Inter,sans-serif] relative">
      
      {/* Fundo Subtle Grid Azul Claro */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage: `linear-gradient(#bfdbfe 1px, transparent 1px), linear-gradient(90deg, #bfdbfe 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none z-0"></div>

      {/* Header Corporativo */}
      <header className="relative w-full px-8 py-6 flex justify-between items-center z-20 border-b border-blue-100 bg-white/70 backdrop-blur-sm">
        <Link href="/" className="text-2xl font-black text-blue-800 tracking-tighter">
          feira.casa <span className="text-blue-500 font-medium tracking-normal text-sm ml-1">Para Empresas</span>
        </Link>
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest shadow-sm">
          <Briefcase size={14} />
          Acesso Empresarial
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 z-10 w-full max-w-6xl mx-auto py-12">
        <div className="w-full bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden grid grid-cols-1 lg:grid-cols-5">
          
          {/* Lado Esquerdo - Benefícios */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 to-blue-800 p-10 text-white relative flex flex-col justify-between">
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop')] bg-cover opacity-[0.08] mix-blend-overlay"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-bold tracking-tight mb-4">Compras inteligentes para seu negócio.</h1>
              <p className="text-blue-200 text-sm mb-10 leading-relaxed">
                Abasteça seu restaurante, mercado ou empresa direto dos produtores. Volume e qualidade com gestão simplificada.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-400/30">
                    <CheckCircle2 className="text-blue-300" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Preços Exclusivos de Atacado</h3>
                    <p className="text-xs text-blue-200 mt-1">Margens agressivas para compras em alto volume.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-400/30">
                    <Receipt className="text-blue-300" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Faturamento e NFe</h3>
                    <p className="text-xs text-blue-200 mt-1">Notas fiscais automatizadas direto no seu painel.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-400/30">
                    <CreditCard className="text-blue-300" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Crédito Empresarial</h3>
                    <p className="text-xs text-blue-200 mt-1">Pagamento via boleto faturado para CNPJs aprovados.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 pt-8 border-t border-blue-700/50">
              <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold mb-4">Empresas que confiam</p>
              <div className="flex gap-4 opacity-50 grayscale">
                <Building2 size={28} />
                <Briefcase size={28} />
                <Receipt size={28} />
              </div>
            </div>
          </div>

          {/* Lado Direito - Form B2B */}
          <div className="lg:col-span-3 p-10 lg:p-16 flex flex-col justify-center">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Abertura de Conta B2B</h2>
              <p className="text-slate-500 text-sm">Preencha os dados da empresa. Nossa equipe aprova em até 24h.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">CNPJ</label>
                <input 
                  name="cnpj" value={formData.cnpj} onChange={handleChange} 
                  placeholder="00.000.000/0000-00" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none text-slate-800 font-medium"
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Razão Social</label>
                <input 
                  name="businessName" value={formData.businessName} onChange={handleChange} 
                  placeholder="Empresa Comércio de Alimentos LTDA" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none text-slate-800 font-medium"
                  required 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">E-mail Corporativo</label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} 
                    placeholder="compras@empresa.com" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none text-slate-800 font-medium"
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Telefone / WhatsApp</label>
                  <input 
                    type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                    placeholder="(00) 0000-0000" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none text-slate-800 font-medium"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Senha</label>
                <input 
                  type="password" name="password" value={formData.password} onChange={handleChange} 
                  placeholder="Defina a senha de acesso ao portal" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none text-slate-800 font-medium"
                  required 
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      Solicitar Cadastro Empresarial
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-slate-500 pt-6 mt-6 border-t border-slate-100">
                Já é cliente B2B? <Link href="/login" className="text-blue-700 font-semibold hover:underline">Fazer login no portal</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
