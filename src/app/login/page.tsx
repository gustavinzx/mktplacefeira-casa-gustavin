"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  LogIn,
  UserPlus,
  HelpCircle,
  Shield,
  Info,
  Phone,
  ShoppingBag,
  Store,
  Briefcase,
  ChefHat,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { persistAuthSession } from "@/lib/profile";
import { resolvePostLoginPath } from "@/lib/login-redirect";
import { buildAuthMetadata, syncProfileAfterSignup, resolveSignupRole } from "@/lib/signup";
import { useCartStore } from "@/store/useCartStore";

const MEDIA_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCEo4QDOzSCJ90Ni1lv45iTYu1TStHTyKFuZoT-mjXI_jYxI6bU2bsAPPqMeP_yKeyEyYXEvdcIek9FKuZ-ThVqG-gCldV-epUWIItq_bztmoL7jtjS5_2XzbhlgU2eWWQGze8q4Tfr6FHkhXDLN67zSuR1XrGks_h9y_zoYtkhWIUcPIfn4ym0YlByVGPNWLO4WHi3xv8G8OxBpNnVcgASFTjmGGEJK9IVUX8WQaswYfgc5tAbWAn6PSKAqLeOO65YGMTWSIVeSMc";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  // OAuth loading state
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "cliente",
  });
  const [showB2CForm, setShowB2CForm] = useState(false);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSignupData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [checkingSession, setCheckingSession] = useState(true);
  const loadingRef = React.useRef(loading);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    let active = true;

    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && active) {
          // Validar com o servidor para evitar loop infinito com o middleware (localStorage vs Cookies)
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            await supabase.auth.signOut();
            if (active) setCheckingSession(false);
            return;
          }

          const { data: profile } = await supabase
            .from("mktplace_feira_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile && active) {
            persistAuthSession(session.access_token, profile);
            const next = searchParams.get("next");
            const target = resolvePostLoginPath(profile.role, next);
            if (target !== '/login') {
              window.location.href = target;
              return;
            }
          }
        }
      } catch (e) {
        console.error("Erro na verificação de sessão inicial:", e);
      }
      if (active) setCheckingSession(false);
    };

    checkInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session && active) {
        if (loadingRef.current) return;
        setCheckingSession(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 50));

          let { data: profile } = await supabase
            .from("mktplace_feira_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!profile && active) {
            await syncProfileAfterSignup(session.access_token, {
              role: 'cliente',
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
              email: session.user.email,
            });

            const { data: newProfileRow } = await supabase
              .from("mktplace_feira_profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
              
            profile = newProfileRow;
          }

          if (profile && active) {
            if (profile.role === 'admin') {
              await supabase.auth.signOut();
              setError("Acesso bloqueado. Administradores devem usar a entrada de segurança no rodapé.");
              if (active) setCheckingSession(false);
              return;
            }

            persistAuthSession(session.access_token, profile);
            useCartStore.getState().clearCart();
            localStorage.removeItem('checkout_items');
            localStorage.removeItem('checkout_subtotal');

            const next = searchParams.get("next");
            const target = resolvePostLoginPath(profile.role, next);
            if (target !== '/login') {
              router.push(target);
              setTimeout(() => { if (active) setCheckingSession(false); }, 3000);
            } else {
              if (active) setCheckingSession(false);
            }
          }
        } catch (err) {
          console.error("Erro processando OAuth login:", err);
          setError("Ocorreu um erro ao finalizar o login.");
          if (active) setCheckingSession(false);
        }
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [router, searchParams]);

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    if (oauthLoading) return;
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      console.error(`Erro no login com ${provider}:`, err);
      setError(`O login com ${provider === 'google' ? 'Google' : 'Apple'} não está configurado no banco de dados ainda.`);
      setOauthLoading(null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotLoading || !forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotSuccess("");
    setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/account/reset-password`,
      });
      if (error) throw error;
      setForgotSuccess("Enviamos um link de recuperação para seu email.");
    } catch (err: any) {
      setError(err?.message || "Erro ao enviar e-mail de recuperação.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: loginData.email,
          password: loginData.password,
        });

      if (authError) {
        setError(authError.message === 'Invalid login credentials' ? "E-mail ou senha incorretos." : authError.message);
        setLoading(false);
        return;
      }

      if (authData?.user && authData?.session) {
        const { data: profile } = await supabase
          .from("mktplace_feira_profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        if (profile?.role === 'admin') {
          await supabase.auth.signOut();
          setError("Acesso bloqueado. Administradores devem usar a entrada de segurança no rodapé.");
          setLoading(false);
          return;
        }

        persistAuthSession(authData.session.access_token, profile);
        useCartStore.getState().clearCart();
        localStorage.removeItem('checkout_items');
        localStorage.removeItem('checkout_subtotal');

        const next = new URLSearchParams(window.location.search).get("next");
        window.location.href = resolvePostLoginPath(profile?.role, next);
      } else {
         setError("Erro ao autenticar. Tente novamente.");
         setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Ocorreu um erro inesperado ao fazer login.");
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setSuccess("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const signupRole = resolveSignupRole(signupData.role);

      const { data, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: buildAuthMetadata({
            role: signupRole,
            fullName: signupData.name,
            phone: signupData.phone,
          }),
        },
      });

      if (authError) throw authError;

      await syncProfileAfterSignup(data.session?.access_token, {
        role: signupRole,
        fullName: signupData.name,
        phone: signupData.phone,
        email: signupData.email,
      });

      setSuccess("Conta criada com sucesso! Você já pode fazer login.");
      setActiveTab("login");
      setLoginData({ email: signupData.email, password: "" });
    } catch (err: any) {
      const message = err?.message || "Erro ao criar conta.";
      console.error("Erro ao cadastrar:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <Loader2 size={48} className="animate-spin text-green-600" />
        <p className="text-gray-500 font-bold text-lg">Carregando sua sessão...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-['Plus_Jakarta_Sans'] text-white overflow-hidden flex flex-col md:flex-row">
      
      {/* HEADER LOGO ABSOLUTO (TOP LEFT) */}
      <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-50">
        <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="font-black text-white text-3xl lg:text-4xl tracking-tighter drop-shadow-lg" style={{ textShadow: "0 0 25px currentColor" }} data-glow="true">feira.casa</span>
          <span className="font-extrabold tracking-tighter text-[#4ade80] text-3xl lg:text-4xl drop-shadow-lg" style={{ textShadow: "0 0 25px currentColor" }} data-glow="true">acesso</span>
        </Link>
      </div>
      
      {/* BACKGROUND DA TELA TODA */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg/login_bg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#062411]/85 backdrop-blur-[2px]" />
      </div>

      {/* LADO ESQUERDO: TEXTO E TESTEMUNHO */}
      <div className="relative z-10 hidden md:flex flex-col w-1/2 p-12 lg:p-16 justify-between">
        <div className="mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4ade80]">COLHIDO HOJE</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extralight tracking-tight mb-6 leading-[1.1]" style={{ color: "#ffffff" }}>
            Produtos frescos, <br />
            <span className="font-black text-[#4ade80]">perto de você.</span>
          </h1>
          <p className="text-lg font-medium max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            Conectando você diretamente aos produtores locais com rastreabilidade e qualidade certificada.
          </p>
        </div>

        <div className="mt-auto pb-10">
          <div className="bg-[#0f4422]/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 max-w-md shadow-2xl">
            <div className="flex items-center gap-4">
              <img src="https://i.pravatar.cc/100?img=32" alt="Avatar" className="w-14 h-14 rounded-full border-2 border-[#4ade80]" />
              <div>
                <p className="text-sm italic font-medium text-white/90 leading-relaxed">"Nunca foi tão fácil comprar verduras orgânicas direto de quem planta. Chega fresco toda terça-feira!"</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#4ade80] mt-2">— Mariana S., Consumidora</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col h-screen overflow-y-auto">
        


        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 max-w-[540px] w-full mx-auto pb-20">
          
          {/* Card do Formulário */}
          <div className="bg-[#0a2e16]/80 backdrop-blur-xl p-8 sm:p-12 rounded-[32px] border border-white/10 shadow-2xl">
            


            {/* Abas */}
            <div className="flex bg-black/20 p-1 rounded-2xl mb-10 border border-white/5">
              <button
                onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'login' ? 'bg-[#4ade80] text-[#062411] shadow-lg' : 'text-white/50 hover:text-white'}`}
              >
                ACESSAR
              </button>
              <button
                onClick={() => { setActiveTab("signup"); setError(""); setSuccess(""); }}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'signup' ? 'bg-[#4ade80] text-[#062411] shadow-lg' : 'text-white/50 hover:text-white'}`}
              >
                CRIAR CONTA
              </button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-500/20 text-red-200 rounded-xl font-bold text-sm border border-red-500/30 flex items-center gap-2"><Info size={18} /> {error}</div>}
            {success && <div className="mb-6 p-4 bg-[#4ade80]/20 text-[#4ade80] rounded-xl font-bold text-sm border border-[#4ade80]/30 flex items-center gap-2"><Info size={18} /> {success}</div>}

            {activeTab === "login" ? (
              <div className="animate-in fade-in duration-500">
                {showForgotPassword ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <button
                      onClick={() => { setShowForgotPassword(false); setForgotEmail(""); setForgotSuccess(""); setError(""); }}
                      className="flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white mb-8 transition-colors"
                    >
                      <ArrowLeft size={16} /> Voltar
                    </button>
                    <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "#ffffff" }}>Recuperar senha</h2>
                    <p className=" text-sm font-medium mb-10" style={{ color: "rgba(255,255,255,0.7)" }}>Informe seu e-mail e enviaremos um link para criar uma nova senha.</p>

                    {forgotSuccess ? (
                      <div className="p-4 bg-[#4ade80]/20 text-[#4ade80] rounded-xl font-bold text-sm border border-[#4ade80]/30 flex items-center gap-2">
                        <Info size={18} /> {forgotSuccess}
                      </div>
                    ) : (
                      <form onSubmit={handleForgotPassword} className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>E-mail</label>
                          <input
                            type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required placeholder="seu@email.com"
                            className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-[#] outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400 mt-2"
                          />
                        </div>
                        <button type="submit" disabled={forgotLoading} className="w-full bg-[#4ade80] text-[#062411] py-4 rounded-[18px] font-black text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#4ade80]/20">
                          {forgotLoading ? <Loader2 size={20} className="animate-spin" /> : 'Enviar link de recuperação'}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-10">
                      <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "#ffffff" }}>Bem-vindo de volta!</h2>
                      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Faça login para continuar suas compras.</p>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <button onClick={() => handleOAuthLogin('google')} disabled={!!oauthLoading} className="flex justify-center items-center gap-3 py-3.5 px-4 bg-white/10 border border-white/20 rounded-[18px] hover:bg-white/20 transition-all font-bold text-sm text-white disabled:opacity-60">
                        {oauthLoading === 'google' ? <Loader2 size={20} className="animate-spin" /> : <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />}
                        Google
                      </button>
                      <button onClick={() => handleOAuthLogin('apple')} disabled={!!oauthLoading} className="flex justify-center items-center gap-3 py-3.5 px-4 bg-white text-black rounded-[18px] hover:bg-gray-100 transition-all font-bold text-sm disabled:opacity-60">
                        {oauthLoading === 'apple' ? <Loader2 size={20} className="animate-spin" /> : <Shield size={18} />}
                        Apple
                      </button>
                    </div>

                    <div className="relative mb-8 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                      <span className="relative bg-[#0a2e16] px-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Ou use seu e-mail</span>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>E-mail ou CPF</label>
                        <input
                          name="email" type="text" value={loginData.email} onChange={handleLoginChange} required placeholder="Digite seu e-mail"
                          className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-[#] outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400 mt-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Senha</label>
                          <button type="button" onClick={() => { setShowForgotPassword(true); setForgotEmail(loginData.email); setError(""); }} className="text-[10px] font-black text-[#4ade80] hover:underline uppercase tracking-widest">
                            Esqueceu a senha?
                          </button>
                        </div>
                        <input
                          name="password" type="password" value={loginData.password} onChange={handleLoginChange} required placeholder="••••••••"
                          className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-[#] outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400 mt-2"
                        />
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer group w-max ml-1">
                        <div className="relative flex items-center justify-center w-5 h-5 rounded-[6px] border-2 border-white/30 group-hover:border-[#4ade80] transition-colors bg-white/10">
                          <input type="checkbox" className="peer opacity-0 absolute inset-0 cursor-pointer" />
                          <CheckIcon className="opacity-0 peer-checked:opacity-100 text-[#4ade80] transition-opacity" />
                        </div>
                        <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">Lembrar de mim</span>
                      </label>

                      <button type="submit" disabled={loading} className="w-full bg-[#4ade80] text-[#062411] py-4 mt-2 rounded-[18px] font-black text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#4ade80]/20">
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Entrar na feira <ArrowRight size={18} /></>}
                      </button>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {!showB2CForm ? (
                  <>
                    <div className="mb-10">
                      <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "#ffffff" }}>Escolha seu perfil</h2>
                      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Temos uma experiência customizada para cada necessidade.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* B2C */}
                      <button onClick={() => setShowB2CForm(true)} className="group text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#4ade80]/50 hover:bg-white/10 transition-all flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-[#4ade80]/20 text-[#4ade80] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#4ade80] group-hover:text-[#062411] transition-all">
                          <ShoppingBag size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-black text-white">Para sua Casa (B2C)</h3>
                          <p className="text-[11px] font-bold text-white font-extrabold mt-1">Compre produtos frescos para sua família.</p>
                        </div>
                        <ArrowRight size={18} className="text-white/30 group-hover:text-[#4ade80] group-hover:translate-x-1 transition-all" />
                      </button>

                      {/* Feirante */}
                      <Link href="/signup/vendor" className="group text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ea580c]/50 hover:bg-white/10 transition-all flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-[#ea580c]/20 text-[#ea580c] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#ea580c] group-hover:text-white transition-all">
                          <Store size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-black text-white">Sou Feirante / Produtor</h3>
                          <p className="text-[11px] font-bold text-white font-extrabold mt-1">Traga sua banca para o digital e venda mais.</p>
                        </div>
                        <ArrowRight size={18} className="text-white/30 group-hover:text-[#ea580c] group-hover:translate-x-1 transition-all" />
                      </Link>

                      {/* B2B */}
                      <Link href="/signup/b2b" className="group text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Briefcase size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-black text-white">Comprador Atacadista</h3>
                          <p className="text-[11px] font-bold text-white font-extrabold mt-1">Condições especiais para compras em volume.</p>
                        </div>
                        <ArrowRight size={18} className="text-white/30 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </Link>

                      {/* Chef */}
                      <Link href="/signup/chef" className="group text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all">
                          <ChefHat size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-black text-white">Restaurante ou Chef</h3>
                          <p className="text-[11px] font-bold text-white font-extrabold mt-1">Abasteça sua cozinha com o melhor tempero.</p>
                        </div>
                        <ArrowRight size={18} className="text-white/30 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setShowB2CForm(false)} className="flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white mb-8 transition-colors">
                      <ArrowLeft size={16} /> Voltar
                    </button>
                    
                    <div className="mb-10">
                      <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "#ffffff" }}>Crie sua conta B2C</h2>
                      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Comece a colher o melhor hoje mesmo!</p>
                    </div>

                    <form onSubmit={handleSignupSubmit} className="space-y-5">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Seu nome completo</label>
                        <input name="name" type="text" value={signupData.name} onChange={handleSignupChange} required placeholder="Nome e sobrenome" className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-[#] outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400 mt-2" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>E-mail</label>
                          <input name="email" type="email" value={signupData.email} onChange={handleSignupChange} required placeholder="seu@email.com" className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-[#] outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400 mt-2" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>WhatsApp</label>
                          <input name="phone" type="tel" value={signupData.phone} onChange={handleSignupChange} required placeholder="(00) 00000-0000" className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-[#] outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400 mt-2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Senha</label>
                          <input name="password" type="password" value={signupData.password} onChange={handleSignupChange} required placeholder="••••••••" className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-[#] outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400 mt-2" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest  font-extrabold ml-1" style={{ color: "#ffffff" }}>Confirmar Senha</label>
                          <input name="confirmPassword" type="password" value={signupData.confirmPassword} onChange={handleSignupChange} required placeholder="••••••••" className="w-full bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-[#] outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400 mt-2" />
                        </div>
                      </div>

                      <button type="submit" disabled={loading} className="w-full bg-[#4ade80] text-[#062411] py-4 mt-4 rounded-[18px] font-black text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#4ade80]/20">
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Criar minha conta <UserPlus size={18} /></>}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f4]">
        <Loader2 className="animate-spin text-green-700" size={40} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
