'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { Star, MapPin, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import Link from 'next/link';

export default function ProdutoresPage() {
  const producers = [
    {
      id: '1',
      name: 'Barraca do Sr. Joaquim',
      specialty: 'Tomates e Legumes',
      location: 'Feira da Vila Mariana',
      rating: 4.9,
      reviews: 128,
      imageUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=400&auto=format&fit=crop',
      bio: 'Há mais de 30 anos cultivando os melhores tomates italianos da região de Atibaia.'
    },
    {
      id: '2',
      name: 'Horta da Família Silva',
      specialty: 'Folhas Higienizadas',
      location: 'Feira de Pinheiros',
      rating: 4.8,
      reviews: 95,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
      bio: 'Produção própria de hortaliças hidropônicas e orgânicas, focando no frescor absoluto.'
    },
    {
      id: '3',
      name: 'Temperos do Mundo',
      specialty: 'Especiarias e Grãos',
      location: 'Feira da Lapa',
      rating: 5.0,
      reviews: 210,
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
      bio: 'Curadoria de temperos de todo o Brasil e do mundo, moídos na hora.'
    },
    {
      id: '4',
      name: 'Pastel do Japa',
      specialty: 'Massas e Salgados',
      location: 'Feira da Mooca',
      rating: 4.7,
      reviews: 350,
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
      bio: 'O pastel mais crocante da Zona Leste, agora disponível para finalizar na sua casa.'
    }
  ];

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.container}>
        <section className={styles.hero}>
          <h1>Nossos Produtores</h1>
          <p>Conheça as mãos que cultivam e preparam o que chega na sua mesa.</p>
        </section>

        <section className={styles.grid}>
          {producers.map((producer) => (
            <div key={producer.id} className={styles.producerCard}>
              <div className={styles.cardImage}>
                <img src={producer.imageUrl} alt={producer.name} />
                <div className={styles.verifiedBadge}>
                  <ShieldCheck size={14} /> Verificado
                </div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3>{producer.name}</h3>
                  <div className={styles.rating}>
                    <Star size={16} fill="#fbbc04" color="#fbbc04" />
                    <span>{producer.rating}</span>
                  </div>
                </div>
                <span className={styles.specialty}>{producer.specialty}</span>
                <p className={styles.location}>
                  <MapPin size={14} /> {producer.location}
                </p>
                <p className={styles.bio}>{producer.bio}</p>
                <button className={styles.btnView}>
                  Ver Produtos <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.becomePartner}>
          <div className={styles.partnerContent}>
            <Award size={64} className={styles.partnerIcon} />
            <h2>Você é produtor ou feirante?</h2>
            <p>Junte-se à maior rede de feiras digitais do Brasil e expanda seu negócio.</p>
            <Link href="/cadastro/feirante" className={styles.btnPartner}>Quero participar</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
