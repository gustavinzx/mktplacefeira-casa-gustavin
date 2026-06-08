'use client';

import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Navigation, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DeliveryDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    enRoute: 0,
    delivered: 0,
    total: 0
  });
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/orders?limit=50', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const orders = Array.isArray(data.data) ? data.data : (data.data?.orders || []);
          
          setStats({
            pending: orders.filter((o: any) => o.status === 'pago' || o.status === 'preparando' || o.status === 'pendente').length,
            enRoute: orders.filter((o: any) => o.status === 'saiu_para_entrega').length,
            delivered: orders.filter((o: any) => o.status === 'entregue').length,
            total: orders.length
          });

          const active = orders.filter((o: any) => o.status === 'saiu_para_entrega').slice(0, 5);
          setActiveDeliveries(active);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin text-[#125d30]">
          <Clock size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Resumo do Dia</h1>
        <p className="text-gray-500">Acompanhe seu progresso e entregas em andamento.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
              <Package size={20} />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase">Pendentes</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.pending}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Truck size={20} />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase">A Caminho</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.enRoute}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase">Entregues</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.delivered}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-50 text-gray-600 rounded-xl">
              <Navigation size={20} />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase">Total Hoje</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Truck size={18} className="text-[#125d30]" /> Próximas Entregas Ativas
          </h2>
          <Link href="/portal/delivery/entregas" className="text-sm font-bold text-[#125d30] hover:underline flex items-center">
            Ver todas <ChevronRight size={16} />
          </Link>
        </div>
        
        {activeDeliveries.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Tudo limpo!</h3>
            <p className="text-gray-500 text-sm">Você não tem entregas ativas (A Caminho) no momento.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase tracking-wide">
                      Em Trânsito
                    </span>
                    <span className="text-sm font-bold text-gray-900">Pedido #{delivery.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    Cliente aguardando. Endereço cadastrado na base.
                  </p>
                </div>
                <Link href="/portal/delivery/entregas" className="p-2 text-[#125d30] bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <Navigation size={20} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#125d30] text-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 className="font-black text-lg">Aviso Logístico</h3>
          <p className="text-green-100 text-sm mt-1">Lembre-se de confirmar a entrega apenas quando o pacote estiver nas mãos do cliente.</p>
        </div>
      </div>
    </div>
  );
}
