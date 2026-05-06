'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Filter, SlidersHorizontal, ChevronDown, Search as SearchIcon } from 'lucide-react';

export default function SearchResultsPage() {
  const [activeFilters, setActiveFilters] = useState(['Frutas']);

  const dummyProducts = [
    { id: '1', title: 'Banana Prata Premium', price: 8.50, unit: 'kg', imageUrl: '/images/banana.png', isOrganic: true, producerName: 'Sítio Sol Nascente' },
    { id: '2', title: 'Tomate Grape Orgânico', price: 12.90, unit: 'bandeja 250g', imageUrl: '/images/tomato.png', isOrganic: true, producerName: 'Horta da Vila' },
    { id: '3', title: 'Alface Crespa Fresca', price: 4.50, unit: 'unidade', imageUrl: '/images/lettuce.png', isOrganic: false, producerName: 'Banca do Zé' },
    { id: '4', title: 'Ovos Caipira de Ouro', price: 18.00, unit: 'dúzia', imageUrl: '/images/eggs.png', isOrganic: true, producerName: 'Granja Esperança' },
    { id: '5', title: 'Maçã Fuji Selecionada', price: 15.00, unit: 'kg', imageUrl: '/images/apple.png', isOrganic: false, producerName: 'Frutas do Vale' },
    { id: '6', title: 'Cenoura Baby Extra', price: 7.20, unit: 'pacote', imageUrl: '/images/carrot.png', isOrganic: true, producerName: 'Sítio Novo' },
  ];

  return (
    <div className="search-page">
      <Header />
      
      <main className="container">
        <section className="search-header">
          <div className="breadcrumb">Home / Busca / &quot;Frutas&quot;</div>
          <div className="title-row">
            <h1>Resultados para <span>&quot;Frutas&quot;</span></h1>
            <p className="results-count">48 produtos encontrados</p>
          </div>
        </section>

        <div className="content-layout">
          <aside className="filters-sidebar">
            <div className="filter-group">
              <h3 className="filter-title">Categorias</h3>
              <div className="filter-options">
                {['Frutas', 'Legumes', 'Verduras', 'Ovos e Laticínios', 'Temperos'].map(cat => (
                  <label key={cat} className="filter-checkbox">
                    <input type="checkbox" defaultChecked={cat === 'Frutas'} />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Preço</h3>
              <div className="price-inputs">
                <input type="number" placeholder="Min" />
                <input type="number" placeholder="Max" />
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Selo e Origem</h3>
              <div className="filter-options">
                <label className="filter-checkbox">
                  <input type="checkbox" />
                  <span>Apenas Orgânicos</span>
                </label>
                <label className="filter-checkbox">
                  <input type="checkbox" />
                  <span>Produção Local (SP)</span>
                </label>
              </div>
            </div>
          </aside>

          <section className="results-section">
            <div className="results-toolbar">
              <div className="active-chips">
                {activeFilters.map(f => (
                  <div key={f} className="chip">
                    {f} <span className="close">×</span>
                  </div>
                ))}
              </div>
              <div className="sort-dropdown">
                Ordenar por: <strong>Mais Relevantes</strong> <ChevronDown size={14} />
              </div>
            </div>

            <div className="products-grid">
              {dummyProducts.map(p => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
            
            <div className="pagination">
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <span className="dots">...</span>
              <button className="page-btn">8</button>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .search-page {
          min-height: 100vh;
          background-color: var(--bg-main);
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .search-header {
          margin-bottom: 40px;
        }
        .breadcrumb {
          font-size: 13px;
          color: #888;
          margin-bottom: 12px;
        }
        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        h1 {
          font-size: 32px;
          color: var(--text-main);
        }
        h1 span {
          color: var(--leaf-green);
        }
        .results-count {
          color: #666;
          font-weight: 500;
        }
        .content-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
        }
        .filters-sidebar {
          background: white;
          padding: 24px;
          border-radius: 24px;
          height: fit-content;
          box-shadow: var(--shadow-sm);
        }
        .filter-group {
          margin-bottom: 32px;
        }
        .filter-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text-main);
        }
        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #555;
          cursor: pointer;
        }
        .filter-checkbox input {
          width: 18px;
          height: 18px;
          accent-color: var(--leaf-green);
        }
        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .price-inputs input {
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 10px;
          font-size: 14px;
          width: 100%;
        }
        .results-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .active-chips {
          display: flex;
          gap: 8px;
        }
        .chip {
          background: #eef7f2;
          color: var(--leaf-green);
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sort-dropdown {
          font-size: 14px;
          color: #555;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
        }
        .pagination {
          margin-top: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        .page-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid #eee;
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .page-btn.active {
          background: var(--leaf-green);
          color: white;
          border-color: var(--leaf-green);
        }
        .dots {
          color: #999;
        }
        
        @media (max-width: 1024px) {
          .content-layout {
            grid-template-columns: 1fr;
          }
          .filters-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
