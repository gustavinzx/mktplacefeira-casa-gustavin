'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Map, MapPin, Navigation, Clock } from 'lucide-react';

export default function RotasPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeliveries() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      try {
        const res = await fetch('/api/orders?limit=50', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const orders = Array.isArray(data.data) ? data.data : (data.data?.orders || []);
          const active = orders.filter((o: any) => o.status === 'saiu_para_entrega');
          setDeliveries(active);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeliveries();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12 text-[#125d30]">
        <Clock size={32} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-black text-gray-900">Rotas do Dia</h1>
        <p className="text-gray-500">Visualize a sequência otimizada das suas entregas atuais.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
          <Map size={48} className="text-gray-400 mb-4" />
          <h3 className="font-black text-gray-700 text-lg">Integração Maps pendente</h3>
          <p className="text-gray-500 text-sm mt-2">A visualização do mapa em tempo real será ativada com a chave de API do Google Maps.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <Navigation size={18} className="text-[#125d30]" /> Próximas Paradas
          </h3>

          {deliveries.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Nenhuma parada ativa (você não possui pedidos com status "A Caminho").</p>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
              {deliveries.map((delivery, index) => (
                <div key={delivery.id} className="relative pl-6">
                  <span className="absolute -left-[11px] bg-white border-2 border-[#125d30] text-[#125d30] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                    {index + 1}
                  </span>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1">Pedido #{delivery.id.slice(0,8).toUpperCase()}</p>
                    <p className="font-bold text-gray-900 text-sm flex items-start gap-1">
                      <MapPin size={14} className="shrink-0 mt-0.5 text-gray-400" /> Endereço do Cliente
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
