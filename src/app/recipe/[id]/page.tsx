'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Clock, Users, Flame, Play, CheckCircle2, ShoppingBag } from 'lucide-react';

export default function RecipeDetailsPage({ params }: { params: { id: string } }) {
  const recipe = {
    title: 'Risoto de Tomate Grape e Manjericão Orgânico',
    chef: 'Chef Eduardo Castro',
    prepTime: '45 min',
    servings: '2 pessoas',
    difficulty: 'Médio',
    description: 'Um prato clássico da culinária italiana revisitado com o frescor dos ingredientes da nossa feira. O segredo está no caldo caseiro e no manjericão colhido na hora.',
    ingredients: [
      { name: 'Arroz Arbóreo', amount: '1 xícara', isSponsored: false },
      { name: 'Tomate Grape Orgânico', amount: '1 bandeja', isSponsored: true, productId: '1' },
      { name: 'Manjericão Fresco', amount: '1 maço', isSponsored: true, productId: '10' },
      { name: 'Cebola Branca', amount: '1 unidade', isSponsored: false },
      { name: 'Vinho Branco Seco', amount: '1/2 xícara', isSponsored: false },
    ],
    steps: [
      'Refogue a cebola picada no azeite até ficar transparente.',
      'Adicione o arroz e frite por 2 minutos mexendo sempre.',
      'Acrescente o vinho e mexa até evaporar completamente.',
      'Vá adicionando o caldo quente concha a concha, mexendo sempre.',
      'Aos 15 minutos, adicione os tomates cortados ao meio.',
      'Finalize com manteiga, parmesão e as folhas de manjericão.'
    ]
  };

  return (
    <div className="recipe-page">
      <Header />
      
      <main className="container">
        <section className="recipe-hero">
          <div className="hero-content">
            <div className="chef-info">Por <strong>{recipe.chef}</strong></div>
            <h1>{recipe.title}</h1>
            <p>{recipe.description}</p>
            <div className="meta-grid">
              <div className="meta"><Clock size={18} /> {recipe.prepTime}</div>
              <div className="meta"><Users size={18} /> {recipe.servings}</div>
              <div className="meta"><Flame size={18} /> {recipe.difficulty}</div>
            </div>
            <button className="play-btn"><Play fill="currentColor" /> Ver Vídeo da Receita</button>
          </div>
          <div className="hero-image">
            <img src="/images/tomato.png" alt="" /> {/* Placeholder */}
          </div>
        </section>

        <div className="recipe-grid">
          <aside className="ingredients-card">
            <h2>Ingredientes</h2>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className={ing.isSponsored ? 'sponsored' : ''}>
                  <div className="ing-main">
                    <CheckCircle2 size={16} />
                    <span>{ing.amount} {ing.name}</span>
                  </div>
                  {ing.isSponsored && (
                    <button className="buy-now">
                      <ShoppingBag size={14} /> Comprar na Feira
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <button className="buy-all">Comprar Todos os Ingredientes</button>
          </aside>

          <section className="steps-section">
            <h2>Modo de Preparo</h2>
            <div className="steps-list">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="step-item">
                  <div className="step-number">{idx + 1}</div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="sponsored-products">
          <h2>Produtos desta Receita</h2>
          <div className="products-grid">
            <ProductCard id="1" title="Tomate Grape Orgânico" price={12.90} unit="bandeja" imageUrl="/images/tomato.png" isOrganic={true} />
            <ProductCard id="10" title="Manjericão Fresco" price={3.50} unit="maço" imageUrl="/images/lettuce.png" isOrganic={true} />
          </div>
        </section>
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
