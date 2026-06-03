'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Check, Wand2 } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    unit: 'kg',
    category_id: '',
    image_url: '',
    is_organic: false,
    is_promotion: false,
    is_wholesale: false,
    wholesale_price: '',
    stock: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch(`/api/products/${id}`).then(r => r.json())
    ]).then(([catData, prodData]) => {
      if (catData.success) setCategories(catData.data || []);
      
      if (prodData.success) {
        const p = prodData.data;
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: p.price ? p.price.toString() : '',
          unit: p.unit || 'kg',
          category_id: p.category_id || '',
          image_url: p.image_url || '',
          is_organic: !!p.is_organic,
          is_promotion: !!p.is_promotion,
          is_wholesale: !!p.is_wholesale,
          wholesale_price: p.wholesale_price ? p.wholesale_price.toString() : '',
          stock: p.stock !== undefined ? p.stock.toString() : '0',
        });
      } else {
        setError('Produto não encontrado.');
      }
    }).catch(() => {
      setError('Erro de conexão ao carregar dados.');
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRewrite = async () => {
    if (!form.description?.trim()) return;
    setRewriting(true);
    try {
      const res = await fetch('/api/products/ai-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: form.description, title: form.title })
      });
      const data = await res.json();
      if (data.success && data.data.rewritten) {
        setForm(prev => ({ ...prev, description: data.data.rewritten }));
      } else {
        alert('Erro ao otimizar texto.');
      }
    } catch (err) {
      alert('Erro de conexão com a IA.');
    } finally {
      setRewriting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.price || !form.unit) {
      setError('Preencha nome, preço e unidade.');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Você precisa estar logado.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          price: parseFloat(form.price),
          unit: form.unit,
          category_id: form.category_id || null,
          image_url: form.image_url || null,
          is_organic: form.is_organic,
          is_promotion: form.is_promotion,
          is_wholesale: form.is_wholesale,
          wholesale_price: form.is_wholesale ? parseFloat(form.wholesale_price) : null,
          stock: parseInt(form.stock) || 0,
        }),
      });

      const data = await res.json();
      if (data.success || res.status === 200) {
        setSaved(true);
        setTimeout(() => router.push('/portal/feirante/produtos'), 1500);
      } else {
        setError(data.error || 'Erro ao atualizar produto.');
      }
    } catch {
      setError('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #ddd',
    borderRadius: 10,
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: '#444',
    marginBottom: 6,
    display: 'block',
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" color="#30852f" />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 640 }}>
      <Link
        href="/portal/feirante/produtos"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#30852f', textDecoration: 'none', fontSize: 14, marginBottom: 24 }}
      >
        <ArrowLeft size={16} /> Voltar para meus produtos
      </Link>

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Editar Produto</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Altere preço, estoque e detalhes do seu produto.</p>

      {error && (
        <div style={{ background: '#ffebee', color: '#ba1a1a', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {saved && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={18} /> Produto atualizado! Redirecionando…
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="title">Nome do produto *</label>
          <input
            style={inputStyle}
            id="title" name="title"
            value={form.title} onChange={handleChange}
            placeholder="Ex: Alface Crespa" required
          />
        </div>

        <div style={fieldStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }} htmlFor="description">Descrição</label>
            <button 
              type="button" 
              onClick={handleRewrite}
              disabled={rewriting || !form.description?.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: rewriting || !form.description?.trim() ? 'not-allowed' : 'pointer', opacity: rewriting || !form.description?.trim() ? 0.6 : 1 }}
            >
              {rewriting ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} 
              {rewriting ? 'Otimizando...' : '✨ Otimizar com IA'}
            </button>
          </div>
          <textarea
            id="description"
            name="description"
            value={form.description || ''}
            onChange={handleChange}
            placeholder="Conte um pouco sobre seu produto…"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="price">Preço (R$) *</label>
            <input
              style={inputStyle}
              id="price" name="price" type="number" step="0.01" min="0"
              value={form.price} onChange={handleChange}
              placeholder="Ex: 3.50" required
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="unit">Unidade *</label>
            <select style={inputStyle} id="unit" name="unit" value={form.unit} onChange={handleChange} required>
              <option value="kg">Por Kg</option>
              <option value="unidade">Por Unidade</option>
              <option value="maço">Por Maço</option>
              <option value="bandeja">Por Bandeja</option>
              <option value="pct">Por Pacote</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="stock">Estoque Disponível *</label>
            <input
              style={inputStyle}
              id="stock" name="stock" type="number" min="0"
              value={form.stock} onChange={handleChange}
              placeholder="Ex: 50" required
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="category_id">Categoria</label>
            <select style={inputStyle} id="category_id" name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">Selecione...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#333' }}>
            <input
              type="checkbox"
              name="is_wholesale"
              checked={form.is_wholesale}
              onChange={handleChange}
              style={{ width: 18, height: 18, accentColor: '#30852f' }}
            />
            Vender no Atacado (B2B)
          </label>
          {form.is_wholesale && (
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="wholesale_price">Preço de Atacado (R$) *</label>
              <input
                id="wholesale_price"
                name="wholesale_price"
                type="number"
                min="0.01"
                step="0.01"
                required={form.is_wholesale}
                value={form.wholesale_price}
                onChange={handleChange}
                placeholder="Ex: 8.50"
                style={inputStyle}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', background: '#f8f8f8', padding: '12px 16px', borderRadius: 10 }}>
            <input
              type="checkbox"
              name="is_organic"
              checked={form.is_organic}
              onChange={handleChange}
              style={{ width: 18, height: 18, accentColor: '#30852f' }}
            />
            Este produto é orgânico certificado
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', background: '#fff1f2', color: '#9f1239', border: '1px solid #fda4af', padding: '12px 16px', borderRadius: 10 }}>
            <input
              type="checkbox"
              name="is_promotion"
              checked={form.is_promotion}
              onChange={handleChange}
              style={{ width: 18, height: 18, accentColor: '#e11d48' }}
            />
            Oferta do Dia (Preço promocional)
          </label>
        </div>

        <button
          type="submit"
          disabled={saving || saved}
          style={{
            background: '#30852f', color: '#fff', border: 'none',
            padding: '14px', borderRadius: 12, fontSize: 16, fontWeight: 700,
            cursor: saving || saved ? 'not-allowed' : 'pointer',
            opacity: saving || saved ? 0.7 : 1,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
            marginTop: 10
          }}
        >
          {saving ? <><Loader2 size={20} className="animate-spin" /> Atualizando...</> : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}
