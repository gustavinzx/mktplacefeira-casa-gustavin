import { useCurrentUser } from '@/hooks/useCurrentUser';
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Heart, Store, ArrowRight, TrendingDown,
  Clock, Package, ChevronRight, Loader2, RefreshCw,
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: { name: string; producer?: string }[];
}

// ── Static fallback offers ────────────────────────────────────────────────────

const OFERTAS_DO_DIA = [
  { id: 'o1', title: 'Cesta Orgânica da Semana',  price: 49.90, oldPrice: 65.00, unit: 'cesta', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop', producer: 'Sítio Recanto Feliz', isOrganic: true, tags: ['Oferta Especial', '-23%'] },
  { id: 'o2', title: 'Morango Especial (Bandeja)', price: 12.50, oldPrice: 18.00, unit: 'bdj',   imageUrl: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?q=80&w=600&auto=format&fit=crop', producer: 'Frutas da Serra',    tags: ['Mais Vendido', '-30%'] },
  { id: 'o3', title: 'Queijo Canastra Artesanal', price: 35.00, oldPrice: 45.00, unit: 'un',    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=600&auto=format&fit=crop', producer: 'Laticínios Minas',  tags: ['Oferta Limitada'] },
  { id: 'o4', title: 'Mix de Folhas Selecionadas',price: 5.90,  oldPrice: 8.50,  unit: 'pct',   imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=600&auto=format&fit=crop', producer: 'Horta da Maria',   isOrganic: true, tags: ['-30%'] },
];

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  pending:      { label: 'Pendente',      color: 'text-yellow-700', bg: 'bg-yellow-50' },
  confirmed:    { label: 'Confirmado',    color: 'text-blue-700',   bg: 'bg-blue-50'   },
  preparing:    { label: 'Preparando',    color: 'text-orange-700', bg: 'bg-orange-50' },
  in_transit:   { label: 'Em Transporte', color: 'text-blue-600',   bg: 'bg-blue-50'   },
  delivered:    { label: 'Entregue',      color: 'text-green-700',  bg: 'bg-green-50'  },
  cancelled:    { label: 'Cancelado',     color: 'text-red-700',    bg: 'bg-red-50'    },
  em_transporte:{ label: 'Em Transporte', color: 'text-blue-600',   bg: 'bg-blue-50'   },
  entregue:     { label: 'Entregue',      color: 'text-green-700',  bg: 'bg-green-50'  },
  cancelado:    { label: 'Cancelado',     color: 'text-red-700',    bg: 'bg-red-50'    },
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsuarioDashboard() {
  const [userName, setUserName]       = useState('');
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loadingOrders, setLoading]   = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [userId, setUserId]           = useState<string | null>(null);

  // ── Load user from Supabase session ─────────────────────────────────────────
  useEffect(() => {
    const cached = localStorage.getItem('user_name') || 'Comprador';
    setUserName(cached);

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        const meta  = user.user_metadata;
        const name  = meta?.full_name || meta?.name || cached;
        setUserName(name);
        setUserId(user.id);
        localStorage.setItem('user_name', name);
        localStorage.setItem('user_id',   user.id);
      } else {
        const id = localStorage.getItem('user_id');
        if (id) setUserId(id);
      }
    });
  }, []);

  // ── Fetch orders ─────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const { data, count } = await supabase
        .from('mktplace_feira_user_orders')
        .select('id, created_at, status, total_amount, items', { count: 'exact' })
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        setOrders(
          data.map((o: any) => ({
            id:           o.id,
            created_at:   o.created_at,
            status:       o.status ?? 'pending',
            total_amount: typeof o.total_amount === 'number' ? o.total_amount : 0,
            items:        Array.isArray(o.items) ? o.items : [],
          }))
        );
        setTotalOrders(count ?? 0);
      }
    } catch (e) {
      console.error('Erro ao buscar pedidos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchOrders(userId);
  }, [userId, fetchOrders]);

  const firstName = userName.split(' ')[0] || 'Comprador';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto animate-in fade-in duration-500 font-sans">

      {/* Header & Metrics */}
      <div className="mb-10 flex flex-col lg:flex-row justify-between lg:items-end gap-6">
        <div>
          <h1 className="text-[32px] font-black text-[#1b1c19] tracking-tight leading-none mb-2">
            Olá, {firstName}!
          </h1>
          <p className="text-[#707a6f] font-medium text-base">
            Bem-vindo ao seu painel. Confira suas métricas e ofertas exclusivas.
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-white border border-[#bfc9bd]/30 p-4 rounded-2xl min-w-[140px] flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#707a6f] mb-1">
              <ShoppingBag size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Compras</span>
            </div>
            <p className="text-2xl font-black text-[#0b612e]">
              {loadingOrders ? '—' : totalOrders}
            </p>
          </div>
          <div className="bg-white border border-[#bfc9bd]/30 p-4 rounded-2xl min-w-[140px] flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#707a6f] mb-1">
              <Store size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Lojas Apoiadas</span>
            </div>
            <p className="text-2xl font-black text-[#0b612e]">
              {orders.length > 0
                ? new Set(orders.flatMap(o => o.items.map(i => i.producer).filter(Boolean))).size || '—'
                : '—'}
            </p>
          </div>
          <div className="bg-white border border-[#bfc9bd]/30 p-4 rounded-2xl min-w-[140px] flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#707a6f] mb-1">
              <Heart size={16} className="text-red-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Favoritos</span>
            </div>
            <p className="text-2xl font-black text-[#0b612e]">—</p>
          </div>
        </div>
      </div>

      {/* Premium Banner */}
      <div className="w-full h-[200px] sm:h-[260px] rounded-[32px] overflow-hidden shadow-sm mb-12 bg-[#f0f0e8] border border-[#bfc9bd]/30 relative">
        <img
          src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=1200&auto=format&fit=crop"
          alt="Banner de Comunicação"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      {/* Carousel: Receitas & Feiras */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-[#1b1c19]">Descobrir Novas Feiras & Receitas</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {[
            { id: 1, title: 'Risoto de Cogumelos Frescos', chef: 'Chef Helena', img: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=400&auto=format&fit=crop' },
            { id: 2, title: 'Salada de Frutas Vermelhas',  chef: 'Chef Marcos', img: 'https://images.unsplash.com/photo-1490818387583-1b5ba479818e?q=80&w=400&auto=format&fit=crop' },
            { id: 3, title: 'Bolo de Milho Verde',         chef: 'Dona Maria',  img: 'https://images.unsplash.com/photo-1600289031464-74d374b64991?q=80&w=400&auto=format&fit=crop' },
            { id: 4, title: 'Peixe Grelhado com Legumes',  chef: 'Chef João',   img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop' },
          ].map(item => (
            <Link href="/recipe" key={item.id}
              className="min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] bg-white rounded-[24px] border border-[#bfc9bd]/30 overflow-hidden snap-center shrink-0 group shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-[160px] overflow-hidden">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#1b1c19] text-base">{item.title}</h3>
                  <p className="text-sm text-[#707a6f] mt-0.5">Por {item.chef}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#f0f0e8] flex items-center justify-center text-[#0e6b17] group-hover:bg-[#0e6b17] group-hover:text-white transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Ofertas + Pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

        {/* Ofertas */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-[#1b1c19] flex items-center gap-2">
              <TrendingDown className="text-[#ff6b00]" size={24} /> Ofertas do Dia
            </h2>
            <Link href="/" className="text-[#0e6b17] font-bold text-sm hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {OFERTAS_DO_DIA.map((produto) => (
              <ProductCard key={produto.id} {...produto} />
            ))}
          </div>
        </div>

        {/* Últimos Pedidos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-[#1b1c19] flex items-center gap-2">
              <Clock className="text-[#0e6b17]" size={24} /> Últimos Pedidos
            </h2>
            <div className="flex items-center gap-2">
              {userId && (
                <button
                  onClick={() => fetchOrders(userId)}
                  className="p-1.5 text-[#707a6f] hover:text-[#0e6b17] rounded-lg transition-colors"
                  title="Atualizar"
                >
                  {loadingOrders ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                </button>
              )}
              <Link href="/portal/usuario/pedidos" className="text-[#0e6b17] font-bold text-sm hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-[#bfc9bd]/30 overflow-hidden shadow-sm">
            {loadingOrders ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-[#0e6b17]" />
              </div>
            ) : orders.length > 0 ? (
              orders.map((pedido, index) => {
                const s = STATUS_STYLE[pedido.status] ?? STATUS_STYLE['pending'];
                const firstItem = pedido.items?.[0];
                const vendorName = firstItem?.producer || 'Feirante';
                return (
                  <Link
                    href={`/portal/usuario/pedidos/${pedido.id}`}
                    key={pedido.id}
                    className={`block p-4 hover:bg-[#f6f6f2] transition-colors ${index !== orders.length - 1 ? 'border-b border-[#bfc9bd]/20' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-[#707a6f] tracking-wider uppercase">
                        Pedido #{pedido.id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${s.bg} ${s.color}`}>
                        {s.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-[#1b1c19] text-sm flex items-center gap-1.5">
                          <Store size={14} className="text-[#0e6b17]" /> {vendorName}
                        </h3>
                        <p className="text-xs text-[#707a6f] font-medium mt-0.5">
                          {fmtDate(pedido.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-[#1b1c19] text-sm">
                          R$ {pedido.total_amount.toFixed(2).replace('.', ',')}
                        </span>
                        <ChevronRight size={16} className="text-[#bfc9bd]" />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              /* Empty state */
              <div className="p-8 text-center">
                <Package size={32} className="text-[#bfc9bd] mx-auto mb-3" />
                <p className="font-bold text-[#707a6f] text-sm">Nenhum pedido ainda</p>
                <p className="text-xs text-[#bfc9bd] mt-1 font-medium">Explore as feiras e faça seu primeiro pedido!</p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0e6b17] text-white rounded-xl font-bold text-sm hover:bg-[#0b612e] transition-colors"
                >
                  <Store size={14} /> Ir às Feiras
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
