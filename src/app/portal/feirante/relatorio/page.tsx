'use client';

import React, { useEffect, useState } from 'react';
import { supabase, getTableName } from '@/lib/supabase';
import { Loader2, TrendingUp, DollarSign, ShoppingBag, Calendar } from 'lucide-react';

export default function FeiranteRelatorioPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, avgTicket: 0, pending: 0 });
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) return;

        const { data, error } = await supabase
          .from(getTableName('orders'))
          .select('id, total_amount, status, created_at')
          .eq('producer_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (active && data) {
          setOrders(data);
          const completedOrders = data.filter(o => o.status === 'entregue' || o.status === 'pago' || o.status === 'saiu_para_entrega');
          const pendingOrders = data.filter(o => o.status === 'pending' || o.status === 'preparando');
          
          const totalSales = completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
          const totalOrders = completedOrders.length;
          const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
          
          setStats({
            totalSales,
            totalOrders,
            avgTicket,
            pending: pendingOrders.length
          });
        }
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadStats();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 size={32} className="animate-spin" color="#0e6b17" />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#111827' }}>Relatório Financeiro</h1>
        <p style={{ color: '#6b7280' }}>Acompanhe o desempenho de suas vendas na plataforma.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#6b7280' }}>
            <DollarSign size={20} className="text-green-600" /> <span style={{ fontWeight: 600 }}>Vendas Concluídas</span>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>
            R$ {stats.totalSales.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#6b7280' }}>
            <ShoppingBag size={20} className="text-blue-600" /> <span style={{ fontWeight: 600 }}>Pedidos Entregues</span>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>
            {stats.totalOrders}
          </p>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#6b7280' }}>
            <TrendingUp size={20} className="text-purple-600" /> <span style={{ fontWeight: 600 }}>Ticket Médio</span>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>
            R$ {stats.avgTicket.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Extrato Recente</h2>
        {orders.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', color: '#9ca3af' }}>
            <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Nenhuma venda encontrada ainda.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '12px', color: '#666', fontWeight: 600 }}>ID do Pedido</th>
                <th style={{ padding: '12px', color: '#666', fontWeight: 600 }}>Data</th>
                <th style={{ padding: '12px', color: '#666', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px', color: '#666', fontWeight: 600, textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order: any) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px', color: '#333', fontWeight: 500 }}>#{order.id.split('-')[0].toUpperCase()}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: order.status === 'entregue' || order.status === 'pago' ? '#dcfce7' : '#fef9c3', color: order.status === 'entregue' || order.status === 'pago' ? '#166534' : '#854d0e' }}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#166534' }}>
                    R$ {Number(order.total_amount || 0).toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
