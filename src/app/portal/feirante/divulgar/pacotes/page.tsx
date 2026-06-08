'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Zap, Package, Crown } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function PacotesPage() {
  const { showToast } = useToast();
  const plans = [
    { name: 'Pacote Básico', credits: 50, price: 49.90, icon: Package, color: '#3b82f6', bg: '#eff6ff', features: ['Destaque em buscas regionais', 'Relatório básico'] },
    { name: 'Pacote Avançado', credits: 150, price: 129.90, icon: Zap, color: '#0e6b17', bg: '#eef7f2', features: ['Tudo do básico', 'Destaque na home', 'Suporte prioritário'], popular: true },
    { name: 'Pacote Pro', credits: 400, price: 299.90, icon: Crown, color: '#d97706', bg: '#fef3c7', features: ['Tudo do Avançado', 'Banner exclusivo', 'Consultoria de anúncios'] }
  ];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/portal/feirante/divulgar" style={{ padding: '8px', background: 'white', borderRadius: '50%', border: '1px solid #e5e7eb', color: '#6b7280' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', color: '#111827' }}>Pacotes e Créditos</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>Adquira créditos para turbinar seus anúncios.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {plans.map((plan, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '24px', padding: '32px', border: plan.popular ? '2px solid #0e6b17' : '1px solid #e5e7eb', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {plan.popular && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#0e6b17', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Mais Popular
              </div>
            )}
            
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: plan.bg, color: plan.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <plan.icon size={28} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>{plan.name}</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>{plan.credits} Créditos = R$ {plan.credits},00 em anúncios</p>

            <div style={{ fontSize: '32px', fontWeight: 900, color: '#111827', marginBottom: '32px' }}>
              R$ {plan.price.toFixed(2).replace('.', ',')}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1 }}>
              {plan.features.map((f, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563', fontSize: '14px', marginBottom: '16px' }}>
                  <CheckCircle2 size={18} color="#0e6b17" /> {f}
                </li>
              ))}
            </ul>

            <button onClick={() => showToast('Compra simulada.', 'info')} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: plan.popular ? '#0e6b17' : '#f3f4f6', color: plan.popular ? 'white' : '#4b5563', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>
              Comprar Agora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
