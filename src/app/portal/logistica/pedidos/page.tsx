'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Truck, Package, MapPin } from 'lucide-react';

interface OrderItem {
  quantity: number;
  price_at_time: number;
  product?: { id: string; title: string };
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items?: OrderItem[];
}

const STATUS_PT: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  preparando: 'Preparando',
  saiu_para_entrega: 'Em Entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  pendente: '#b05a00',
  pago: '#1565c0',
  preparando: '#6a1e9a',
  saiu_para_entrega: '#0e6b17',
  entregue: '#1e8e3e',
  cancelado: '#ba1a1a',
};

export default function LogisticaPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }

    fetch('/api/orders?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrders(Array.isArray(data.data) ? data.data : (data.data?.orders || []));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'todos'
    ? orders
    : orders.filter(o => o.status === filter);

  const counts = {
    todos: orders.length,
    pago: orders.filter(o => o.status === 'pago').length,
    preparando: orders.filter(o => o.status === 'preparando').length,
    saiu_para_entrega: orders.filter(o => o.status === 'saiu_para_entrega').length,
    pendente: orders.filter(o => o.status === 'pendente').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={32} className="animate-spin" color="#30852f" />
      </div>
    );
  }

  const tabs = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendente', label: 'Pendentes' },
    { key: 'pago', label: 'Pagos' },
    { key: 'preparando', label: 'Preparando' },
    { key: 'saiu_para_entrega', label: 'Em Entrega' },
  ];

  return (
    <div style={{ padding: '32px 40px' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Pedidos para Entrega</h1>
        <p style={{ color: '#666' }}>{orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}</p>
      </header>

      {/* Tabs de filtro */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 100,
              border: '1px solid',
              borderColor: filter === tab.key ? '#30852f' : '#ddd',
              background: filter === tab.key ? '#e8f5e9' : '#fff',
              color: filter === tab.key ? '#1b5e20' : '#555',
              fontWeight: filter === tab.key ? 700 : 400,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {tab.label} <span style={{ opacity: 0.7 }}>({counts[tab.key as keyof typeof counts] ?? 0})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          <Package size={48} color="#ddd" style={{ margin: '0 auto 16px' }} />
          <p>Nenhum pedido encontrado para este filtro.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(order => (
            <div
              key={order.id}
              style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <strong style={{ fontSize: 15 }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </strong>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 100,
                    fontSize: 12,
                    fontWeight: 700,
                    background: `${STATUS_COLOR[order.status]}18`,
                    color: STATUS_COLOR[order.status] || '#555',
                  }}>
                    {STATUS_PT[order.status] || order.status}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                  {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {order.items && order.items.length > 0 && (
                  <p style={{ fontSize: 13, color: '#888' }}>
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}: {order.items.map(i => i.product?.title || 'Produto').join(', ')}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                </p>
                {order.status === 'pago' && (
                  <span style={{ fontSize: 12, color: '#0e6b17', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <Truck size={14} /> Pronto para envio
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
