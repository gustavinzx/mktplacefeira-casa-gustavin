'use client';

import React, { useState } from 'react';
import {
  Truck, MapPin, Clock, CheckCircle2, AlertCircle, Phone, Eye,
  Package, TrendingUp, Users, Navigation
} from 'lucide-react';
import Modal from '@/components/admin/Modal';

interface Route {
  id: string;
  courier: string;
  avatar: string;
  zone: string;
  deliveries: number;
  done: number;
  status: 'ativo' | 'atrasado' | 'concluido';
  eta: string;
  phone: string;
}

const routes: Route[] = [
  { id: '#RT-041', courier: 'Lucas Mendes', avatar: 'L', zone: 'Vila Mariana / Saúde', deliveries: 12, done: 7, status: 'ativo', eta: '14:30', phone: '(11) 9 8765-0001' },
  { id: '#RT-042', courier: 'Fernanda Ramos', avatar: 'F', zone: 'Consolação / Bela Vista', deliveries: 9, done: 9, status: 'concluido', eta: '—', phone: '(11) 9 8765-0002' },
  { id: '#RT-043', courier: 'Carlos Dias', avatar: 'C', zone: 'Moema / Ibirapuera', deliveries: 15, done: 8, status: 'atrasado', eta: '15:10', phone: '(11) 9 8765-0003' },
  { id: '#RT-044', courier: 'Aline Costa', avatar: 'A', zone: 'Pinheiros / Alto de Pinheiros', deliveries: 11, done: 4, status: 'ativo', eta: '15:45', phone: '(11) 9 8765-0004' },
];

const statusCfg = {
  ativo: { label: 'Em Rota', bg: 'bg-blue-50', color: 'text-blue-700' },
  atrasado: { label: 'Atrasado', bg: 'bg-red-50', color: 'text-red-600' },
  concluido: { label: 'Concluído', bg: 'bg-green-50', color: 'text-green-700' },
};

export default function LogisticaPage() {
  const [viewRoute, setViewRoute] = useState<Route | null>(null);

  const totalDeliveries = routes.reduce((a, r) => a + r.deliveries, 0);
  const doneDeliveries = routes.reduce((a, r) => a + r.done, 0);
  const activeRoutes = routes.filter(r => r.status === 'ativo').length;
  const delayedRoutes = routes.filter(r => r.status === 'atrasado').length;

  return (
    <div className="space-y-7 pb-10">

      <div>
        <h1 className="text-[32px] font-black text-gray-900 leading-tight tracking-tight">Logística Regional</h1>
        <p className="text-gray-500 font-medium mt-1">Acompanhe as rotas de entrega e o desempenho da equipe.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Entregas Hoje', value: `${doneDeliveries}/${totalDeliveries}`, icon: Package, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Rotas Ativas', value: activeRoutes, icon: Navigation, bg: 'bg-green-50', color: 'text-green-700' },
          { label: 'Entregadores', value: routes.length, icon: Users, bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Atrasadas', value: delayedRoutes, icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-600' },
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

      {/* Progress bar */}
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-green-700" />
            <p className="font-black text-gray-900">Progresso Geral do Dia</p>
          </div>
          <span className="font-black text-gray-900">{Math.round((doneDeliveries / totalDeliveries) * 100)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#125d30] rounded-full transition-all duration-700" style={{ width: `${(doneDeliveries / totalDeliveries) * 100}%` }} />
        </div>
        <p className="text-xs text-gray-400 font-medium mt-2">{doneDeliveries} de {totalDeliveries} entregas concluídas</p>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-50">
          <h2 className="font-black text-gray-900">Rotas em Andamento</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {routes.map(route => {
            const cfg = statusCfg[route.status];
            const pct = (route.done / route.deliveries) * 100;
            return (
              <div key={route.id} className="px-7 py-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-600 shrink-0">
                    {route.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-gray-900 text-sm">{route.courier}</p>
                      <span className="text-[10px] text-gray-400">{route.id}</span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={10} />{route.zone}
                    </p>
                  </div>
                  <div className="w-32 hidden md:block">
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                      <span>{route.done}/{route.deliveries}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${route.status === 'atrasado' ? 'bg-red-400' : 'bg-[#125d30]'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {route.status !== 'concluido' && (
                    <div className="text-right hidden md:block shrink-0">
                      <p className="text-[10px] font-black text-gray-400">PREVISÃO</p>
                      <p className="font-black text-gray-700 flex items-center gap-1 text-sm"><Clock size={12} />{route.eta}</p>
                    </div>
                  )}
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-black shrink-0 ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  <div className="flex gap-2 shrink-0">
                    <a href={`tel:${route.phone}`} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-green-700 hover:bg-green-50 transition-all">
                      <Phone size={15} />
                    </a>
                    <button onClick={() => setViewRoute(route)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                      <Eye size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Ver Rota */}
      <Modal isOpen={!!viewRoute} onClose={() => setViewRoute(null)} title={`Rota ${viewRoute?.id}`}>
        {viewRoute && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[24px]">
              <div className="w-12 h-12 bg-[#125d30] rounded-xl flex items-center justify-center text-white font-black text-lg">
                {viewRoute.avatar}
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg">{viewRoute.courier}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={13} />{viewRoute.phone}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={13} />{viewRoute.zone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: viewRoute.deliveries },
                { label: 'Concluídas', value: viewRoute.done },
                { label: 'Pendentes', value: viewRoute.deliveries - viewRoute.done },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-gray-50 rounded-[20px] text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="font-black text-gray-900 text-xl">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                <span>Progresso</span>
                <span>{Math.round((viewRoute.done / viewRoute.deliveries) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#125d30] rounded-full" style={{ width: `${(viewRoute.done / viewRoute.deliveries) * 100}%` }} />
              </div>
            </div>
            {viewRoute.status === 'atrasado' && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-[20px] flex items-center gap-3">
                <AlertCircle size={18} className="text-red-600 shrink-0" />
                <p className="text-sm font-bold text-red-700">Rota com atraso. Considere acionar suporte logístico.</p>
              </div>
            )}
            <div className="flex gap-3">
              <a href={`tel:${viewRoute.phone}`} className="flex-1 py-4 bg-green-50 text-green-700 rounded-[20px] font-bold flex items-center justify-center gap-2 hover:bg-green-700 hover:text-white transition-all">
                <Phone size={16} /> Ligar
              </a>
              <button className="flex-1 py-4 bg-[#125d30] text-white rounded-[20px] font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-all shadow-lg">
                <Truck size={16} /> Ver no Mapa
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
