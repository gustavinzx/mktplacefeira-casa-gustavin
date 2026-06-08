'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Loader2, BookOpen, Clock, Users, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

export default function ChefReceitasPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchRecipes = async () => {
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
          setRecipes(Array.isArray(data.data) ? data.data : []);
        } else if (data.error === 'Não autenticado') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        } else {
          setError(data.error || 'Erro ao carregar receitas');
        }
      } catch (err) {
        console.error(err);
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleDelete = async (id: string) => {

    
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecipes(recipes.filter(r => r.id !== id));
      } else {
        showToast(data.error || 'Erro ao excluir receita', 'error');
      }
    } catch (err) {
      showToast('Erro de conexão ao excluir', 'error');
    }
  };

  return (
    <div style={{ padding: '32px 40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <Link href="/portal/chef" style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={16} /> Voltar ao Painel
            </Link>
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Minhas Receitas</h1>
          <p style={{ color: '#666' }}>
            {loading ? 'Carregando…' : `${recipes.length} receita${recipes.length !== 1 ? 's' : ''} criada${recipes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/portal/chef/receitas/nova"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#ea580c',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <Plus size={18} /> Nova Receita
        </Link>
      </header>

      {error && <p style={{ color: '#ba1a1a', padding: '12px 16px', background: '#ffebee', borderRadius: 8 }}>{error}</p>}

      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={32} className="animate-spin" color="#ea580c" />
        </div>
      ) : recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
          <BookOpen size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, marginBottom: 8 }}>Você ainda não criou nenhuma receita.</p>
          <Link href="/portal/chef/receitas/nova" style={{ color: '#ea580c', fontWeight: 700 }}>
            + Criar primeira receita
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {recipes.map(recipe => (
            <div key={recipe.id} style={{ display: 'flex', background: '#fff', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
              {recipe.image_url ? (
                <img src={recipe.image_url} alt={recipe.title} style={{ width: 160, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 160, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={32} color="#ccc" />
                </div>
              )}
              <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>{recipe.title}</h3>
                <p style={{ color: '#666', fontSize: 14, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {recipe.description}
                </p>
                <div style={{ display: 'flex', gap: 16, color: '#888', fontSize: 13, alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {new Date(recipe.created_at).toLocaleDateString()}</span>
                  <Link href={`/receitas/${recipe.id}`} style={{ color: '#ea580c', fontWeight: 600, textDecoration: 'none' }}>Ver página pública →</Link>
                  <div style={{ flex: 1 }} />
                  <Link 
                    href={`/portal/chef/receitas/${recipe.id}/editar`}
                    style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                  >
                    <Edit size={14} /> Editar
                  </Link>
                  <button 
                    onClick={() => handleDelete(recipe.id)}
                    style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
