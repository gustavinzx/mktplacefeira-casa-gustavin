'use client';

import React from 'react';
import { MapPin, Plus, Trash2, Edit2 } from 'lucide-react';
import styles from './page.module.css';

const AddressesPage = () => {
  const addresses = [
    {
      id: '1',
      type: 'Casa',
      street: 'Rua das Orquídeas, 123',
      complement: 'Ap 42',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04123-000',
      isDefault: true
    },
    {
      id: '2',
      type: 'Trabalho',
      street: 'Av. Paulista, 1000',
      complement: 'Andar 15',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      isDefault: false
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Meus Endereços</h1>
        <button className={styles.btnAdd}>
          <Plus size={18} /> Adicionar Novo
        </button>
      </header>

      <div className={styles.list}>
        {addresses.map(addr => (
          <div key={addr.id} className={`${styles.card} ${addr.isDefault ? styles.default : ''}`}>
            <div className={styles.cardIcon}>
              <MapPin size={24} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.typeRow}>
                <h3>{addr.type}</h3>
                {addr.isDefault && <span className={styles.badge}>Principal</span>}
              </div>
              <p>{addr.street}, {addr.complement}</p>
              <p>{addr.neighborhood} - {addr.city}/{addr.state}</p>
              <p>{addr.zipCode}</p>
              
              <div className={styles.actions}>
                <button className={styles.btnEdit}><Edit2 size={16} /> Editar</button>
                {!addr.isDefault && (
                  <button className={styles.btnDelete}><Trash2 size={16} /> Excluir</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesPage;
