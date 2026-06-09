'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  HelpCircle,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { supabase, supabaseAdmin, getTableName } from '@/lib/supabase';

export default function LoginClientePage() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        let { data: profile } = await supabase
          .from(getTableName('userb2c'))
          .select('*')
          .eq('id', authData.user.id)
          .single();

        // Contingência: se o perfil não existe no banco, cria agora via admin (bypassa RLS)
        if (!profile) {
          await supabaseAdmin.from(getTableName('userb2c')).upsert({
            id: authData.user.id,
            email: authData.user.email || formData.email,
            full_name: authData.user.user_metadata?.full_name || '',
            phone: authData.user.user_metadata?.phone || ''
          }, { onConflict: 'id' });
          profile = { full_name: authData.user.user_metadata?.full_name || '' };
        }

        localStorage.setItem('user_role', 'b2c');
        localStorage.setItem('user_name', profile.full_name || '');
        localStorage.setItem('user_id', authData.user.id);
        document.cookie = 'feira_role=usuario; path=/; max-age=86400; SameSite=Lax';
        window.location.href = '/portal/usuario';
      }
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
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
            user_type: 'b2c'
          }
        }
      });

      if (authError) throw authError;

      // Garante o registro na tabela via admin (bypassa RLS e evita problema de SELECT sem sessão)
      if (data.user) {
        await supabaseAdmin.from(getTableName('userb2c')).upsert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.name,
          phone: formData.phone
        }, { onConflict: 'id' });
      }

      setSuccess('Conta criada com sucesso! Você já pode fazer login.');
      setView('login');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
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
    if (err) {
      setError(err.message);
    } else {
      setForgotSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf5] flex flex-col font-sans text-[#404940]">
      {/* Header */}
      <header className="w-full px-10 py-8 flex justify-between items-center bg-transparent">
        <Link href="/" className="text-2xl font-bold text-[#0e6b17] font-sans">
          feira.casa
        </Link>
        <div className="bg-[#f0f0e8] p-2 rounded-full cursor-pointer hover:bg-[#e0e0d8] transition-colors">
          <HelpCircle size={22} className="text-[#707a6f]" />
        </div>
      </header>

      {/* Main Container - FORCING FLEX ROW FOR LATERAL COLUMNS */}
      <main className="flex-grow flex items-center justify-center px-6 pb-12">
        <div 
          style={{ display: 'flex', flexDirection: 'row', minHeight: '650px' }}
          className="w-full max-w-[1100px] bg-white rounded-[32px] overflow-hidden shadow-2xl border border-[#bfc9bd]/20"
        >
          
          {/* LADO ESQUERDO: IMAGEM (Forcing 50% width) */}
          <div style={{ flex: '1', position: 'relative', overflow: 'hidden' }}>
            {/* Overlays for perfect text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
            <div className="absolute inset-0 bg-[#0e6b17]/30 z-10" />
            
            <img 
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000&auto=format&fit=crop" 
              alt="Legumes frescos" 
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
            
            {/* Badge */}
            <div className="absolute top-8 right-8 z-20">
              <span className="bg-[#ff6b00] text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">
                Colhido hoje
              </span>
            </div>

            {/* Bottom Text - FORCING WHITE COLOR with Shadow */}
            <div style={{ position: 'absolute', top: '50px', left: '50px', right: '50px', zIndex: 20 }}>
              <h1 
                style={{ color: 'white', textShadow: '0 4px 12px rgba(0,0,0,0.5)', margin: 0 }}
                className="text-[40px] font-black leading-[1.1] mb-6 font-sans"
              >
                O frescor da feira <br /> na sua mesa.
              </h1>
              <p 
                style={{ color: 'white', margin: 0 }}
                className="text-base leading-relaxed max-w-[340px] font-medium"
              >
                Conecte-se com produtores locais e receba produtos frescos direto na sua casa.
              </p>
            </div>
          </div>

          {/* LADO DIREITO: FORMULÁRIO (Forcing 50% width) */}
          <div style={{ flex: '1' }} className="p-10 md:p-16 flex flex-col justify-center bg-white">
            <div className="max-w-[420px] mx-auto w-full">
              {view === 'login' ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-[40px] font-extrabold text-[#0e6b17] mb-4 font-sans tracking-tight">
                    Acesse sua conta
                  </h2>
                  <p className="text-[#707a6f] text-base mb-14 font-medium">
                    Que bom ver você por aqui novamente!
                  </p>

                  {error && <div className="mb-8 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100">{error}</div>}
                  {success && <div className="mb-8 p-4 bg-green-50 text-green-600 text-sm font-bold rounded-xl border border-green-100">{success}</div>}

                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    {/* E-mail Block */}
                    <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ 
                        fontSize: '11px', 
                        fontWeight: '900', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.2em', 
                        marginBottom: '12px', 
                        color: '#231a11',
                        marginLeft: '4px'
                      }}>
                        E-mail ou CPF
                      </label>
                      <input 
                        type="text" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Digite seu e-mail ou CPF" 
                        style={{ 
                          width: '100%', 
                          backgroundColor: '#f6f6f2', 
                          borderRadius: '16px', 
                          padding: '24px', 
                          border: '2px solid transparent',
                          outline: 'none',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                        required
                      />
                    </div>

                    {/* Password Block */}
                    <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingRight: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#231a11' }}>
                          Senha
                        </label>
                        <button type="button" onClick={() => { setError(''); setForgotSent(false); setForgotEmail(formData.email); setView('forgot'); }} style={{ fontSize: '11px', fontWeight: 'bold', color: '#a63b00', border: 'none', background: 'none', cursor: 'pointer' }}>
                          Esqueceu a senha?
                        </button>
                      </div>
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••" 
                        style={{ 
                          width: '100%', 
                          backgroundColor: '#f6f6f2', 
                          borderRadius: '16px', 
                          padding: '24px', 
                          border: '2px solid transparent',
                          outline: 'none',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                        required
                      />
                    </div>

                    {/* Remember me */}
                    <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '4px' }}>
                      <input type="checkbox" id="remember" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      <label htmlFor="remember" style={{ fontSize: '14px', fontWeight: '600', color: '#707a6f', cursor: 'pointer' }}>Lembrar de mim</label>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={loading}
                      style={{ 
                        width: '100%', 
                        backgroundColor: '#0e6b17', 
                        color: 'white', 
                        padding: '20px', 
                        borderRadius: '20px', 
                        fontWeight: 'bold', 
                        fontSize: '18px', 
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 10px 25px rgba(14, 107, 23, 0.25)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                      }}
                    >
                      {loading ? <Loader2 size={22} className="animate-spin" /> : 'Entrar na feira'}
                    </button>
                  </form>

                  <div style={{ 
                    marginTop: '48px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '16px' 
                  }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#707a6f', margin: 0 }}>
                      Novo por aqui?
                    </p>
                    <button 
                      onClick={() => setView('signup')} 
                      style={{ 
                        backgroundColor: '#ff6b00', 
                        color: 'white', 
                        padding: '14px 36px', 
                        borderRadius: '100px', 
                        fontWeight: 'bold', 
                        fontSize: '14px', 
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(255, 107, 0, 0.25)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Crie sua conta agora
                    </button>
                  </div>
                </div>
              ) : view === 'forgot' ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-[36px] font-extrabold text-[#0e6b17] mb-2 font-sans tracking-tight">
                    Recuperar senha
                  </h2>
                  <p className="text-[#707a6f] text-sm mb-8 font-medium">
                    Digite seu e-mail e enviaremos um link para criar uma nova senha.
                  </p>

                  {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100">{error}</div>}

                  {forgotSent ? (
                    <div className="flex flex-col items-center text-center gap-4 py-6">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                        <Mail size={28} className="text-green-600" />
                      </div>
                      <p className="font-black text-gray-800">E-mail enviado!</p>
                      <p className="text-sm text-gray-500 font-medium">
                        Verifique sua caixa de entrada em <strong>{forgotEmail}</strong> e clique no link para criar uma nova senha.
                      </p>
                      <button
                        onClick={() => { setView('login'); setForgotSent(false); }}
                        style={{ fontSize: '13px', fontWeight: 'bold', color: '#0e6b17', border: 'none', background: 'none', cursor: 'pointer', marginTop: '8px' }}
                      >
                        ← Voltar ao login
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px', color: '#231a11', marginLeft: '4px' }}>
                          Seu e-mail
                        </label>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="Digite seu e-mail cadastrado"
                          required
                          style={{ width: '100%', backgroundColor: '#f6f6f2', borderRadius: '16px', padding: '24px', border: '2px solid transparent', outline: 'none', fontSize: '14px', fontWeight: '500' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', backgroundColor: '#0e6b17', color: 'white', padding: '20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px rgba(14, 107, 23, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                      >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Enviar link de recuperação'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setView('login')}
                        style={{ fontSize: '13px', fontWeight: 'bold', color: '#707a6f', border: 'none', background: 'none', cursor: 'pointer', marginTop: '4px' }}
                      >
                        ← Voltar ao login
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <h2 className="text-[36px] font-extrabold text-[#0e6b17] mb-2 font-sans tracking-tight">
                    Criar minha conta
                  </h2>
                  <p className="text-[#707a6f] text-sm mb-10 font-medium">
                    Junte-se à nossa comunidade de produtores e clientes.
                  </p>

                  <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Nome Completo */}
                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px', color: '#231a11', marginLeft: '4px' }}>Nome completo</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={{ width: '100%', backgroundColor: '#f6f6f2', borderRadius: '16px', padding: '20px', border: 'none', outline: 'none', fontSize: '14px' }}
                        required
                      />
                    </div>

                    {/* E-mail */}
                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px', color: '#231a11', marginLeft: '4px' }}>E-mail</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{ width: '100%', backgroundColor: '#f6f6f2', borderRadius: '16px', padding: '20px', border: 'none', outline: 'none', fontSize: '14px' }}
                        required
                      />
                    </div>

                    {/* WhatsApp */}
                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px', color: '#231a11', marginLeft: '4px' }}>WhatsApp</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{ width: '100%', backgroundColor: '#f6f6f2', borderRadius: '16px', padding: '20px', border: 'none', outline: 'none', fontSize: '14px' }}
                        required
                      />
                    </div>

                    {/* Senhas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px', color: '#231a11', marginLeft: '4px' }}>Senha</label>
                        <input 
                          type="password" 
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          style={{ width: '100%', backgroundColor: '#f6f6f2', borderRadius: '16px', padding: '20px', border: 'none', outline: 'none', fontSize: '14px' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px', color: '#231a11', marginLeft: '4px' }}>Confirmar</label>
                        <input 
                          type="password" 
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          style={{ width: '100%', backgroundColor: '#f6f6f2', borderRadius: '16px', padding: '20px', border: 'none', outline: 'none', fontSize: '14px' }}
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      style={{ 
                        width: '100%', 
                        backgroundColor: '#0e6b17', 
                        color: 'white', 
                        padding: '20px', 
                        borderRadius: '20px', 
                        fontWeight: 'bold', 
                        fontSize: '18px', 
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 10px 25px rgba(14, 107, 23, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                      }}
                    >
                      {loading ? <Loader2 size={22} className="animate-spin" /> : 'Criar conta agora'}
                    </button>
                  </form>

                  <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#707a6f' }}>
                      Já tem conta? <button onClick={() => setView('login')} style={{ fontWeight: 'extrabold', color: '#0e6b17', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '4px' }}>Faça login</button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Matching screenshot exactly */}
      <footer className="w-full px-12 py-10 border-t border-[#bfc9bd]/20 flex flex-col md:flex-row justify-between items-center bg-[#fbfaf5]">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-[#0e6b17] text-xl font-sans">feira.casa</span>
          <p className="text-[11px] font-bold text-[#bfc9bd]">© 2024 Feira Viva - Conectando o campo à sua mesa.</p>
        </div>
        
        <div className="flex items-center gap-10">
          <nav className="flex gap-8 text-[11px] font-black text-[#707a6f] uppercase tracking-widest">
            <Link href="/" className="hover:text-[#0e6b17] transition-colors">Termos de Uso</Link>
            <Link href="/" className="hover:text-[#0e6b17] transition-colors">Privacidade</Link>
            <Link href="/" className="hover:text-[#0e6b17] transition-colors">Suporte</Link>
          </nav>
          <div className="text-[#bfc9bd]">
            <ShieldCheck size={20} />
          </div>
        </div>
      </footer>
    </div>
  );
}
