'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, Loader2, Store } from 'lucide-react';
import styles from './page.module.css';

export default function FeirasPage() {
  const [myFairs, setMyFairs] = useState<any[]>([]);
  const [availableFairs, setAvailableFairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFairs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/feirante/feiras', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyFairs(data.data.myFairs);
        setAvailableFairs(data.data.availableFairs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFairs();
  }, []);

  const handleJoin = async (fair_id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/feirante/feiras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fair_id })
      });
      if (res.ok) fetchFairs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeave = async (fair_id: string) => {
    if (!confirm('Tem certeza que deseja sair desta feira? Você perderá seu espaço reservado.')) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/feirante/feiras?fair_id=${fair_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchFairs();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Minhas Feiras</h1>
        <p className={styles.subtitle}>Gerencie os pontos físicos onde sua banca está presente.</p>
      </div>

      <h2 className={styles.sectionTitle}><Store size={20} /> Feiras que Participo</h2>
      <div className={styles.grid}>
        {myFairs.length > 0 ? (
          myFairs.map(item => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.fairName}>{item.fair.name}</h3>
                <span className={styles.badge}>{item.status === 'approved' ? 'Confirmado' : 'Pendente'}</span>
              </div>
              <div className={styles.infoRow}><MapPin size={16} /> {item.fair.location}</div>
              <div className={styles.infoRow}><MapPin size={16} /> {item.fair.city} {item.fair.region ? `- ${item.fair.region}` : ''}</div>
              <div className={styles.infoRow}><Calendar size={16} /> Presença Ativa</div>
              
              <button className={`${styles.btnAction} ${styles.btnLeave}`} onClick={() => handleLeave(item.fair.id)}>
                Sair da Feira
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>Você ainda não participa de nenhuma feira. Junte-se a uma abaixo!</div>
        )}
      </div>

      <h2 className={styles.sectionTitle}><MapPin size={20} /> Descobrir Novas Feiras</h2>
      <div className={styles.grid}>
        {availableFairs.length > 0 ? (
          availableFairs.map(fair => (
            <div key={fair.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.fairName}>{fair.name}</h3>
              </div>
              <div className={styles.infoRow}><MapPin size={16} /> {fair.location}</div>
              <div className={styles.infoRow}><MapPin size={16} /> {fair.city} {fair.region ? `- ${fair.region}` : ''}</div>
              
              <button className={`${styles.btnAction} ${styles.btnJoin}`} onClick={() => handleJoin(fair.id)}>
                Participar desta Feira
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>Não há novas feiras disponíveis no momento.</div>
        )}
      </div>
    </div>
  );
}
