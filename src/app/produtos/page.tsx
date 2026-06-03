'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import { Search, Filter, Loader2, Leaf, Tag } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=50');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products || []);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (onlyOrganic && !p.is_organic) return false;
    if (onlyOffers && !p.is_promotion) return false;
    return true;
  });

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Todos os Produtos</h1>
          <p>Frescos, saudáveis e direto de quem planta.</p>
        </div>

        <div className={styles.layout}>
          
          <aside className={styles.sidebar}>
            <div className={styles.filterCard}>
              <h3><Filter size={20} /> Filtros</h3>
              
              <div className={styles.searchBox}>
                <Search size={18} color="#9ca3af" />
                <input 
                  type="text" 
                  placeholder="Buscar produto..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className={styles.filterGroup}>
                <h4>Características</h4>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={onlyOrganic}
                    onChange={e => setOnlyOrganic(e.target.checked)}
                  />
                  <Leaf size={14} color="#16a34a" /> Orgânicos
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={onlyOffers}
                    onChange={e => setOnlyOffers(e.target.checked)}
                  />
                  <Tag size={14} color="#ea580c" /> Ofertas
                </label>
              </div>

            </div>
          </aside>

          <section className={styles.productsContent}>
            <div className={styles.resultsHeader}>
              <span className={styles.resultsCount}>
                Mostrando {filteredProducts.length} produtos
              </span>
              <select className={styles.sortSelect}>
                <option value="recent">Mais Recentes</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
              </select>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 size={40} className="animate-spin" color="#16a34a" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '24px' }}>
                <p style={{ color: '#6b7280' }}>Nenhum produto encontrado com os filtros atuais.</p>
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
                    producer={product.producer?.stall_name}
                    tags={product.is_promotion ? ['Oferta'] : undefined}
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
