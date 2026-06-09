'use client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Package, Store, Calendar, ChevronRight,
  Loader2, ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: { name: string; qty?: number; price?: number; producer?: string }[];
}

// ── Status styles ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:      { label: 'Pendente',      color: 'text-yellow-700', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  confirmed:    { label: 'Confirmado',    color: 'text-blue-700',   bg: 'bg-blue-50',   dot: 'bg-blue-500'   },
  preparing:    { label: 'Preparando',    color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  in_transit:   { label: 'Em Transporte', color: 'text-sky-700',    bg: 'bg-sky-50',    dot: 'bg-sky-500'    },
  em_transporte:{ label: 'Em Transporte', color: 'text-sky-700',    bg: 'bg-sky-50',    dot: 'bg-sky-500'    },
  delivered:    { label: 'Entregue',      color: 'text-green-700',  bg: 'bg-green-50',  dot: 'bg-green-600'  },
  entregue:     { label: 'Entregue',      color: 'text-green-700',  bg: 'bg-green-50',  dot: 'bg-green-600'  },
  cancelled:    { label: 'Cancelado',     color: 'text-red-700',    bg: 'bg-red-50',    dot: 'bg-red-500'    },
  cancelado:    { label: 'Cancelado',     color: 'text-red-700',    bg: 'bg-red-50',    dot: 'bg-red-500'    },
};

const DEFAULT_S = { label: 'Em processamento', color: 'text-gray-600', bg: 'bg-gray-50', dot: 'bg-gray-400' };

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? DEFAULT_S;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.bg} ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MeusPedidosPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { id: userId } = useCurrentUser();
  const [filter, setFilter]   = useState<'todos' | 'em_aberto' | 'entregues' | 'cancelados'>('todos');

  const fetchOrders = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mktplace_feira_user_orders')
        .select('id, created_at, status, total_amount, items')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (data) {
        setOrders(
          data.map((o: any) => ({
            id:           o.id,
            created_at:   o.created_at,
            status:       o.status ?? 'pending',
            total_amount: typeof o.total_amount === 'number' ? o.total_amount : 0,
            items:        Array.isArray(o.items) ? o.items : [],
          }))
        );
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (userId) fetchOrders(userId);
  }, [userId, fetchOrders]);

  const filtered = orders.filter(o => {
    if (filter === 'em_aberto')  return ['pending','confirmed','preparing','in_transit','em_transporte'].includes(o.status);
    if (filter === 'entregues')  return ['delivered','entregue'].includes(o.status);
    if (filter === 'cancelados') return ['cancelled','cancelado'].includes(o.status);
    return true;
  });

  return (
    <div className="p-8 pb-32 max-w-4xl mx-auto animate-in fade-in duration-500 font-sans">

      {/* Header */}
      <div className="mb-8">
        <Link href="/portal/usuario" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-700 mb-4 transition-colors w-fit">
          <ArrowLeft size={15} /> Voltar ao início
        </Link>
        <h1 className="text-[32px] font-black text-[#1b1c19] tracking-tight leading-none mb-2">Meus Pedidos</h1>
        <p className="text-[#707a6f] font-medium text-sm">Acompanhe o status das suas compras e histórico completo.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 w-fit mb-8 overflow-x-auto">
        {([
          { key: 'todos',      label: `Todos (${orders.length})` },
          { key: 'em_aberto',  label: 'Em andamento' },
          { key: 'entregues',  label: 'Entregues' },
          { key: 'cancelados', label: 'Cancelados' },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              filter === f.key ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="text-green-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-gray-100 py-20 text-center">
          <ShoppingBag size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
            {orders.length === 0 ? 'Nenhum pedido ainda' : 'Nenhum pedido nesta categoria'}
          </p>
          {orders.length === 0 && (
            <Link href="/"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-2xl font-black text-sm hover:bg-green-800 transition-colors"
            >
              <Store size={16} /> Explorar feiras
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const itemCount = order.items.length;
            const producers = [...new Set(order.items.map((i: any) => i.producer).filter(Boolean))];

            return (
              <Link
                key={order.id}
                href={`/portal/usuario/pedidos/${order.id}`}
                className="block bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Package size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-black text-gray-900">
                          Pedido #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {fmtDate(order.created_at)}
                        </span>
                        {itemCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Package size={11} /> {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                          </span>
                        )}
                        {producers.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Store size={11} />
                            {(producers as string[]).slice(0, 2).join(', ')}
                            {producers.length > 2 ? ` +${producers.length - 2}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base font-black text-green-700">
                      R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                    </span>
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
