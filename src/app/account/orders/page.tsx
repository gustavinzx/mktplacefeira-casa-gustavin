'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackageX, Loader2, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'shipped', label: 'A Caminho' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'cancelled', label: 'Cancelados' },
];

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string, color: string, label: string }> = {
    pending: { bg: '#fef3c7', color: '#d97706', label: 'Pendente' },
    confirmed: { bg: '#e0e7ff', color: '#4338ca', label: 'Confirmado' },
    preparing: { bg: '#ffedd5', color: '#ea580c', label: 'Preparando' },
    ready: { bg: '#fce7f3', color: '#db2777', label: 'Pronto p/ Entrega' },
    shipped: { bg: '#dcfce7', color: '#16a34a', label: 'A Caminho' },
    delivered: { bg: '#d1fae5', color: '#059669', label: 'Entregue' },
    cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelado' },
  };
  
  const config = statusConfig[status] || { bg: '#f3f4f6', color: '#4b5563', label: status };
  
  return (
    <span style={{ backgroundColor: config.bg, color: config.color, padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 600 }}>
      {config.label}
    </span>
  );
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = async (status: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch(`/api/account/orders?status=${status}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  return (
    <div>
      <h1 className={styles.pageTitle}>Meus Pedidos</h1>
      <p className={styles.pageSubtitle}>Histórico completo das suas compras na feira.</p>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            className={`${styles.tabBtn} ${activeTab === tab.value ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className={styles.ordersList}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <h3 className={styles.orderId}>Pedido #{order.id.split('-')[0].toUpperCase()}</h3>
                  <p className={styles.orderDate}>{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div className={styles.orderRight}>
                  <p className={styles.orderTotal}>R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              <div className={styles.orderBody}>
                {order.items?.map((item: any) => (
                  <div key={item.id} className={styles.itemRow}>
                    <img src={item.product?.image_url || '/images/placeholder.png'} alt={item.product?.title} className={styles.itemImg} />
                    <div className={styles.itemInfo}>
                      <p className={styles.itemTitle}>{item.quantity}x {item.product?.title}</p>
                      <p className={styles.itemPrice}>R$ {Number(item.unit_price).toFixed(2).replace('.', ',')} unid.</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                {order.status === 'pending' && (
                  <button className="btn-outline-danger" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Cancelar Pedido
                  </button>
                )}
                <button className="btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <PackageX size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Nenhum pedido encontrado</h3>
            <p>Você ainda não fez nenhum pedido com este status.</p>
            {activeTab !== 'all' && (
              <button 
                onClick={() => setActiveTab('all')} 
                style={{ marginTop: '16px', color: 'var(--leaf-green)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Ver todos os pedidos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
