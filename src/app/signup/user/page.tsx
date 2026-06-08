'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2,
  ChevronRight,
  ArrowLeft,
  Info,
  Phone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildAuthMetadata, syncProfileAfterSignup } from '@/lib/signup';

import styles from './page.module.css';

export default function UserSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

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
          data: buildAuthMetadata({
            role: 'cliente',
            fullName: formData.name,
            phone: formData.phone,
          }),
        },
      });

      if (authError) throw authError;

      await syncProfileAfterSignup(data.session?.access_token, {
        role: 'cliente',
        fullName: formData.name,
        phone: formData.phone,
        email: formData.email,
      });

      setSuccess('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => router.push('/login'), 2000);

    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>feira.casa</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2>Criar conta</h2>
          
          {error && <div className={styles.alertError}>{error}</div>}
          {success && <div className={styles.alertSuccess}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Seu nome</label>
              <input 
                className={styles.input} 
                id="name" name="name" 
                value={formData.name} onChange={handleChange}
                placeholder="Nome e sobrenome" type="text" required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">E-mail</label>
              <input 
                className={styles.input} 
                id="email" name="email" 
                value={formData.email} onChange={handleChange}
                placeholder="nome@exemplo.com" type="email" required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">WhatsApp</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}><Phone size={16} /></span>
                <input 
                  className={`${styles.input} ${styles.inputWithIcon}`} 
                  id="phone" name="phone" 
                  value={formData.phone} onChange={handleChange}
                  placeholder="(00) 00000-0000" type="tel" required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Senha</label>
              <input 
                className={styles.input} 
                id="password" name="password" 
                value={formData.password} onChange={handleChange}
                placeholder="Pelo menos 6 caracteres" type="password" required
              />
              <div className={styles.hint}>
                <Info size={12} />
                <span>As senhas devem ter pelo menos 6 caracteres.</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <input 
                className={styles.input} 
                id="confirmPassword" name="confirmPassword" 
                value={formData.confirmPassword} onChange={handleChange}
                placeholder="••••••••" type="password" required
              />
            </div>

            <button className={styles.btnSubmit} type="submit" disabled={loading}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Criar sua conta feira.casa'}
            </button>

            <p className={styles.policy}>
              Ao criar uma conta, você concorda com as <a href="/">Condições de Uso</a> e o <a href="/">Aviso de Privacidade</a> da feira.casa.
            </p>

            <div className={styles.divider}>
              <span>Já tem uma conta?</span>
            </div>

            <Link className={styles.loginLink} href="/login">
              Fazer login <ChevronRight size={18} />
            </Link>
          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <a href="/">Condições de Uso</a>
          <a href="/">Aviso de Privacidade</a>
          <a href="/">Ajuda</a>
        </div>
        <p className={styles.copyright}>© 2024 feira.casa - Conectando o campo à sua mesa.</p>
      </footer>
    </div>
  );
}
