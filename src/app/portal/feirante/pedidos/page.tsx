'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Package, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  customer_id?: string;
  delivery_type?: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#ff6b00',
  pago: '#2563eb',
  preparando: '#2563eb',
  saiu_para_entrega: '#1e8e3e',
  entregue: '#1e8e3e',
  cancelado: '#ba1a1a',
};

export default function FeirantePedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session) {
          if (active) router.push('/login');
          return;
        }

        const uid = session.user.id;
        
        let query = supabase
          .from(getTableName('orders'))
          .select('*')
          .eq('producer_id', uid)
          .order('created_at', { ascending: false });

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        if (active) setOrders(data || []);
      } catch (err: any) {
        console.error('Erro ao carregar pedidos:', err);
        if (active) setError('Erro ao carregar seus pedidos.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();
    return () => { active = false; };
  }, [router]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error: updateError } = await supabase
        .from(getTableName('orders'))
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e: any) {
      console.error('Erro ao atualizar pedido:', e);
      alert('Falha ao atualizar o status: ' + (e.message || 'Erro desconhecido.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === 'todos' ? orders : orders.filter(o => o.status === filterStatus);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#0e6b17' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Meus Pedidos</h1>
        <p style={{ color: '#666' }}>Gerencie e acompanhe todos os pedidos da sua banca.</p>
      </header>

      {error && (
        <div style={{ marginBottom: '24px', padding: '16px', background: '#fef2f2', color: '#b91c1c', borderRadius: '12px', fontWeight: '500' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {['todos', 'pending', 'pago', 'preparando', 'saiu_para_entrega', 'entregue', 'cancelado'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filterStatus === status ? 'none' : '1px solid #ddd',
              background: filterStatus === status ? '#30852f' : 'white',
              color: filterStatus === status ? 'white' : '#666',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: status === 'todos' ? 'capitalize' : 'none'
            }}
          >
            {status === 'todos' ? 'Todos' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Search size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#999', fontSize: '16px' }}>Nenhum pedido encontrado para o filtro selecionado.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f8f5', textAlign: 'left', fontSize: '14px', color: '#666' }}>
                <th style={{ padding: '16px', fontWeight: 600 }}>ID Pedido</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Data</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Total</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '16px', fontWeight: 700, fontSize: '15px' }}>
                    #{order.id.slice(0,8).toUpperCase()}
                  </td>
                  <td style={{ padding: '16px', color: '#555', fontSize: '14px' }}>
                    {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#333' }}>
                    R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      style={{ 
                        border: '1px solid ' + (STATUS_COLOR[order.status] || '#ccc'), 
                        color: STATUS_COLOR[order.status] || '#333',
                        borderRadius: '8px', 
                        padding: '6px 12px', 
                        outline: 'none', 
                        cursor: 'pointer', 
                        background: 'transparent',
                        fontWeight: 600,
                        fontSize: '13px'
                      }}
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
    </div>
  );
}
