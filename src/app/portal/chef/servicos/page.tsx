'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, PlusCircle, Star, Edit2, Trash2, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

export default function ChefServicosPage() {
  const [servicos, setServicos] = useState<any[]>([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newService, setNewService] = useState({ title: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'servicos' | 'agendamentos'>('servicos');

  const fetchServices = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    try {
      const res = await fetch('/api/services', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setServicos(Array.isArray(data.data) ? data.data : []);

      const resApp = await fetch('/api/appointments?type=chef', { headers: { Authorization: `Bearer ${token}` } });
      const dataApp = await resApp.json();
      if (dataApp.success) setAppointments(Array.isArray(dataApp.data) ? dataApp.data : []);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newService.title,
          price: parseFloat(newService.price),
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setNewService({ title: '', price: '' });
        setShowModal(false);
        fetchServices();
      } else {
        showToast(data.error || 'Erro ao salvar', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAppointment = async (id: string, status: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Erro de conexão.', 'error');
    }
  };

  return (
    <div style={{ padding: '32px 40px', background: '#fdfdfc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Meus Serviços Gastronômicos</h1>
          <p style={{ color: '#666' }}>Gerencie os serviços que você oferece para os clientes da Feira Casa.</p>
        </div>
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#ea580c',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => setShowModal(true)}
        >
          <PlusCircle size={18} /> Novo Serviço
        </button>
      </header>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, borderBottom: '1px solid #eee', paddingBottom: 16 }}>
        <button 
          onClick={() => setActiveTab('servicos')}
          style={{ background: 'none', border: 'none', fontSize: 16, fontWeight: activeTab === 'servicos' ? 700 : 400, color: activeTab === 'servicos' ? '#ea580c' : '#666', cursor: 'pointer', borderBottom: activeTab === 'servicos' ? '2px solid #ea580c' : 'none', paddingBottom: 8 }}
        >
          Meus Serviços
        </button>
        <button 
          onClick={() => setActiveTab('agendamentos')}
          style={{ background: 'none', border: 'none', fontSize: 16, fontWeight: activeTab === 'agendamentos' ? 700 : 400, color: activeTab === 'agendamentos' ? '#ea580c' : '#666', cursor: 'pointer', borderBottom: activeTab === 'agendamentos' ? '2px solid #ea580c' : 'none', paddingBottom: 8 }}
        >
          Agendamentos ({appointments.filter(a => a.status === 'pendente').length} novos)
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Loader2 size={32} className="animate-spin" color="#ea580c" /></div>
      ) : activeTab === 'servicos' ? (
        servicos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666', background: '#fff', borderRadius: 16, border: '1px dashed #ccc' }}>
            <ChefHat size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16 }}>Você ainda não cadastrou nenhum serviço.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {servicos.map(s => (
              <div key={s.id} style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChefHat size={24} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 8 }}>
                    {s.status}
                  </span>
                </div>
                
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>{s.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#666', fontSize: 14, marginBottom: 24 }}>
                  <strong>A partir de R$ {Number(s.price || 0).toFixed(2)}</strong>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
                    <Star size={14} fill="#f59e0b" /> {s.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eee', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '16px 24px', color: '#666' }}>Cliente</th>
                <th style={{ padding: '16px 24px', color: '#666' }}>Serviço</th>
                <th style={{ padding: '16px 24px', color: '#666' }}>Data Evento</th>
                <th style={{ padding: '16px 24px', color: '#666' }}>Status</th>
                <th style={{ padding: '16px 24px', color: '#666' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#999' }}>Nenhum agendamento encontrado.</td></tr>
              )}
              {appointments.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <strong>{app.customer?.full_name}</strong><br/>
                    <span style={{ fontSize: 12, color: '#666' }}>{app.customer?.phone || 'Sem telefone'}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {app.service?.title}<br/>
                    <span style={{ fontSize: 12, color: '#ea580c' }}>R$ {Number(app.service?.price || 0).toFixed(2)}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {new Date(app.event_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: app.status === 'pendente' ? '#fef3c7' : app.status === 'confirmado' ? '#d1fae5' : app.status === 'cancelado' ? '#fee2e2' : '#f3f4f6',
                      color: app.status === 'pendente' ? '#d97706' : app.status === 'confirmado' ? '#059669' : app.status === 'cancelado' ? '#dc2626' : '#4b5563'
                    }}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <select 
                      value={app.status} 
                      onChange={e => handleUpdateAppointment(app.id, e.target.value)}
                      style={{ padding: '8px', borderRadius: 8, border: '1px solid #ccc' }}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmar</option>
                      <option value="concluido">Concluir</option>
                      <option value="cancelado">Cancelar</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, color: '#333' }}>Novo Serviço</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Nome do Serviço</label>
                <input 
                  type="text" 
                  value={newService.title}
                  onChange={e => setNewService({...newService, title: e.target.value})}
                  required
                  placeholder="Ex: Jantar Romântico"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Preço Inicial (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newService.price}
                  onChange={e => setNewService({...newService, price: e.target.value})}
                  required
                  placeholder="Ex: 450.00"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc' }}
                />
              </div>
              <button 
                type="submit" 
                disabled={saving}
                style={{ background: '#ea580c', color: '#fff', padding: 16, border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: saving ? 'wait' : 'pointer', marginTop: 8 }}
              >
                {saving ? 'Salvando...' : 'Cadastrar Serviço'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
