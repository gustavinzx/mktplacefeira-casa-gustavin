'use client';

import React, { useState } from 'react';
import { ShoppingCart, Leaf } from 'lucide-react';
import styles from './ProductCard.module.css';
import VendorSelectorModal from './VendorSelectorModal';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  unit: string;
  imageUrl: string;
  isOrganic?: boolean;
  producer?: string;
  tags?: string[];
}

export function ProductCard({ 
  id, 
  title, 
  price, 
  oldPrice, 
  unit, 
  imageUrl, 
  isOrganic, 
  producer,
  tags 
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock vendors for demonstration
  const vendors = [
    { id: 'v1', name: producer || 'Barraca do Zé', rating: 4.9, price: price, fair: 'Feira da Vila Mariana', stock: 'Disponível' },
    { id: 'v2', name: 'Horta da Maria', rating: 4.7, price: price * 1.1, fair: 'Feira de Pinheiros', stock: 'Poucas unidades' },
    { id: 'v3', name: 'Sítio Novo Sol', rating: 4.8, price: price * 0.95, fair: 'Feira do Sumaré', stock: 'Disponível' }
  ];

  return (
    <>
      <div className={styles.productCard}>
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={title} className={styles.image} />
          {isOrganic && (
            <span className={styles.organicBadge}>
              <Leaf size={12} /> Orgânico
            </span>
          )}
          {tags && tags.length > 0 && (
            <span className={styles.tag}>{tags[0]}</span>
          )}
        </div>
        
        <div className={styles.info}>
          <p className={styles.producer}>{producer || 'Produtor Local'}</p>
          <h3 className={styles.title}>{title}</h3>
          
          <div className={styles.priceRow}>
            <div className={styles.priceContainer}>
              <span className={styles.unit}>por {unit}</span>
              <div className={styles.priceValue}>
                <span>R$</span> {price.toFixed(2)}
              </div>
            </div>
            <button 
              className={styles.btnAdd} 
              onClick={() => setIsModalOpen(true)}
              aria-label="Adicionar ao carrinho"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>

      <VendorSelectorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={title}
        unit={unit}
        vendors={vendors}
      />
    </>
  );
}

export default ProductCard;
