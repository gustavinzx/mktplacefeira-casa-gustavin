'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { MapPin, CreditCard, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const CheckoutPage = () => {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={`${styles.container} container`}>
        <div>
          <h1 className={styles.title}>Finalizar Compra</h1>
          
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}><MapPin size={24} /> Endereço de Entrega</h2>
            <div className={styles.addressCard}>
              <div>
                <p style={{ fontWeight: 700 }}>Casa (Principal)</p>
                <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                  Rua das Orquídeas, 123 - Vila Mariana<br />
                  São Paulo, SP - 04101-000
                </p>
              </div>
              <button className="btn-secondary" style={{ fontSize: '13px' }}>Alterar</button>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}><CreditCard size={24} /> Método de Pagamento</h2>
            <div className={styles.paymentMethods}>
              <div className={`${styles.method} ${styles.methodActive}`}>
                <input type="radio" checked readOnly />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>Cartão de Crédito final 4421</p>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Visa • Expira em 12/28</p>
                </div>
              </div>
              <div className={styles.method}>
                <input type="radio" />
                <p style={{ fontWeight: 600 }}>Pagar com PIX</p>
              </div>
            </div>
          </div>
        </div>

        <aside>
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Resumo do Pedido</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal (8 itens)</span>
              <span>R$ 138,50</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Frete Único</span>
              <span>R$ 12,00</span>
            </div>
            <div className={styles.summaryRow} style={{ color: '#1e8e3e' }}>
              <span>Cupom: PRIMEIRAFAIRA</span>
              <span>- R$ 10,00</span>
            </div>
            
            <div className={styles.totalRow}>
              <span>Total</span>
              <span>R$ 140,50</span>
            </div>

            <Link href="/checkout/confirmation" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '32px', padding: '16px' }}>
                Confirmar e Pagar <ChevronRight size={20} />
              </button>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', color: 'var(--on-surface-variant)', fontSize: '13px' }}>
              <ShieldCheck size={18} /> Pagamento 100% Seguro
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
