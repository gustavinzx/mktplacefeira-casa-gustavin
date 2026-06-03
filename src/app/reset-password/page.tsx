'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Supabase coloca token_hash + type na URL quando o usuário clica no link
  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (tokenHash && type === 'recovery') {
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ error }) => {
          if (error) setErrorMsg('Link inválido ou expirado. Solicite um novo.');
          setVerifying(false);
        });
    } else {
      // Supabase pode entregar o token via fragmento de URL (hash)
      // O SDK detecta automaticamente ao escutar onAuthStateChange
      supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') setVerifying(false);
      });
      setVerifying(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setErrorMsg('As senhas não coincidem.'); return; }
    if (password.length < 6) { setErrorMsg('A senha deve ter no mínimo 6 caracteres.'); return; }

    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setStatus('ok');
      setTimeout(() => router.push('/logincliente'), 3000);
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 size={32} className="animate-spin text-[#0e6b17]" />
        <p className="text-gray-500 font-medium">Verificando seu link…</p>
      </div>
    );
  }

  if (status === 'ok') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Senha redefinida!</h2>
        <p className="text-gray-500 font-medium">Redirecionando para o login…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-3xl font-black text-[#0e6b17] mb-2">Nova senha</h2>
        <p className="text-gray-500 font-medium">Digite sua nova senha abaixo.</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">
          <AlertTriangle size={16} /> {errorMsg}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Nova senha</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            className="w-full px-5 py-4 pr-12 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[18px] outline-none font-bold text-sm transition-all"
          />
          <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Confirmar senha</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Repita a nova senha"
          required
          className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[18px] outline-none font-bold text-sm transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#0e6b17] text-white rounded-[18px] font-black text-sm shadow hover:bg-green-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
        {loading ? 'Salvando…' : 'Salvar nova senha'}
      </button>

      <p className="text-center text-sm text-gray-400">
        <Link href="/logincliente" className="font-bold text-[#0e6b17] hover:underline">Voltar ao login</Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf5] flex items-center justify-center p-6 font-['Be_Vietnam_Pro']">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-[#bfc9bd]/20 p-10">
        <div className="mb-8">
          <Link href="/" className="text-xl font-black text-[#0e6b17]">feira.casa</Link>
        </div>
        <Suspense fallback={<div className="flex justify-center py-10"><Loader2 size={28} className="animate-spin text-green-700" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
