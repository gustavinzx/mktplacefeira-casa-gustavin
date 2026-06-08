'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import { MapPin, Star, BadgeCheck, Search, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function ProducerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const producerId = unwrappedParams.id;
  
  const [producer, setProducer] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducerData();
  }, [producerId]);

  const fetchProducerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/producers/${producerId}`);
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

            {/* Reviews Section */}
            <div style={{ marginTop: '4rem', background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star fill="#fbbf24" color="#fbbf24" size={24} /> Avaliações dos Clientes
              </h3>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '2rem' }}>
                <input type="text" placeholder="Deixe seu comentário sobre a banca..." style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none' }} />
                <button style={{ padding: '12px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => showToast('Em breve: Avaliações conectadas à API', 'info')}>Publicar</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>João Pedro</span>
                    <span style={{ color: '#fbbf24', fontSize: '0.875rem' }}>★★★★★</span>
                  </div>
                  <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>Produtos muito frescos, comprei a alface e os tomates e vieram perfeitos! Recomendo.</p>
                </div>
                <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>Maria S.</span>
                    <span style={{ color: '#fbbf24', fontSize: '0.875rem' }}>★★★★☆</span>
                  </div>
                  <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>Atendimento ótimo, só atrasou um pouquinho a separação, mas a qualidade compensa.</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
