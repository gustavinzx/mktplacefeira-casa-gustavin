'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoApprove: false,
    maintenanceMode: false
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Configurações do Sistema</h1>
        <p>Ajuste as preferências globais do marketplace.</p>
      </header>

      <div className={styles.section}>
        <h2>Geral</h2>
        
        <div className={styles.row}>
          <div className={styles.info}>
            <h3>Notificações por E-mail</h3>
            <p>Receber alertas de novos cadastros e compras grandes.</p>
          </div>
          <div 
            className={`${styles.toggle} ${!settings.notifications ? styles.toggleOff : ''}`}
            onClick={() => toggle('notifications')}
          >
            <div className={styles.knob}></div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.info}>
            <h3>Aprovação Automática de Clientes</h3>
            <p>Aprovar novos cadastros de clientes (b2b, chef, casa) sem moderação.</p>
          </div>
          <div 
            className={`${styles.toggle} ${!settings.autoApprove ? styles.toggleOff : ''}`}
            onClick={() => toggle('autoApprove')}
          >
            <div className={styles.knob}></div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.info}>
            <h3>Modo Manutenção</h3>
            <p>Desativar a loja pública temporariamente para atualizações.</p>
          </div>
          <div 
            className={`${styles.toggle} ${!settings.maintenanceMode ? styles.toggleOff : ''}`}
            onClick={() => toggle('maintenanceMode')}
          >
            <div className={styles.knob}></div>
          </div>
        </div>
      </div>

      <button className={styles.btnSave} onClick={handleSave}>
        {saved ? 'Alterações Salvas!' : 'Salvar Alterações'}
      </button>
    </div>
  );
}
