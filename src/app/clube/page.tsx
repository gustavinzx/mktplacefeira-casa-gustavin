'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import { Flame, Calendar, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';

const ClubePage = () => {
  const [deals, setDeals] = React.useState<any[]>([]);
  const [denseDeals, setDenseDeals] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/products?limit=12')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.products) {
          const prods = data.data.products;
          // Simulate deals by adding oldPrice and picking a few
          const mappedDeals = prods.slice(0, 5).map((p: any) => ({
            id: p.id,
            title: p.title,
            price: Number(p.price),
            oldPrice: p.old_price ? Number(p.old_price) : undefined,
            unit: p.unit,
            imageUrl: p.image_url || '/images/placeholder.png',
            producer: p.producer?.full_name || 'Feirante',
            tags: ['OFERTAÇO']
          }));
          setDeals(mappedDeals);
          setDenseDeals(prods.slice(5, 11));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Exclusivo Clube</span>
            <h1>Clube Tabloide</h1>
            <p>Ofertas imbatíveis direto do produtor. Frescor garantido na sua mesa toda quarta-feira.</p>
          </div>
          <div className={styles.heroImage}>
            <img src="/images/placeholder.png" alt="Frutas" />
          </div>
        </section>

        {/* Location & Context Bar */}
        <div className={styles.contextBar}>
          <div className={styles.contextItem}>
            <div className={styles.iconBox}><Calendar size={20} /></div>
            <div>
              <p className={styles.label}>Você está vendo todas as ofertas de:</p>
              <h2>Ofertas de Quarta-feira</h2>
            </div>
          </div>
          <div className={styles.contextItemSecondary}>
            <div className={styles.iconBoxSecondary}><MapPin size={20} /></div>
            <div>
              <p className={styles.label}>Raio de 24km ativo</p>
              <h2>CEP 05412-000</h2>
            </div>
          </div>
        </div>

        {/* Fair Filter */}
        <section className={styles.fairFilter}>
          <p>Feiras no seu raio (24km):</p>
          <div className={styles.chipsRow}>
            <button className={styles.chipActive}>Todas</button>
            <button className={styles.chip}>Vila Madalena (0.5km)</button>
            <button className={styles.chip}>Pinheiros (2km)</button>
            <button className={styles.chip}>Sumaré (4.5km)</button>
            <button className={styles.chip}>Perdizes (3.8km)</button>
          </div>
        </section>

        {/* High Highlights Section */}
        <section className={styles.dealsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerTitle}>
              <Flame size={24} className="text-tertiary" />
              <h3>Destaques em Todas as Feiras</h3>
            </div>
            <div className={styles.countdown}>Termina em 04:22:15</div>
          </div>
          <div className={styles.dealsGrid}>
            {deals.length > 0 ? deals.map(deal => (
              <ProductCard key={deal.id} {...deal} />
            )) : <p>Carregando ofertas...</p>}
          </div>
        </section>

        {/* Categories / Grid of Small Items */}
        <section className={styles.denseSection}>
          <div className={styles.sectionHeaderBordered}>
            <div className={styles.headerTitle}>
              <ShoppingBag size={20} />
              <h3>Direto da Horta (Multifeiras)</h3>
            </div>
          </div>
          <div className={styles.denseGrid}>
             {denseDeals.map((prod: any, i) => (
               <div key={i} className={styles.miniCard}>
                 <img src={prod.image_url || "/images/placeholder.png"} alt={prod.title} />
                 <div className={styles.miniInfo}>
                   <span className={styles.locationTag}><MapPin size={8} /> VILA MADALENA</span>
                   <h4>{prod.title}</h4>
                   <div className={styles.miniPrice}>
                     <strong>R$ {Number(prod.price).toFixed(2)}</strong>
                     <span>{prod.unit}</span>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ClubePage;
