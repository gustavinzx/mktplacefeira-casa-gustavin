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
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYVNv-ihK5WRveMFFflFB-mMFgkminTZDH_Sz5T1XRSRaP1TnPcv6kRq0hhFHiUZXBsh-8AE84-XoL52TDenSxFM7X4b1G_y_2M8VEP_UuobD1uo8aWjdzTBE9OKvkv1sYGzQeVTBEByvxOsJjOX58uypVaBQ5Tqv0kPIHF9W7UUkMEif-RbadDZsbZcUn_bxQPgfcKSwLMt5mBoYIU2JK-dt98kE1fTwWY9ghbu9UUy3dx-TVTvfRLlAOh9mMI2BYYzVd9-taZHE',
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
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkkXa08W04pVAg7GH_cXwojS1eh4cTh50wS8GZUNSDE77MBm-jMq8-sTbwWKjCEcheEoSrG9S3s1HplkvtmK0iCglML4iENnBdbdrvoyYQ_7EwwUn9V0-bwtNGOSU4jFgWFBW9NOLw8zhNgqovXdktIE0rFryFw2Q_iBXkhuh1tMRuNS3KpQKyOcF1L49m799pVVc4aUgcF1yT_ig--7OgjBWFKrGcDGZD4beaBP9CVZkuxgrf1WvpS5JOHCu1gCqWfuL0JbHlJOc',
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
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeWZD0jbk-iLm0gc_AClcLHmIMx77pCVkBQe1iKmCYovNBSsK7WXjPNJn-hzQfnonh9oQqSFVgOgTcSHNdYXwme6jtfywe2t8ip46b660O25WP3OQeNrUbCno4HvZcB9COjY8eKALG2rSe91TTaGdFx7mMIYAtW-fY3s-JV_pKEoRNnBhP46QUaI1C_H8qV3FCxCSgPAthmdPlpn-ttBbqPQgYZWb2YF0TQqHoy3yYKwYubgzZhGbvSn3rZ_tNzPo_S298nNC1wuc',
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
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbi9GMuXbqbTfV_u_RG_3DwRV7i3qFOlxiCeWLDtVJdyNJ4481faCnF9J9fgiBIgeUShbjO3vgddJEJXHMk31lSXDi1unHFaci9Vx_GX1EWdKWm9sLxillXajhBTAq2j8R7YB4GI5PJXurAey4f37hRDh3Y_JC9UQxRWijRmEp2izN7ffLynCoUW_gDdtHG_GIsUoGtSBq7ZmrAkutAb-o0zN-Jfw5wgF4Y_6D9euzF5TkEW4KVTMk3GfQjNc30alFpmPwxAKlPHA',
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
