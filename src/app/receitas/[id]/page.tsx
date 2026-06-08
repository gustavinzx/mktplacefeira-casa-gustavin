'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChefHat, Clock, ShoppingCart, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

export default function ReceitaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { showToast } = useToast();
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then(r => r.json())
      .then(async data => {
        if (data.success) {
          const rec = data.data;
          
          // Busca inteligente de ingredientes
          if (rec.ingredients) {
            for (let ing of rec.ingredients) {
              if (!ing.suggested_product) {
                  let sRes = await fetch(`/api/products?search=${encodeURIComponent(ing.name)}&limit=1`);
                  let sData = await sRes.json();
                  
                  // Busca inteligente (fuzzy) caso o nome exato não bata (ex: "Chocolate Amargo" falha se produto for "Chocolate")
                  if ((!sData.success || !sData.data?.products?.length) && ing.name.includes(' ')) {
                    const firstWord = ing.name.split(' ')[0];
                    sRes = await fetch(`/api/products?search=${encodeURIComponent(firstWord)}&limit=1`);
                    sData = await sRes.json();
                  }

                  if (sData.success && sData.data.products && sData.data.products.length > 0) {
                    ing.suggested_product = sData.data.products[0];
                  }
              }
            }
          }
          
          setRecipe(rec);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const addIngredientsToCart = async () => {
    setAddingToCart(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login?redirect=/receitas/' + id;
      return;
    }
    
    // Filtra apenas ingredientes que tiveram produtos sugeridos encontrados
    const availableIngredients = (recipe.ingredients || []).filter((i: any) => i.suggested_product);
    
    if (availableIngredients.length === 0) {
      showToast('Nenhum ingrediente disponível na feira no momento.', 'info');
      setAddingToCart(false);
      return;
    }

    availableIngredients.forEach((ing: any) => {
      const prod = ing.suggested_product;
      useCartStore.getState().addItem({
        id: prod.id,
        title: prod.title,
        price: prod.price,
        unit: prod.unit,
        quantity: 1, 
        imageUrl: prod.image_url,
        producer: prod.producer?.stall_name || 'Feira Casa',
        producer_id: prod.producer_id || prod.producer?.id,
      });
    });

    setTimeout(() => {
      setAddingToCart(false);
      router.push('/cart');
    }, 1000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} className="animate-spin" color="#ea580c" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Receita não encontrada</h2>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: '#ea580c', marginTop: 16, cursor: 'pointer', fontSize: 16, textDecoration: 'underline' }}>Voltar</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fdfdfc', minHeight: '100vh' }}>
      <Header />

      <main className="container" style={{ padding: '40px 20px' }}>
        <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#666', textDecoration: 'none', marginBottom: 32, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={20} /> Voltar
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          
          {/* Foto e Ingredientes */}
          <div>
            <div style={{ height: 400, borderRadius: 32, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', marginBottom: 32 }}>
              <img src={recipe.image_url || '/images/placeholder.png'} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ background: '#fff', padding: 32, borderRadius: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
              <h2 style={{ fontSize: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                Ingredientes Necessários
              </h2>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'grid', gap: 16 }}>
                {recipe.ingredients?.map((ing: any, i: number) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <strong style={{ fontSize: 16, color: '#333' }}>{ing.name}</strong>
                      <div style={{ fontSize: 14, color: '#ea580c' }}>{ing.amount}</div>
                    </div>
                    {ing.suggested_product ? (
                      <span style={{ fontSize: 11, background: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={14} /> {ing.is_auto_extracted ? 'Encontrado na feira' : 'Disponível na Feira'}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, background: '#fef2f2', color: '#991b1b', padding: '6px 10px', borderRadius: 8, display: 'inline-block', maxWidth: 180, textAlign: 'right', lineHeight: 1.4 }}>
                        Em falta ou não cadastrado por feirantes no momento.
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <button 
                onClick={addIngredientsToCart}
                disabled={addingToCart}
                style={{ width: '100%', background: '#0b612e', color: 'white', border: 'none', padding: 20, borderRadius: 16, fontSize: 18, fontWeight: 700, cursor: addingToCart ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 24px rgba(11, 97, 46, 0.3)' }}
              >
                {addingToCart ? <Loader2 className="animate-spin" size={24} /> : <ShoppingCart size={24} />}
                Comprar Ingredientes com 1 Clique
              </button>
            </div>
          </div>

          {/* Detalhes e Preparo */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              {recipe.chef?.avatar_url ? (
                <img src={recipe.chef.avatar_url} style={{ width: 64, height: 64, borderRadius: 32, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 32, background: '#ea580c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChefHat size={32} /></div>
              )}
              <div>
                <span style={{ fontSize: 14, color: '#666', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Receita do Chef</span>
                <h3 style={{ fontSize: 20, color: '#111827', margin: 0 }}>{recipe.chef?.full_name || 'Chef Feira Casa'}</h3>
              </div>
            </div>

            <h1 style={{ fontSize: 48, lineHeight: 1.1, color: '#111827', marginBottom: 24 }}>{recipe.title}</h1>
            
            <p style={{ fontSize: 18, color: '#4b5563', lineHeight: 1.6, marginBottom: 32 }}>
              {recipe.description}
            </p>

            <div style={{ display: 'flex', gap: 24, marginBottom: 40, borderBottom: '1px solid #e5e7eb', paddingBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={24} /></div>
                <div>
                  <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>PREPARO</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>45 Minutos</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChefHat size={24} /></div>
                <div>
                  <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>DIFICULDADE</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Fácil</div>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: 28, marginBottom: 24 }}>Modo de Preparo</h2>
            <div style={{ fontSize: 18, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {recipe.instructions}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
