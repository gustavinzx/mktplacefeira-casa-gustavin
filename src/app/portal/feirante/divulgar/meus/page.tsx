'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Play, Pause, Trash2 } from 'lucide-react';

export default function MeusAnunciosPage() {
  const campaigns = [
    { id: 1, name: 'Promoção de Morangos', status: 'Ativa', clicks: 145, views: 1250, spent: 45.50 },
    { id: 2, name: 'Kit Salada Completo', status: 'Pausada', clicks: 89, views: 800, spent: 20.00 }
  ];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/portal/feirante/divulgar" style={{ padding: '8px', background: 'white', borderRadius: '50%', border: '1px solid #e5e7eb', color: '#6b7280' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', color: '#111827' }}>Meus Anúncios</h1>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Gerencie suas campanhas e acompanhe o desempenho.</p>
          </div>
        </div>
        <Link href="/portal/feirante/divulgar/criar" style={{ padding: '12px 24px', background: '#0e6b17', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
          Nova Campanha
        </Link>
      </header>

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Campanha</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Métricas</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Gasto</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(camp => (
              <tr key={camp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '24px', fontWeight: 700, color: '#111827' }}>{camp.name}</td>
                <td style={{ padding: '24px' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', background: camp.status === 'Ativa' ? '#dcfce7' : '#f3f4f6', color: camp.status === 'Ativa' ? '#166534' : '#4b5563' }}>
                    {camp.status}
                  </span>
                </td>
                <td style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#4b5563' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BarChart3 size={16} className="text-blue-500" /> {camp.views} views</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BarChart3 size={16} className="text-orange-500" /> {camp.clicks} clicks</span>
                  </div>
                </td>
                <td style={{ padding: '24px', fontWeight: 700, color: '#111827' }}>R$ {camp.spent.toFixed(2).replace('.', ',')}</td>
                <td style={{ padding: '24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#4b5563' }}>
                      {camp.status === 'Ativa' ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
