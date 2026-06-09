'use client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Truck, Package, Calendar } from 'lucide-react';
import Link from 'next/link';

const ConfirmationPage = () => {
  const { name } = useCurrentUser();
  const [orderId, setOrderId] = useState('');
  const userName = name ? name.split(' ')[0] : '';

  useEffect(() => {
    const id = localStorage.getItem('last_order_id');
    if (id) setOrderId(id.slice(0, 8).toUpperCase());
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--background)' }}>
      <Header />
      <main className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'white',
          padding: '48px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-3)'
        }}>
          <CheckCircle size={80} color="var(--primary)" style={{ marginBottom: '24px' }} />
          <h1 style={{ fontFamily: 'var(--font-plus-jakarta)', fontSize: '32px', marginBottom: '12px' }}>
            Pedido Confirmado!
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '40px' }}>
            {userName ? `Obrigado, ${userName}! ` : ''}
            {orderId ? `Seu pedido #${orderId} foi recebido` : 'Seu pedido foi recebido'} e já está sendo separado pelos feirantes.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', textAlign: 'left', marginBottom: '40px' }}>
            <div style={{ padding: '20px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
              <Calendar size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>Previsão de Entrega</h4>
              <p style={{ fontWeight: 700 }}>Hoje</p>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Entre 18:00 e 20:00</p>
            </div>
            <div style={{ padding: '20px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
              <Truck size={24} color="var(--secondary)" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>Tipo de Entrega</h4>
              <p style={{ fontWeight: 700 }}>Eco-Delivery</p>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Entrega em 24h</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/account/orders" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Package size={20} /> Acompanhar Pedido
              </button>
            </Link>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Voltar para a Loja
              </button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConfirmationPage;
