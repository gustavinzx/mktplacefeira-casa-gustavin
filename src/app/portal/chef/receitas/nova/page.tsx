'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Plus, Trash2, Wand2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

export default function NovaReceitaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    image_url: ''
  });
  
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRewrite = async () => {
    if (!formData.instructions.trim()) return;
    setRewriting(true);
    try {
      const res = await fetch('/api/recipes/ai-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: formData.instructions })
      });
      const data = await res.json();
      if (data.success && data.data.rewritten) {
        setFormData(prev => ({ ...prev, instructions: data.data.rewritten }));
      } else {
        showToast('Erro ao otimizar texto. Tente novamente.', 'error');
      }
    } catch (err) {
      showToast('Erro de conexão com o simulador de IA.', 'error');
    } finally {
      setRewriting(false);
    }
  };

  const handleIngredientChange = (index: number, field: 'name' | 'amount', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
      if (!token) {
        setError('Sessão expirada. Faça login novamente.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          instructions: formData.instructions,
          image_url: formData.image_url,
          ingredients: ingredients.filter(i => i.name.trim() !== '')
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro ao salvar receita');
      }

      router.push('/portal/chef/receitas');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800 }}>
      <header style={{ marginBottom: 32 }}>
        <Link 
          href="/portal/chef/receitas" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#666', textDecoration: 'none', marginBottom: 16 }}
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 style={{ fontSize: 28, color: '#333' }}>Nova Receita</h1>
        <p style={{ color: '#666' }}>Compartilhe sua criação com os clientes da feira.</p>
      </header>

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: 16, borderRadius: 8, marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div>
          <strong style={{ display: 'block', marginBottom: 4 }}>Dica da Feira Inteligente</strong>
          Nosso sistema cruza as informações do seu <strong>Modo de Preparo</strong> com o estoque dos feirantes automaticamente! Use os nomes exatos das frutas e verduras no texto para que seus clientes encontrem e comprem os ingredientes com facilidade.
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #eee' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Título da Receita</label>
          <input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ex: Sopa de Legumes da Vovó"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Breve Descrição</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Conte um pouco sobre esse prato..."
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={{ fontWeight: 600, color: '#333' }}>Ingredientes</label>
            <button 
              type="button" 
              onClick={addIngredient}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#ea580c', fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={16} /> Adicionar
            </button>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {ingredients.map((ing, index) => (
              <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  placeholder="Quantidade (ex: 200g)"
                  style={{ width: '120px', padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                />
                <input 
                  type="text" 
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  placeholder="Ingrediente (ex: Farinha de Trigo)"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                />
                {ingredients.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeIngredient(index)}
                    style={{ background: 'none', border: 'none', color: '#ba1a1a', cursor: 'pointer', padding: 8 }}
                    title="Remover"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontWeight: 600, color: '#333' }}>Modo de Preparo</label>
            <button 
              type="button" 
              onClick={handleRewrite}
              disabled={rewriting || !formData.instructions.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: rewriting || !formData.instructions.trim() ? 'not-allowed' : 'pointer', opacity: rewriting || !formData.instructions.trim() ? 0.6 : 1 }}
            >
              {rewriting ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} 
              {rewriting ? 'Otimizando...' : '✨ Otimizar com IA'}
            </button>
          </div>
          <textarea 
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={6}
            placeholder="1. Pique os legumes...&#10;2. Refogue a cebola..."
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>URL da Foto (opcional)</label>
          <input 
            type="url" 
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://..."
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc' }}
          />
          {formData.image_url && (
            <div style={{ marginTop: 12 }}>
              <img src={formData.image_url} alt="Preview" style={{ height: 160, borderRadius: 8, objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: 16,
            background: '#ea580c',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Salvar Receita</>}
        </button>
      </form>
    </div>
  );
}
