'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './VendorSelectorModal.module.css';
import { X, Star, ShoppingCart, Store, Leaf, Clock, MapPin } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/components/Toast';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div style={{width: '100%', height: '100%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px'}}>Carregando mapa...</div>
});

interface VendorTag {
  label: string;
  icon: 'leaf' | 'clock';
}

interface Vendor {
  id: string;
  name: string;
  rating: number;
  price: number;
  unit: string;
  fair: string;
  stock: string;
  lat?: number;
  lng?: number;
  tags?: VendorTag[];
}

interface VendorSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productDescription?: string;
  productImage?: string;
  vendors: Vendor[];
  isDirectVendor?: boolean;
  preSelectedVendorId?: string;
}

const VendorSelectorModal: React.FC<VendorSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  productId,
  productName, 
  productDescription,
  productImage,
  vendors,
  isDirectVendor = false,
  preSelectedVendorId
}) => {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (isDirectVendor && preSelectedVendorId) {
        setSelectedVendor(preSelectedVendorId);
      } else if (vendors.length > 0 && !selectedVendor) {
        setSelectedVendor(vendors[0].id);
      }
      setQuantity(1);
    }
  }, [isOpen, isDirectVendor, preSelectedVendorId, vendors, selectedVendor]);

  if (!isOpen) return null;

  const activeVendor = vendors.find(v => v.id === selectedVendor);

  const renderIcon = (iconName: string) => {
    switch(iconName) {
      case 'leaf': return <Leaf size={14} />;
      case 'clock': return <Clock size={14} />;
      default: return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Left Side: Large Image */}
        <div className={styles.imagePane}>
          {productImage ? (
             <img src={productImage} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
             <div className={styles.noImagePlaceholder}>Sem imagem</div>
          )}
        </div>

        {/* Right Side: Info & Actions */}
        <div className={styles.infoPane}>
          <header className={styles.header}>
            <button className={styles.btnClose} onClick={onClose} aria-label="Fechar">
              <X size={24} />
            </button>
          </header>

          <div className={styles.infoScrollArea}>
            <h2 className={styles.productTitle}>{productName}</h2>
            {productDescription && <p className={styles.description}>{productDescription}</p>}

            {!isDirectVendor ? (
              <>
                <h3 className={styles.sectionSubtitle}>Opções de feirantes</h3>
                <div className={styles.vendorList}>
                  {vendors.map(vendor => (
                    <div 
                      key={vendor.id} 
                      className={`${styles.vendorCard} ${selectedVendor === vendor.id ? styles.selected : ''}`}
                      onClick={() => setSelectedVendor(vendor.id)}
                    >
                      <div className={styles.vendorInfo}>
                        <div className={styles.nameRow}>
                          <Store size={16} className={styles.vendorIcon} />
                          <h4>{vendor.name}</h4>
                          <div className={styles.rating}>
                            <Star size={12} fill="#fbbc04" stroke="none" />
                            <span>{vendor.rating}</span>
                          </div>
                        </div>
                        <p className={styles.fairName}>{vendor.fair}</p>
                        
                        {vendor.tags && vendor.tags.length > 0 && (
                          <div className={styles.tagsContainer}>
                            {vendor.tags.map((tag, idx) => (
                              <span key={idx} className={styles.tagBadge}>
                                {renderIcon(tag.icon)} {tag.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.priceCol}>
                        <strong className={styles.price}>R$ {vendor.price.toFixed(2)}</strong>
                        <span className={styles.priceLabel}>/ {vendor.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Direct Vendor Mode
              activeVendor && (
                <div className={styles.directVendorBox}>
                  <div className={styles.directVendorHeader}>
                    <Store size={20} className={styles.vendorIcon} />
                    <span>Vendido por <strong>{activeVendor.name}</strong></span>
                  </div>
                  <div className={styles.directPriceRow}>
                     <strong className={styles.largePrice}>R$ {activeVendor.price.toFixed(2)}</strong>
                     <span className={styles.largePriceUnit}>/ {activeVendor.unit}</span>
                  </div>
                  {activeVendor.tags && activeVendor.tags.length > 0 && (
                    <div className={styles.tagsContainer}>
                      {activeVendor.tags.map((tag, idx) => (
                        <span key={idx} className={styles.tagBadge}>
                          {renderIcon(tag.icon)} {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {/* Map Area */}
            {activeVendor && activeVendor.lat && activeVendor.lng && (
              <div className={styles.mapSection}>
                <div className={styles.mapHeader}>
                  <MapPin size={16} /> Localização da Banca
                </div>
                <div className={styles.mapContainer}>
                  <Map lat={activeVendor.lat} lng={activeVendor.lng} vendorName={activeVendor.name} />
                </div>
              </div>
            )}
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
                // Add to cart logic
                if (activeVendor) {
                  useCartStore.getState().addItem({
                    id: productId, // Usa o ID real do produto!
                    title: productName,
                    price: activeVendor.price,
                    unit: activeVendor.unit,
                    quantity: quantity,
                    imageUrl: productImage || '/images/placeholder.png',
                    producer: activeVendor.name
                  });
                  showToast('Item adicionado ao carrinho com sucesso!', 'success');
                }
                onClose();
              }}
            >
              <ShoppingCart size={18} />
              Comprar
            </button>
          </footer>
        </div>

      </div>
    </div>
  );
};

export default VendorSelectorModal;
