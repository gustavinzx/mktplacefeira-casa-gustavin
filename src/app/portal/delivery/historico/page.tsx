'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Clock, CalendarDays } from 'lucide-react';

export default function HistoricoPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      try {
        const res = await fetch('/api/orders?limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const orders = Array.isArray(data.data) ? data.data : (data.data?.orders || []);
          const past = orders.filter((o: any) => o.status === 'entregue' || o.status === 'cancelado');
          setHistory(past);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
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
        <h1 className="text-2xl font-black text-gray-900">Histórico de Entregas</h1>
        <p className="text-gray-500">Acompanhe suas entregas concluídas.</p>
      </header>

      {history.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <CalendarDays size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">Sem histórico</h3>
          <p className="text-gray-500">Você ainda não concluiu nenhuma entrega.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4 font-black">Data/Hora</th>
                <th className="px-6 py-4 font-black">Pedido</th>
                <th className="px-6 py-4 font-black text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">
                    {new Date(item.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    #{item.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      item.status === 'entregue' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'entregue' ? <CheckCircle2 size={14} /> : null}
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
