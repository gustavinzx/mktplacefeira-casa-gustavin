'use client';

import React, { useState } from 'react';
import {
  MapPin, Package, CheckCircle2, Clock, Navigation, Phone, Eye,
  DollarSign, TrendingUp, Star, Truck, ChevronRight, AlertCircle
} from 'lucide-react';
import Modal from '@/components/admin/Modal';

type DeliveryStatus = 'pendente' | 'a_caminho' | 'entregue' | 'problema';

interface Delivery {
  id: string;
  customer: string;
  phone: string;
  address: string;
  neighborhood: string;
  distance: string;
  eta: string;
  items: string[];
  value: number;
  status: DeliveryStatus;
  priority: boolean;
}

// Remove static deliveries

const statusConfig: Record<DeliveryStatus, { label: string; color: string; bg: string }> = {
  pendente: { label: 'Pendente', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  a_caminho: { label: 'A Caminho', color: 'text-blue-700', bg: 'bg-blue-50' },
  entregue: { label: 'Entregue', color: 'text-green-700', bg: 'bg-green-50' },
  problema: { label: 'Problema', color: 'text-red-600', bg: 'bg-red-50' },
};

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDelivery, setViewDelivery] = useState<Delivery | null>(null);
  const [problemModal, setProblemModal] = useState<Delivery | null>(null);
  const [problema, setProblema] = useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('/api/orders?type=delivery', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const mapped: Delivery[] = data.data.map((o: any) => {
            let s: DeliveryStatus = 'pendente';
            if (o.status === 'saiu_para_entrega') s = 'a_caminho';
            if (o.status === 'entregue') s = 'entregue';
            
            return {
              id: `#D-${o.id.substring(0, 4).toUpperCase()}`,
              customer: o.customer?.full_name || 'Cliente',
              phone: o.customer?.phone || '(00) 00000-0000',
              address: 'Endereço Completo',
              neighborhood: 'Bairro',
              distance: 'Aprox. 2.5 km',
              eta: '15 min',
              items: o.items?.map((i: any) => `${i.product?.title} (${i.quantity}x)`) || [],
              value: Number(o.total_amount),
              status: s,
              priority: o.total_amount > 100
            };
          });
          setDeliveries(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeDelivery = deliveries.find(d => d.status === 'a_caminho');
  const pending = deliveries.filter(d => d.status === 'pendente');
  const delivered = deliveries.filter(d => d.status === 'entregue');

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-[32px] font-black text-gray-900 leading-tight tracking-tight">Bom dia, Entregador!</h1>
        <p className="text-gray-500 font-medium mt-1">
          {loading ? 'Carregando entregas...' : `Você tem ${pending.length + (activeDelivery ? 1 : 0)} entregas para hoje.`}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Hoje', value: deliveries.filter(d => d.status !== 'problema').length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Concluídas', value: delivered.length, icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Ganhos Hoje', value: `R$ ${delivered.reduce((a, d) => a + d.value, 0).toFixed(0)}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Rating', value: '4.9 ★', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
              <p className="text-xl font-black text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Delivery */}
      {activeDelivery && (
        <div className="bg-[#125d30] rounded-[32px] p-7 text-white shadow-xl shadow-green-900/20">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Navigation size={16} />
            </div>
            <span className="font-black text-sm uppercase tracking-widest text-green-200">Em Rota Agora</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-5 justify-between">
            <div>
              <h3 className="text-2xl font-black mb-1">{activeDelivery.customer}</h3>
              <p className="text-white/70 font-medium flex items-center gap-1">
                <MapPin size={14} />{activeDelivery.address}, {activeDelivery.neighborhood}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="bg-white/20 px-3 py-1.5 rounded-xl text-sm font-black flex items-center gap-1">
                  <Clock size={14} />{activeDelivery.eta}
                </span>
                <span className="bg-white/20 px-3 py-1.5 rounded-xl text-sm font-black flex items-center gap-1">
                  <Navigation size={14} />{activeDelivery.distance}
                </span>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <a href={`tel:${activeDelivery.phone}`} className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all">
                <Phone size={20} />
              </a>
              <button
                onClick={() => setProblemModal(activeDelivery)}
                className="px-5 py-3 bg-white/20 rounded-2xl font-bold text-sm hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <AlertCircle size={16} /> Problema
              </button>
              <button className="px-5 py-3 bg-white text-green-800 rounded-2xl font-black text-sm hover:bg-green-50 transition-all flex items-center gap-2">
                <CheckCircle2 size={16} /> Confirmar Entrega
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Deliveries */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-50">
          <h2 className="text-lg font-black text-gray-900">Próximas Entregas</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {[...deliveries.filter(d => d.status === 'pendente'), ...deliveries.filter(d => d.status === 'entregue')].map(delivery => {
            const cfg = statusConfig[delivery.status];
            return (
              <div key={delivery.id} className="px-7 py-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  {delivery.priority && (
                    <div className="w-2 h-10 bg-[#fc6c29] rounded-full shrink-0" />
                  )}
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <Truck size={18} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-gray-900 text-sm">{delivery.customer}</p>
                      <span className="text-[10px] text-gray-400">{delivery.id}</span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />{delivery.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {delivery.status !== 'entregue' && (
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-400">{delivery.distance}</p>
                        <p className="text-xs font-bold text-gray-600">{delivery.eta}</p>
                      </div>
                    )}
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    <button onClick={() => setViewDelivery(delivery)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Ver Entrega */}
      <Modal isOpen={!!viewDelivery} onClose={() => setViewDelivery(null)} title={`Entrega ${viewDelivery?.id}`}>
        {viewDelivery && (
          <div className="space-y-5">
            <div className="p-5 bg-gray-50 rounded-[24px]">
              <p className="font-black text-gray-900 text-lg">{viewDelivery.customer}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone size={14} />{viewDelivery.phone}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={14} />{viewDelivery.address}, {viewDelivery.neighborhood}</p>
            </div>
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Itens da Entrega</p>
              <div className="space-y-2">
                {viewDelivery.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-[16px]">
                    <Package size={14} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 bg-green-50 border border-green-100 rounded-[24px] flex justify-between">
              <p className="font-black text-green-800">Valor</p>
              <p className="font-black text-green-800 text-lg">R$ {viewDelivery.value.toFixed(2).replace('.', ',')}</p>
            </div>
            {viewDelivery.status === 'pendente' && (
              <button className="w-full py-4 bg-[#125d30] text-white rounded-[20px] font-black shadow-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2">
                <Truck size={18} /> Iniciar Entrega
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL: Problema */}
      <Modal isOpen={!!problemModal} onClose={() => setProblemModal(null)} title="Reportar Problema">
        {problemModal && (
          <div className="space-y-5">
            <div className="p-4 bg-red-50 border border-red-100 rounded-[20px]">
              <p className="font-black text-red-800">{problemModal.customer}</p>
              <p className="text-sm text-red-600">{problemModal.address}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Tipo de Problema</label>
              <select className="w-full px-6 py-4 bg-gray-50 rounded-[20px] outline-none font-bold text-sm appearance-none">
                <option>Cliente ausente</option>
                <option>Endereço não encontrado</option>
                <option>Produto danificado</option>
                <option>Cliente recusou entrega</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Descrição</label>
              <textarea value={problema} onChange={e => setProblema(e.target.value)} placeholder="Descreva o ocorrido..."
                className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-red-400/40 focus:bg-white rounded-[24px] outline-none font-medium text-sm min-h-[100px] resize-none transition-all" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setProblemModal(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-900">Cancelar</button>
              <button className="flex-1 py-4 bg-red-600 text-white rounded-[20px] font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                <AlertCircle size={18} /> Reportar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
