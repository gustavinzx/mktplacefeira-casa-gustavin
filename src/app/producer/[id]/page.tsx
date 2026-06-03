'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import { Star, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProducerPage() {
  const params = useParams();
  const producerId = params.id as string;
  
  const [producer, setProducer] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rating state
  const [ratingHover, setRatingHover] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!producerId) return;

    Promise.all([
      fetch(`/api/producer/${producerId}`).then(res => res.json()),
      fetch(`/api/producer/${producerId}/reviews`).then(res => res.json())
    ])
      .then(([prodData, revData]) => {
        if (prodData.success) {
          setProducer(prodData.data.producer);
          setProducts(prodData.data.products);
        } else {
          setError(prodData.error || 'Banca não encontrada');
        }
        if (revData.success) {
          setReviews(revData.data.reviews || []);
        }
      })
      .catch(err => {
        setError('Erro de conexão ao carregar a banca.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [producerId]);

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    setSubmittingReview(true);
    const token = localStorage.getItem('access_token');
    
    try {
      const res = await fetch(`/api/producer/${producerId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        setReviews([...reviews, data.data.review]);
        setRating(0);
        setComment('');
        setTimeout(() => setReviewSuccess(false), 3000);
      } else {
        alert(data.error || 'Erro ao enviar avaliação');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>
          <Loader2 className="animate-spin" size={48} color="var(--primary)" />
          <p style={{ marginTop: 16, color: '#666' }}>Carregando banca...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !producer) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.error}>
          <h2>Ops! Algo deu errado.</h2>
          <p>{error}</p>
          <Link href="/" className={styles.btnBack} style={{ marginTop: 24 }}>
            <ArrowLeft size={16} /> Voltar para a página inicial
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        <Link href="/" className={styles.btnBack}>
          <ArrowLeft size={16} /> Voltar
        </Link>

        <section className={styles.producerHeader}>
          <div className={styles.avatar}>
            <img 
              src={producer.profile?.avatar_url || "/images/placeholder.png"} 
              alt={producer.stall_name} 
            />
          </div>
          <div className={styles.info}>
            <h1>{producer.stall_name}</h1>
            <div className={styles.rating}>
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}
              <span>(4.9) - Produtor Verificado</span>
            </div>
            <p className={styles.description}>
              {producer.description || "Bem-vindo à nossa banca! Cultivamos e selecionamos os melhores produtos com muito carinho para levar sabor e saúde até a sua mesa."}
            </p>
          </div>
        </section>

        <section className={styles.productsSection}>
          <div className={styles.sectionHeader}>
            <h2>Produtos desta Banca</h2>
            <span style={{ color: '#666' }}>{products.length} itens disponíveis</span>
          </div>
          
          {products.length > 0 ? (
            <div className={styles.productsGrid}>
              {products.map(p => (
                <ProductCard 
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  price={Number(p.price)}
                  unit={p.unit}
                  imageUrl={p.image_url || '/images/tomato.png'}
                  isOrganic={!!p.is_organic}
                  producer={producer.stall_name}
                />
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '16px', color: '#666' }}>
              <p>Este produtor ainda não cadastrou nenhum produto.</p>
            </div>
          )}
        </section>

        <section className={styles.productsSection} style={{ marginTop: 40, borderTop: '1px solid #eee', paddingTop: 40 }}>
          <div className={styles.sectionHeader}>
            <h2>Avaliações dos Clientes</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40, marginTop: 24 }}>
            {/* Form de Avaliação */}
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #eee', height: 'fit-content' }}>
              <h3 style={{ fontSize: 18, marginBottom: 16 }}>Avalie esta banca</h3>
              
              {reviewSuccess ? (
                <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                  Obrigado pela sua avaliação! 🌟
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={28} 
                        color={star <= (ratingHover || rating) ? '#fbbc04' : '#ddd'} 
                        fill={star <= (ratingHover || rating) ? '#fbbc04' : 'transparent'} 
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                  <textarea 
                    placeholder="Deixe um comentário (opcional)" 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', minHeight: 80, marginBottom: 16, fontFamily: 'inherit' }}
                  />
                  <button 
                    onClick={handleSubmitReview}
                    disabled={rating === 0 || submittingReview}
                    style={{ 
                      width: '100%', padding: 12, borderRadius: 8, border: 'none', 
                      background: rating === 0 ? '#ddd' : 'var(--primary)', 
                      color: rating === 0 ? '#888' : '#fff', fontWeight: 700, cursor: rating === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {submittingReview ? 'Enviando...' : 'Enviar Avaliação'}
                  </button>
                </>
              )}
            </div>

            {/* Lista de Avaliações */}
            <div>
              {reviews.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>Esta banca ainda não possui avaliações. Seja o primeiro!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {reviews.map(rev => (
                    <div key={rev.id} style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={14} color="#fbbc04" fill={star <= rev.rating ? '#fbbc04' : 'transparent'} />
                            ))}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>Cliente Verificado</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#888' }}>
                          {new Date(rev.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {rev.comment && <p style={{ fontSize: 14, color: '#444' }}>&quot;{rev.comment}&quot;</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
