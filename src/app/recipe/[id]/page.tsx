'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useToast } from '@/components/Toast';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Clock, Users, Flame, Play, CheckCircle2, ShoppingBag } from 'lucide-react';

export default function RecipeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const recipeId = unwrappedParams.id;
  const [recipe, setRecipe] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const addItem = useCartStore(s => s.addItem);
  const { showToast } = useToast();
  const requireAuth = useRequireAuth();
  const router = useRouter();

  const handleBuy = async (product: any) => {
    requireAuth(() => {
      addItem({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        unit: product.unit,
        quantity: 1,
        imageUrl: product.image_url || '/images/placeholder.png',
        producer: product.producer?.stall_name || 'Feirante',
        producer_id: product.producer_id
      });
      showToast('Produto adicionado ao carrinho', 'success');
    }, `/recipe/${recipeId}`);
  };

  const handleBuyAll = async () => {
    requireAuth(() => {
      sponsoredProducts.forEach((ing: any) => {
        const p = ing.suggested_product;
        if (p) {
          addItem({
            id: p.id,
            title: p.title,
            price: Number(p.price),
            unit: p.unit,
            quantity: 1,
            imageUrl: p.image_url || '/images/placeholder.png',
            producer: p.producer?.stall_name || 'Feirante',
            producer_id: p.producer_id
          });
        }
      });
      
      showToast(`${sponsoredProducts.length} itens adicionados ao carrinho`, 'success');
      setTimeout(() => {
        router.push('/carrinho');
      }, 1000);
    }, `/recipe/${recipeId}`);
  };

  React.useEffect(() => {
    fetch(`/api/recipes/${recipeId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecipe(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [recipeId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando receita...</div>;
  }

  if (!recipe) {
    return <div className="min-h-screen flex items-center justify-center">Receita não encontrada.</div>;
  }

  const stepsArray = recipe.instructions ? recipe.instructions.split('\n').filter((s: string) => s.trim() !== '') : [];
  const sponsoredProducts = (recipe.ingredients || []).filter((i: any) => i.suggested_product != null);

  return (
    <div className="recipe-page">
      <Header />
      
      <main className="container">
        <section className="recipe-hero">
          <div className="hero-content">
            <div className="chef-info">Por <strong>{recipe.chef?.full_name || 'Chef'}</strong></div>
            <h1>{recipe.title}</h1>
            <p>{recipe.description}</p>
            <div className="meta-grid">
              <div className="meta"><Clock size={18} /> {recipe.prep_time || '40 min'}</div>
              <div className="meta"><Users size={18} /> {recipe.servings || '2'} porções</div>
              <div className="meta"><Flame size={18} /> {recipe.difficulty || 'Médio'}</div>
            </div>
            <button className="play-btn"><Play fill="currentColor" /> Ver Vídeo da Receita</button>
          </div>
          <div className="hero-image">
            <img src={recipe.image_url || "/images/tomato.png"} alt={recipe.title} />
          </div>
        </section>

        <div className="recipe-grid">
          <aside className="ingredients-card">
            <h2>Ingredientes</h2>
            <ul className="ingredients-list">
              {(recipe.ingredients || []).map((ing: any, idx: number) => (
                <li key={idx} className={ing.suggested_product ? 'sponsored' : ''}>
                  <div className="ing-main">
                    <CheckCircle2 size={16} />
                    <span>{ing.amount} {ing.name}</span>
                  </div>
                  {ing.suggested_product && (
                    <button className="buy-now" onClick={() => handleBuy(ing.suggested_product)}>
                      <ShoppingBag size={14} /> Comprar na Feira
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <button className="buy-all" onClick={handleBuyAll}>Comprar Todos os Ingredientes</button>
          </aside>

          <section className="steps-section">
            <h2>Modo de Preparo</h2>
            <div className="steps-list">
              {stepsArray.map((step: string, idx: number) => (
                <div key={idx} className="step-item">
                  <div className="step-number">{idx + 1}</div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {sponsoredProducts.length > 0 && (
          <section className="sponsored-products">
            <h2>Produtos desta Receita</h2>
            <div className="products-grid">
              {sponsoredProducts.map((ing: any) => (
                <ProductCard 
                  key={ing.suggested_product.id}
                  id={ing.suggested_product.id} 
                  title={ing.suggested_product.title} 
                  price={Number(ing.suggested_product.price)} 
                  unit={ing.suggested_product.unit} 
                  imageUrl={ing.suggested_product.image_url || "/images/placeholder.png"} 
                  isOrganic={true} 
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .recipe-page {
          background: var(--bg-main);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .recipe-hero {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
          margin-bottom: 60px;
          background: white;
          padding: 60px;
          border-radius: 40px;
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }
        .hero-content h1 {
          font-size: 42px;
          margin: 16px 0 24px;
          line-height: 1.1;
        }
        .hero-content p {
          font-size: 18px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .meta-grid {
          display: flex;
          gap: 32px;
          margin-bottom: 40px;
        }
        .meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #555;
        }
        .play-btn {
          background: var(--market-orange);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .hero-image {
          height: 400px;
          background: #fdf2f0;
          border-radius: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-image img {
          width: 80%;
          transform: rotate(15deg);
        }
        .recipe-grid {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 40px;
          margin-bottom: 80px;
        }
        .ingredients-card {
          background: white;
          padding: 40px;
          border-radius: 32px;
          box-shadow: var(--shadow-sm);
          height: fit-content;
        }
        .ingredients-list {
          list-style: none;
          margin: 24px 0 32px;
        }
        .ingredients-list li {
          padding: 16px 0;
          border-bottom: 1px solid #f5f5f5;
        }
        .ing-main {
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 15px;
          font-weight: 500;
          color: #444;
        }
        .ing-main :global(svg) {
          color: #ddd;
        }
        .sponsored .ing-main :global(svg) {
          color: var(--leaf-green);
        }
        .buy-now {
          margin-top: 10px;
          margin-left: 28px;
          background: #eef7f2;
          color: var(--leaf-green);
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .buy-all {
          width: 100%;
          background: var(--leaf-green);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
        }
        .steps-section {
          background: white;
          padding: 40px 60px;
          border-radius: 32px;
          box-shadow: var(--shadow-sm);
        }
        .steps-list {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .step-item {
          display: flex;
          gap: 24px;
        }
        .step-number {
          width: 36px;
          height: 36px;
          background: #f5f5f5;
          color: var(--market-orange);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          flex-shrink: 0;
        }
        .step-item p {
          font-size: 16px;
          line-height: 1.6;
          color: #555;
        }
        .sponsored-products h2 {
          margin-bottom: 32px;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
      `}</style>
    </div>
  );
}
