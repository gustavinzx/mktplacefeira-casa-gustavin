'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Leaf, Heart } from 'lucide-react';
import Link from 'next/link';
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
  producerName?: string;
  tags?: string[];
}

const FAVORITES_KEY = 'fc_favorites';

function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
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
  producerName,
  tags 
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayProducer = producer || producerName || 'Produtor Local';
  const validPrice = typeof price === 'number' ? price : 0;
  const discountPct = oldPrice && oldPrice > validPrice
    ? Math.round(((oldPrice - validPrice) / oldPrice) * 100)
    : null;

  // Carrega favoritos do localStorage na montagem
  useEffect(() => {
    setIsFavorite(getFavorites().includes(id));
  }, [id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favs = getFavorites();
    const next = favs.includes(id)
      ? favs.filter(f => f !== id)
      : [...favs, id];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    setIsFavorite(!isFavorite);
  };

  const vendors = [
    { 
      id: 'v1', 
      name: displayProducer, 
      rating: 4.9, 
      price: validPrice, 
      unit,
      fair: 'Feira.Casa', 
      stock: 'Disponível', 
      lat: -15.7801, 
      lng: -47.9292,
      tags: isOrganic ? [{ label: 'Orgânico', icon: 'leaf' as const }] : []
    }
  ];

  return (
    <>
      <div className={styles.productCard}>
        {/* Imagem — clicável para o produto */}
        <Link href={`/product/${id}`} className={styles.imageContainer} tabIndex={-1} aria-hidden="true">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={title}
              className={styles.image}
              onError={() => setImageError(true)}
            />
          ) : (
            <div style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #e8f5e2 0%, #c8e6c0 100%)',
              fontSize: '40px',
            }}>
              🥬
            </div>
          )}

          {/* Badge orgânico */}
          {isOrganic && (
            <span className={styles.organicBadge}>
              <Leaf size={12} /> Orgânico
            </span>
          )}

          {/* Badge de desconto */}
          {discountPct && discountPct > 0 && (
            <span style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: '#ef4444',
              color: 'white',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '999px',
              letterSpacing: '0.02em',
            }}>
              -{discountPct}%
            </span>
          )}

          {/* Tag personalizada */}
          {!discountPct && tags && tags.length > 0 && (
            <span className={styles.tag}>{tags[0]}</span>
          )}

          {/* Botão favorito */}
          <button 
            className={`${styles.favoriteBtn} ${isFavorite ? styles.isFavorite : ''}`}
            onClick={toggleFavorite}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              size={18}
              fill={isFavorite ? 'currentColor' : 'none'}
              className={isFavorite ? styles.heartFilled : ''}
            />
          </button>
        </Link>
        
        <div className={styles.info}>
          <p className={styles.producer}>{displayProducer}</p>
          <Link href={`/product/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className={styles.title}>{title}</h3>
          </Link>
          
          <div className={styles.priceRow}>
            <div className={styles.priceContainer}>
              <span className={styles.unit}>por {unit}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                {oldPrice && oldPrice > validPrice && (
                  <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through', fontWeight: 500 }}>
                    R$ {oldPrice.toFixed(2)}
                  </span>
                )}
                <div className={styles.priceValue}>
                  <span>R$</span> {validPrice.toFixed(2)}
                </div>
              </div>
            </div>
            <button 
              className={styles.btnAdd} 
              onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}
              aria-label={`Adicionar ${title} ao carrinho`}
            >
              <ShoppingCart size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <VendorSelectorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={id}
        productName={title}
        productImage={imageUrl}
        productDescription={`${title} fresquinho, selecionado com carinho pelos nossos produtores locais.`}
        vendors={vendors}
        isDirectVendor={true}
        preSelectedVendorId="v1"
      />
    </>
  );
}

export default ProductCard;
