'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChefHat, Search, Clock, ArrowRight, Loader2 } from 'lucide-react';

export default function ReceitasPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/recipes')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRecipes(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = recipes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Header />

      <div style={{ background: '#111827', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, marginBottom: 16, color: '#ffffff' }}>Caderno de Receitas</h1>
        <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 600, margin: '0 auto 32px' }}>
          Descubra pratos incríveis criados pelos nossos Chefs, e compre os ingredientes fresquinhos diretamente da nossa Feira.
        </p>
        <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
          <Search size={20} style={{ position: 'absolute', left: 16, top: 14, color: '#666' }} />
          <input 
            type="text" 
            placeholder="Buscar por receita..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 100, border: 'none', fontSize: 16 }}
          />
        </div>
      </div>

      <main className="container" style={{ padding: '60px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader2 className="animate-spin" size={40} color="#ea580c" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <ChefHat size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#666', fontSize: 18 }}>Nenhuma receita encontrada.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
            {filtered.map(recipe => (
              <div key={recipe.id} style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ height: 240, background: '#eee', position: 'relative' }}>
                  <img src={recipe.image_url || '/images/placeholder.png'} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} /> 45 min
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 22, marginBottom: 12, color: '#111827' }}>{recipe.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {recipe.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {recipe.chef?.avatar_url ? (
                        <img src={recipe.chef.avatar_url} style={{ width: 32, height: 32, borderRadius: 16, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: 16, background: '#ea580c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChefHat size={16} /></div>
                      )}
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{recipe.chef?.full_name || 'Chef'}</span>
                    </div>
                    <Link href={`/receitas/${recipe.id}`} passHref>
                      <button style={{ background: '#ea580c', color: 'white', border: 'none', width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <ArrowRight size={20} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
