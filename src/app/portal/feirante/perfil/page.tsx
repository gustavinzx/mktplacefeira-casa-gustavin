'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function FeirantePerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [fairs, setFairs] = useState<{ id: string; name: string; city: string; state: string }[]>([]);

  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
    phone: string;
    role: string;
    stall_name: string;
    specialty: string;
    fair_id: string;
  }>({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    stall_name: '',
    specialty: '',
    fair_id: ''
  });

  const DAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) return;

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('mktplace_feira_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch producer profile
        const { data: producerData } = await supabase
          .from('mktplace_feira_producers')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Fetch active fairs
        const { data: fairsData } = await supabase
          .from('mktplace_feira_fairs')
          .select('id, name, city, state')
          .order('name');

        if (active) {
          if (fairsData) setFairs(fairsData);
          
          setProfile({
            full_name: profileData?.full_name || '',
            email: profileData?.email || session.user.email || '',
            phone: profileData?.phone || '',
            role: profileData?.role || 'feirante',
            stall_name: producerData?.stall_name || '',
            specialty: producerData?.specialty || '',
            fair_id: producerData?.fair_id || ''
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

      // Update Profile
      const { error: pError } = await supabase
        .from('mktplace_feira_profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone
        })
        .eq('id', session.user.id);

      if (pError) throw pError;

      // Upsert Producer
      const { error: prodError } = await supabase
        .from('mktplace_feira_producers')
        .upsert({
          id: session.user.id,
          stall_name: profile.stall_name,
          specialty: profile.specialty,
          fair_id: profile.fair_id || null
        });

      if (prodError) throw prodError;

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

  const toggleDay = (day: string) => {
    // Removed operating_days from profile
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
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Mantenha suas informações de contato e da sua banca atualizadas.</p>
      
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        
        {/* DADOS PESSOAIS */}
        <div>
          <h3 style={{ fontSize: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginBottom: 16 }}>Dados Pessoais</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Nome Completo</label>
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
          </div>
        </div>

        {/* DADOS DA BANCA */}
        <div style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginBottom: 16 }}>Dados da Banca</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Nome da Banca</label>
              <input 
                type="text" 
                value={profile.stall_name}
                placeholder="Ex: Barraca do Zé"
                onChange={(e) => setProfile({...profile, stall_name: e.target.value})}
                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Especialidade Principal</label>
              <input 
                type="text" 
                value={profile.specialty}
                placeholder="Ex: Verduras Orgânicas"
                onChange={(e) => setProfile({...profile, specialty: e.target.value})}
                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Locais de Atuação</label>
              <div style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#166534', fontSize: '14px' }}>Múltiplas Feiras</h4>
                  <p style={{ margin: '4px 0 0', color: '#15803d', fontSize: '13px' }}>Gerencie as feiras em que você participa na aba dedicada.</p>
                </div>
                <a href="/portal/feirante/feiras" style={{ padding: '8px 16px', background: '#16a34a', color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  Acessar Minhas Feiras →
                </a>
              </div>
            </div>
          </div>
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
