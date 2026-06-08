'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Loader2, Store } from 'lucide-react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

export default function FeirasPage() {
  const [myFairs, setMyFairs] = useState<any[]>([]);
  const [availableFairs, setAvailableFairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchFairs = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/feirante/feiras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fair_id })
      });
      if (res.ok) {
        showToast('Feira adicionada com sucesso!', 'success');
        fetchFairs();
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao entrar na feira.', 'error');
    }
  };

  const handleLeave = async (fair_id: string) => {
    if (!confirm('Tem certeza que deseja sair desta feira? Você perderá seu espaço reservado.')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/feirante/feiras?fair_id=${fair_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Você saiu da feira.', 'info');
        fetchFairs();
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao sair da feira.', 'error');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Minhas Feiras</h1>
        <p className={styles.subtitle}>Gerencie seus pontos de venda físicos e expanda sua atuação para novas regiões.</p>
      </div>

      <div className={styles.sectionHeader}>
        <div className={styles.iconWrapper}><Store size={18} /></div> 
        <h2 className={styles.sectionTitle}>Feiras que Participo</h2>
      </div>
      
      <div className={styles.grid}>
        {myFairs.length > 0 ? (
          myFairs.map(item => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.fairName}>{item.fair.name}</h3>
                <span className={styles.badgeActive}>{item.status === 'approved' ? 'Confirmado' : 'Pendente'}</span>
              </div>
              <div className={styles.infoRow}><MapPin size={16} className={styles.infoIcon} /> <span>{item.fair.location}</span></div>
              <div className={styles.infoRow}><MapPin size={16} className={styles.infoIcon} /> <span>{item.fair.city} {item.fair.region ? `- ${item.fair.region}` : ''}</span></div>
              <div className={styles.infoRow}><Calendar size={16} className={styles.infoIcon} /> <span>Presença Ativa</span></div>
              
              <button className={`${styles.btnAction} ${styles.btnLeave}`} onClick={() => handleLeave(item.fair.id)}>
                Sair da Feira
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><Store size={32} /></div>
            <p>Você ainda não participa de nenhuma feira.</p>
            <span>Junte-se a uma das opções abaixo!</span>
          </div>
        )}
      </div>

      <div className={styles.sectionDivider} />

      <div className={styles.sectionHeader}>
        <div className={styles.iconWrapperBlue}><MapPin size={18} /></div>
        <h2 className={styles.sectionTitle}>Descobrir Novas Feiras</h2>
      </div>

      <div className={styles.grid}>
        {availableFairs.length > 0 ? (
          availableFairs.map(fair => (
            <div key={fair.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.fairName}>{fair.name}</h3>
              </div>
              <div className={styles.infoRow}><MapPin size={16} className={styles.infoIcon} /> <span>{fair.location}</span></div>
              <div className={styles.infoRow}><MapPin size={16} className={styles.infoIcon} /> <span>{fair.city} {fair.region ? `- ${fair.region}` : ''}</span></div>
              
              <button className={`${styles.btnAction} ${styles.btnJoin}`} onClick={() => handleJoin(fair.id)}>
                Participar desta Feira
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><MapPin size={32} /></div>
            <p>Não há novas feiras disponíveis.</p>
            <span>Você já participa de todas as feiras cadastradas!</span>
          </div>
        )}
      </div>
    </div>
  );
}
