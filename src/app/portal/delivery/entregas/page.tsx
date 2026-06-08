'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, MapPin, CheckCircle2, Clock, Navigation, AlertCircle, Phone } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function EntregasPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    try {
      // Pega ordens que estão como saiu_para_entrega, pendente, pago ou preparando
      const res = await fetch('/api/orders?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const orders = Array.isArray(data.data) ? data.data : (data.data?.orders || []);
        const active = orders.filter((o: any) => ['saiu_para_entrega', 'pago', 'preparando', 'pendente'].includes(o.status));
        // Sort by status: saiu_para_entrega first
        active.sort((a: any, b: any) => {
          if (a.status === 'saiu_para_entrega' && b.status !== 'saiu_para_entrega') return -1;
          if (a.status !== 'saiu_para_entrega' && b.status === 'saiu_para_entrega') return 1;
          return 0;
        });
        setDeliveries(active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('mktplace_feira_orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      showToast(`Status atualizado para ${newStatus.replace(/_/g, ' ')}`, 'success');
      
      // Update local state
      if (newStatus === 'entregue') {
        setDeliveries(prev => prev.filter(d => d.id !== id));
      } else {
        setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
      }
    } catch (err: any) {
      showToast('Erro ao atualizar: ' + err.message, 'error');
    } finally {
      setUpdating(null);
    }
  };

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
        <h1 className="text-2xl font-black text-gray-900">Entregas Ativas</h1>
        <p className="text-gray-500">Mude o status dos pedidos e navegue até os clientes.</p>
      </header>

      {deliveries.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 text-[#125d30]">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">Sua fila está vazia!</h3>
          <p className="text-gray-500">Não há entregas alocadas para você no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map(delivery => (
            <div key={delivery.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      delivery.status === 'saiu_para_entrega' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-bold text-gray-500">#{delivery.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <h3 className="font-black text-lg text-gray-900">Cliente via Feira</h3>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#125d30] text-lg">
                    R$ {Number(delivery.total_amount).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl mb-4 space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Endereço de Entrega</p>
                    <p className="text-sm text-gray-600">Verifique os detalhes no painel do administrador (Endereço mascarado para testes)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Phone size={18} className="text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-600">Ligar para cliente</p>
                </div>
              </div>

              <div className="flex gap-2">
                {delivery.status !== 'saiu_para_entrega' && (
                  <button
                    onClick={() => handleStatusUpdate(delivery.id, 'saiu_para_entrega')}
                    disabled={updating === delivery.id}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Truck size={18} /> Iniciar Rota
                  </button>
                )}
                
                {delivery.status === 'saiu_para_entrega' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(delivery.id, 'entregue')}
                      disabled={updating === delivery.id}
                      className="flex-1 bg-[#125d30] hover:bg-[#0d4523] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {updating === delivery.id ? <Clock size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      Marcar Entregue
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(delivery.id, 'problema')}
                      disabled={updating === delivery.id}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 rounded-xl transition-colors flex items-center justify-center"
                      title="Reportar Problema"
                    >
                      <AlertCircle size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
