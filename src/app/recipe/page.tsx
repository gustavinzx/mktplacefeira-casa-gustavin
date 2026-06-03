'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Clock, Flame, ShoppingBag } from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';

interface DBRecipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  prep_time: string;
  difficulty: string;
  chef_id: string | null;
}

const staticRecipes = [
  {
    id: 'r1',
    title: 'Sopa de Legumes da Vovó',
    description: 'Uma receita clássica usando os melhores ingredientes da feira.',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoBPD_Am0blcg8SURE3cT3kZ5Gvwm4ZvnV74nYnodQbLs931I0vcVlCPVTmiNJ34cGvcMcL9bOzhtM2rkHzp7vTeN06RMHE-HmVB8nAiPXEKkfh51PerYGCKa668aSLctamxU-yCgQVyBisfsJW29yVKfIb2J-tKq3V31gA3Yna4fvGmIcLKuB_43iiB9tUXXIRa8cv0kTq_UlR1nhhs3VCmMn-_cCl_Xyrut0Tn9g7w-UT9mZeP6cTaygwG4SpGY2gQ7Rls9awQg',
    prep_time: '40min',
    difficulty: 'Fácil',
    chef_id: null,
  },
  {
    id: 'r2',
    title: 'Salada de Frutas Tropical',
    description: 'Refrescante e direta do pomar dos nossos feirantes.',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMgrrD2slpYSx8pWc1gNjgHfANRH6i2HbOgZefEWOVDzIPNqsMD9Tir785dYYFKLRxfo5pyQesT9xGN8NntTvAEvibwE3D8v7O3dTWakUiMOkFRseKeiQJ2hIjgayFY3D_5M0BMP0rTtTA_KYH8wToKAd1bu0r2LWiUI-kRumwjweeU0XaUC_jb1FsB697ZHHS7axoVa10nYAoPqB_sPp6SY3bvqpXQchv4lctySeKlS5LXbu9eq8zTH3bAGJ_7odvMuwG2uAS43I',
    prep_time: '15min',
    difficulty: 'Fácil',
    chef_id: null,
  },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<DBRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from(getTableName('recipes'))
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data && data.length > 0) {
          setRecipes(data as DBRecipe[]);
        } else {
          setRecipes(staticRecipes);
        }
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setRecipes(staticRecipes);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, []);

  return (
    <div className="recipes-page">
      <Header />

      <main className="container">
        <section className="search-header">
          <div className="breadcrumb">Home / Receitas</div>
          <div className="title-row">
            <h1>Receitas do <span>Chef</span></h1>
            <p className="results-count">
              {loading ? 'Carregando...' : `${recipes.length} receita${recipes.length !== 1 ? 's' : ''} encontrada${recipes.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </section>

        <section className="results-section">
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="empty-state">
              <h2>Nenhuma receita encontrada</h2>
            </div>
          ) : (
            <div className="recipes-grid">
              {recipes.map(recipe => (
                <Link href={`/recipe/${recipe.id}`} key={recipe.id} className="recipe-card-link">
                  <div className="recipe-card">
                    <div className="recipe-image">
                      <img src={recipe.image_url || '/placeholder.jpg'} alt={recipe.title} />
                    </div>
                    <div className="recipe-info">
                      <h3>{recipe.title}</h3>
                      <p>{recipe.description}</p>
                      <div className="recipe-tags">
                        {recipe.prep_time && <span className="tag"><Clock size={14} /> {recipe.prep_time}</span>}
                        {recipe.difficulty && <span className="tag"><Flame size={14} /> {recipe.difficulty}</span>}
                      </div>
                      <button className="buy-ingredients">
                        Comprar Ingredientes <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .recipes-page {
          min-height: 100vh;
          background-color: var(--color-background, #fff8f5);
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
          color: var(--color-outline, #707a6f);
          margin-bottom: 12px;
        }
        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        h1 {
          font-size: 32px;
          color: #1b1c19;
        }
        h1 span {
          color: var(--color-primary, #0b612e);
        }
        .results-count {
          color: var(--color-outline, #707a6f);
          font-weight: 500;
        }
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .skeleton-card {
          height: 380px;
          border-radius: 20px;
          background: #e8f0e8;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .recipes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .recipe-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .recipe-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--color-outline-variant, #bfc9bd);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .recipe-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
          border-color: var(--color-primary, #0b612e);
        }
        .recipe-image {
          height: 200px;
          width: 100%;
          overflow: hidden;
        }
        .recipe-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .recipe-card:hover .recipe-image img {
          transform: scale(1.05);
        }
        .recipe-info {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .recipe-info h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1b1c19;
          margin-bottom: 8px;
          line-height: 1.3;
        }
        .recipe-info p {
          font-size: 14px;
          color: var(--color-on-surface-variant, #707a6f);
          line-height: 1.5;
          margin-bottom: 16px;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .recipe-tags {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .tag {
          font-size: 12px;
          font-weight: 700;
          color: #1b1c19;
          background: #f0f4f0;
          padding: 4px 10px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .tag svg {
          color: var(--color-primary, #0b612e);
        }
        .buy-ingredients {
          width: 100%;
          background: #eef7f2;
          color: var(--color-primary, #0b612e);
          border: 1px solid transparent;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .recipe-card:hover .buy-ingredients {
          background: var(--color-primary, #0b612e);
          color: white;
        }
      `}</style>
    </div>
  );
}
