'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChefHat, Star, Calendar, Clock, Loader2, MessageCircle } from 'lucide-react';

export default function ChefPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [chef, setChef] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    // Busca informações publicas do chef, servicos e receitas
    const fetchData = async () => {
      try {
        // Obviamente numa app real, fariamos endpoints publicos
        // Aqui estamos usando os dados com um admin mock ou rotas anonimas
        const [profRes, servRes, recRes] = await Promise.all([
          fetch(`/api/producer/${id}`),
          fetch(`/api/services/public?chef_id=${id}`),
          fetch(`/api/recipes?chef_id=${id}`)
        ]);

        const profData = await profRes.json().catch(() => ({}));
        const servData = await servRes.json().catch(() => ({}));
        const recData = await recRes.json().catch(() => ({}));

        let chefData = { full_name: 'Chef Especialista', bio: 'Cozinha Francesa e Contemporânea', rating: 5.0, avatar_url: null };
        if (profData.success && profData.data && profData.data.producer) {
          chefData = {
            ...profData.data.producer.profile,
            full_name: profData.data.producer.profile?.full_name || profData.data.producer.stall_name,
            bio: profData.data.producer.description,
            rating: profData.data.producer.rating
          };
        }

        setChef(chefData);
        setServices(servData.data || []);
        setRecipes(recData.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Você precisa estar logado para contratar.');
      window.location.href = '/login/b2c';
      return;
    }

    try {
      const eventDateTime = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          chef_id: id,
          service_id: selectedService.id,
          event_date: eventDateTime,
          notes
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Agendamento solicitado com sucesso! O Chef entrará em contato para confirmar.');
        setShowModal(false);
        setBookingDate('');
        setBookingTime('');
        setNotes('');
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Erro ao agendar.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={40} className="animate-spin" color="#ea580c" /></div>;
  }

  return (
    <div style={{ background: '#f9f9f9', minHeight: '100vh' }}>
      <Header />
      
      {/* Banner/Profile Header */}
      <div style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, background: '#ea580c', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {chef?.avatar_url ? (
            <img src={chef.avatar_url} alt={chef.full_name} style={{ width: '100%', height: '100%', borderRadius: 60, objectFit: 'cover' }} />
          ) : (
            <ChefHat size={60} color="white" />
          )}
        </div>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>{chef?.full_name}</h1>
        <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 600, margin: '0 auto 16px' }}>{chef?.bio || 'Especialista em criar momentos gastronômicos inesquecíveis.'}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#f59e0b', fontSize: 18, fontWeight: 700 }}>
          <Star fill="#f59e0b" /> {chef?.rating?.toFixed(1) || '5.0'} (124 avaliações)
        </div>
      </div>

      <main className="container" style={{ padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {services.map(s => (
            <div key={s.id} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <ChefHat size={24} />
              </div>
              <h3 style={{ fontSize: 20, marginBottom: 8, color: '#111827' }}>{s.title}</h3>
              <p style={{ color: '#6b7280', marginBottom: 24 }}>A partir de <strong style={{ color: '#ea580c', fontSize: 18 }}>R$ {Number(s.price || 0).toFixed(2)}</strong></p>
              <button 
                onClick={() => { setSelectedService(s); setShowModal(true); }}
                style={{ width: '100%', padding: '12px', background: '#ea580c', color: 'white', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Calendar size={18} /> Contratar Serviço
              </button>
            </div>
          ))}
          {services.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#6b7280' }}>
              Este chef ainda não possui serviços cadastrados.
            </div>
          )}
        </div>
      </main>
      <Footer />

      {showModal && selectedService && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'white', padding: 32, borderRadius: 24, width: '100%', maxWidth: 500 }}>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Contratar Chef</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>Serviço: <strong>{selectedService.title}</strong></p>

            <form onSubmit={handleBook} style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Data do Evento</label>
                  <input type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Horário</label>
                  <input type="time" required value={bookingTime} onChange={e => setBookingTime(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Observações / Restrições (Opcional)</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: Alguém é alérgico a camarão?" style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #d1d5db' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={bookingLoading} style={{ flex: 2, padding: 12, background: '#ea580c', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: bookingLoading ? 'wait' : 'pointer' }}>
                  {bookingLoading ? 'Processando...' : 'Confirmar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
