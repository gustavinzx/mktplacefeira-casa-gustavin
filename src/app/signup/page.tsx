'use client';

import React from 'react';
import Link from 'next/link';
import { 
  User, 
  Store, 
  Utensils, 
  Building2, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

import styles from './page.module.css';

export default function SignupSelection() {
  const profiles = [
    {
      id: 'user',
      title: 'Chef da Casa',
      description: 'Dona de casa ou apaixonado por culinária. Compras para o dia a dia.',
      icon: User,
      color: '#0e6b17',
      href: '/signup/user'
    },
    {
      id: 'chef',
      title: 'Chef Gourmet',
      description: 'Restaurantes, bares e cozinhas profissionais. Qualidade e frescor.',
      icon: Utensils,
      color: '#a63b00',
      href: '/signup/chef'
    },
    {
      id: 'b2b',
      title: 'Comprador Atacadista',
      description: 'Mercados, hotéis e grandes volumes com faturamento.',
      icon: Building2,
      color: '#30852f',
      href: '/signup/b2b'
    },
    {
      id: 'vendor',
      title: 'Feirante / Produtor',
      description: 'Venda seus produtos direto do campo para nossos clientes.',
      icon: Store,
      color: '#fc6c29',
      href: '/signup/vendor'
    }
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/login" className={styles.btnBack}>
           <ArrowLeft size={16} /> LOGIN
        </Link>
        <div className={styles.logo}>feira.casa</div>
      </header>

      <main className={styles.main}>
        <div className={styles.titleArea}>
          <h1>Como você quer <br/><span>começar hoje?</span></h1>
          <p>Selecione o perfil que melhor descreve você para personalizarmos sua experiência na plataforma.</p>
        </div>

        <div className={styles.list}>
          {profiles.map(profile => {
            const Icon = profile.icon;
            return (
              <Link key={profile.id} href={profile.href} className={styles.card}>
                <div className={styles.iconWrap} style={{ color: profile.color }}>
                  <Icon size={28} />
                </div>
                <div className={styles.cardInfo}>
                  <h3>{profile.title}</h3>
                  <p>{profile.description}</p>
                </div>
                <div className={styles.arrow}>
                  <ChevronRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Feira Viva - O frescor do campo na sua porta.</p>
      </footer>
    </div>
  );
}
