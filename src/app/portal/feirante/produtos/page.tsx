'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Edit2, Trash2, Package } from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';

interface Product {
  id: string;
  title: string;
  price: number;
  unit: string;
  stock: number;
  is_organic: boolean;
  image_url?: string;
}

export default function FeiranteProdutosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session) {
          if (active) router.push('/login');
          return;
        }

        const uid = session.user.id;
        if (active) setUserId(uid);

        const { data, error: fetchError } = await supabase
          .from(getTableName('products'))
          .select('*')
          .eq('producer_id', uid)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (active) setProducts(data || []);
      } catch (err: any) {
        console.error('Erro ao carregar produtos:', err);
        if (active) setError('Não foi possível carregar o seu catálogo.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProducts();
    return () => { active = false; };
  }, [router]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o produto "${title}"? Essa ação é irreversível.`)) return;

    try {
      const { error } = await supabase.from(getTableName('products')).delete().eq('id', id);
      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      console.error('Erro ao deletar produto:', e);
      alert('Erro de conexão ao tentar remover: ' + (e.message || 'Erro desconhecido.'));
    }
  };

  return (
    <div style={{ padding: '32px 40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Meus Produtos</h1>
          <p style={{ color: '#666' }}>
            {loading ? 'Carregando…' : `${products.length} produto${products.length !== 1 ? 's' : ''} no seu catálogo`}
          </p>
        </div>
        <Link
          href="/portal/feirante/produtos/novo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#30852f',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <Plus size={18} /> Novo produto
        </Link>
      </header>

      {error && <p style={{ color: '#ba1a1a', padding: '16px', background: '#ffebee', borderRadius: 8, marginBottom: 24, fontWeight: 500 }}>{error}</p>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#30852f' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#666', background: 'white', borderRadius: 16, boxShadow: 'var(--shadow-1)' }}>
              <Package size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: 16, marginBottom: 16 }}>Nenhum produto cadastrado ainda.</p>
              <Link href="/portal/feirante/produtos/novo" style={{ padding: '12px 24px', background: '#30852f', color: 'white', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>
                + Cadastrar meu primeiro produto
              </Link>
            </div>
          ) : (
            products.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: 12,
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                      <Package size={24} />
                    </div>
                  )}
                  <div>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.title}
                      {p.is_organic && (
                        <span style={{ fontSize: 11, background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 100 }}>
                          Orgânico
                        </span>
                      )}
                    </strong>
                    <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                      R$ {Number(p.price).toFixed(2)} / {p.unit} · Estoque: {p.stock} {p.stock <= 0 && <span style={{ color: '#ba1a1a', fontWeight: 'bold' }}>⚠ Sem estoque</span>}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Link href={`/portal/feirante/produtos/${p.id}/editar`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd',
                    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#444', textDecoration: 'none'
                  }}>
                    <Edit2 size={14} /> Editar
                  </Link>
                  <Link
                    href={`/product/${p.id}`}
                    target="_blank"
                    style={{
                      padding: '8px 14px',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#555',
                      textDecoration: 'none',
                    }}
                  >
                    Ver
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: 8,
                      background: '#fee2e2',
                      color: '#b91c1c',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Excluir Produto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
