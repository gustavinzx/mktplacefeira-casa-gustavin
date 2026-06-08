'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { Leaf, Users, ShieldCheck, Heart } from 'lucide-react';

// Textos padrão (fallback enquanto carrega ou se o banco estiver vazio)
const DEFAULTS = {
  sobre_titulo: 'Sobre nós',
  sobre_subtitulo: 'Conectando o frescor da feira diretamente à sua mesa, com tecnologia e propósito.',
  sobre_missao_titulo: 'Nossa Missão',
  sobre_missao_texto1:
    'A Feira.Casa nasceu da vontade de democratizar o acesso a alimentos frescos e de qualidade, apoiando diretamente o produtor local e o feirante tradicional. Acreditamos que a tecnologia deve servir para aproximar as pessoas daquilo que é essencial: a saúde e o sabor de verdade.',
  sobre_missao_texto2:
    'Trabalhamos para que cada pedido seja uma experiência de descoberta, onde você conhece a origem do que consome e fortalece a economia da sua região.',
};

export default function SobrePage() {
  const [content, setContent] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          // Merge com defaults para garantir que campos vazios mostram o fallback
          setContent((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {
        // silently fail — usa defaults
      })
      .finally(() => setLoading(false));
  }, []);

  const g = (key: string) => content[key] || DEFAULTS[key as keyof typeof DEFAULTS] || '';

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>{g('sobre_titulo')}</h1>
            <p>{g('sobre_subtitulo')}</p>
          </div>
        </section>

        <section className={styles.missionSection}>
          <div className={styles.contentGrid}>
            <div className={styles.textContent}>
              <h2>{g('sobre_missao_titulo')}</h2>
              <p>{g('sobre_missao_texto1')}</p>
              <p>{g('sobre_missao_texto2')}</p>
            </div>
            <div className={styles.imageContent}>
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
                alt="Feira tradicional"
              />
            </div>
          </div>
        </section>

        <section className={styles.values}>
          <div className={styles.valueCard}>
            <Leaf size={40} className={styles.icon} />
            <h3>Sustentabilidade</h3>
            <p>Focamos em circuitos curtos de consumo, reduzindo desperdício e emissão de carbono.</p>
          </div>
          <div className={styles.valueCard}>
            <Users size={40} className={styles.icon} />
            <h3>Comunidade</h3>
            <p>Valorizamos o trabalho humano e as relações de confiança entre produtores e consumidores.</p>
          </div>
          <div className={styles.valueCard}>
            <ShieldCheck size={40} className={styles.icon} />
            <h3>Qualidade</h3>
            <p>Curadoria rigorosa de parceiros para garantir que apenas o melhor chegue até você.</p>
          </div>
          <div className={styles.valueCard}>
            <Heart size={40} className={styles.icon} />
            <h3>Paixão</h3>
            <p>Amamos o que fazemos e acreditamos no poder transformador da alimentação consciente.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
