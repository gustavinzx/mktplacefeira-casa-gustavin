'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { 
  Search, 
  ArrowLeft, 
  ChefHat, 
  Utensils, 
  BookOpen, 
  Timer,
  Sparkles,
  Filter
} from 'lucide-react';
import ServiceCard from '@/components/ServiceCard';

const ServicesPage = () => {
  const categories = [
    { id: 'chef', name: 'Personal Chef', icon: ChefHat, color: '#0e6b17' },
    { id: 'workshop', name: 'Workshops', icon: BookOpen, color: '#a63b00' },
    { id: 'prep', name: 'Preparo de Marmitas', icon: Timer, color: '#30852f' },
    { id: 'consulting', name: 'Consultorias', icon: Sparkles, color: '#ffc107' }
  ];

  const services = [
    {
      id: 's1',
      title: 'Jantar Gourmet em Casa (6-10 pessoas)',
      provider: 'Chef Henrique Fogaça',
      price: 2400,
      rating: 4.9,
      duration: '4h de duração',
      capacity: '6-10 pessoas',
      imageUrl: '/images/placeholder.png',
      category: 'Experiência',
      isHighDemand: true
    },
    {
      id: 's2',
      title: 'Oficina de Pães Artesanais Sourdough',
      provider: 'Padaria da Vila',
      price: 350,
      rating: 4.8,
      duration: '3h de aula',
      capacity: 'Até 12 pessoas',
      imageUrl: '/images/placeholder.png',
      category: 'Workshop',
      isHighDemand: false
    },
    {
      id: 's3',
      title: 'Consultoria de Despensa Saudável',
      provider: 'Nutri Marina Lima',
      price: 450,
      rating: 4.7,
      duration: '2h de consultoria',
      capacity: 'Individual',
      imageUrl: '/images/placeholder.png',
      category: 'Consultoria',
      isHighDemand: false
    },
    {
      id: 's4',
      title: 'Preparo de Marmitas para a Semana',
      provider: 'Cozinha com Afeto',
      price: 180,
      rating: 4.9,
      duration: '3h de preparo',
      capacity: 'Na sua casa',
      imageUrl: '/images/placeholder.png',
      category: 'Serviço Doméstico',
      isHighDemand: true
    }
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.btnBack}>
            <ArrowLeft size={20} />
          </Link>
          <div className={styles.searchBar}>
            <Search size={20} />
            <input type="text" placeholder="Qual serviço você procura hoje?" />
          </div>
          <button className={styles.btnFilter}>
            <Filter size={20} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1>Talentos da Feira <br/><strong>na sua casa</strong></h1>
          <p>Contrate especialistas para cozinhar, ensinar ou organizar sua vida gastronômica.</p>
        </section>

        <section className={styles.categories}>
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} className={styles.catCard}>
                <div className={styles.iconBox} style={{ backgroundColor: cat.color + '15', color: cat.color }}>
                  <Icon size={24} />
                </div>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </section>

        <section className={styles.content}>
          <div className={styles.sectionHeader}>
            <h2>Serviços em Destaque</h2>
            <Link href="/services/all">Ver todos</Link>
          </div>

          <div className={styles.grid}>
            {services.map(service => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h3>Tem um talento na cozinha?</h3>
            <p>Comece a oferecer seus serviços no feira.casa e garanta sua renda fazendo o que ama.</p>
            <Link href="/signup/chef" className={styles.btnCta}>Quero ser um Parceiro</Link>
          </div>
          <div className={styles.ctaImage}>
             <Utensils size={80} color="white" opacity={0.2} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default ServicesPage;
