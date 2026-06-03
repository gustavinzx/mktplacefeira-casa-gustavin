'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Truck, FileText, Search, Filter, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

export default function ChefB2BPurchasePage() {
  const categories = ['Hortifrúti Atacado', 'Proteínas', 'Grãos e Sacas', 'Temperos Profissionais'];
  
  const [activeCategory, setActiveCategory] = React.useState('Hortifrúti Atacado');
  const [b2bProducts, setB2bProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.products) {
          setB2bProducts(data.data.products.map((p: any) => ({
            id: p.id,
            title: p.title,
            price: Number(p.wholesale_price || p.price),
            originalPrice: Number(p.price),
            unit: p.unit,
            isWholesale: !!p.is_wholesale,
            isPromotion: !!p.is_promotion,
            imageUrl: p.image_url || '/images/tomato.png',
            producerName: p.producer?.stall_name || 'Banca Local',
            isOrganic: !!p.is_organic,
          })));
        }
      })
      .catch(console.error);
  }, []);

  const categoriesList = categories;
  
  const filteredProducts = b2bProducts.filter(p => {
    if (activeCategory === 'Hortifrúti Atacado') return true;
    if (activeCategory === 'Proteínas') return p.title.toLowerCase().match(/ovo|queijo|carne|frango|peixe/);
    if (activeCategory === 'Grãos e Sacas') return p.title.toLowerCase().match(/saca|grão|feijão|arroz|milho|soja/);
    if (activeCategory === 'Temperos Profissionais') return p.title.toLowerCase().match(/tempero|alho|cebola|pimenta|salsa|coentro/);
    return true; 
  });

  let featuredProducts = b2bProducts.filter(p => p.isWholesale || p.isPromotion).slice(0, 5);

  return (
    <div className="b2b-portal">
      <header className="b2b-header">
        <div>
          <h1>Portal de Compras B2B</h1>
          <p>Insumos direto da feira para o seu restaurante</p>
        </div>
        <div className="b2b-stats">
          <div className="stat">
            <Truck size={20} />
            <span>Frete Grátis acima de R$ 500</span>
          </div>
          <div className="stat">
            <FileText size={20} />
            <span>Faturamento 15/30 dias</span>
          </div>
        </div>
      </header>

      <div className="b2b-search-bar">
        <div className="search-input">
          <Search size={20} />
          <input type="text" placeholder="Buscar insumos por saca, caixa ou fardo..." />
        </div>
        <button className="filter-btn"><Filter size={20} /> Filtros</button>
      </div>

      <nav className="b2b-nav">
        {categoriesList.map(cat => (
          <button 
            key={cat} 
            className={cat === activeCategory ? 'active' : ''}
            onClick={() => setActiveCategory(cat as string)}
          >
            {cat}
          </button>
        ))}
      </nav>

      {featuredProducts.length > 0 && (
        <section className="b2b-hero-grid">
          <div 
            className="main-offer-banner"
            style={{ backgroundImage: `url(${featuredProducts[0].imageUrl})` }}
          >
            <div className="banner-overlay"></div>
            <div className="banner-text">
              <span className="badge">
                {featuredProducts[0].isWholesale ? 'OFERTA B2B' : featuredProducts[0].isPromotion ? 'OFERTA DA SEMANA' : 'DESTAQUE'}
              </span>
              <h2>{featuredProducts[0].title}</h2>
              <p>Condições exclusivas para faturamentos acima de R$ 5.000,00.</p>
              <Link href={`/product/${featuredProducts[0].id}`} passHref>
                <button className="btn-explore">Explorar Ofertas</button>
              </Link>
            </div>
          </div>
          <div className="info-card-side">
            <h3>Pedido Mínimo</h3>
            <p>Aproveite frete grátis para sua região em pedidos acima de R$ 1.200,00.</p>
            <div className="info-card-bottom">
              <div>
                <span style={{ fontSize: 10, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>Próxima Saída</span>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Amanhã, 04:00</div>
              </div>
              <Truck size={24} />
            </div>
          </div>
        </section>
      )}

      <section className="b2b-grid">
        <div className="section-header">
          <h2>Mais Vendidos no Atacado</h2>
          <button>Ver tudo</button>
        </div>
        <div className="products-grid">
          {filteredProducts.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
          {filteredProducts.length === 0 && (
            <p style={{ color: '#666', gridColumn: '1 / -1', padding: '20px 0' }}>
              Nenhum produto encontrado nesta categoria no momento.
            </p>
          )}
        </div>
      </section>

      <style jsx>{`
        .b2b-portal {
          padding: 20px;
          background: #fdfdfd;
          min-height: 100vh;
        }
        .b2b-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        h1 {
          font-size: 28px;
          color: #231a11;
          margin-bottom: 4px;
        }
        .b2b-header p {
          color: #666;
        }
        .b2b-stats {
          display: flex;
          gap: 24px;
        }
        .stat {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #eef7f2;
          color: #0b612e;
          padding: 12px 20px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 700;
        }
        .b2b-search-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }
        .search-input {
          flex: 1;
          background: white;
          border: 2px solid #eee;
          border-radius: 20px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 12px;
          color: #999;
        }
        .search-input input {
          width: 100%;
          border: none;
          padding: 18px 0;
          font-size: 16px;
          outline: none;
          color: #333;
        }
        .filter-btn {
          background: white;
          color: #333;
          border: 2px solid #eee;
          border-radius: 20px;
          padding: 0 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .b2b-nav {
          display: flex;
          gap: 12px;
          margin-bottom: 40px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .b2b-nav button {
          white-space: nowrap;
          background: white;
          border: 1px solid #eee;
          padding: 10px 20px;
          border-radius: 100px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
        }
        .b2b-nav button.active {
          background: #0b612e;
          color: white;
          border-color: #0b612e;
        }
        .b2b-hero-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }
        .main-offer-banner {
          border-radius: 24px;
          color: white;
          position: relative;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          min-height: 340px;
          display: flex;
          align-items: center;
        }
        .banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0) 100%);
          z-index: 1;
        }
        .banner-text {
          position: relative;
          z-index: 2;
          padding: 40px 60px;
          max-width: 80%;
        }
        .banner-text h2 {
          font-size: 38px;
          line-height: 1.1;
          margin: 16px 0;
          color: #ffffff;
        }
        .banner-text p {
          font-size: 16px;
          opacity: 0.9;
          margin-bottom: 24px;
          color: #ffffff;
        }
        .btn-explore {
          background: #0b612e;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 100px;
          font-weight: 700;
          cursor: pointer;
        }
        .info-card-side {
          background: #2b7a4b;
          border-radius: 24px;
          padding: 40px 32px;
          color: white;
          display: flex;
          flex-direction: column;
        }
        .info-card-side h3 {
          font-size: 24px;
          margin-bottom: 16px;
        }
        .info-card-side p {
          font-size: 16px;
          line-height: 1.5;
          opacity: 0.9;
          flex: 1;
        }
        .info-card-bottom {
          background: rgba(255,255,255,0.15);
          padding: 16px 20px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
        }
        @media (max-width: 900px) {
          .b2b-hero-grid {
            grid-template-columns: 1fr;
          }
          .banner-overlay {
            background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%);
          }
          .banner-text {
            max-width: 100%;
            padding: 120px 20px 40px 20px;
            text-align: center;
          }
        }
        .badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 16px;
          display: inline-block;
        }
        .banner-text h2 {
          font-size: 36px;
          margin-bottom: 12px;
        }
        .banner-text p {
          font-size: 20px;
          margin-bottom: 32px;
          opacity: 0.9;
        }
        .banner-text button {
          background: white;
          color: #0b612e;
          border: none;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .b2b-grid {
          margin-bottom: 80px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .section-header h2 {
          color: #231a11;
        }
        .section-header button {
          color: #0b612e;
          font-weight: 600;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 32px;
        }
      `}</style>
    </div>
  );
}
