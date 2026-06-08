'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { TrendingUp, Package, AlertCircle, Loader2, ShoppingBag, Star } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';
import { supabase, getTableName } from '@/lib/supabase';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
}

interface ProducerStats {
  productCount: number;
  rating: number;
  stallName: string;
}

const STATUS_PT: Record<string, string> = {
  pending: 'Pendente',
  pago: 'Pago',
  preparando: 'Preparando',
  saiu_para_entrega: 'Em entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

const FeiranteDashboard = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<ProducerStats>({ productCount: 0, rating: 5.0, stallName: '' });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session) {
          if (active) router.push('/login');
          return;
        }

        const user = session.user;
        const fallbackName = user.user_metadata?.full_name?.split(' ')[0] || 'Feirante';
        if (active) setUserName(fallbackName);

        const [profileRes, ordersRes, productsRes] = await Promise.all([
          supabase.from(getTableName('profiles')).select('*').eq('id', user.id).single(),
          supabase.from(getTableName('orders')).select('*').eq('producer_id', user.id).order('created_at', { ascending: false }),
          supabase.from(getTableName('products')).select('id').eq('producer_id', user.id)
        ]);

        if (!active) return;

        if (profileRes.data) {
          setUserName(profileRes.data.full_name?.split(' ')[0] || fallbackName);
          setStats(prev => ({ ...prev, stallName: profileRes.data.full_name || '' }));
        }

        if (ordersRes.error) throw ordersRes.error;
        if (productsRes.error) throw productsRes.error;

        setOrders(ordersRes.data || []);
        setStats(prev => ({ ...prev, productCount: productsRes.data?.length || 0 }));
      } catch (err: any) {
        console.error('Erro ao carregar dashboard feirante:', err);
        if (active) setError('Não foi possível carregar as informações do seu painel.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
  }, [router]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from(getTableName('orders'))
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e: any) {
      console.error('Erro ao atualizar status:', e);
      showToast('Falha na conexão ao atualizar status: ' + (e.message || 'Erro desconhecido.'), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((acc, o) => acc + Number(o.total_amount), 0);

  const pendingOrders = orders.filter(o => o.status === 'pendente' || o.status === 'pago' || o.status === 'pending').length;
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={32} className="animate-spin" color="#30852f" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Olá, {userName}! 👋</h1>
          <p>Bem-vindo ao seu painel de controle da Feira Casa.</p>
        </div>
        <Link href="/portal/feirante/produtos/novo" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Novo Produto
        </Link>
      </header>

      {error && (
        <div style={{ marginBottom: '24px', padding: '16px', background: '#fef2f2', color: '#b91c1c', borderRadius: '12px', fontWeight: '500' }}>
          {error}
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Receita Total</h3>
          <p>R$ {totalRevenue.toFixed(2).replace('.', ',')}</p>
          <div style={{ fontSize: '12px', color: '#1e8e3e', marginTop: '4px' }}>
            {orders.filter(o => o.status !== 'cancelado').length} pedidos realizados
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>Pedidos Ativos</h3>
          <p>{pendingOrders}</p>
          <div style={{ fontSize: '12px', color: '#b05a00', marginTop: '4px' }}>
            aguardando processamento
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>Meus Produtos</h3>
          <p>{stats.productCount}</p>
          <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
            <Link href="/portal/feirante/produtos" style={{ color: '#30852f' }}>ver catálogo →</Link>
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>Avaliação</h3>
          <p>5.0 ★</p>
          <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
            perfil verificado
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.section}>
          <h2>Pedidos Recentes</h2>
          {recentOrders.length === 0 ? (
            <p style={{ color: '#888', fontSize: 14, marginTop: 12 }}>
              Nenhum pedido recebido ainda. <Link href="/portal/feirante/produtos" style={{ color: '#30852f' }}>Adicione produtos</Link> para começar a vender!
            </p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700 }}>#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                    <td>R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`${styles.status} ${
                          order.status === 'entregue' ? styles.statusSuccess :
                          (order.status === 'pago' || order.status === 'preparando') ? styles.statusSuccess :
                          order.status === 'cancelado' ? styles.statusError :
                          styles.statusWarning
                        }`}
                        style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', outline: 'none', cursor: 'pointer', background: 'transparent' }}
                      >
                        <option value="pending">Pendente</option>
                        <option value="pago">Pago</option>
                        <option value="preparando">Preparando</option>
                        <option value="saiu_para_entrega">Saiu p/ Entrega</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                      {updatingId === order.id && <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>Salvando...</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.section}>
          <h2>Sua Banca</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Package style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '14px' }}>Catálogo de Produtos</h4>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                  {stats.productCount} produto{stats.productCount !== 1 ? 's' : ''} cadastrado{stats.productCount !== 1 ? 's' : ''}.
                  <Link href="/portal/feirante/produtos/novo" style={{ color: '#30852f', marginLeft: 4 }}>Adicionar novo →</Link>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Star style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '14px' }}>Perfil verificado</h4>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                  Sua banca está ativa e visível para compradores.
                  <Link href="/portal/feirante/perfil" style={{ color: '#30852f', marginLeft: 4 }}>Editar perfil →</Link>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <ShoppingBag style={{ color: 'var(--secondary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '14px' }}>Portal B2B</h4>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                  Seus produtos também aparecem no catálogo atacado.
                  <Link href="/b2b" style={{ color: '#30852f', marginLeft: 4 }}>Ver catálogo B2B →</Link>
                </p>
              </div>
            </div>
            {pendingOrders > 0 && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <AlertCircle style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '14px' }}>{pendingOrders} pedido{pendingOrders > 1 ? 's' : ''} pendente{pendingOrders > 1 ? 's' : ''}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Verifique e processe os pedidos em aberto.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeiranteDashboard;
