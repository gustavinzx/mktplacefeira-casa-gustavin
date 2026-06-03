'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Heart, Share2, Leaf, ShieldCheck, Truck, Star, CheckCircle, AlertCircle, Copy, Link } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, getTableName } from '@/lib/supabase';
import { useCartStore } from '@/store/useCartStore';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  image_url: string | null;
  images?: string[];
  is_organic?: boolean;
  stock?: number;
  vendor_id?: string;
  vendor_name?: string;
  vendor_rating?: number;
  vendor_location?: string;
  vendor_avatar?: string;
  category?: string;
}

interface RelatedProduct {
  id: string;
  title: string;
  price: number;
  unit: string;
  imageUrl: string;
  isOrganic?: boolean;
  producer?: string;
}

interface ProductPageClientProps {
  id: string;
}

// ─── Toast Component ─────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

function Toast({ message, type, visible }: ToastProps) {
  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Copy size={18} />,
  };
  const colors = {
    success: '#2e7d32',
    error: '#c62828',
    info: '#1565c0',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        background: colors[type],
        color: 'white',
        padding: '14px 22px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: 600,
        fontSize: '15px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        zIndex: 9999,
        transform: visible ? 'translateY(0)' : 'translateY(120px)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'none',
      }}
    >
      {icons[type]}
      {message}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="product-page">
      <Header />
      <main className="container">
        <div className="breadcrumb skeleton-bar" style={{ width: 200, height: 16, borderRadius: 8 }} />
        <section className="product-main">
          <div className="product-gallery">
            <div className="main-image skeleton-pulse" style={{ borderRadius: 24, aspectRatio: '1', background: '#eee' }} />
            <div style={{ display: 'flex', gap: 12 }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="skeleton-pulse" style={{ width: 80, height: 80, borderRadius: 12, background: '#eee' }} />
              ))}
            </div>
          </div>
          <div className="product-details" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="skeleton-pulse" style={{ width: 160, height: 20, borderRadius: 8, background: '#eee' }} />
            <div className="skeleton-pulse" style={{ width: '80%', height: 36, borderRadius: 8, background: '#eee' }} />
            <div className="skeleton-pulse" style={{ width: 120, height: 48, borderRadius: 8, background: '#eee' }} />
            <div className="skeleton-pulse" style={{ width: '100%', height: 72, borderRadius: 8, background: '#eee' }} />
            <div className="skeleton-pulse" style={{ width: '100%', height: 56, borderRadius: 16, background: '#eee' }} />
          </div>
        </section>
      </main>
      <Footer />
      <style jsx>{`
        .product-page { background: var(--bg-main); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .breadcrumb { margin-bottom: 24px; }
        .product-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          background: white;
          padding: 40px;
          border-radius: 32px;
          box-shadow: var(--shadow-sm);
        }
        .main-image { width: 100%; }
        @keyframes shimmer {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        .skeleton-pulse { animation: shimmer 1.5s ease-in-out infinite; }
        @media (max-width: 900px) {
          .product-main { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ProductNotFound() {
  return (
    <div className="product-page">
      <Header />
      <main className="container">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🥬</div>
          <h1 style={{ fontSize: 28, color: 'var(--text-main)', marginBottom: 12 }}>Produto não encontrado</h1>
          <p style={{ color: '#888', marginBottom: 32 }}>
            Este produto não está disponível ou foi removido da feira.
          </p>
          <a
            href="/"
            style={{
              background: 'var(--leaf-green)',
              color: 'white',
              padding: '14px 32px',
              borderRadius: 16,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Voltar à feira
          </a>
        </div>
      </main>
      <Footer />
      <style jsx>{`
        .product-page { background: var(--bg-main); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductPageClient({ id }: ProductPageClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState<ToastProps>({ message: '', type: 'success', visible: false });

  const addItem = useCartStore((s) => s.addItem);

  // ── Show toast helper ────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: ToastProps['type'] = 'success') => {
    setToast({ message, type, visible: true });
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // ── Fetch product from Supabase ──────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from(getTableName('products'))
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProduct(data as Product);

      // Fetch related products from same vendor
      if (data.vendor_id) {
        const { data: related } = await supabase
          .from(getTableName('products'))
          .select('id, name, price, unit, image_url, is_organic, vendor_name')
          .eq('vendor_id', data.vendor_id)
          .neq('id', id)
          .limit(4);

        if (related && related.length > 0) {
          setRelatedProducts(
            related.map((p: any) => ({
              id: p.id,
              title: p.name,
              price: p.price,
              unit: p.unit,
              imageUrl: p.image_url || '',
              isOrganic: p.is_organic,
              producer: p.vendor_name,
            }))
          );
        }
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  // ── Add to cart ──────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      title: product.name,
      price: product.price,
      unit: product.unit,
      quantity,
      imageUrl: product.image_url || '',
      producer: product.vendor_name || 'Produtor Local',
      producer_id: product.vendor_id,
      stock: product.stock,
    });

    showToast(`${quantity}x ${product.name} adicionado ao carrinho!`, 'success');
  };

  // ── Toggle favorite ──────────────────────────────────────────────────────
  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    showToast(
      next ? 'Adicionado aos favoritos ❤️' : 'Removido dos favoritos',
      next ? 'success' : 'info'
    );
  };

  // ── Share ────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const shareData = {
      title: product?.name ?? 'Produto na Feira.Casa',
      text: `Confira ${product?.name ?? 'este produto'} na Feira.Casa!`,
      url: window.location.href,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copiado para a área de transferência!', 'info');
      } catch {
        showToast('Não foi possível copiar o link.', 'error');
      }
    }
  };

  // ── Quantity bounds ──────────────────────────────────────────────────────
  const maxQty = product?.stock ?? 99;
  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => Math.min(maxQty, q + 1));

  // ── Derived image list ───────────────────────────────────────────────────
  const images: string[] =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image_url
      ? [product.image_url]
      : ['/images/placeholder.png'];

  // ── Breadcrumb ───────────────────────────────────────────────────────────
  const breadcrumb = product
    ? `Home / ${product.category ?? 'Produtos'} / ${product.name}`
    : 'Home';

  // ── Early returns ────────────────────────────────────────────────────────
  if (loading) return <ProductSkeleton />;
  if (notFound || !product) return <ProductNotFound />;

  return (
    <div className="product-page">
      <Header />

      <main className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Navegação estrutural">
          {breadcrumb}
        </nav>

        {/* Product main section */}
        <section className="product-main">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img src={images[activeImage]} alt={product.name} />
              {product.is_organic && (
                <span className="organic-seal">
                  <Leaf size={16} /> Orgânico
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumb ${activeImage === idx ? 'active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveImage(idx)}
                    aria-label={`Ver imagem ${idx + 1}`}
                  >
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="product-details">
            <div className="header-info">
              {/* Producer badge */}
              <div className="producer-badge">
                {product.vendor_avatar && (
                  <img src={product.vendor_avatar} alt={product.vendor_name} />
                )}
                <span>{product.vendor_name ?? 'Produtor Local'}</span>
                {product.vendor_rating !== undefined && (
                  <div className="rating">
                    <Star size={12} fill="currentColor" /> {product.vendor_rating.toFixed(1)}
                  </div>
                )}
                {product.vendor_location && (
                  <span className="location">{product.vendor_location}</span>
                )}
              </div>

              <h1>{product.name}</h1>

              <p className="price-tag">
                <span className="currency">R$</span>
                <span className="value">{product.price.toFixed(2).replace('.', ',')}</span>
                <span className="unit">/{product.unit}</span>
              </p>
            </div>

            <p className="description">{product.description}</p>

            {/* Stock indicator */}
            {product.stock !== undefined && product.stock !== null && (
              <p className="stock-info">
                {product.stock > 10
                  ? `✅ Em estoque (${product.stock} disponíveis)`
                  : product.stock > 0
                  ? `⚠️ Últimas unidades (${product.stock} restantes)`
                  : '❌ Sem estoque'}
              </p>
            )}

            {/* Purchase actions */}
            <div className="purchase-actions">
              <div className="quantity-selector" role="group" aria-label="Quantidade">
                <button
                  id="qty-decrement"
                  onClick={handleDecrement}
                  aria-label="Diminuir quantidade"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  id="qty-increment"
                  onClick={handleIncrement}
                  aria-label="Aumentar quantidade"
                  disabled={quantity >= maxQty}
                >
                  +
                </button>
              </div>

              <button
                id="add-to-cart-btn"
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                aria-label={`Adicionar ${quantity} ${product.name} ao carrinho`}
              >
                <ShoppingCart size={20} />
                {product.stock === 0 ? 'Sem Estoque' : 'Adicionar ao Carrinho'}
              </button>

              <button
                id="wishlist-btn"
                className={`wishlist-btn ${isFavorite ? 'is-favorite' : ''}`}
                onClick={handleToggleFavorite}
                aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>

              <button
                id="share-btn"
                className="share-btn"
                onClick={handleShare}
                aria-label="Compartilhar produto"
                title="Compartilhar"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Benefits */}
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

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="related-section">
            <h2>Mais do mesmo produtor</h2>
            <div className="related-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Toast notification */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

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
          user-select: none;
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
          transition: transform 0.3s ease;
        }
        .main-image:hover img {
          transform: scale(1.04);
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
          transition: border-color 0.2s, transform 0.2s;
        }
        .thumb:hover {
          transform: scale(1.05);
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
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .producer-badge img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
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
        .location {
          font-size: 12px;
          color: #aaa;
          font-weight: 400 !important;
        }
        h1 {
          font-size: 34px;
          color: var(--text-main);
          margin-bottom: 12px;
          line-height: 1.2;
        }
        .price-tag {
          margin-bottom: 20px;
          display: flex;
          align-items: baseline;
          gap: 4px;
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
          line-height: 1.7;
          color: #555;
          margin-bottom: 20px;
        }
        .stock-info {
          font-size: 13px;
          color: #555;
          margin-bottom: 24px;
          font-weight: 500;
        }
        .purchase-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 36px;
          flex-wrap: wrap;
          align-items: stretch;
        }
        .quantity-selector {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          border-radius: 16px;
          padding: 6px;
          gap: 4px;
        }
        .quantity-selector button {
          width: 40px;
          height: 40px;
          border: none;
          background: white;
          border-radius: 12px;
          font-size: 22px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .quantity-selector button:hover:not(:disabled) {
          background: var(--leaf-green);
          color: white;
          transform: scale(1.05);
        }
        .quantity-selector button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .quantity-selector span {
          width: 40px;
          text-align: center;
          font-weight: 700;
          font-size: 16px;
        }
        .add-to-cart-btn {
          flex: 1;
          min-width: 180px;
          background: var(--leaf-green);
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          padding: 0 20px;
          min-height: 52px;
        }
        .add-to-cart-btn:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(0, 150, 50, 0.25);
        }
        .add-to-cart-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .add-to-cart-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .wishlist-btn {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          border: 2px solid #eee;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #ccc;
          transition: color 0.2s, border-color 0.2s, transform 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .wishlist-btn:hover {
          border-color: #e91e63;
          color: #e91e63;
          transform: scale(1.07);
        }
        .wishlist-btn.is-favorite {
          background: #fce4ec;
          border-color: #e91e63;
          color: #e91e63;
        }
        .share-btn {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          border: 2px solid #eee;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #999;
          transition: color 0.2s, border-color 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .share-btn:hover {
          border-color: var(--leaf-green);
          color: var(--leaf-green);
          transform: scale(1.07);
        }
        .benefits-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          border-top: 1px solid #eee;
          padding-top: 28px;
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
        .related-section h2 {
          font-size: 24px;
          margin-bottom: 32px;
          color: var(--text-main);
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 28px;
        }
        @media (max-width: 900px) {
          .product-main {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 24px;
          }
          h1 {
            font-size: 26px;
          }
          .value {
            font-size: 32px;
          }
          .purchase-actions {
            flex-wrap: wrap;
          }
          .add-to-cart-btn {
            min-width: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
