'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Users, Star, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';


export default function LogisticaEntregadoresPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entregadores, setEntregadores] = useState<any[]>([]);

  useEffect(() => {
    const fetchEntregadores = async () => {
      const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          // API retorna { users: [] } dentro de data
          const allUsers = data.data?.users || (Array.isArray(data.data) ? data.data : []);
          const logisticaUsers = allUsers.filter((u: any) => u.role === 'logistica');
          if (logisticaUsers.length > 0) {
            setEntregadores(logisticaUsers.map((u: any) => ({
              id: u.id,
              nome: u.full_name || 'Entregador',
              telefone: u.phone || '(Sem número)',
              regioes: ['Geral'],
              pedidosHoje: 0,
              avaliacao: 5.0,
              ativo: true
            })));
          } else {
            setEntregadores([]);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar entregadores:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntregadores();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={32} className="animate-spin" color="#30852f" />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Entregadores</h1>
          <p style={{ color: '#666' }}>
            {entregadores.filter(e => e.ativo).length} ativo{entregadores.filter(e => e.ativo).length !== 1 ? 's' : ''} de {entregadores.length} cadastrado{entregadores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#30852f',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => router.push('/admin/users')}
        >
          <Users size={18} /> Cadastrar Entregador
        </button>
      </header>

      <div style={{ display: 'grid', gap: 12 }}>
        {entregadores.map(e => (
          <div
            key={e.id}
            style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              opacity: e.ativo ? 1 : 0.6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: e.ativo ? '#e8f5e9' : '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                color: e.ativo ? '#2e7d32' : '#999',
                flexShrink: 0,
              }}>
                {e.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <strong>{e.nome}</strong>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    background: e.ativo ? '#e8f5e9' : '#f5f5f5',
                    color: e.ativo ? '#2e7d32' : '#888',
                  }}>
                    {e.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={12} /> {e.telefone}
                </p>
                <p style={{ fontSize: 12, color: '#888' }}>Regiões: {e.regioes.join(', ')}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', color: '#f59e0b' }}>
                <Star size={16} fill="#f59e0b" /> {e.avaliacao}
              </p>
              <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{e.pedidosHoje} entregas hoje</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
