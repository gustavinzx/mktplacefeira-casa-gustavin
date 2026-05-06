'use client';

import React from 'react';
import styles from './page.module.css';
import { TrendingUp, Users, Package, AlertCircle } from 'lucide-react';

const FeiranteDashboard = () => {
  const recentOrders = [
    { id: '#1234', customer: 'Maria Oliveira', date: 'Hoje, 10:30', amount: 'R$ 85,90', status: 'pendente' },
    { id: '#1233', customer: 'João Souza', date: 'Hoje, 09:15', amount: 'R$ 42,00', status: 'pago' },
    { id: '#1232', customer: 'Ana Clara', date: 'Ontem, 18:00', amount: 'R$ 120,50', status: 'entregue' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Olá, Zé das Frutas!</h1>
          <p>Sua banca está ativa na Feira da Vila Mariana hoje.</p>
        </div>
        <button className="btn-primary">Novo Produto</button>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Vendas Hoje</h3>
          <p>R$ 1.240,00</p>
          <div style={{ fontSize: '12px', color: '#1e8e3e', marginTop: '4px' }}>+12% que ontem</div>
        </div>
        <div className={styles.statCard}>
          <h3>Pedidos Ativos</h3>
          <p>14</p>
          <div style={{ fontSize: '12px', color: '#b05a00', marginTop: '4px' }}>5 aguardando coleta</div>
        </div>
        <div className={styles.statCard}>
          <h3>Produtos em Falta</h3>
          <p>3</p>
          <div style={{ fontSize: '12px', color: '#d93025', marginTop: '4px' }}>Reponha seu estoque</div>
        </div>
        <div className={styles.statCard}>
          <h3>Avaliação Média</h3>
          <p>4.9 ★</p>
          <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>850 avaliações</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.section}>
          <h2>Pedidos Recentes</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700 }}>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.date}</td>
                  <td>{order.amount}</td>
                  <td>
                    <span className={`${styles.status} ${
                      order.status === 'entregue' ? styles.statusSuccess :
                      order.status === 'pendente' ? styles.statusWarning :
                      styles.statusSuccess
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.section}>
          <h2>Resumo da Banca</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <AlertCircle style={{ color: 'var(--secondary)' }} />
              <div>
                <h4 style={{ fontSize: '14px' }}>Assinatura vence em 5 dias</h4>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Renove agora para manter sua banca online.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <TrendingUp style={{ color: 'var(--primary)' }} />
              <div>
                <h4 style={{ fontSize: '14px' }}>Tomate Grape em alta</h4>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Aumento de 25% na procura nesta região.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeiranteDashboard;
