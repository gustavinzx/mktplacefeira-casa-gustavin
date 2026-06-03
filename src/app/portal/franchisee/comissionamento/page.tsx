'use client';

import React, { useState } from 'react';
import { Download, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

const repasses = [
  { id: '#F3829', vendor: 'Horta do Zé Carlos', avatar: 'H', color: 'bg-green-100 text-green-700', total: 450.00, taxa: 8.5, status: 'pago' },
  { id: '#F3830', vendor: 'Frutas da Estação', avatar: 'F', color: 'bg-orange-100 text-orange-700', total: 1200.00, taxa: 8.5, status: 'pendente' },
  { id: '#F3831', vendor: 'Queijaria Mineira', avatar: 'Q', color: 'bg-blue-100 text-blue-700', total: 870.00, taxa: 8.5, status: 'pago' },
  { id: '#F3832', vendor: 'Orgânicos da Serra', avatar: 'O', color: 'bg-purple-100 text-purple-700', total: 310.00, taxa: 8.5, status: 'pago' },
];

const weeks = ['SEM 01', 'SEM 02', 'SEM 03', 'SEM 04'];
const salesData = [65, 80, 72, 95];
const commissionsData = [52, 68, 58, 82];

export default function ComissionamentoPage() {
  const [period, setPeriod] = useState('Últimos 30 dias');
  const maxVal = Math.max(...salesData, ...commissionsData);

  return (
    <div className="space-y-7 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-gray-900 leading-tight tracking-tight">Gestão de Comissionamento</h1>
          <p className="text-gray-500 font-medium mt-1">Acompanhe seus rendimentos e repasses regionais</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-[20px] font-bold text-sm text-gray-700 hover:border-gray-400 transition-all shadow-sm">
            <span className="text-sm">📅</span> {period}
            <ChevronDown size={15} />
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm hover:bg-green-800 transition-all shadow-lg shadow-green-900/10">
            <Download size={16} /> Exportar Relatório Financeiro
          </button>
        </div>
      </div>

      {/* KPI Top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Comissão Acumulada */}
        <div className="bg-[#125d30] rounded-[28px] p-7 shadow-xl shadow-green-900/20 text-white">
          <p className="text-[10px] font-black text-green-200 uppercase tracking-widest mb-3">Comissão Acumulada</p>
          <p className="text-[36px] font-black leading-tight">R$ 14.280,50</p>
          <div className="flex items-center gap-2 mt-3">
            <TrendingUp size={14} className="text-green-300" />
            <span className="text-sm font-bold text-green-200">+12.5% em relação ao mês anterior</span>
          </div>
        </div>

        {/* Volume de Vendas */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-7">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
              <span className="text-sm">🛒</span>
            </div>
            <span className="text-xs font-black text-gray-400 ml-auto">META: 85%</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3 mb-1">Volume de Vendas</p>
          <p className="text-[28px] font-black text-gray-900 mb-4">R$ 184.200,00</p>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#fc6c29] rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Evolução de Ganhos Chart */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-7">
          <div className="flex items-center justify-between mb-5">
            <p className="font-black text-gray-900">Evolução de Ganhos</p>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#125d30] inline-block" />Ganhos</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Vendas</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-24">
            {weeks.map((w, i) => (
              <div key={w} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 h-20">
                  <div className="flex-1 bg-[#125d30] rounded-t-xl transition-all" style={{ height: `${(commissionsData[i] / maxVal) * 100}%` }} />
                  <div className="flex-1 bg-green-100 rounded-t-xl transition-all" style={{ height: `${(salesData[i] / maxVal) * 100}%` }} />
                </div>
                <p className="text-[9px] font-black text-gray-400">{w}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detalhamento de Repasses */}
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-50 flex justify-between items-center">
          <h2 className="font-black text-gray-900">Detalhamento de Repasses</h2>
          <button className="text-sm font-bold text-green-700 hover:text-green-800 flex items-center gap-1">
            Ver todos →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                {['ID DO PEDIDO', 'FEIRANTE', 'VALOR TOTAL', 'TAXA FRANQUIA (%)', 'COMISSÃO LÍQUIDA', 'STATUS'].map(h => (
                  <th key={h} className="text-left px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {repasses.map(r => {
                const comissao = r.total * (r.taxa / 100);
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-7 py-5">
                      <span className="font-black text-green-700">{r.id}</span>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${r.color}`}>{r.avatar}</div>
                        <span className="font-bold text-gray-900 text-sm">{r.vendor}</span>
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      <span className="font-bold text-gray-700">R$ {r.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-7 py-5">
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl font-black text-xs">{r.taxa}%</span>
                    </td>
                    <td className="px-7 py-5">
                      <span className="font-black text-green-700">R$ {comissao.toFixed(2).replace('.', ',')}</span>
                    </td>
                    <td className="px-7 py-5">
                      {r.status === 'pago'
                        ? <CheckCircle2 size={20} className="text-green-600" />
                        : <Clock size={20} className="text-yellow-500" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-7 py-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">Mostrando 4 de 128 repasses</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all">
              <ChevronLeft size={14} />
            </button>
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${p === 1 ? 'bg-[#125d30] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}>{p}</button>
            ))}
            <button className="w-8 h-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
