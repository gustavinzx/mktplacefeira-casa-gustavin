'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Package, Store, CreditCard, MapPin,
  Loader2, AlertCircle, Truck, CheckCircle2, Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  qty?: number;
  price?: number;
  producer?: string;
}

interface OrderDetail {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  delivery_fee?: number;
  items: OrderItem[];
  delivery_address?: string;
  payment_method?: string;
  producer_name?: string;
}

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:      { label: 'Aguardando confirmação', color: 'text-yellow-700', bg: 'bg-yellow-50', icon: <Clock size={16} /> },
  confirmed:    { label: 'Pedido confirmado',      color: 'text-blue-700',   bg: 'bg-blue-50',   icon: <CheckCircle2 size={16} /> },
  preparing:    { label: 'Preparando seu pedido',  color: 'text-orange-700', bg: 'bg-orange-50', icon: <Package size={16} /> },
  in_transit:   { label: 'Saiu para entrega',      color: 'text-sky-700',    bg: 'bg-sky-50',    icon: <Truck size={16} /> },
  em_transporte:{ label: 'Saiu para entrega',      color: 'text-sky-700',    bg: 'bg-sky-50',    icon: <Truck size={16} /> },
  delivered:    { label: 'Pedido entregue',         color: 'text-green-700',  bg: 'bg-green-50',  icon: <CheckCircle2 size={16} /> },
  entregue:     { label: 'Pedido entregue',         color: 'text-green-700',  bg: 'bg-green-50',  icon: <CheckCircle2 size={16} /> },
  cancelled:    { label: 'Pedido cancelado',        color: 'text-red-700',    bg: 'bg-red-50',    icon: <AlertCircle size={16} /> },
  cancelado:    { label: 'Pedido cancelado',        color: 'text-red-700',    bg: 'bg-red-50',    icon: <AlertCircle size={16} /> },
};

const DEFAULT_S = { label: 'Em processamento', color: 'text-gray-600', bg: 'bg-gray-50', icon: <Clock size={16} /> };

function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DetalhesPedido() {
  const params   = useParams();
  const orderId  = params.id as string;
  const [order, setOrder]   = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    supabase
      .from('mktplace_feira_user_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setNotFound(true); }
        else {
          setOrder({
            id:               data.id,
            created_at:       data.created_at,
            status:           data.status ?? 'pending',
            total_amount:     typeof data.total_amount === 'number' ? data.total_amount : 0,
            delivery_fee:     typeof data.delivery_fee === 'number' ? data.delivery_fee : undefined,
            items:            Array.isArray(data.items) ? data.items : [],
            delivery_address: data.delivery_address ?? undefined,
            payment_method:   data.payment_method ?? undefined,
            producer_name:    data.producer_name ?? undefined,
          });
        }
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-green-600 animate-spin" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="p-8 pb-32 max-w-3xl mx-auto font-['Plus_Jakarta_Sans']">
        <Link href="/portal/usuario/pedidos" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-700 mb-6 transition-colors w-fit">
          <ArrowLeft size={15} /> Meus Pedidos
        </Link>
        <div className="bg-white rounded-[32px] border border-gray-100 py-20 text-center">
          <AlertCircle size={40} className="text-red-300 mx-auto mb-4" />
          <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Pedido não encontrado</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_STYLE[order.status] ?? DEFAULT_S;
  const subtotal   = order.total_amount - (order.delivery_fee ?? 0);

  return (
    <div className="p-8 pb-32 max-w-3xl mx-auto animate-in fade-in duration-500 font-['Plus_Jakarta_Sans']">

      {/* Header */}
      <div className="mb-8">
        <Link href="/portal/usuario/pedidos" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-700 mb-4 transition-colors w-fit">
          <ArrowLeft size={15} /> Meus Pedidos
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-black text-[#1b1c19] tracking-tight">
              Pedido #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-[#707a6f] font-medium mt-1 text-sm">
              Realizado em {fmtDateTime(order.created_at)}
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black ${statusInfo.bg} ${statusInfo.color}`}>
            {statusInfo.icon} {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">

        {/* Vendor row */}
        {order.producer_name && (
          <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <div className="w-12 h-12 bg-white rounded-full border border-gray-100 flex items-center justify-center text-green-600">
              <Store size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Vendido por</p>
              <h2 className="text-base font-black text-gray-900">{order.producer_name}</h2>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
            <Package size={14} /> Itens do Pedido
          </h3>
          {order.items.length === 0 ? (
            <p className="text-sm text-gray-400 font-medium">Detalhes dos itens não disponíveis.</p>
          ) : (
            <div className="space-y-4">
              {order.items.map((item, i) => {
                const qty   = item.qty ?? 1;
                const price = item.price ?? 0;
                return (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-green-50 text-green-700 font-black flex items-center justify-center text-xs">
                        {qty}x
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.name}</p>
                        {item.producer && (
                          <p className="text-[10px] text-gray-400 font-medium">{item.producer}</p>
                        )}
                      </div>
                    </div>
                    {price > 0 && (
                      <span className="text-sm font-black text-gray-900">
                        R$ {(price * qty).toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Address + Payment */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100 bg-gray-50/30">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
              <MapPin size={11} /> Endereço de Entrega
            </h3>
            <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line">
              {order.delivery_address ?? 'Endereço não registrado'}
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
              <CreditCard size={11} /> Pagamento
            </h3>
            <p className="text-sm text-gray-700 font-medium">
              {order.payment_method ?? 'Não registrado'}
            </p>
          </div>
        </div>

        {/* Totals */}
        <div className="p-6 md:p-8">
          {order.delivery_fee !== undefined && order.delivery_fee > 0 && (
            <>
              <div className="flex justify-between items-center mb-2 text-sm font-medium text-gray-500">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center mb-5 text-sm font-medium text-gray-500">
                <span>Taxa de Entrega</span>
                <span>R$ {order.delivery_fee.toFixed(2).replace('.', ',')}</span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center pt-5 border-t border-gray-100">
            <span className="text-base font-black text-gray-900">Total</span>
            <span className="text-2xl font-black text-green-700">
              R$ {order.total_amount.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
