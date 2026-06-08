'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ShoppingCart, Search, ChefHat } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MeusInsumosPage() {
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsumos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch('/api/recipes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          const allRecipes = Array.isArray(data.data) ? data.data : [];
          
          // Agrupar insumos de todas as receitas
          const list: any[] = [];
          
          allRecipes.forEach((recipe: any) => {
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
              recipe.ingredients.forEach((ing: any) => {
                list.push({
                  recipeId: recipe.id,
                  recipeTitle: recipe.title,
                  name: ing.name,
                  amount: ing.amount
                });
              });
            }
          });
          
          setIngredients(list);
        } else if (data.error === 'Não autenticado') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        } else {
          setError(data.error || 'Erro ao carregar insumos');
        }
      } catch (err) {
        console.error(err);
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    fetchInsumos();
  }, []);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, color: '#333', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ChefHat size={32} color="#166534" /> Meus Insumos
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Sua lista de compras automatizada, baseada nos ingredientes das suas receitas cadastradas.
        </p>
      </header>

      {error && <p style={{ color: '#ba1a1a', padding: '12px 16px', background: '#ffebee', borderRadius: 8 }}>{error}</p>}

      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={32} className="animate-spin" color="#166534" />
        </div>
      ) : ingredients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 12, border: '1px solid #eee' }}>
          <ShoppingCart size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, marginBottom: 8, color: '#333', fontWeight: 600 }}>Nenhum insumo encontrado.</p>
          <p style={{ color: '#666', marginBottom: 24 }}>Você ainda não adicionou ingredientes às suas receitas.</p>
          <Link href="/portal/chef/receitas/nova" style={{ color: '#fff', background: '#ea580c', padding: '10px 20px', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>
            Adicionar Nova Receita
          </Link>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '16px 24px', color: '#555', fontWeight: 600 }}>Ingrediente</th>
                <th style={{ padding: '16px 24px', color: '#555', fontWeight: 600 }}>Quantidade</th>
                <th style={{ padding: '16px 24px', color: '#555', fontWeight: 600 }}>Receita Origem</th>
                <th style={{ padding: '16px 24px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500, color: '#333' }}>{ing.name}</td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>{ing.amount || '-'}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <Link href={`/portal/chef/receitas/${ing.recipeId}/editar`} style={{ color: '#0ea5e9', textDecoration: 'none', fontSize: 14 }}>
                      {ing.recipeTitle}
                    </Link>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link 
                      href={`/b2b?q=${encodeURIComponent(ing.name)}`} 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#166534',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <Search size={14} /> Buscar no B2B
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
