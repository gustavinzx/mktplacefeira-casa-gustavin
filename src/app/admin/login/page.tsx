'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);

  React.useEffect(() => {
    const unlocked = sessionStorage.getItem('admin_entry_unlocked') === 'true';
    if (!unlocked) {
      setIsUnlocked(false);
    } else {
      setIsUnlocked(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setLoading(true);
    setError('');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${origin}/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); } else { setForgotSent(true); }
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
        console.log('Login Auth OK, verificando permissões para:', authData.user.email);
        
        // Busca o perfil geral
        const { data: profile } = await supabase
          .from(getTableName('profiles'))
          .select('*')
          .eq('id', authData.user.id)
          .single();

        // Busca também na tabela específica de admins por email (como redundância)
        const { data: adminRecord } = await supabase
          .from(getTableName('admins'))
          .select('*')
          .eq('email', authData.user.email)
          .single();

        const isAllowed = (profile && profile.role === 'admin') || adminRecord;

        if (isAllowed) {
          localStorage.setItem('user_role', 'admin');
          localStorage.setItem('user_name', profile?.full_name || adminRecord?.full_name || 'Admin');
          document.cookie = 'feira_role=admin; path=/; max-age=86400; SameSite=Lax';
          router.push('/admin');
        } else {
          setError('Acesso negado. Esta área é restrita a administradores.');
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Credenciais inválidas ou erro de conexão. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  if (isUnlocked === null) return null; // Loading state

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#faf9f4] flex flex-col items-center justify-center font-['Plus_Jakarta_Sans'] text-[#1b1c19] p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-red-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-red-600" />
          </div>
          <h1 className="text-[28px] font-extrabold text-red-600 mb-3 tracking-tight">Acesso Bloqueado</h1>
          <p className="text-[#40493c] font-medium mb-8 leading-relaxed">
            Tentativa de acesso não autorizada a uma área de segurança máxima. O protocolo de segurança bloqueou sua entrada.
          </p>
          <Link href="/" className="inline-block w-full py-4 px-6 bg-[#1b1c19] text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-black transition-colors shadow-lg">
            Retornar à Segurança
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-['Plus_Jakarta_Sans'] text-white overflow-hidden flex flex-col md:flex-row">
      
      {/* HEADER LOGO ABSOLUTO (TOP LEFT) */}
      <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-50">
        <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="font-black text-white text-3xl lg:text-4xl tracking-tighter drop-shadow-lg" style={{ textShadow: "0 0 25px currentColor" }} data-glow="true">feira.casa</span>
          <span className="font-extrabold tracking-tighter text-emerald-400 text-3xl lg:text-4xl drop-shadow-lg" style={{ textShadow: "0 0 25px currentColor" }} data-glow="true">admin</span>
        </Link>
      </div>
      
      {/* BACKGROUND FULLSCREEN */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg/admin_bg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#042008]/85 backdrop-blur-[2px]" />
      </div>

      {/* LADO ESQUERDO: TEXTO */}
      <div className="relative z-10 hidden md:flex flex-col w-1/2 p-12 lg:p-16 justify-between">
        <div className="mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">ACESSO ADMINISTRATIVO</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extralight tracking-tight mb-6 leading-[1.1]" style={{ color: "#ffffff" }}>
            Painel de <br />
            <span className="font-black text-emerald-400">Controle.</span>
          </h1>
          <p className="text-lg font-medium max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            Gestão centralizada e segura para o campo e a cidade. Acesse as ferramentas administrativas do ecossistema feira.casa.
          </p>
        </div>

        <div className="mt-auto pb-10">
          <div className="bg-[#020a04]/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 max-w-md shadow-2xl flex items-start gap-4">
            <ShieldCheck className="text-emerald-400 shrink-0" size={32} />
            <div>
              <p className="text-sm font-black" style={{ color: "#ffffff" }}>Ambiente Restrito</p>
              <p className="text-[11px]  font-medium mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                Todas as tentativas de acesso são monitoradas e registradas para sua segurança.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col h-screen overflow-y-auto">
        


        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 max-w-[540px] w-full mx-auto pb-20">
          
          {/* Card do Formulário */}
          <div className="bg-[#020a04]/80 backdrop-blur-xl p-8 sm:p-12 rounded-[32px] border border-white/10 shadow-2xl">
            


            <div className="animate-in fade-in duration-500">
              {view === 'forgot' ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "#ffffff" }}>Recuperar senha</h2>
                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Informe seu e-mail corporativo para receber o link.</p>
                  </div>
                  {error && <div className="p-4 bg-red-500/20 text-red-200 text-[13px] font-bold rounded-xl border border-red-500/30 text-center">{error}</div>}
                  {forgotSent ? (
                    <div className="flex flex-col items-center text-center gap-4 py-4">
                      <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center"><Mail size={24} className="text-emerald-400" /></div>
                      <p className="font-black text-white">E-mail enviado!</p>
                      <p className="text-sm text-white/60 font-medium">Verifique <strong>{forgotEmail}</strong>.</p>
                      <button onClick={() => setView('login')} className="text-sm font-black text-emerald-400 hover:text-white mt-2 transition-colors">← Voltar ao login</button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>E-mail Corporativo</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                          <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="admin@feira.casa" required className="w-full pl-12 pr-4 py-4 bg-white/10-white placeholder:text-white/40 transition-all" />
                        </div>
                      </div>
                      <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/20 hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Enviar link de recuperação'}
                      </button>
                      <button type="button" onClick={() => setView('login')} className="w-full text-sm font-bold text-white/40 hover:text-white transition-colors">← Voltar ao login</button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "#ffffff" }}>Login do Administrador</h2>
                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Acesse o sistema administrativo.</p>
                  </div>

                  {error && <div className="mb-6 p-4 bg-red-500/20 text-red-200 text-sm font-bold rounded-xl border border-red-500/30 text-center">{error}</div>}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>E-mail Corporativo</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="admin@feira.casa" 
                          className="w-full pl-12 pr-4 py-4 bg-white/10-white placeholder:text-white/40 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold" style={{ color: "#ffffff" }}>Senha de Acesso</label>
                        <button type="button" onClick={() => { setError(''); setForgotSent(false); setForgotEmail(formData.email); setView('forgot'); }} className="text-[10px] font-black text-emerald-400 hover:text-white uppercase tracking-widest transition-colors">Esqueci a senha</button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••" 
                          className="w-full pl-12 pr-12 py-4 bg-white/10-white placeholder:text-white/40 transition-all"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 text-white font-black text-sm rounded-[18px] shadow-lg shadow-emerald-600/20 hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : (
                          <>
                            <span>Entrar no Painel</span>
                            <ArrowRight size={20} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
