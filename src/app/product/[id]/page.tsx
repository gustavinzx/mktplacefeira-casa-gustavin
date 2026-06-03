'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { ShoppingCart, Heart, Leaf, ShieldCheck, Truck, Star, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  price: number;
  unit: string;
  description: string;
  image_url: string;
  is_organic: boolean;
  stock: number;
  producer?: {
    id?: string;
    stall_name: string;
    rating: number;
  };
  category?: {
    name: string;
    slug: string;
  };
}

import { useCartStore } from '@/store/useCartStore';

export default function ProductDetailsPage({ params }: { params: any }) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const addStoreItem = useCartStore(state => state.addItem);

  useEffect(() => {
    Promise.resolve(params).then(async (p) => {
      const id = p.id;
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
        } else {
          setError('Produto não encontrado.');
        }
      } catch {
        setError('Erro ao carregar produto.');
      } finally {
        setLoading(false);
      }
    });
  }, [params]);

  const addToCart = () => {
    if (!product) return;
    
    addStoreItem({
      id: product.id,
      title: product.title,
      price: product.price,
      unit: product.unit,
      quantity: quantity,
      imageUrl: product.image_url || '/images/tomato.png',
      producer: product.producer?.stall_name || 'Produtor Local',
      producer_id: (product as any).producer_id || product.producer?.id,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedProducts = [
    { id: '10', title: 'Manjericão Fresco', price: 3.50, unit: 'maço', imageUrl: '/images/prod_manjericao.png', isOrganic: true, producerName: 'Horta da Vila' },
    { id: '11', title: 'Azeite de Oliva Extra Virgem', price: 45.00, unit: '500ml', imageUrl: '/images/prod_azeite.png', isOrganic: false, producerName: 'Empório Rural' },
    { id: '12', title: 'Queijo Minas Frescal', price: 22.00, unit: '500g', imageUrl: '/images/prod_queijo.png', isOrganic: false, producerName: 'Laticínios Vale' },
  ];

  if (loading) {
    return (
      <div className="product-page">
        <Header />
        <main className="container" style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
          <Loader2 size={40} className="animate-spin" color="#0e6b17" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page">
        <Header />
        <main className="container" style={{ textAlign: 'center', padding: '120px 0' }}>
          <p style={{ fontSize: '20px', color: '#888' }}>{error || 'Produto não encontrado.'}</p>
          <button onClick={() => router.push('/')} style={{ marginTop: '24px', background: '#0e6b17', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>
            Voltar para a feira
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const images = [product.image_url || '/images/tomato.png'];

  return (
    <div className="product-page">
      <Header />
      
      <main className="container">
        <div className="breadcrumb">
          Home / {product.category?.name || 'Produtos'} / {product.title}
        </div>

        <section className="product-main">
          <div className="product-gallery">
            <div className="main-image">
              <img 
                src={images[activeImage]} 
                alt={product.title} 
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/tomato.png'; }}
              />
              {product.is_organic && (
                <span className="organic-seal"><Leaf size={16} /> Orgânico</span>
              )}
            </div>
            <div className="thumbnails">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumb ${activeImage === idx ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img 
                    src={img} 
                    alt="" 
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/tomato.png'; }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="product-details">
            <div className="header-info">
              <div className="producer-badge">
                <span>{product.producer?.stall_name || 'Produtor Local'}</span>
                {product.producer?.rating && (
                  <div className="rating">
                    <Star size={12} fill="currentColor" /> {product.producer.rating}
                  </div>
                )}
              </div>
              <h1>{product.title}</h1>
              <p className="price-tag">
                <span className="currency">R$</span>
                <span className="value">{Number(product.price || 0).toFixed(2)}</span>
                <span className="unit">/{product.unit}</span>
              </p>
            </div>

            <p className="description">{product.description}</p>

            {product.stock <= 0 && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 600 }}>
                Produto sem estoque no momento
              </div>
            )}

            <div className="purchase-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
              <button
                className={`add-to-cart-btn ${added ? 'added' : ''}`}
                onClick={addToCart}
                disabled={product.stock <= 0}
                style={{
                  flex: 1,
                  background: added ? '#1e8e3e' : '#0e6b17',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                  padding: '0 24px',
                  opacity: product.stock <= 0 ? 0.5 : 1,
                }}
              >
                {added ? (
                  <><CheckCircle size={20} /> Adicionado!</>
                ) : (
                  <><ShoppingCart size={20} /> Adicionar ao Carrinho</>
                )}
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
        .product-page { background: var(--bg-main); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .breadcrumb { font-size: 13px; color: #888; margin-bottom: 24px; }
        .product-main { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 80px; background: white; padding: 40px; border-radius: 32px; box-shadow: var(--shadow-sm); }
        .product-gallery { display: flex; flex-direction: column; gap: 20px; }
        .main-image { position: relative; background: #f9f9f9; border-radius: 24px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .main-image img { width: 80%; object-fit: contain; }
        .organic-seal { position: absolute; top: 20px; left: 20px; background: var(--leaf-green); color: white; padding: 8px 16px; border-radius: 12px; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .thumbnails { display: flex; gap: 12px; }
        .thumb { width: 80px; height: 80px; border-radius: 12px; border: 2px solid transparent; cursor: pointer; overflow: hidden; background: #f9f9f9; }
        .thumb.active { border-color: var(--leaf-green); }
        .thumb img { width: 100%; height: 100%; object-fit: cover; }
        .producer-badge { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .producer-badge span { font-weight: 600; color: #555; }
        .rating { background: #fff4e5; color: #904d00; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
        h1 { font-size: 36px; color: var(--text-main); margin-bottom: 12px; }
        .price-tag { margin-bottom: 24px; }
        .currency { font-size: 18px; color: var(--market-orange); font-weight: 700; }
        .value { font-size: 40px; font-weight: 800; color: var(--text-main); }
        .unit { font-size: 18px; color: #666; font-weight: 500; }
        .description { font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 32px; }
        .purchase-actions { display: flex; gap: 16px; margin-bottom: 40px; }
        .quantity-selector { display: flex; align-items: center; background: #f5f5f5; border-radius: 16px; padding: 8px; }
        .quantity-selector button { width: 40px; height: 40px; border: none; background: white; border-radius: 12px; font-size: 20px; font-weight: 600; cursor: pointer; }
        .quantity-selector span { width: 40px; text-align: center; font-weight: 700; }
        .wishlist-btn { width: 56px; height: 56px; border-radius: 16px; border: 1px solid #eee; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #999; }
        .benefits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #eee; padding-top: 32px; margin-bottom: 32px; }
        .benefit { display: flex; gap: 12px; align-items: center; color: var(--leaf-green); }
        .benefit strong { display: block; color: var(--text-main); font-size: 14px; }
        .benefit span { color: #888; font-size: 12px; }
        .related-section h2 { font-size: 24px; margin-bottom: 32px; }
        .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 32px; }
        @media (max-width: 900px) { .product-main { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
