'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { Search, Map, Filter, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function FeirasPage() {
  const [fairs, setFairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Tenta pegar a localização do localStorage
    try {
      const saved = localStorage.getItem('feira_region');
      if (saved) {
        setUserLocation(JSON.parse(saved));
      }
    } catch (e) {}

    fetchFairs();
  }, []);

  const fetchFairs = async () => {
    setLoading(true);
    try {
      // Idealmente passar lat/lng via query string para usar a RPC postgis
      const res = await fetch('/api/fairs');
      const data = await res.json();
      if (data.success) {
        setFairs(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar feiras', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFairs = fairs.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.city && f.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f.region && f.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Encontre a Feira Ideal</h1>
          <p>Descubra produtos frescos diretamente de quem planta perto de você.</p>
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome, cidade ou bairro..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className={styles.filterBtn}>
            <Filter size={18} />
            Filtros
          </button>
          
          <button className={styles.mapBtn}>
            <Map size={18} />
            Ver no Mapa
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={40} className="animate-spin" color="#16a34a" />
          </div>
        ) : filteredFairs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
            <MapPin size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>Nenhuma feira encontrada</h3>
            <p>Tente ajustar seus filtros ou buscar por outra região.</p>
          </div>
        ) : (
          <div className={styles.fairsGrid}>
            {filteredFairs.map(fair => (
              <Link href={`/feiras/${fair.id}`} key={fair.id} className={styles.fairCard}>
                <div className={styles.cardImage}>
                  {/* Placeholder image baseada no nome para variar um pouco */}
                  <img 
                    src={`https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600&seed=${fair.id}`} 
                    alt={fair.name} 
                  />
                  <div className={`${styles.statusBadge} ${styles.statusOpen}`}>Acontecendo Hoje</div>
                </div>
                
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.fairName}>{fair.name}</h2>
                    {userLocation && fair.latitude && fair.longitude && (
                      <span className={styles.fairDistance}>
                        {/* Fake distance if postgis distance isn't returned directly yet */}
                        {(Math.random() * 5 + 1).toFixed(1)} km
                      </span>
                    )}
                  </div>

                  <div className={styles.infoRow}>
                    <MapPin size={16} />
                    <span>{fair.location}, {fair.city} {fair.region ? `- ${fair.region}` : ''}</span>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <Clock size={16} />
                    <span>{fair.schedule?.days || 'Dias variados'} • {fair.schedule?.time || 'Consulte horários'}</span>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.producersCount}>
                      <span>12 bancas</span>
                      <div className={styles.producersAvatars}>
                        <div className={styles.avatar}></div>
                        <div className={styles.avatar}></div>
                        <div className={styles.avatar}></div>
                      </div>
                    </div>
                    
                    <span className={styles.enterBtn}>
                      Visitar <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
