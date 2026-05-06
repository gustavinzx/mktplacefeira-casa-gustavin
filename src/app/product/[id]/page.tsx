'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { ShoppingCart, Heart, Share2, Leaf, ShieldCheck, Truck, Star } from 'lucide-react';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const product = {
    id: params.id,
    title: 'Tomate Grape Orgânico Premium',
    price: 12.90,
    unit: 'bandeja 250g',
    description: 'Tomates tipo grape cultivados sem agrotóxicos no Sítio Sol Nascente. Possuem sabor adocicado, baixa acidez e são colhidos no dia da entrega para garantir máxima frescura.',
    images: ['/images/tomato.png', '/images/tomato.png', '/images/tomato.png'],
    isOrganic: true,
    producer: {
      name: 'Sítio Sol Nascente',
      rating: 4.9,
      location: 'Mogi das Cruzes, SP',
      avatar: '/images/producer-avatar.png'
    },
    nutritionalInfo: [
      { label: 'Calorias', value: '18 kcal' },
      { label: 'Carboidratos', value: '3.9g' },
      { label: 'Fibras', value: '1.2g' },
      { label: 'Vitamina C', value: '13.7mg' },
    ]
  };

  const relatedProducts = [
    { id: '10', title: 'Manjericão Fresco', price: 3.50, unit: 'maço', imageUrl: '/images/lettuce.png', isOrganic: true, producerName: 'Horta da Vila' },
    { id: '11', title: 'Azeite de Oliva Extra Virgem', price: 45.00, unit: '500ml', imageUrl: '/images/apple.png', isOrganic: false, producerName: 'Empório Rural' },
    { id: '12', title: 'Queijo Minas Frescal', price: 22.00, unit: '500g', imageUrl: '/images/eggs.png', isOrganic: false, producerName: 'Laticínios Vale' },
  ];

  return (
    <div className="product-page">
      <Header />
      
      <main className="container">
        <div className="breadcrumb">Home / Frutas / Tomate Grape</div>

        <section className="product-main">
          <div className="product-gallery">
            <div className="main-image">
              <img src={product.images[activeImage]} alt={product.title} />
              {product.isOrganic && <span className="organic-seal"><Leaf size={16} /> Orgânico</span>}
            </div>
            <div className="thumbnails">
              {product.images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumb ${activeImage === idx ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          </div>

          <div className="product-details">
            <div className="header-info">
              <div className="producer-badge">
                <img src={product.producer.avatar} alt="" />
                <span>{product.producer.name}</span>
                <div className="rating"><Star size={12} fill="currentColor" /> {product.producer.rating}</div>
              </div>
              <h1>{product.title}</h1>
              <p className="price-tag">
                <span className="currency">R$</span>
                <span className="value">{product.price.toFixed(2)}</span>
                <span className="unit">/{product.unit}</span>
              </p>
            </div>

            <p className="description">{product.description}</p>

            <div className="purchase-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button className="add-to-cart-btn">
                <ShoppingCart size={20} /> Adicionar ao Carrinho
              </button>
              <button className="wishlist-btn">
                <Heart size={20} />
              </button>
            </div>

            <div className="benefits-grid">
              <div className="benefit">
                <ShieldCheck size={20} />
                <div>
                  <strong>Qualidade Garantida</strong>
                  <span>Colhido no dia</span>
                </div>
              </div>
              <div className="benefit">
                <Truck size={20} />
                <div>
                  <strong>Entrega Rápida</strong>
                  <span>Em até 24h</span>
                </div>
              </div>
            </div>

            <div className="nutritional-section">
              <h3>Informação Nutricional (por 100g)</h3>
              <div className="nutrition-grid">
                {product.nutritionalInfo.map(info => (
                  <div key={info.label} className="nutrition-item">
                    <span className="label">{info.label}</span>
                    <span className="value">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="related-section">
          <h2>Combina perfeitamente com</h2>
          <div className="related-grid">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .product-page {
          background: var(--bg-main);
          min-height: 100vh;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .breadcrumb {
          font-size: 13px;
          color: #888;
          margin-bottom: 24px;
        }
        .product-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 80px;
          background: white;
          padding: 40px;
          border-radius: 32px;
          box-shadow: var(--shadow-sm);
        }
        .product-gallery {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .main-image {
          position: relative;
          background: #f9f9f9;
          border-radius: 24px;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .main-image img {
          width: 80%;
          object-fit: contain;
        }
        .organic-seal {
          position: absolute;
          top: 20px;
          left: 20px;
          background: var(--leaf-green);
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .thumbnails {
          display: flex;
          gap: 12px;
        }
        .thumb {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          border: 2px solid transparent;
          cursor: pointer;
          overflow: hidden;
          background: #f9f9f9;
        }
        .thumb.active {
          border-color: var(--leaf-green);
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .producer-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .producer-badge img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .producer-badge span {
          font-weight: 600;
          color: #555;
        }
        .rating {
          background: #fff4e5;
          color: #904d00;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        h1 {
          font-size: 36px;
          color: var(--text-main);
          margin-bottom: 12px;
        }
        .price-tag {
          margin-bottom: 24px;
        }
        .currency {
          font-size: 18px;
          color: var(--market-orange);
          font-weight: 700;
        }
        .value {
          font-size: 40px;
          font-weight: 800;
          color: var(--text-main);
        }
        .unit {
          font-size: 18px;
          color: #666;
          font-weight: 500;
        }
        .description {
          font-size: 16px;
          line-height: 1.6;
          color: #555;
          margin-bottom: 32px;
        }
        .purchase-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 40px;
        }
        .quantity-selector {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          border-radius: 16px;
          padding: 8px;
        }
        .quantity-selector button {
          width: 40px;
          height: 40px;
          border: none;
          background: white;
          border-radius: 12px;
          font-size: 20px;
          font-weight: 600;
          cursor: pointer;
        }
        .quantity-selector span {
          width: 40px;
          text-align: center;
          font-weight: 700;
        }
        .add-to-cart-btn {
          flex: 1;
          background: var(--leaf-green);
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .add-to-cart-btn:hover {
          transform: scale(1.02);
        }
        .wishlist-btn {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          border: 1px solid #eee;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #999;
        }
        .benefits-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          border-top: 1px solid #eee;
          padding-top: 32px;
          margin-bottom: 32px;
        }
        .benefit {
          display: flex;
          gap: 12px;
          align-items: center;
          color: var(--leaf-green);
        }
        .benefit strong {
          display: block;
          color: var(--text-main);
          font-size: 14px;
        }
        .benefit span {
          color: #888;
          font-size: 12px;
        }
        .nutritional-section h3 {
          font-size: 16px;
          margin-bottom: 16px;
        }
        .nutrition-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .nutrition-item {
          background: #f9f9f9;
          padding: 12px;
          border-radius: 12px;
          text-align: center;
        }
        .nutrition-item .label {
          display: block;
          font-size: 11px;
          color: #888;
          margin-bottom: 4px;
        }
        .nutrition-item .value {
          font-weight: 700;
          color: var(--text-main);
          font-size: 14px;
        }
        .related-section h2 {
          font-size: 24px;
          margin-bottom: 32px;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 32px;
        }
        
        @media (max-width: 900px) {
          .product-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
