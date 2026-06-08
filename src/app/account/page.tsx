'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Package, Wallet, MapPin, Tag, ArrowRight, Loader2, Clock } from 'lucide-react';
import styles from './page.module.css';

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
    <span style={{ backgroundColor: config.bg, color: config.color, padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>
      {config.label}
    </span>
  );
}

export default function AccountOverviewPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch('/api/account/summary');
        const data = await res.json();
        if (data.success) {
          setSummary(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) return <div>Erro ao carregar resumo.</div>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Visão Geral</h1>
      <p className={styles.pageSubtitle}>Acompanhe suas compras, saldo e informações principais.</p>

      {/* Summary Cards */}
      <div className={styles.cardsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Package size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Total de Pedidos</p>
            <p className={styles.statValue}>{summary.totalOrders}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <Wallet size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Saldo na Carteira</p>
            <p className={styles.statValue}>R$ {summary.walletBalance.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Tag size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Cupons Ativos na Feira</p>
            <p className={styles.statValue}>{summary.activeCoupons}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
            <MapPin size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Endereços Salvos</p>
            <p className={styles.statValue}>{summary.savedAddresses}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Pedidos Recentes</h2>
        <Link href="/account/orders" className={styles.viewAllBtn}>
          Ver todos <ArrowRight size={16} />
        </Link>
      </div>

      <div className={styles.recentOrders}>
        {summary.recentOrders.length > 0 ? (
          summary.recentOrders.map((order: any) => (
            <div key={order.id} className={styles.orderRow}>
              <div className={styles.orderLeft}>
                <div className={styles.orderIcon}>
                  <Package size={20} />
                </div>
                <div>
                  <p className={styles.orderNumber}>Pedido #{order.id.split('-')[0].toUpperCase()}</p>
                  <p className={styles.orderDate}>
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {new Date(order.created_at).toLocaleDateString('pt-BR')} • {order.items?.[0]?.count || 0} itens
                  </p>
                </div>
              </div>
              <div className={styles.orderRight}>
                <p className={styles.orderTotal}>R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</p>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhum pedido encontrado.</p>
            <Link href="/produtos" className="btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
              Começar a comprar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
