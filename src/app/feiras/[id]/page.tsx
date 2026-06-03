'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { MapPin, Clock, Star, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FairDetailsPage({ params }: { params: { id: string } }) {
  const [fair, setFair] = useState<any>(null);
  const [producers, setProducers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFairData();
  }, [params.id]);

  const fetchFairData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fairs/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setFair(data.data.fair);
        setProducers(data.data.producers || []);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da feira', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} className="animate-spin" color="#16a34a" />
      </div>
    );
  }

  if (!fair) {
    return (
      <div className={styles.page}>
        <Header />
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <h2>Feira não encontrada</h2>
          <Link href="/feiras" style={{ color: '#16a34a', textDecoration: 'underline' }}>Voltar para lista</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.hero}>
        <img 
          src={`https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1600`} 
          alt={fair.name} 
          className={styles.heroImage} 
        />
        <div className={styles.heroOverlay}></div>
        
        <div className={styles.heroContent}>
          <div className={styles.container}>
            <Link href="/feiras" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Voltar
            </Link>
            <h1 className={styles.heroTitle}>{fair.name}</h1>
            <div className={styles.infoChips}>
              <div className={styles.chip}>
                <MapPin size={16} />
                {fair.location}, {fair.city}
              </div>
              <div className={styles.chip}>
                <Clock size={16} />
                {fair.schedule?.days || 'Dias variados'} • {fair.schedule?.time || 'Consulte horários'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className={`${styles.main} ${styles.container}`}>
        <div className={styles.sectionTitle}>
          <h2>Conheça as Bancas ({producers.length})</h2>
        </div>

        {producers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', background: 'white', borderRadius: '24px' }}>
            Ainda não há produtores cadastrados nesta feira.
          </div>
        ) : (
          <div className={styles.stallsGrid}>
            {producers.map(producer => (
              <Link href={`/banca/${producer.id}`} key={producer.id} className={styles.stallCard}>
                <div className={styles.stallHeader}>
                  <img src={producer.profile?.avatar_url || "/images/placeholder.png"} alt={producer.stall_name} className={styles.avatar} />
                  <div className={styles.stallInfo}>
                    <h3>{producer.stall_name}</h3>
                    <div className={styles.rating}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                      <span>(5.0)</span>
                    </div>
                  </div>
                </div>
                
                {producer.products && producer.products.length > 0 && (
                  <div className={styles.productsPreview}>
                    {producer.products.slice(0, 3).map((prod: any) => (
                      <div key={prod.id} className={styles.productMini}>
                        <img src={prod.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'} alt={prod.title} />
                        <span>{prod.title}</span>
                        <span className={styles.price}>R$ {Number(prod.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
