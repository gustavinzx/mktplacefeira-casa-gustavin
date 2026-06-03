'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Rocket, Save, Loader2, Image as ImageIcon } from 'lucide-react';

export default function CriarCampanhaPage() {
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Campanha criada com sucesso! (Modo de Demonstração)');
      window.location.href = '/portal/feirante/divulgar/meus';
    }, 1500);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800 }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/portal/feirante/divulgar" style={{ padding: '8px', background: 'white', borderRadius: '50%', border: '1px solid #e5e7eb', color: '#6b7280' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', color: '#111827' }}>Nova Campanha</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>Configure os detalhes do seu anúncio.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Nome da Campanha</label>
          <input required type="text" placeholder="Ex: Promoção de Morangos" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Público Alvo (Raio de entrega)</label>
          <select style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none' }}>
            <option>Até 5km</option>
            <option>Até 10km</option>
            <option>Toda a cidade</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Orçamento Diário</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#6b7280' }}>R$</span>
            <input required type="number" min="5" placeholder="10.00" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none' }} />
          </div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>Mínimo de R$ 5,00 por dia.</p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Banner do Anúncio (Opcional)</label>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#9ca3af', cursor: 'pointer' }}>
            <ImageIcon size={32} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>Clique para anexar uma imagem</p>
            <p style={{ fontSize: '12px' }}>JPG ou PNG, máx. 5MB</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Link href="/portal/feirante/divulgar" style={{ padding: '14px 24px', borderRadius: '12px', fontWeight: 700, color: '#4b5563', background: '#f3f4f6', textDecoration: 'none' }}>
            Cancelar
          </Link>
          <button disabled={saving} type="submit" style={{ padding: '14px 32px', borderRadius: '12px', fontWeight: 700, color: 'white', background: '#0e6b17', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Rocket size={20} />}
            {saving ? 'Publicando...' : 'Publicar Campanha'}
          </button>
        </div>
      </form>
    </div>
  );
}
