'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/lib/i18n/client';
import { locales, localeNames, Locale } from '@/lib/i18n/settings';
import { User, MapPin, Camera, Settings, Globe, Loader2, Check, X } from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { locale, setLocale, dictionary } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: ''
  });
  const [activeTable, setActiveTable] = useState('profiles');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/logincliente');
        return;
      }

      // Consulta de forma segura sem depender do localStorage
      let tableName = 'profiles';
      let { data, error } = await supabase
        .from(getTableName(tableName))
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        tableName = 'userb2c';
        const res = await supabase
          .from(getTableName(tableName))
          .select('*')
          .eq('id', user.id)
          .single();
        data = res.data;
        error = res.error;
      }
      
      setActiveTable(tableName);

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          cpf: data.cpf || ''
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar perfil:', err.message);
      setMessage({ type: 'error', text: 'Não foi possível carregar os dados do perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tableName = activeTable;

      const updateData: any = {
        full_name: formData.full_name,
        phone: formData.phone,
        updated_at: new Date().toISOString()
      };

      // Incluir CPF se estiver na tabela userb2c
      if (tableName === 'userb2c') {
        updateData.cpf = formData.cpf;
      }

      const { error } = await supabase
        .from(getTableName(tableName))
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      
      // Atualiza o nome no localStorage para refletir no Header
      await supabase.auth.updateUser({
      data: { full_name: formData.full_name }
    });
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err.message);
      setMessage({ type: 'error', text: 'Erro ao salvar as alterações.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin text-leaf-green" size={40} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      
      <main className="container">
        {message.text && (
          <div className={`alert ${message.type}`}>
            {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
            {message.text}
          </div>
        )}

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="user-card">
              <div className="avatar-wrapper">
                <div className="avatar">
                  {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </div>
                <button className="edit-avatar"><Camera size={14} /></button>
              </div>
              <h3>{profile?.full_name || 'Usuário'}</h3>
              <p>Membro desde {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '---'}</p>
            </div>

            <nav className="side-nav">
              <a href="/profile" className="active"><User size={18} /> {dictionary.common.profile}</a>
              <a href="/account/addresses"><MapPin size={18} /> Meus Endereços</a>
              <a href="/account/wallet"><Settings size={18} /> Pagamentos</a>
              <a href="/account/coupons"><Settings size={18} /> Meus Cupons</a>
            </nav>
          </aside>

          <div className="profile-content">
            <div className="content-card">
              <div className="card-header">
                <h2>{dictionary.common.profile}</h2>
                {!isEditing ? (
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    {dictionary.common.edit}
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button className="cancel-btn" onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        full_name: profile.full_name || '',
                        email: profile.email || '',
                        phone: profile.phone || '',
                        cpf: profile.cpf || ''
                      });
                    }}>Cancelar</button>
                    <button className="save-btn" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="animate-spin" size={16} /> : 'Salvar'}
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="info-form">
                  <div className="form-group">
                    <label>Nome Completo</label>
                    <input 
                      type="text" 
                      name="full_name" 
                      value={formData.full_name} 
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="form-group">
                    <label>E-mail (Não pode ser alterado)</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      disabled 
                      className="disabled"
                    />
                  </div>
                  <div className="form-group">
                    <label>Telefone</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="form-group">
                    <label>CPF</label>
                    <input 
                      type="text" 
                      name="cpf" 
                      value={formData.cpf} 
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nome Completo</label>
                    <p>{profile?.full_name || 'Não informado'}</p>
                  </div>
                  <div className="info-item">
                    <label>E-mail</label>
                    <p>{profile?.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Telefone</label>
                    <p>{profile?.phone || 'Não informado'}</p>
                  </div>
                  <div className="info-item">
                    <label>CPF</label>
                    <p>{profile?.cpf ? `***.${profile.cpf.split('.')[1]}.***-**` : 'Não informado'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="content-card">
              <div className="card-header">
                <h2>{dictionary.common.settings}</h2>
              </div>
              
              <div className="settings-section">
                <div className="settings-item">
                  <div className="settings-info">
                    <div className="icon-bg">
                      <Globe size={20} />
                    </div>
                    <div>
                      <strong>{dictionary.common.language}</strong>
                      <span>Selecione o idioma de preferência para a plataforma</span>
                    </div>
                  </div>
                  
                  <select 
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                    className="lang-select"
                  >
                    {locales.map((l) => (
                      <option key={l} value={l}>
                        {localeNames[l]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <h2>Segurança</h2>
              </div>
              <div className="security-item">
                <div className="sec-info">
                  <strong>Senha</strong>
                  <span>Para sua segurança, troque sua senha periodicamente</span>
                </div>
                <button className="outline-btn">Alterar Senha</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .profile-page { background: #f8f9f8; min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        
        .alert { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 16px 24px; 
          border-radius: 16px; 
          margin-bottom: 32px;
          font-weight: 600;
        }
        .alert.success { background: #eef7f2; color: #125d30; border: 1px solid #c9e7d5; }
        .alert.error { background: #fff5f5; color: #ba1a1a; border: 1px solid #ffdad6; }

        .profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: 40px; }
        
        .profile-sidebar { display: flex; flex-direction: column; gap: 32px; }
        .user-card { 
          background: white; 
          padding: 32px; 
          border-radius: 24px; 
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .avatar-wrapper { position: relative; width: 80px; height: 80px; margin: 0 auto 16px; }
        .avatar { 
          width: 100%; height: 100%; background: #eef7f2; color: #125d30;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 800;
        }
        .edit-avatar {
          position: absolute; bottom: 0; right: 0; background: #1b1c19;
          color: white; border: none; width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .user-card h3 { font-size: 18px; margin-bottom: 4px; color: #1b1c19; }
        .user-card p { font-size: 13px; color: #707a6b; }

        .side-nav { background: white; padding: 12px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .side-nav a {
          display: flex; align-items: center; gap: 12px; padding: 14px 16px;
          border-radius: 12px; text-decoration: none; color: #40493c; font-weight: 600;
          transition: all 0.2s;
        }
        .side-nav a.active { background: #eef7f2; color: #125d30; }
        .side-nav a:hover:not(.active) { background: #fcfbf7; }

        .profile-content { display: flex; flex-direction: column; gap: 32px; }
        .content-card { background: white; padding: 32px; border-radius: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .card-header h2 { font-size: 20px; color: #1b1c19; }
        
        .edit-btn { background: #eef7f2; color: #125d30; border: none; padding: 8px 20px; border-radius: 100px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .edit-btn:hover { background: #d9ecd9; }
        
        .edit-actions { display: flex; gap: 12px; }
        .cancel-btn { background: #fcfbf7; color: #707a6b; border: 1px solid #e3e3de; padding: 8px 16px; border-radius: 100px; font-weight: 600; cursor: pointer; }
        .save-btn { background: #125d30; color: white; border: none; padding: 8px 24px; border-radius: 100px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; min-width: 100px; }
        .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .info-item label { display: block; font-size: 11px; color: #707a6b; text-transform: uppercase; margin-bottom: 8px; font-weight: 800; letter-spacing: 0.5px; }
        .info-item p { font-size: 16px; font-weight: 600; color: #1b1c19; }

        .info-form { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 12px; color: #707a6b; font-weight: 700; }
        .form-group input { 
          padding: 12px 16px; border: 1px solid #e3e3de; border-radius: 12px; 
          font-size: 14px; outline: none; transition: all 0.2s; 
          background: #fcfbf7;
        }
        .form-group input:focus { border-color: #125d30; box-shadow: 0 0 0 4px rgba(18, 93, 48, 0.1); background: white; }
        .form-group input.disabled { background: #f1f0ea; color: #707a6b; cursor: not-allowed; }

        .settings-section { display: flex; flex-direction: column; gap: 24px; }
        .settings-item { display: flex; justify-content: space-between; align-items: center; padding: 24px; background: #fcfbf7; border-radius: 24px; border: 1px solid #f1f0ea; }
        .settings-info { display: flex; align-items: center; gap: 20px; }
        .icon-bg { width: 48px; height: 48px; background: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #125d30; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .settings-info strong { display: block; font-size: 16px; margin-bottom: 2px; color: #1b1c19; }
        .settings-info span { font-size: 13px; color: #707a6b; }
        
        .lang-select { 
          background: white; border: 1px solid #e3e3de; padding: 12px 20px; border-radius: 14px; 
          font-weight: 700; font-size: 14px; outline: none; cursor: pointer; transition: all 0.2s;
          min-width: 200px; color: #1b1c19;
        }
        .lang-select:focus { border-color: #125d30; box-shadow: 0 0 0 4px rgba(18, 93, 48, 0.1); }

        .security-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #fcfbf7; border-radius: 16px; }
        .sec-info strong { display: block; margin-bottom: 4px; color: #1b1c19; }
        .sec-info span { font-size: 12px; color: #707a6b; }
        .outline-btn { background: transparent; border: 1px solid #e3e3de; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; color: #40493c; }
        .outline-btn:hover { background: #fcfbf7; border-color: #707a6b; }

        @media (max-width: 900px) {
          .profile-layout { grid-template-columns: 1fr; }
          .info-grid, .info-form { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
