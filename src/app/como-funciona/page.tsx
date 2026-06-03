'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { Search, ShoppingCart, Truck, CheckCircle, Apple, Store, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ComoFuncionaPage() {
  const steps = [
    {
      icon: <MapPin size={40} />,
      title: 'Encontre sua região',
      description: 'Informe seu CEP para localizarmos as feiras e produtores que atendem o seu bairro.'
    },
    {
      icon: <Search size={40} />,
      title: 'Escolha seus itens',
      description: 'Navegue pelas bancas digitais e selecione frutas, legumes e produtos artesanais fresquinhos.'
    },
    {
      icon: <ShoppingCart size={40} />,
      title: 'Finalize o pedido',
      description: 'Pague com segurança via cartão ou PIX. Seus itens são reservados diretamente com o feirante.'
    },
    {
      icon: <Truck size={40} />,
      title: 'Receba em casa',
      description: 'Nossa logística especializada garante que o frescor da feira chegue intacto à sua porta.'
    }
  ];

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.container}>
        <section className={styles.hero}>
          <h1>Como Funciona</h1>
          <p>Sua feira de rua favorita, agora com a conveniência do digital.</p>
        </section>

        <section className={styles.stepsGrid}>
          {steps.map((step, index) => (
            <div key={index} className={styles.stepCard}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.iconWrapper}>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </section>

        <section className={styles.features}>
          <div className={styles.featureItem}>
            <Apple size={32} className={styles.featureIcon} />
            <div>
              <h3>Frescor Garantido</h3>
              <p>Os produtos são separados no dia da entrega, garantindo a máxima qualidade.</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <Store size={32} className={styles.featureIcon} />
            <div>
              <h3>Apoio ao Produtor</h3>
              <p>Ao comprar na Feira.Casa, você fortalece o pequeno produtor e a agricultura familiar.</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <CheckCircle size={32} className={styles.featureIcon} />
            <div>
              <h3>Curadoria Especializada</h3>
              <p>Selecionamos apenas os melhores feirantes de cada região para integrar nossa rede.</p>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <h2>Pronto para começar?</h2>
          <p>Descubra o que há de melhor nas feiras da sua região.</p>
          <Link href="/" className={styles.btnPrimary}>Ir para a Loja</Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
