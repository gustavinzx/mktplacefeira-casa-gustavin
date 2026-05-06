'use client';

import React from 'react';
import { ShoppingBag, Truck, FileText, Search, Filter, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

export default function ChefB2BPurchasePage() {
  const categories = ['Hortifrúti Atacado', 'Proteínas', 'Grãos e Sacas', 'Temperos Profissionais'];
  
  const b2bProducts = [
    { id: 'b1', title: 'Caixa de Tomate Grape (5kg)', price: 180.00, unit: 'caixa', imageUrl: '/images/tomato.png', isOrganic: true, producerName: 'Sítio Sol Nascente' },
    { id: 'b2', title: 'Saca de Cebola (20kg)', price: 95.00, unit: 'saca', imageUrl: '/images/tomato.png', isOrganic: false, producerName: 'Banca do Zé' },
    { id: 'b3', title: 'Fardo de Folhas Mix (10un)', price: 35.00, unit: 'fardo', imageUrl: '/images/lettuce.png', isOrganic: true, producerName: 'Horta da Vila' },
  ];

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
        {categories.map(cat => (
          <button key={cat} className={cat === 'Hortifrúti Atacado' ? 'active' : ''}>{cat}</button>
        ))}
      </nav>

      <section className="offers-banner">
        <div className="banner-text">
          <span className="badge">OFERTA DA SEMANA</span>
          <h2>Saca de Batata Asterix 25kg</h2>
          <p>De R$ 120,00 por <strong>R$ 89,90</strong></p>
          <button>Aproveitar Agora <ArrowRight size={18} /></button>
        </div>
      </section>

      <section className="b2b-grid">
        <div className="section-header">
          <h2>Mais Vendidos no Atacado</h2>
          <button>Ver tudo</button>
        </div>
        <div className="products-grid">
          {b2bProducts.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
          {b2bProducts.map(p => (
            <ProductCard key={`${p.id}-2`} {...p} />
          ))}
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
          color: var(--text-main);
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
          color: var(--leaf-green);
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
        }
        .filter-btn {
          background: white;
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
          background: var(--text-main);
          color: white;
          border-color: var(--text-main);
        }
        .offers-banner {
          background: linear-gradient(135deg, #0b612e 0%, #15803d 100%);
          border-radius: 32px;
          padding: 60px;
          color: white;
          margin-bottom: 60px;
          position: relative;
          overflow: hidden;
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
          color: var(--leaf-green);
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
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 32px;
        }
      `}</style>
    </div>
  );
}
