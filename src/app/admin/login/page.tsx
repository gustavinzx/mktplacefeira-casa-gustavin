'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Lock, 
  Terminal,
  Server,
  Activity,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', code2fa: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Email/Password, 2: 2FA
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC' + (now.getTimezoneOffset() / -60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(formData.password);
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (step === 1) {
        // Authenticate
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

          const { data: adminRecord } = await supabase
            .from(getTableName('admins'))
            .select('*')
            .eq('email', authData.user.email)
            .single();

          const isAllowed = (profile && (profile.user_type === 'admin' || profile.role === 'admin')) || adminRecord;

          if (isAllowed) {
            setStep(2); // Go to 2FA Step
          } else {
            setError('ACCESS_DENIED: INSUFFICIENT_PRIVILEGES');
            await supabase.auth.signOut();
          }
        }
      } else {
        // 2FA mock check
        if (formData.code2fa.length === 6) {
          localStorage.setItem('user_role', 'admin');
          document.cookie = 'feira_role=admin; path=/; max-age=86400; SameSite=Lax';
          router.push('/admin');
        } else {
          setError('AUTH_FAILED: INVALID_2FA_TOKEN');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('AUTH_FAILED: INVALID_CREDENTIALS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-mono text-[#f4f4f5] relative overflow-hidden">
      
      {/* Background Animated Grid / Scanline effect via CSS */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
           style={{
             backgroundImage: `linear-gradient(rgba(124, 58, 237, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.2) 1px, transparent 1px)`,
             backgroundSize: '40px 40px',
             backgroundPosition: 'center center'
           }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7C3AED] via-transparent to-transparent"></div>

      <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10">
        
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-[#18181b] border border-[#27272a] rounded flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <Terminal size={32} className="text-[#7C3AED]" />
            </div>
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-[#e4e4e7]">
              Painel_Administrativo
            </h1>
            <div className="flex items-center gap-2 mt-3 text-xs text-[#a1a1aa] bg-[#18181b] px-3 py-1 rounded border border-[#27272a]">
              <Lock size={12} className="text-[#7C3AED]" />
              <span>SECURE_CONNECTION_ESTABLISHED</span>
            </div>
          </div>

          {/* Terminal Box */}
          <div className="bg-[#0c0c0e] border border-[#27272a] rounded shadow-2xl overflow-hidden">
            
            {/* Window Controls */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#18181b] border-b border-[#27272a]">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
              <span className="ml-2 text-[10px] text-[#71717a]">auth_module_v2.4.1</span>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 flex items-start gap-3 p-3 bg-[#7f1d1d]/20 border border-[#b91c1c]/50 rounded text-xs text-[#fca5a5]">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span className="break-all">{error}</span>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-6">
                
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-[#71717a] tracking-widest">
                        &gt; USER_IDENTIFIER
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@domain.com"
                        className="w-full bg-[#18181b] border border-[#27272a] rounded px-4 py-3 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
                        required
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-[#71717a] tracking-widest">
                        &gt; ACCESS_KEY
                      </label>
                      <input 
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••••••"
                        className="w-full bg-[#18181b] border border-[#27272a] rounded px-4 py-3 text-sm text-[#f4f4f5] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
                        required
                      />
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4].map((level) => (
                            <div 
                              key={level} 
                              className={`h-1 flex-1 rounded-sm ${level <= strength ? (strength > 2 ? 'bg-[#22c55e]' : 'bg-[#f59e0b]') : 'bg-[#27272a]'}`}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                    <label className="text-[10px] uppercase text-[#7C3AED] tracking-widest flex items-center gap-2">
                      <ShieldAlert size={12} />
                      &gt; 2FA_VERIFICATION_REQUIRED
                    </label>
                    <p className="text-xs text-[#a1a1aa] mb-4">Insira o token de 6 dígitos gerado pelo seu aplicativo autenticador.</p>
                    <input 
                      type="text"
                      name="code2fa"
                      value={formData.code2fa}
                      onChange={handleChange}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded px-4 py-3 text-center tracking-[1em] text-lg text-[#f4f4f5] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
                      required
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold rounded flex justify-center items-center gap-2 transition-colors disabled:opacity-50 uppercase tracking-widest mt-8"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : (
                    <>
                      {step === 1 ? 'AUTHENTICATE' : 'VERIFY_TOKEN'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* System Status Bar */}
            <div className="bg-[#18181b] p-3 flex justify-between items-center border-t border-[#27272a] text-[10px] text-[#71717a]">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-[#22c55e]" />
                <span>SYS_OP: NORMAL</span>
              </div>
              <div className="flex items-center gap-2">
                <Server size={12} />
                <span>{currentTime}</span>
              </div>
            </div>

          </div>

          <div className="mt-8 text-center text-[10px] text-[#52525b] space-y-1">
            <p>LAST_ACCESS: {new Date(Date.now() - 86400000).toISOString().replace('T', ' ').substring(0, 19)} from IP 192.168.1.45</p>
            <p>FAILED_ATTEMPTS_LOG: 0</p>
          </div>

        </div>
      </main>
    </div>
  );
}
