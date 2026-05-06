'use client';

import React, { useState } from 'react';
import styles from './VendorSelectorModal.module.css';
import { X, Star, ShoppingCart, Store, ChevronRight } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  rating: number;
  price: number;
  fair: string;
  stock: string;
}

interface VendorSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  unit: string;
  vendors: Vendor[];
}

const VendorSelectorModal: React.FC<VendorSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  productName, 
  unit,
  vendors 
}) => {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <span className={styles.label}>Escolha o feirante para:</span>
            <h2>{productName}</h2>
          </div>
          <button className={styles.btnClose} onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className={styles.content}>
          <p className={styles.infoText}>
            Este produto está disponível em {vendors.length} bancas diferentes hoje. 
            Escolha a sua preferida:
          </p>

          <div className={styles.vendorList}>
            {vendors.map(vendor => (
              <div 
                key={vendor.id} 
                className={`${styles.vendorCard} ${selectedVendor === vendor.id ? styles.selected : ''}`}
                onClick={() => setSelectedVendor(vendor.id)}
              >
                <div className={styles.vendorInfo}>
                  <div className={styles.avatar}>
                    <Store size={20} />
                  </div>
                  <div>
                    <div className={styles.nameRow}>
                      <h4>{vendor.name}</h4>
                      <div className={styles.rating}>
                        <Star size={12} fill="#fbbc04" stroke="none" />
                        <span>{vendor.rating}</span>
                      </div>
                    </div>
                    <p className={styles.fairName}>{vendor.fair}</p>
                  </div>
                </div>
                
                <div className={styles.priceRow}>
                  <div className={styles.priceCol}>
                    <span className={styles.priceLabel}>Preço por {unit}</span>
                    <strong className={styles.price}>R$ {vendor.price.toFixed(2)}</strong>
                  </div>
                  <div className={styles.check}>
                    <div className={styles.radio}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.quantityControl}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          
          <button 
            className={styles.btnAdd} 
            disabled={!selectedVendor}
            onClick={() => {
              // Lógica de adicionar ao carrinho aqui
              onClose();
            }}
          >
            <ShoppingCart size={18} />
            {selectedVendor ? 'Adicionar à Cesta' : 'Selecione um feirante'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default VendorSelectorModal;
