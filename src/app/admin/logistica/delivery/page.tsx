'use client';

import { useState } from 'react';
import {
  Truck, CheckCircle2, AlertCircle, Clock, Phone, Eye,
  Star, DollarSign, TrendingUp, Navigation, MapPin
} from 'lucide-react';
import Modal from '@/components/admin/Modal';

interface Courier {
  id: string;
  name: string;
  phone: string;
  region: string;
  todayDeliveries: number;
  completedToday: number;
  earnings: number;
  rating: number;
  status: 'ativo' | 'em_rota' | 'parado' | 'inativo';
  vehicle: string;
}

const couriers: Courier[] = [
  { id: '#ENT-001', name: 'João Silva', phone: '(11) 9 8765-0001', region: 'Vila Mariana', todayDeliveries: 12, completedToday: 8, earnings: 156.00, rating: 4.9, status: 'em_rota', vehicle: 'Moto Honda CG 160' },
  { id: '#ENT-002', name: 'Maria Costa', phone: '(11) 9 8765-0002', region: 'Consolação', todayDeliveries: 9, completedToday: 9, earnings: 117.00, rating: 4.8, status: 'ativo', vehicle: 'Bike Elétrica' },
  { id: '#ENT-003', name: 'Carlos Dias', phone: '(11) 9 8765-0003', region: 'Moema', todayDeliveries: 15, completedToday: 7, earnings: 91.00, rating: 4.6, status: 'em_rota', vehicle: 'Moto Yamaha Factor' },
  { id: '#ENT-004', name: 'Aline Costa', phone: '(11) 9 8765-0004', region: 'Pinheiros', todayDeliveries: 11, completedToday: 4, earnings: 52.00, rating: 4.7, status: 'parado', vehicle: 'Bike Convencional' },
  { id: '#ENT-005', name: 'Ricardo Gomes', phone: '(11) 9 8765-0005', region: 'Lapa', todayDeliveries: 0, completedToday: 0, earnings: 0, rating: 4.5, status: 'inativo', vehicle: 'Moto Honda Pop' },
];

const statusConfig = {
  ativo: { label: 'Disponível', bg: 'bg-green-50', color: 'text-green-700', dot: 'bg-green-500' },
  em_rota: { label: 'Em Rota', bg: 'bg-blue-50', color: 'text-blue-700', dot: 'bg-blue-500' },
  parado: { label: 'Parado', bg: 'bg-yellow-50', color: 'text-yellow-700', dot: 'bg-yellow-500' },
  inativo: { label: 'Inativo', bg: 'bg-gray-50', color: 'text-gray-500', dot: 'bg-gray-400' },
};

export default function LogisticaDeliveryPage() {
  const [viewCourier, setViewCourier] = useState<Courier | null>(null);

  const active = couriers.filter(c => c.status !== 'inativo');
  const totalDeliveries = couriers.reduce((a, c) => a + c.completedToday, 0);
  const totalEarnings = couriers.reduce((a, c) => a + c.earnings, 0);
  const avgRating = (couriers.filter(c => c.rating > 0).reduce((a, c) => a + c.rating, 0) / couriers.filter(c => c.rating > 0).length).toFixed(1);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div>
        <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Painel Delivery</h1>
        <p className="text-gray-500 font-medium mt-1">Acompanhe os entregadores e o desempenho da frota em tempo real.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Entregadores Ativos', value: active.length, icon: Truck, bg: 'bg-green-50', color: 'text-green-700' },
          { label: 'Entregas Hoje', value: totalDeliveries, icon: CheckCircle2, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Ganhos da Frota', value: `R$ ${totalEarnings.toFixed(0)}`, icon: DollarSign, bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Rating Médio', value: `${avgRating} ★`, icon: Star, bg: 'bg-yellow-50', color: 'text-yellow-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
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

      {/* Couriers Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-50 flex justify-between items-center">
          <h2 className="font-black text-gray-900">Equipe de Entregadores</h2>
          <div className="flex gap-2">
            {['todos', 'em_rota', 'ativo', 'parado'].map(s => (
              <button key={s} className="px-3 py-1.5 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all capitalize">
                {s === 'todos' ? 'Todos' : statusConfig[s as keyof typeof statusConfig]?.label ?? s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                {['Entregador', 'Região', 'Veículo', 'Entregas Hoje', 'Ganhos', 'Rating', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {couriers.map(c => {
                const cfg = statusConfig[c.status];
                const pct = c.todayDeliveries > 0 ? (c.completedToday / c.todayDeliveries) * 100 : 0;
                return (
                  <tr key={c.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-600 text-sm shrink-0">
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm">{c.name}</p>
                          <p className="text-[11px] text-gray-400">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      <p className="text-sm font-bold text-gray-600 flex items-center gap-1"><MapPin size={11} className="text-gray-400" />{c.region}</p>
                    </td>
                    <td className="px-7 py-5">
                      <p className="text-sm font-bold text-gray-600">{c.vehicle}</p>
                    </td>
                    <td className="px-7 py-5">
                      <p className="font-black text-gray-900 text-sm mb-1">{c.completedToday}/{c.todayDeliveries}</p>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#125d30] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      <p className="font-black text-green-700">R$ {c.earnings.toFixed(2).replace('.', ',')}</p>
                    </td>
                    <td className="px-7 py-5">
                      <p className="font-bold text-yellow-600 text-sm">{c.rating > 0 ? `${c.rating} ★` : '—'}</p>
                    </td>
                    <td className="px-7 py-5">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black w-fit ${cfg.bg} ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${c.status === 'em_rota' ? 'animate-pulse' : ''}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex gap-2">
                        <a href={`tel:${c.phone}`} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-green-700 hover:bg-green-50 transition-all">
                          <Phone size={14} />
                        </a>
                        <button onClick={() => setViewCourier(c)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Ver Entregador */}
      <Modal isOpen={!!viewCourier} onClose={() => setViewCourier(null)} title={viewCourier?.name ?? ''}>
        {viewCourier && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[24px]">
              <div className="w-14 h-14 bg-[#125d30] rounded-2xl flex items-center justify-center text-white font-black text-xl">
                {viewCourier.name[0]}
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg">{viewCourier.name}</p>
                <p className="text-sm text-gray-500">{viewCourier.phone} · {viewCourier.vehicle}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={13} />{viewCourier.region}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Entregas Hoje', value: `${viewCourier.completedToday}/${viewCourier.todayDeliveries}` },
                { label: 'Ganhos Hoje', value: `R$ ${viewCourier.earnings.toFixed(2).replace('.', ',')}` },
                { label: 'Rating Geral', value: viewCourier.rating > 0 ? `${viewCourier.rating} ★` : '—' },
                { label: 'Status Atual', value: statusConfig[viewCourier.status].label },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-gray-50 rounded-[20px]">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="font-black text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <a href={`tel:${viewCourier.phone}`} className="flex-1 py-4 bg-green-50 text-green-700 rounded-[20px] font-bold flex items-center justify-center gap-2 hover:bg-green-700 hover:text-white transition-all">
                <Phone size={16} /> Ligar
              </a>
              <button className="flex-1 py-4 bg-[#125d30] text-white rounded-[20px] font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-all shadow-lg">
                <Navigation size={16} /> Ver no Mapa
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
