import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '../institutional.module.css';
import { Leaf, Truck, Users, Heart } from 'lucide-react';

export const metadata = {
  title: 'Quem somos | Feira Casa',
  description: 'Conheça a Feira Casa — frescor da feira livre direto na sua porta.',
};

export default function SobrePage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Quem somos</h1>
          <p>
            A Feira Casa conecta famílias, restaurantes e chefs aos melhores produtores
            das feiras livres da sua região — com a praticidade de um marketplace digital.
          </p>
        </div>

        <section className={styles.section}>
          <h2>Nossa missão</h2>
          <p>
            Levar o frescor da feira direto à sua porta, valorizando o pequeno produtor e
            reduzindo a distância entre o campo e a mesa. Acreditamos em alimentos frescos,
            sazonais e em comércio justo.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Como funciona</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <Leaf size={32} color="#0e6b17" />
              <h3>Produtores locais</h3>
              <p>Feirantes verificados vendem o que colheram no dia.</p>
            </div>
            <div className={styles.card}>
              <Truck size={32} color="#0e6b17" />
              <h3>Entrega rápida</h3>
              <p>Pedidos separados na feira e entregues na sua região.</p>
            </div>
            <div className={styles.card}>
              <Users size={32} color="#0e6b17" />
              <h3>Para todos</h3>
              <p>Consumidor final, restaurantes, chefs e compra atacado.</p>
            </div>
            <div className={styles.card}>
              <Heart size={32} color="#0e6b17" />
              <h3>Comunidade</h3>
              <p>Fortalecemos feiras livres e a economia local.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Quer fazer parte?</h2>
          <p>Seja feirante, chef parceiro ou comprador atacadista.</p>
          <div className={styles.ctaRow}>
            <Link href="/signup/vendor" className={styles.btnPrimary}>
              Sou Produtor/Feirante
            </Link>
            <Link href="/signup/chef" className={styles.btnOutline}>
              Restaurantes &amp; Chefs
            </Link>
            <Link href="/fairs" className={styles.btnOutline}>
              Ver feiras próximas
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
