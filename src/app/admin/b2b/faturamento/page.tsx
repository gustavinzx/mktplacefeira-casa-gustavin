'use client';

import React from 'react';
import { Download, FileText, ArrowUpRight, ArrowDownRight, DollarSign, Calendar } from 'lucide-react';

export default function FaturamentoB2BPage() {
  const faturas = [
    { id: 'FAT-2024-001', empresa: 'Restaurante Mani', valor: 4500.00, dataVencimento: '15/06/2024', status: 'PAGO' },
    { id: 'FAT-2024-002', empresa: 'Hotel Grand Hyatt', valor: 12800.50, dataVencimento: '20/06/2024', status: 'PENDENTE' },
    { id: 'FAT-2024-003', empresa: 'Bistrô São Paulo', valor: 3200.00, dataVencimento: '05/06/2024', status: 'ATRASADO' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[32px] font-bold text-gray-900 leading-tight tracking-tight">Faturamento B2B</h2>
          <p className="text-gray-500 mt-1 font-medium">Gestão de faturas, cobranças e repasses de contratos B2B.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all text-sm shadow-sm">
          <Download size={18} /> Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-700 rounded-xl"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Faturamento do Mês</p>
            <h3 className="text-2xl font-black text-gray-900">R$ 142.500,00</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-orange-700 rounded-xl"><Calendar size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">A Receber (30 dias)</p>
            <h3 className="text-2xl font-black text-gray-900">R$ 45.200,00</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-700 rounded-xl"><ArrowDownRight size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inadimplência</p>
            <h3 className="text-2xl font-black text-gray-900">R$ 3.200,00</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900">Últimas Faturas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-4">FATURA</th>
                <th className="px-4 py-4">CLIENTE / EMPRESA</th>
                <th className="px-4 py-4">VALOR</th>
                <th className="px-4 py-4">VENCIMENTO</th>
                <th className="px-8 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {faturas.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5 font-bold text-gray-900">{f.id}</td>
                  <td className="px-4 py-5 font-medium text-gray-700">{f.empresa}</td>
                  <td className="px-4 py-5 font-black text-gray-900">R$ {f.valor.toFixed(2)}</td>
                  <td className="px-4 py-5 font-medium text-gray-500">{f.dataVencimento}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      f.status === 'PAGO' ? 'bg-green-100 text-green-700' :
                      f.status === 'PENDENTE' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
