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
import { supabase, getTableName } from '@/lib/supabase';
import { syncUserProfile } from '@/lib/database';

export default function CadastroB2BPage() {
  const router = useRouter();
  const [view, setView] = useState<'signup' | 'login'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
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
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            user_type: 'b2b',
            company_name: formData.companyName,
            cnpj: formData.cnpj
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        await syncUserProfile({
          id: data.user.id,
          email: formData.email,
          full_name: formData.name,
          phone: formData.phone,
          user_type: 'b2b'
        });
      }

      setSuccess('Solicitação enviada! Nossa equipe de contas entrará em contato.');
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

      if (authError) throw authError;

      if (authData.user) {
        const { data: profile } = await supabase
          .from(getTableName('profiles'))
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profile) {
          localStorage.setItem('user_role', profile.user_type);
          localStorage.setItem('user_name', profile.full_name);
          router.push('/admin/b2b');
        }
      }
    } catch (err: any) {
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-['Be_Vietnam_Pro'] text-[#1e293b]">
      {/* Header */}
      <header className="w-full px-10 py-8 flex justify-between items-center bg-transparent">
        <Link href="/" className="text-2xl font-bold text-[#0f172a] font-['Plus_Jakarta_Sans']">
          feira.casa <span className="text-blue-600 font-black">B2B</span>
        </Link>
        <div className="bg-white p-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors shadow-sm">
          <HelpCircle size={22} className="text-[#64748b]" />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center px-6 pb-12">
        <div 
          style={{ display: 'flex', flexDirection: 'row', minHeight: '700px' }}
          className="w-full max-w-[1150px] bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-200"
        >
          
          {/* LADO ESQUERDO: CORPORATIVO */}
          <div style={{ flex: '1.2', position: 'relative', overflow: 'hidden' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/95 via-[#1e293b]/80 to-[#334155]/40 z-10" />
            
            <img 
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop" 
              alt="Logística B2B" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 z-20 p-16 flex flex-col justify-between text-white">
              <div>
                <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest mb-8 inline-block">
                  Atacado & Distribuição
                </span>
                <h1 className="text-[52px] font-black leading-[1] mb-8 font-['Plus_Jakarta_Sans'] tracking-tight">
                  Escalabilidade <br /> para seu negócio.
                </h1>
                <p className="text-xl opacity-80 max-w-[420px] font-medium leading-relaxed">
                  Reduza custos e garanta a melhor qualidade de produtos frescos com nossa infraestrutura B2B.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-[24px] border border-white/10">
                  <DollarSign size={24} className="text-blue-400 mb-3" />
                  <p className="text-sm font-black">Preços de Custo</p>
                  <p className="text-[11px] opacity-60">Tabelas exclusivas para volume.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-[24px] border border-white/10">
                  <TrendingUp size={24} className="text-emerald-400 mb-3" />
                  <p className="text-sm font-black">Faturamento Flex</p>
                  <p className="text-[11px] opacity-60">Pagamento em até 30 dias.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-[24px] border border-white/10">
                  <Handshake size={24} className="text-amber-400 mb-3" />
                  <p className="text-sm font-black">Key Account</p>
                  <p className="text-[11px] opacity-60">Gerente de conta dedicado.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-[24px] border border-white/10">
                  <FileText size={24} className="text-indigo-400 mb-3" />
                  <p className="text-sm font-black">XML Automatizado</p>
                  <p className="text-[11px] opacity-60">Notas fiscais integradas ao seu ERP.</p>
                </div>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: FORMULÁRIO */}
          <div style={{ flex: '1' }} className="p-10 md:p-16 flex flex-col justify-center bg-white">
            <div className="max-w-[450px] mx-auto w-full">
              {view === 'signup' ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-[36px] font-black text-[#0f172a] mb-2 font-['Plus_Jakarta_Sans'] tracking-tighter">
                    Abra sua Conta PJ
                  </h2>
                  <p className="text-[#64748b] text-sm mb-10 font-medium">
                    Preencha os dados e receba nossa tabela de atacado.
                  </p>

                  {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100">{error}</div>}

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Razão Social / Nome Fantasia</label>
                        <input 
                          type="text" 
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="w-full bg-slate-50 rounded-[16px] px-6 py-4 border-2 border-transparent focus:border-blue-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CNPJ</label>
                        <input 
                          type="text" 
                          name="cnpj"
                          value={formData.cnpj}
                          onChange={handleChange}
                          placeholder="00.000.000/0001-00"
                          className="w-full bg-slate-50 rounded-[16px] px-6 py-4 border-2 border-transparent focus:border-blue-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone / WhatsApp</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-slate-50 rounded-[16px] px-6 py-4 border-2 border-transparent focus:border-blue-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail Corporativo</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-50 rounded-[16px] px-6 py-4 border-2 border-transparent focus:border-blue-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Senha</label>
                        <input 
                          type="password" 
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full bg-slate-50 rounded-[16px] px-6 py-4 border-2 border-transparent focus:border-blue-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmar</label>
                        <input 
                          type="password" 
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full bg-slate-50 rounded-[16px] px-6 py-4 border-2 border-transparent focus:border-blue-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#0f172a] text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                    >
                      {loading ? <Loader2 size={24} className="animate-spin" /> : 'Solicitar Acesso B2B'}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-sm font-bold text-slate-400">
                      Já possui acesso corporativo? <button onClick={() => setView('login')} className="text-blue-600 font-black hover:underline ml-1">Entrar agora</button>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <h2 className="text-[36px] font-black text-[#0f172a] mb-2 font-['Plus_Jakarta_Sans'] tracking-tighter">
                    Login Corporativo
                  </h2>
                  <p className="text-[#64748b] text-sm mb-10 font-medium">
                    Acesse o portal de pedidos B2B.
                  </p>

                  {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100">{error}</div>}
                  {success && <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm font-bold rounded-xl border border-green-100">{success}</div>}

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail Corporativo</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-50 rounded-[18px] px-6 py-5 border-2 border-transparent focus:border-blue-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1 pr-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Senha</label>
                        <button type="button" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Recuperar acesso</button>
                      </div>
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-slate-50 rounded-[18px] px-6 py-5 border-2 border-transparent focus:border-blue-600/20 focus:bg-white outline-none transition-all font-bold text-sm"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#0f172a] text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                    >
                      {loading ? <Loader2 size={24} className="animate-spin" /> : 'Entrar no Portal B2B'}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-sm font-bold text-slate-400">
                      Novo parceiro? <button onClick={() => setView('signup')} className="text-blue-600 font-black hover:underline ml-1">Cadastre sua empresa</button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-12 py-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center bg-white/50 backdrop-blur-md">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-[#0f172a] text-xl font-['Plus_Jakarta_Sans'] tracking-tighter">feira.casa <span className="text-blue-600 font-black text-sm">B2B</span></span>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">© 2024 Corporate Solutions - Soluções inteligentes para sua cadeia de suprimentos.</p>
        </div>
        
        <div className="flex items-center gap-10">
          <nav className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-blue-600 transition-colors">Tabela de Preços</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Logística</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Suporte PJ</Link>
          </nav>
          <div className="text-slate-200">
            <ShieldCheck size={20} />
          </div>
        </div>
      </footer>
    </div>
  );
}
