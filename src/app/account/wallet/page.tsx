'use client';

import React from 'react';
import { CreditCard, Plus, Trash2, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';

const WalletPage = () => {
  const cards = [
    {
      id: '1',
      brand: 'Visa',
      last4: '4242',
      expiry: '12/28',
      holder: 'MARIA S SILVA',
      isDefault: true
    },
    {
      id: '2',
      brand: 'Mastercard',
      last4: '8812',
      expiry: '05/26',
      holder: 'MARIA S SILVA',
      isDefault: false
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Minha Carteira</h1>
        <button className={styles.btnAdd}>
          <Plus size={18} /> Novo Cartão
        </button>
      </header>

      <div className={styles.list}>
        {cards.map(card => (
          <div key={card.id} className={`${styles.card} ${card.isDefault ? styles.default : ''}`}>
            <div className={styles.cardHeader}>
              <CreditCard size={24} />
              <span className={styles.brand}>{card.brand}</span>
            </div>
            
            <div className={styles.cardNumber}>
              •••• •••• •••• {card.last4}
            </div>

            <div className={styles.cardFooter}>
              <div>
                <p className={styles.label}>Validade</p>
                <p className={styles.value}>{card.expiry}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className={styles.label}>Titular</p>
                <p className={styles.value}>{card.holder}</p>
              </div>
            </div>

            {card.isDefault && (
              <div className={styles.defaultBadge}>
                <ShieldCheck size={12} /> Cartão Principal
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.securityNote}>
        <ShieldCheck size={20} />
        <p>Seus dados de pagamento são criptografados e processados com segurança máxima (PCI-DSS).</p>
      </div>
    </div>
  );
};

export default WalletPage;
