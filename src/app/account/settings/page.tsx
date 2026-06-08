'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

export default function AccountSettingsPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch('/api/account/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // We use the summary endpoint just to check auth, but actually we need the profile from Supabase
        const { data: { user } } = await supabase.auth.getUser(token as string);
        if (user) {
          const { data } = await supabase.from('mktplace_feira_profiles').select('*').eq('id', user.id).single();
          setProfile({ ...data, email: user.email });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/account/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          password: password || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Configurações atualizadas com sucesso!', 'success');
        setPassword('');
      } else {
        showToast(data.error || 'Erro ao atualizar dados', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar as configurações', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('ATENÇÃO: Esta ação é irreversível. Deseja realmente excluir sua conta permanentemente?')) {
      showToast('Funcionalidade de exclusão desabilitada por segurança na versão de demonstração.', 'warning');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return <div>Erro ao carregar configurações.</div>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Configurações da Conta</h1>
      <p className={styles.pageSubtitle}>Gerencie seus dados pessoais e preferências de segurança.</p>

      <form onSubmit={handleSave}>
        {/* Profile Settings */}
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Dados Pessoais</h2>
          <p className={styles.sectionDesc}>Informações básicas do seu perfil.</p>
          
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Nome Completo</label>
              <input 
                value={profile.full_name || ''} 
                onChange={e => setProfile({...profile, full_name: e.target.value})} 
                required
              />
            </div>
            
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>E-mail (Login)</label>
              <input value={profile.email} readOnly title="O e-mail não pode ser alterado diretamente" />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Segurança</h2>
          <p className={styles.sectionDesc}>Atualize sua senha de acesso.</p>
          
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Nova Senha</label>
              <input 
                type="password" 
                placeholder="Deixe em branco para não alterar" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>
        </div>

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>

      {/* Danger Zone */}
      <div className={`${styles.settingsSection} ${styles.dangerZone}`} style={{ marginTop: '40px' }}>
        <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>
          <AlertTriangle size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }}/>
          Zona de Perigo
        </h2>
        <p className={styles.sectionDesc} style={{ color: '#991b1b' }}>Ao excluir sua conta, todos os seus dados, histórico de pedidos e carteira serão perdidos para sempre.</p>
        
        <button onClick={handleDeleteAccount} className={styles.deleteBtn}>
          Excluir minha conta
        </button>
      </div>
    </div>
  );
}
