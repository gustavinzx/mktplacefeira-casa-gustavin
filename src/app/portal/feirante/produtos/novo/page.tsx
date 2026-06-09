'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Check, Wand2, UploadCloud, ImagePlus, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}


interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NovoProdutoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    unit: 'kg',
    category_id: '',
    image_url: '',
    is_organic: false,
    is_promotion: false,
    stock: '10',
    is_wholesale: false,
    wholesale_price: '',
  });

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (data.success) setCategories(data.data || []);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRewrite = async () => {
    if (!form.description.trim()) return;
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
        showToast('Erro ao otimizar texto.', 'error');
      }
    } catch (err) {
      showToast('Erro de conexão com a IA.', 'error');
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

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      setError('Usuário não logado.');
      return;
    }

    setLoading(true);
    let uploadedUrl = form.image_url;
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${ext}`;
      const { data, error: uploadError } = await supabase.storage.from('products').upload(fileName, imageFile);
      if (uploadError) {
        showToast('Erro ao fazer upload da imagem', 'error');
        setLoading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
      uploadedUrl = publicUrl;
    }

    const { error: dbError } = await supabase.from('mktplace_feira_products').insert({
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      unit: form.unit,
      category_id: form.category_id || null,
      image_url: uploadedUrl,
      is_organic: form.is_organic,
      is_promotion: form.is_promotion,
      stock: parseInt(form.stock) || 0,
      is_wholesale: form.is_wholesale,
      wholesale_price: form.is_wholesale ? parseFloat(form.wholesale_price) : null,
      producer_id: session.user.id
    });

    if (dbError) {
      setError(dbError.message);
    } else {
      setSaved(true);
      showToast('Produto cadastrado com sucesso!', 'success');
      setTimeout(() => router.push('/portal/feirante/produtos'), 1500);
    }
    setLoading(false);
  };

  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14, color: '#333' };
  const inputStyle = { width: '100%', padding: '12px 14px', border: '1px solid #ccc', borderRadius: 8, fontSize: 15 };
  const fieldStyle = { marginBottom: 20 };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <button type="button" onClick={() => router.back()} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: '#666', cursor: 'pointer', marginBottom: 24, fontSize: 15 }}>
        <ArrowLeft size={18} /> Voltar
      </button>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#111' }}>Cadastrar Novo Produto</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Preencha os detalhes do seu produto para vender na feira.</p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="title">Nome do Produto *</label>
            <input id="title" name="title" required value={form.title} onChange={handleChange} placeholder="Ex: Tomate Carmem Orgânico" style={inputStyle} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="category_id">Categoria</label>
            <select id="category_id" name="category_id" value={form.category_id} onChange={handleChange} style={inputStyle}>
              <option value="">Selecione uma categoria...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={fieldStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }} htmlFor="description">Descrição do Produto</label>
            <button type="button" onClick={handleRewrite} disabled={rewriting || !form.description} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#30852f', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 }}>
              {rewriting ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              Otimizar com IA
            </button>
          </div>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Descreva os benefícios, origem e características do produto..." style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="price">Preço (R$) *</label>
            <input id="price" name="price" type="number" step="0.01" min="0" required value={form.price} onChange={handleChange} placeholder="0.00" style={inputStyle} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="unit">Unidade de Venda *</label>
            <select id="unit" name="unit" value={form.unit} onChange={handleChange} style={inputStyle}>
              <option value="kg">Por Quilo (kg)</option>
              <option value="unidade">Por Unidade (un)</option>
              <option value="maco">Maço</option>
              <option value="bandeja">Bandeja</option>
              <option value="gramas">A cada 100g</option>
              <option value="caixa">Caixa</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="stock">Estoque Disponível *</label>
            <input id="stock" name="stock" type="number" min="0" required value={form.stock} onChange={handleChange} placeholder="Ex: 50" style={inputStyle} />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Imagem do Produto</label>
          <div style={{ border: '2px dashed #ccc', borderRadius: 12, padding: 24, textAlign: 'center', position: 'relative', background: '#fafafa' }}>
            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ position: 'absolute', top: -10, right: -10, background: '#fff', border: '1px solid #ccc', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <ImagePlus size={32} color="#999" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Clique ou arraste uma imagem aqui</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>JPG ou PNG até 5MB</p>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 15 }}>
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

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 15 }}>
            <input
              type="checkbox"
              name="is_organic"
              checked={form.is_organic}
              onChange={handleChange}
              style={{ width: 18, height: 18, accentColor: '#30852f' }}
            />
            Produto 100% Orgânico 🌱
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 15 }}>
            <input
              type="checkbox"
              name="is_promotion"
              checked={form.is_promotion}
              onChange={handleChange}
              style={{ width: 18, height: 18, accentColor: '#e11d48' }}
            />
            Oferta do Dia (Preço promocional) 💥
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || saved}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: saved ? '#2e7d32' : '#30852f',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '14px 28px',
            fontSize: 16,
            fontWeight: 700,
            cursor: loading || saved ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: 8,
          }}
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> Salvando…</>
          ) : saved ? (
            <><Check size={20} /> Salvo!</>
          ) : (
            'Cadastrar Produto'
          )}
        </button>
      </form>
    </div>
  );
}
