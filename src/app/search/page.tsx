'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  price: number;
  unit: string;
  image_url: string;
  is_organic: boolean;
  producer?: { id: string; stall_name: string };
  category?: { name: string };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [organic, setOrganic] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        const categoryId = searchParams.get('category_id');
        const slug = searchParams.get('slug');
        if (categoryId) params.set('category_id', categoryId);
        if (query) params.set('q', query);
        if (organic) params.set('organic', 'true');
        params.set('limit', '20');

        if (slug && !categoryId) {
          const catRes = await fetch('/api/categories');
          const catData = await catRes.json();
          const match = catData.data?.find((c: { slug: string }) => c.slug === slug);
          if (match?.id) params.set('category_id', match.id);
        }

        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data?.products || []);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, organic, searchParams]);

  return (
    <div className="search-page">
      <Header />
      
      <main className="container">
        <section className="search-header">
          <div className="breadcrumb">Home / Busca {query ? `/ "${query}"` : ''}</div>
          <div className="title-row">
            <h1>{query ? <>Resultados para <span>&quot;{query}&quot;</span></> : 'Todos os Produtos'}</h1>
            <p className="results-count">{products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}</p>
          </div>
        </section>

        <div className="content-layout">
          <aside className="filters-sidebar">
            <div className="filter-group">
              <h3 className="filter-title">Filtros</h3>
              <div className="filter-options">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={organic}
                    onChange={e => setOrganic(e.target.checked)}
                  />
                  <span>Apenas Orgânicos</span>
                </label>
              </div>
            </div>
          </aside>

          <section className="results-section">
            <div className="results-toolbar">
              <div style={{ fontSize: '14px', color: '#555' }}>
                {loading ? 'Buscando...' : `${products.length} resultados`}
              </div>
              <div className="sort-dropdown">
                <span>Ordenar por</span> <ChevronDown size={16} />
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
                <Loader2 size={40} className="animate-spin" color="#0e6b17" />
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
                <p style={{ fontSize: '20px' }}>Nenhum produto encontrado.</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>Tente buscar por outro termo.</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(p => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    price={p.price}
                    unit={p.unit}
                    imageUrl={p.image_url || '/images/tomato.png'}
                    isOrganic={p.is_organic}
                    producer={p.producer?.stall_name}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .search-page { background: var(--bg-main); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .breadcrumb { font-size: 13px; color: #888; margin-bottom: 16px; }
        .title-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 40px; }
        .title-row h1 { font-size: 32px; }
        .title-row h1 span { color: var(--leaf-green); }
        .results-count { font-size: 14px; color: #888; }
        .content-layout { display: grid; grid-template-columns: 240px 1fr; gap: 40px; }
        .filters-sidebar { background: white; padding: 24px; border-radius: 24px; box-shadow: var(--shadow-sm); height: fit-content; }
        .filter-group { margin-bottom: 24px; }
        .filter-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #888; margin-bottom: 16px; }
        .filter-options { display: flex; flex-direction: column; gap: 12px; }
        .filter-checkbox { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #555; cursor: pointer; }
        .filter-checkbox input { width: 18px; height: 18px; accent-color: var(--leaf-green); }
        .results-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .sort-dropdown { font-size: 14px; color: #555; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
        @media (max-width: 1024px) { .content-layout { grid-template-columns: 1fr; } .filters-sidebar { display: none; } }
      `}</style>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <React.Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>Carregando busca...</div>}>
      <SearchContent />
    </React.Suspense>
  );
}
