'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Truck, Package, Users, MapPin } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LogisticaDashboardPage() {
  const [orders, setOrders] = useState<{ total: number; pendente: number; saiu: number; entregue: number }>({
    total: 0, pendente: 0, saiu: 0, entregue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const { data, error } = await supabase.from('mktplace_feira_orders').select('status');
      if (data && !error) {
        setOrders({
          total: data.length,
          pendente: data.filter((o: { status: string }) => o.status === 'pendente' || o.status === 'pago').length,
          saiu: data.filter((o: { status: string }) => o.status === 'saiu_para_entrega').length,
          entregue: data.filter((o: { status: string }) => o.status === 'entregue').length,
        });
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={32} className="animate-spin" color="#30852f" />
      </div>
    );
  }

  const cards = [
    { label: 'Total de Pedidos', value: orders.total, icon: Package, color: '#1565c0', bg: '#eff6ff' },
    { label: 'Aguardando Coleta', value: orders.pendente, icon: Package, color: '#b05a00', bg: '#fff7ed' },
    { label: 'Em Entrega', value: orders.saiu, icon: Truck, color: '#0e6b17', bg: '#f0fdf4' },
    { label: 'Entregues', value: orders.entregue, icon: MapPin, color: '#1e8e3e', bg: '#e8f5e9' },
  ];

  const shortcuts = [
    { href: '/portal/logistica/pedidos', label: 'Ver Pedidos', icon: Package, desc: 'Acompanhe e filtre pedidos por status' },
    { href: '/portal/logistica/rotas', label: 'Rotas de Entrega', icon: Truck, desc: 'Visualize e otimize as rotas do dia' },
    { href: '/portal/logistica/entregadores', label: 'Entregadores', icon: Users, desc: 'Gerencie a equipe de entrega' },
  ];

  return (
    <div style={{ padding: '32px 40px' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Painel de Logística</h1>
        <p style={{ color: '#666' }}>Visão geral das entregas e operações.</p>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={card.color} />
                </div>
                <span style={{ fontSize: 13, color: '#666' }}>{card.label}</span>
              </div>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#1a1a1a' }}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Atalhos */}
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Acesso Rápido</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {shortcuts.map(s => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              style={{
                display: 'block',
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 12,
                padding: 20,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Icon size={22} color="#30852f" />
                <strong style={{ fontSize: 15 }}>{s.label}</strong>
              </div>
              <p style={{ fontSize: 13, color: '#888' }}>{s.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
