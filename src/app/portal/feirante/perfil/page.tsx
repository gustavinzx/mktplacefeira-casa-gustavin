'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function FeirantePerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
    phone: string;
    role: string;
  }>({
    full_name: '',
    email: '',
    phone: '',
    role: ''
  });

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) return;

        const { data, error } = await supabase
          .from('mktplace_feira_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        if (active && data) {
          setProfile({
            full_name: data.full_name || '',
            email: data.email || session.user.email || '',
            phone: data.phone || '',
            role: data.role || 'feirante'
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProfile();
    return () => { active = false; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('mktplace_feira_profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      localStorage.setItem('user_name', profile.full_name);
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar perfil' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <p style={{ padding: 40, display: 'flex', gap: 8, color: '#666' }}>
        <Loader2 size={20} className="animate-spin" /> Carregando perfil…
      </p>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 600 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8, color: '#111827' }}>Meu Perfil</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Mantenha suas informações de contato atualizadas para seus clientes.</p>
      
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Nome Completo / Razão Social</label>
          <input 
            type="text" 
            required
            value={profile.full_name}
            onChange={(e) => setProfile({...profile, full_name: e.target.value})}
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>E-mail de Acesso <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>(Não alterável)</span></label>
          <input 
            type="email" 
            disabled
            value={profile.email}
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '15px', background: '#f9fafb', color: '#6b7280' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Telefone / WhatsApp</label>
          <input 
            type="text" 
            value={profile.phone}
            placeholder="(00) 00000-0000"
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Perfil da Conta</label>
          <input 
            type="text" 
            disabled
            value={profile.role === 'feirante' ? 'Feirante Parceiro' : profile.role}
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '15px', background: '#f9fafb', color: '#6b7280', textTransform: 'capitalize' }}
          />
        </div>

        {message && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: '8px', 
            background: message.type === 'success' ? '#dcfce7' : '#fee2e2', 
            color: message.type === 'success' ? '#166534' : '#991b1b', 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {message.type === 'success' && <CheckCircle size={18} />}
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button 
            type="submit" 
            disabled={saving}
            style={{ 
              background: '#0e6b17', 
              color: '#fff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
