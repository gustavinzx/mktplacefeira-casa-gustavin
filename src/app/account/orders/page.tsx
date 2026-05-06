'use client';

import React from 'react';
import { Package, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import styles from './page.module.css';

const OrdersPage = () => {
  const orders = [
    {
      id: '88291',
      date: '23 Abr 2026',
      status: 'Entregue',
      total: 124.50,
      items: 6,
      type: 'delivery'
    },
    {
      id: '88290',
      date: '15 Abr 2026',
      status: 'Finalizado',
      total: 145.00,
      items: 8,
      type: 'retirada'
    },
    {
      id: '88285',
      date: '08 Abr 2026',
      status: 'Finalizado',
      total: 92.30,
      items: 4,
      type: 'delivery'
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Meus Pedidos</h1>
      </header>

      <div className={styles.list}>
        {orders.map(order => (
          <div key={order.id} className={styles.card}>
            <div className={styles.cardIcon}>
              <Package size={24} />
            </div>
            
            <div className={styles.info}>
              <div className={styles.topRow}>
                <h3>Pedido #{order.id}</h3>
                <span className={styles.date}>{order.date}</span>
              </div>
              <p className={styles.details}>{order.items} itens • {order.type === 'delivery' ? 'Delivery' : 'Retirada na Feira'}</p>
              
              <div className={styles.statusRow}>
                {order.status === 'Entregue' ? (
                  <span className={styles.statusSuccess}><CheckCircle2 size={14} /> {order.status}</span>
                ) : (
                  <span className={styles.statusNeutral}><Clock size={14} /> {order.status}</span>
                )}
                <span className={styles.total}>R$ {order.total.toFixed(2)}</span>
              </div>
            </div>

            <button className={styles.btnDetail}>
              <ChevronRight size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
