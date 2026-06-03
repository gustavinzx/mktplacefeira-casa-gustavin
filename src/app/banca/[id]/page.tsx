'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import { MapPin, Star, BadgeCheck, Search, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProducerDetailsPage({ params }: { params: { id: string } }) {
  const [producer, setProducer] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducerData();
  }, [params.id]);

  const fetchProducerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/producers/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setProducer(data.data.producer);
        setProducts(data.data.products || []);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da banca', error);
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

  if (!producer) {
    return (
      <div className={styles.page}>
        <Header />
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <h2>Banca não encontrada</h2>
          <Link href="/feiras" style={{ color: '#16a34a', textDecoration: 'underline' }}>Explorar feiras</Link>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.hero}>
        <img 
          src={producer.banner_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600"} 
          alt={producer.stall_name} 
          className={styles.banner} 
        />
        <div className={styles.heroOverlay}></div>
        
        <div className={styles.heroContent}>
          <div className={`${styles.container} ${styles.headerInfo}`}>
            <img 
              src={producer.profile?.avatar_url || "/images/placeholder.png"} 
              alt={producer.stall_name}
              className={styles.avatar} 
            />
            <div className={styles.textInfo}>
              <h1>{producer.stall_name}</h1>
              <div className={styles.badges}>
                <span className={styles.badge}>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  {producer.rating || '5.0'} ({Math.floor(Math.random() * 100 + 10)} avaliações)
                </span>
                {producer.is_verified && (
                  <span className={styles.badge} style={{ color: '#bbf7d0', borderColor: '#bbf7d0' }}>
                    <BadgeCheck size={14} /> Produtor Verificado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.layout}>
          
          <aside className={styles.sidebar}>
            <div className={styles.infoCard}>
              <h3>Sobre a Banca</h3>
              <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {producer.bio || 'Produtor local focado em trazer o melhor do campo diretamente para a sua mesa com qualidade e frescor garantidos.'}
              </p>
              
              <div className={styles.infoRow}>
                <MapPin size={18} />
                <div>
                  <p style={{ fontWeight: 700, color: '#111827' }}>Feira Atual</p>
                  <p>{producer.fair?.name || 'Várias Feiras'}</p>
                </div>
              </div>
            </div>
          </aside>

          <section className={styles.productsContent}>
            <div className={styles.filters}>
              <h2>Produtos</h2>
              <div className={styles.searchBox}>
                <Search size={18} color="#9ca3af" />
                <input 
                  type="text" 
                  placeholder="Buscar produto nesta banca..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '24px' }}>
                <p style={{ color: '#6b7280' }}>Nenhum produto encontrado na busca.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    unit={product.unit}
                    imageUrl={product.image_url}
                    isOrganic={product.is_organic}
                    producer={producer.stall_name}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
