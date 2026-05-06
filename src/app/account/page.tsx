'use client';

import React from 'react';
import styles from './page.module.css';
import { Package, MapPin, Clock } from 'lucide-react';

const AccountDashboard = () => {
  return (
    <div>
      <div className={styles.welcome}>
        <h1>Olá, Maria!</h1>
        <p>Que bom ver você de novo. Sua última feira foi há 3 dias.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Package size={24} style={{ color: 'var(--primary)' }} />
            <h3>Último Pedido</h3>
          </div>
          <div className={styles.orderInfo}>
            <p className={styles.orderId}>#88291</p>
            <p className={styles.orderStatus}>Entregue em 23/04</p>
          </div>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
            Ver Detalhes
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MapPin size={24} style={{ color: 'var(--secondary)' }} />
            <h3>Endereço Padrão</h3>
          </div>
          <p className={styles.addressText}>
            Rua das Orquídeas, 123 - Ap 42<br />
            Vila Mariana, São Paulo - SP
          </p>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
            Alterar
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Histórico Recente</h2>
        <div className={styles.historyList}>
          {[1, 2].map((i) => (
            <div key={i} className={styles.historyItem}>
              <div className={styles.historyIcon}><Clock size={20} /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600 }}>Pedido #{88290 - i}</p>
                <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>15/04/2026 • 8 itens</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700 }}>R$ 145,00</p>
                <p style={{ fontSize: '12px', color: '#1e8e3e' }}>Finalizado</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
