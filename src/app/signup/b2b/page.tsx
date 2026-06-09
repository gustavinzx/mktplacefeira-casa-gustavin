'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  HelpCircle,
  ShieldCheck,
  Building2,
  Handshake,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildAuthMetadata, syncProfileAfterSignup } from '@/lib/signup';
import { persistAuthSession } from '@/lib/profile';

export default function B2BSignup() {
  const router = useRouter();
  const [view, setView] = useState<'signup' | 'login'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '', // The beautiful layout only uses email, password, confirmPassword, companyName, cnpj, phone. Oh wait, it doesn't have a fullName field in the layout! Let's check the code:
    phone: '',
    confirmPassword: '',
    companyName: '',
    cnpj: ''
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
            role: 'b2b',
            fullName: formData.companyName, // Use companyName as fullName since there's no name field
            phone: formData.phone,
            companyName: formData.companyName,
            cnpj: formData.cnpj
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
          role: 'b2b',
          fullName: formData.companyName,
          phone: formData.phone,
          companyName: formData.companyName,
          cnpj: formData.cnpj,
          email: formData.email,
        });

        if (!sync.ok && !authData.session) {
          setError('Conta criada! Confirme o e-mail se necessário e faça login.');
          router.push('/login?signup=success&tipo=b2b');
          return;
        }

        if (authData.session?.access_token) {
          persistAuthSession(authData.session.access_token, {
            role: 'b2b',
            full_name: formData.companyName,
          });
          router.push('/portal/b2b');
          return;
        }

        router.push('/login?signup=success&tipo=b2b');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-white overflow-hidden flex flex-col md:flex-row">
      
      {/* HEADER LOGO ABSOLUTO (TOP LEFT) */}
      <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-50">
        <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="font-black text-white text-3xl lg:text-4xl tracking-tighter drop-shadow-lg" style={{ textShadow: "0 0 25px currentColor" }} data-glow="true">feira.casa</span>
          <span className="font-extrabold tracking-tighter text-blue-400 text-3xl lg:text-4xl drop-shadow-lg" style={{ textShadow: "0 0 25px currentColor" }} data-glow="true">empresarial</span>
        </Link>
      </div>
      
      {/* BACKGROUND FULLSCREEN */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg/b2b_bg.png"
          alt="Logística B2B"
          className="w-full h-full object-cover object-[left_center]"
        />
        <div className="absolute inset-0 bg-[#0f172a]/85 backdrop-blur-[2px]" />
      </div>

      {/* LADO ESQUERDO: TEXTO */}
      <div className="relative z-10 hidden md:flex flex-col w-1/2 p-12 lg:p-16 justify-between">
        <div className="mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#60a5fa" }}>ATACADO & DISTRIBUIÇÃO</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extralight tracking-tight mb-6 leading-[1.1]" style={{ color: "#ffffff" }}>
            Escalabilidade <br />
            <span className="font-black text-blue-400">para seu negócio.</span>
          </h1>
          <p className="text-lg font-medium max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            Reduza custos e garanta a melhor qualidade de produtos frescos com nossa infraestrutura B2B.
          </p>
        </div>

        <div className="mt-auto pb-10">
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {[
              { icon: DollarSign, color: 'text-blue-400', title: 'Preços de Custo', desc: 'Tabelas exclusivas para volume.' },
              { icon: TrendingUp, color: 'text-emerald-400', title: 'Faturamento Flex', desc: 'Pagamento em até 30 dias.' },
              { icon: Handshake, color: 'text-amber-400', title: 'Key Account', desc: 'Gerente de conta dedicado.' },
              { icon: FileText, color: 'text-indigo-400', title: 'XML Automatizado', desc: 'Notas fiscais integradas ao seu ERP.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-[#020617]/60 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                <Icon size={24} className={`${color} mb-3`} />
                <p className="text-sm font-black" style={{ color: "#ffffff" }}>{title}</p>
                <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col h-screen overflow-y-auto">
        


        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 max-w-[540px] w-full mx-auto pb-20">
          
          {/* Card do Formulário */}
          <div className="bg-[#020617]/80 backdrop-blur-xl p-8 sm:p-12 rounded-[32px] border border-white/10 shadow-2xl">
            


            <div className="animate-in fade-in duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "#ffffff" }}>Abra sua Conta PJ</h2>
                <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Preencha os dados e receba nossa tabela de atacado.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 text-red-200 text-sm font-bold rounded-xl border border-red-500/30 flex items-center gap-2">
                  <HelpCircle size={18} /> {error}
                </div>
              )}

                            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#ffffff' }}>Razão Social / Nome Fantasia</label>
                  <input
                    type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                    className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-blue-400 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#ffffff' }}>CNPJ</label>
                    <input
                      type="text" name="cnpj" value={formData.cnpj} onChange={handleChange}
                      placeholder="00.000.000/0001-00"
                      className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-blue-400 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#ffffff' }}>WhatsApp</label>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-blue-400 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#ffffff' }}>E-mail Corporativo</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-blue-400 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#ffffff' }}>Senha</label>
                    <input
                      type="password" name="password" value={formData.password} onChange={handleChange}
                      className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-blue-400 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                      required minLength={6}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#ffffff' }}>Confirmar Senha</label>
                    <input
                      type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-blue-400 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                      required minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-[18px] font-black text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 shadow-lg shadow-blue-600/20"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Solicitar Análise de Conta ->'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-[11px] font-bold font-extrabold" style={{ color: "#ffffff" }}>
                  Já possui acesso corporativo?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-white transition-colors uppercase tracking-widest ml-1">
                    Entrar agora
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
