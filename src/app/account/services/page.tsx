'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { ChefHat, Calendar, Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServicesPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login/b2c');
        return;
      }
      try {
        const res = await fetch('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setAppointments(Array.isArray(data.data) ? data.data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [router]);

  const cancelAppointment = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelado' })
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelado' } : a));
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Erro ao cancelar.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontSize: 28, color: '#333', marginBottom: 32 }}>Meus Serviços Contratados</h1>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader2 className="animate-spin" size={32} /></div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16 }}>
            <ChefHat size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#666' }}>Você ainda não contratou nenhum serviço de Chef.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {appointments.map(app => (
              <div key={app.id} style={{ background: '#fff', padding: 24, borderRadius: 16, display: 'flex', gap: 24, alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 64, height: 64, borderRadius: 32, background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChefHat size={32} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 20, margin: 0 }}>{app.service?.title}</h3>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 700,
                      background: app.status === 'pendente' ? '#fef3c7' : app.status === 'confirmado' ? '#d1fae5' : app.status === 'cancelado' ? '#fee2e2' : '#f3f4f6',
                      color: app.status === 'pendente' ? '#d97706' : app.status === 'confirmado' ? '#059669' : app.status === 'cancelado' ? '#dc2626' : '#4b5563'
                     }}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: '#666', margin: '0 0 8px 0' }}>Com <strong>{app.chef?.full_name}</strong></p>
                  <div style={{ display: 'flex', gap: 16, color: '#555', fontSize: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} /> {new Date(app.event_date).toLocaleDateString('pt-BR')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> {new Date(app.event_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#ea580c', marginBottom: 12 }}>
                    R$ {Number(app.service?.price || 0).toFixed(2)}
                  </div>
                  {(app.status === 'pendente' || app.status === 'confirmado') && (
                    <button 
                      onClick={() => cancelAppointment(app.id)}
                      style={{ background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
