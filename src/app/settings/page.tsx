'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/lib/i18n/client';
import { locales, localeNames, Locale } from '@/lib/i18n/settings';
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Trash2, 
  ChevronRight,
  User,
  CreditCard,
  Mail,
  Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  const { locale, setLocale, dictionary } = useI18n();
  const [activeTab, setActiveTab] = useState('general');

  // Toggle states
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade & Segurança', icon: Shield },
  ];

  return (
    <div className="settings-page">
      <Header />
      
      <main className="container">
        <div className="page-header">
          <h1 className="title">{dictionary.common.settings}</h1>
          <p className="subtitle">Gerencie suas preferências de conta e notificações.</p>
        </div>

        <div className="settings-layout">
          {/* Sidebar Tabs */}
          <aside className="settings-sidebar">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
                <ChevronRight size={16} className="arrow" />
              </button>
            ))}
          </aside>

          {/* Content Area */}
          <div className="settings-content">
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="section animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="card">
                  <div className="card-header">
                    <Globe size={20} className="text-green-600" />
                    <h3>Preferências de Idioma</h3>
                  </div>
                  <div className="card-body">
                    <p className="desc">Escolha como você deseja visualizar a interface da plataforma.</p>
                    <div className="setting-item">
                      <div className="info">
                        <strong>{dictionary.common.language}</strong>
                        <span>Selecione seu idioma principal</span>
                      </div>
                      <select 
                        value={locale}
                        onChange={(e) => setLocale(e.target.value as Locale)}
                        className="custom-select"
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

                <div className="card">
                  <div className="card-header">
                    <Moon size={20} className="text-blue-600" />
                    <h3>Aparência</h3>
                  </div>
                  <div className="card-body">
                    <div className="setting-item">
                      <div className="info">
                        <strong>Modo Escuro</strong>
                        <span>Ajustar cores para ambientes com pouca luz</span>
                      </div>
                      <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className={`toggle ${darkMode ? 'on' : ''}`}
                      >
                        <div className="handle" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="section animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="card">
                  <div className="card-header">
                    <Bell size={20} className="text-orange-600" />
                    <h3>Alertas e Avisos</h3>
                  </div>
                  <div className="card-body">
                    <div className="setting-item">
                      <div className="info">
                        <div className="flex-icon"><Mail size={16} /> <strong>E-mail Marketing</strong></div>
                        <span>Receba ofertas, promoções e novidades da feira.</span>
                      </div>
                      <button 
                        onClick={() => setNotifEmail(!notifEmail)}
                        className={`toggle ${notifEmail ? 'on' : ''}`}
                      >
                        <div className="handle" />
                      </button>
                    </div>
                    
                    <div className="divider" />

                    <div className="setting-item">
                      <div className="info">
                        <div className="flex-icon"><Smartphone size={16} /> <strong>Notificações Push</strong></div>
                        <span>Status de pedidos e alertas de entrega no celular.</span>
                      </div>
                      <button 
                        onClick={() => setNotifPush(!notifPush)}
                        className={`toggle ${notifPush ? 'on' : ''}`}
                      >
                        <div className="handle" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {activeTab === 'privacy' && (
              <div className="section animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="card">
                  <div className="card-header">
                    <Shield size={20} className="text-sky-600" />
                    <h3>Segurança da Conta</h3>
                  </div>
                  <div className="card-body">
                    <div className="setting-item">
                      <div className="info">
                        <strong>Autenticação de Dois Fatores</strong>
                        <span>Adicione uma camada extra de segurança ao seu login.</span>
                      </div>
                      <button className="outline-btn">Configurar</button>
                    </div>
                    
                    <div className="divider" />

                    <div className="setting-item">
                      <div className="info">
                        <strong>Dispositivos Conectados</strong>
                        <span>Gerencie as sessões ativas em outros navegadores.</span>
                      </div>
                      <button className="outline-btn">Ver Todos</button>
                    </div>
                  </div>
                </div>

                <div className="card danger">
                  <div className="card-header">
                    <Trash2 size={20} className="text-red-600" />
                    <h3>Zona de Perigo</h3>
                  </div>
                  <div className="card-body">
                    <div className="setting-item">
                      <div className="info">
                        <strong className="text-red-600">Excluir minha conta</strong>
                        <span>Esta ação é permanente e removerá todos os seus dados.</span>
                      </div>
                      <button className="danger-btn">Excluir Conta</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .settings-page { background: #fbfaf5; min-height: 100vh; color: #404940; }
        .container { max-width: 1100px; margin: 0 auto; padding: 60px 20px 100px; }
        
        .page-header { margin-bottom: 48px; }
        .title { font-size: 36px; font-weight: 900; color: #0e6b17; font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
        .subtitle { font-size: 16px; color: #707a6f; font-weight: 500; margin-top: 8px; }

        .settings-layout { display: grid; grid-template-columns: 280px 1fr; gap: 48px; align-items: start; }
        
        .settings-sidebar { display: flex; flex-direction: column; gap: 8px; }
        .tab-btn {
          display: flex; align-items: center; gap: 14px; padding: 16px 20px;
          background: white; border: 1px solid #eef0ed; border-radius: 20px;
          color: #707a6f; font-weight: 700; font-size: 14px; cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); text-align: left;
        }
        .tab-btn:hover { background: #f6f8f5; color: #0e6b17; border-color: #d0d8d0; }
        .tab-btn.active { 
          background: #0e6b17; color: white; border-color: #0e6b17;
          box-shadow: 0 10px 20px rgba(14, 107, 23, 0.15);
        }
        .tab-btn .arrow { margin-left: auto; opacity: 0.4; }
        .tab-btn.active .arrow { opacity: 1; }

        .settings-content { display: flex; flex-direction: column; gap: 32px; }
        .section { display: flex; flex-direction: column; gap: 24px; }
        
        .card { background: white; border-radius: 32px; border: 1px solid #eef0ed; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02); }
        .card.danger { border-color: #fee2e2; }
        .card-header { padding: 24px 32px; background: #fcfdfc; border-bottom: 1px solid #f0f2f0; display: flex; align-items: center; gap: 12px; }
        .card-header h3 { font-size: 16px; font-weight: 800; color: #231a11; }
        
        .card-body { padding: 32px; }
        .desc { font-size: 14px; color: #707a6f; margin-bottom: 24px; font-weight: 500; }

        .setting-item { display: flex; justify-content: space-between; align-items: center; gap: 24px; }
        .info { display: flex; flex-direction: column; gap: 4px; }
        .info strong { font-size: 15px; color: #231a11; }
        .info span { font-size: 13px; color: #888; font-weight: 500; }
        .flex-icon { display: flex; align-items: center; gap: 8px; }

        .divider { height: 1px; background: #f0f2f0; margin: 24px 0; }

        .custom-select {
          background: #f6f8f5; border: 2px solid transparent; padding: 12px 20px;
          border-radius: 14px; font-weight: 700; font-size: 14px; color: #231a11;
          outline: none; cursor: pointer; min-width: 180px; transition: all 0.2s;
        }
        .custom-select:focus { border-color: #0e6b17; background: white; }

        .toggle {
          width: 52px; height: 30px; background: #e2e8e2; border-radius: 100px;
          position: relative; border: none; cursor: pointer; transition: all 0.3s;
        }
        .toggle.on { background: #0e6b17; }
        .handle {
          width: 22px; height: 22px; background: white; border-radius: 50%;
          position: absolute; top: 4px; left: 4px; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .toggle.on .handle { left: 26px; }

        .outline-btn {
          background: white; border: 1.5px solid #d0d8d0; padding: 10px 24px;
          border-radius: 14px; font-weight: 700; font-size: 13px; color: #404940;
          cursor: pointer; transition: all 0.2s;
        }
        .outline-btn:hover { background: #f6f8f5; border-color: #0e6b17; color: #0e6b17; }

        .danger-btn {
          background: #fee2e2; color: #dc2626; border: none; padding: 12px 24px;
          border-radius: 14px; font-weight: 800; font-size: 13px; cursor: pointer;
          transition: all 0.2s;
        }
        .danger-btn:hover { background: #fecaca; transform: translateY(-1px); }

        .text-red-600 { color: #dc2626; }
      `}</style>
    </div>
  );
}
