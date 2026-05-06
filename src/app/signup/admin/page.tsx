'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  Building,
  UserPlus,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dept: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      setLoading(false);
      return;
    }

    try {
      // Regra de TI: Acesso total se o departamento for TI
      const userPermissions = formData.dept === 'ti' ? 'all' : 'restricted';
      const userRole = formData.dept === 'ti' ? 'super_admin' : 'admin';

      const { data, error } = await supabase
        .from(getTableName('admins'))
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email,
            department: formData.dept,
            job_role: formData.role,
            permissions: userPermissions,
            access_level: userRole,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Administrador cadastrado com sucesso!' });
      
      // Limpar formulário após sucesso
      setFormData({
        fullName: '',
        email: '',
        dept: '',
        role: '',
        password: '',
        confirmPassword: ''
      });

    } catch (err: unknown) {
      console.error('Erro ao cadastrar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setMessage({ type: 'error', text: 'Erro ao salvar: ' + errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Left Section: Image & Branding */}
        <section className={styles.visualSide}>
          <div className={styles.imageOverlay}></div>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbqwy-DbnUXn_AU0WwLbQ5KgiQNET3tteGBADDymDgxyFxBrWoinzL2TKRqewbcbSwQYaWZVSfYlixutzAkcn2JQgPDtqYvKAHhykN4yk66prgjFVaKrwsKXHM7qJnTD8jRWPDWebNhO-AzKg2n7OnpMbapp2r00NSKT0d0JNmwGDivpubMrL5Wtz-E_98wkvT3-Q4bO39bvkW5Phaym_DK5MXsjp3usBO03CRzwFq_HMKmMLjRm0s3uvaBqazAQ-m-Jnp1d67WE8" 
            alt="Marketplace Management" 
          />
          <div className={styles.visualContent}>
            <div className={styles.visualHeader}>
              <ShieldCheck size={40} className={styles.shieldIcon} />
              <h1>Gestão feira.casa</h1>
            </div>
            <p>Crie novos acessos para a equipe administrativa e fortaleça o ecossistema do produtor local.</p>
            <div className={styles.indicators}>
              <div className={styles.indActive}></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </section>

        {/* Right Section: Form */}
        <section className={styles.formSide}>
          <header className={styles.formHeader}>
            <Link href="/signup" className={styles.btnBack}>
               <ArrowLeft size={20} />
            </Link>
            <span className={styles.logo}>feira.casa</span>
          </header>

          <div className={styles.formContainer}>
            <div className={styles.titleArea}>
              <h2>Novo Administrador</h2>
              <p>Preencha os dados abaixo para criar uma nova conta de acesso ao painel.</p>
            </div>

            {message.text && (
              <div className={`${styles.alert} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Nome Completo</label>
                <div className={styles.inputWrapper}>
                  <User size={18} />
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ex: João da Silva" 
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>E-mail Corporativo (@feira.casa)</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nome@feira.casa" 
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Departamento</label>
                  <div className={styles.inputWrapper}>
                    <Building size={18} />
                    <select 
                      name="dept" 
                      value={formData.dept}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecionar</option>
                      <option value="ti">TI (Acesso Total)</option>
                      <option value="logistica">Logística</option>
                      <option value="curadoria">Curadoria</option>
                      <option value="suporte">Suporte</option>
                      <option value="financeiro">Financeiro</option>
                    </select>
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Cargo</label>
                  <div className={styles.inputWrapper}>
                    <Briefcase size={18} />
                    <input 
                      type="text" 
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="Ex: Analista Sênior" 
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Senha</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Confirmar Senha</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} />
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={loading}>
                {loading ? <Loader2 className={styles.spin} /> : 'Cadastrar Administrador'}
                {!loading && <UserPlus size={18} />}
              </button>
            </form>

            <footer className={styles.footer}>
              <p>Já tem uma conta? <Link href="/login">Fazer login</Link></p>
              <span className={styles.copyright}>© 2024 feira.casa - Painel Administrativo Seguro</span>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminSignup;
