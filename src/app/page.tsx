'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryGrid from '@/components/CategoryGrid';
import styles from './page.module.css';
import Link from 'next/link';
import { ArrowRight, MapPin, Clock, Star, ShoppingBag, Heart, Loader2 } from 'lucide-react';
import CarouselHero from '@/components/CarouselHero';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [fair, setFair] = useState<any>(null);
  const [featuredProducers, setFeaturedProducers] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [variedProducts, setVariedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let queryParams = '';
    try {
      const saved = localStorage.getItem('feira_region');
      if (saved) {
        const region = JSON.parse(saved);
        if (region.lat && region.lng) {
          queryParams = `?lat=${region.lat}&lng=${region.lng}`;
        }
      }
    } catch (e) {}

    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.access_token;
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`/api/home${queryParams}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.featuredProducts?.length) {
            setFeaturedProducts(
              data.data.featuredProducts.map((p: any) => ({
                id: p.id,
                title: p.title,
                price: Number(p.price),
                unit: p.unit,
                imageUrl: p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300',
                producer: p.producer?.stall_name || 'Produtor Local',
                producerId: p.producer_id,
                tags: p.is_promotion ? ['Oferta'] : undefined,
              }))
            );
          }
          if (data.data.fair) setFair(data.data.fair);
          if (data.data.featuredProducers) setFeaturedProducers(data.data.featuredProducers);
          if (data.data.recipes) setRecipes(data.data.recipes);
          if (data.data.variedProducts) setVariedProducts(data.data.variedProducts);
        } else {
          setFetchError(true);
        }
      })
      .catch((e) => {
        console.error('Erro ao carregar dados da home:', e);
        setFetchError(true);
      })
      .finally(() => {
        setLoading(false);
      });
    });
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        {/* Hero Section Carousel */}
        <CarouselHero />

        {/* Categories Section */}
        <section className={styles.categories}>
          <CategoryGrid />
        </section>

        <div className={styles.bentoGrid}>
          {/* Sidebar Area */}
          <aside className={styles.sidebar}>
            {/* Nearest Fair Card */}
            {fair && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <MapPin className="text-primary" size={20} />
                <h2>Feira mais próxima</h2>
              </div>
              <div className={styles.mapPreview} style={{ overflow: 'hidden', position: 'relative' }}>
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${fair.location}${fair.city ? ` - ${fair.city}` : ''}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                  allowFullScreen
                ></iframe>
                <span className={styles.mapLabel} style={{ zIndex: 10, bottom: '12px', left: '12px', right: 'auto' }}>
                  {fair.name?.toUpperCase()}
                </span>
              </div>
              <div className={styles.fairInfo}>
                <div className={styles.infoRow}>
                  <Clock size={16} />
                  <div>
                    <p><strong>{fair.schedule?.days || 'Terças e Sábados'}</strong></p>
                    <p>{fair.schedule?.time || 'Das 07:00 às 13:00'}</p>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <MapPin size={16} />
                  <p>{fair.location}{fair.city ? ` - ${fair.city}` : ''}</p>
                </div>
                <a 
                  className={styles.btnOutline}
                  style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${fair.location}${fair.city ? ` - ${fair.city}` : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Como chegar
                </a>
              </div>
            </div>
            )}

            {/* Featured Producers Carousel */}
            {featuredProducers.length > 0 && (
            <div className={styles.producersCarouselWrapper}>
              <h3 style={{ fontSize: 18, marginBottom: 16 }}>Bancas Destaque</h3>
              <div className={styles.producersCarousel}>
                {featuredProducers.map(producer => (
                  <div key={producer.id} className={`${styles.card} ${styles.featuredProducer}`}>
                    {producer.profile?.avatar_url && <span className={styles.badge}>PATROCINADO</span>}
                    <div className={styles.producerHeader}>
                      <div className={styles.avatar}>
                        <img src={producer.profile?.avatar_url || "/images/placeholder.png"} alt={producer.stall_name} />
                      </div>
                      <div>
                        <h3>{producer.stall_name}</h3>
                        <div className={styles.rating}>
                          {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                          <span>(4.9)</span>
                        </div>
                      </div>
                    </div>
                    <p className={styles.quote}>&quot;{producer.description || 'Os melhores produtos da região, colhidos com carinho.'}&quot;</p>
                    <div className={styles.miniProducts}>
                      {producer.products?.map((prod: any) => (
                        <div className={styles.miniItem} key={prod.id}>
                          <img src={prod.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'} alt={prod.title} />
                          <p>{prod.title}</p>
                          <span>R$ {Number(prod.price).toFixed(2).replace('.', ',')}/{prod.unit}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={`/producer/${producer.id}`} className={styles.btnSecondary} style={{display:'flex', justifyContent:'center'}}>Ver Banca <ArrowRight size={16} /></Link>
                  </div>
                ))}
              </div>
            </div>
            )}
          </aside>

          {/* Main Content Area */}
          <section className={styles.content}>
            <div className={styles.sectionHeader}>
              <h2>Recomendado para Você</h2>
              <Link href="/search" className={styles.viewAll}>
                Ver tudo <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className={styles.productsGrid}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                  <Loader2 size={32} className="animate-spin" color="#0e6b17" />
                </div>
              ) : fetchError ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon">⚠️</div>
                  <h3>Ops! Não conseguimos carregar as ofertas.</h3>
                  <p>Verifique sua conexão ou tente novamente mais tarde.</p>
                </div>
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))
              ) : (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon">🛒</div>
                  <h3>Nenhuma oferta no momento</h3>
                  <p>Volte mais tarde para ver novos produtos fresquinhos!</p>
                </div>
              )}
            </div>

            {/* Varied Products Area */}
            {variedProducts && variedProducts.length > 0 && (
            <div className={styles.variedSection} style={{ marginTop: 48, marginBottom: 48 }}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Descubra Novos Produtos</h2>
                  <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                    Uma seleção especial de produtos fresquinhos e variados para você.
                  </p>
                </div>
              </div>
              
              <div className={styles.productsGrid} style={{ marginTop: 20 }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                    <Loader2 size={32} className="animate-spin" color="#0e6b17" />
                  </div>
                ) : fetchError ? (
                  <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                    <div className="empty-state-icon">⚠️</div>
                    <h3>Não foi possível carregar a lista.</h3>
                  </div>
                ) : variedProducts.length > 0 ? (
                  variedProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      unit={product.unit}
                      imageUrl={product.image_url}
                      isOrganic={product.is_organic}
                      producer={product.producer?.stall_name}
                    />
                  ))
                ) : (
                  <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                    <div className="empty-state-icon">🛒</div>
                    <h3>Sem produtos na sua região</h3>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Promo Banners Area */}
            <div className={styles.bannersGrid}>
              <Link href="/categories/organicos" className={styles.banner}>
                <img src="/images/cat_organicos.png" alt="Orgânicos" />
                <div className={styles.bannerContent}>
                  <span>Orgânicos</span>
                </div>
              </Link>
              <Link href="/categories/temperos" className={styles.banner}>
                <img src="/images/cat_temperos.png" alt="Temperos" />
                <div className={styles.bannerContent}>
                  <span>Temperos do Mundo</span>
                </div>
              </Link>
              <Link href="/categories/kit-pastel" className={styles.banner}>
                <img src="/images/cat_pastel.png" alt="Pastel" />
                <div className={styles.bannerContent}>
                  <span>Kit Pastel</span>
                </div>
              </Link>
              <Link href="/categories/ofertas-dia" className={styles.banner}>
                <img src="/images/cat_ofertas.png" alt="Ofertas" />
                <div className={styles.bannerContent}>
                  <span>Ofertas do Dia</span>
                </div>
              </Link>
            </div>

            {/* Recipes Area */}
            {recipes && recipes.length > 0 && (
            <div className={styles.recipesSection}>
              <div className={styles.sectionHeader}>
                <h2>Receitas do Chef</h2>
              </div>
              <div className={styles.recipesGrid}>
                {recipes.map(recipe => (
                <div className={styles.recipeCard} key={recipe.id}>
                  <div className={styles.recipeImage}>
                    <img src={recipe.image_url || "/images/placeholder.png"} alt={recipe.title} />
                  </div>
                  <div className={styles.recipeInfo}>
                    <h3>{recipe.title}</h3>
                    <p>{recipe.description || 'Uma receita especial do nosso chef.'}</p>
                    <Link href={`/receitas/${recipe.id}`} className={styles.buyIngredients}>
                      Ver Receita <ShoppingBag size={14} />
                    </Link>
                  </div>
                </div>
                ))}
              </div>
            </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
