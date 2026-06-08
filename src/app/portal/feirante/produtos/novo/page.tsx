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
