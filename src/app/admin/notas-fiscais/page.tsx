'use client';

import React from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  Eye, 
  Send,
  MoreVertical,
  Building2,
  ShieldCheck,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';

export default function AdminNotasFiscaisPage() {
  const pending = [
    { id: 'PED-4281', vendor: 'Sítio das Morangas', cnpj: '12.345.../0001', value: 'R$ 342,90', date: 'Hoje, 09:42' },
    { id: 'PED-4282', vendor: 'Horta do Marcão', cnpj: '98.765.../0001', value: 'R$ 1.204,00', date: 'Hoje, 10:15' },
    { id: 'PED-4283', vendor: 'Agro Familiar LTDA', cnpj: '55.444.../0001', value: 'R$ 89,50', date: 'Hoje, 11:20' },
    { id: 'PED-4284', vendor: 'Orgânicos Reais', cnpj: '22.333.../0001', value: 'R$ 512,20', date: 'Hoje, 12:05' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#b7ffc1] text-green-700 rounded-lg">
              <FileText size={20} />
            </div>
            <span className="text-[12px] font-black text-green-700 uppercase tracking-widest">Faturamento Eletrônico</span>
          </div>
          <h2 className="text-[36px] font-black text-gray-900 tracking-tight leading-tight">Emissor de Notas Fiscais</h2>
          <p className="text-[16px] font-medium text-[#404940] mt-1">Gerencie o faturamento e a emissão de documentos eletrônicos (NFe) dos pedidos.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-[#bfc9bd]/30 rounded-2xl text-[14px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all">
            <RefreshCcw size={18} className="text-green-700" />
            Sincronizar SEFAZ
          </button>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-green-700 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest shadow-xl shadow-green-900/20 hover:bg-[#2d7a44] transition-all">
            <Send size={18} />
            Emissão em Lote
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-[#bfc9bd]/20 shadow-sm flex items-center gap-6 relative overflow-hidden group">
          <div className="w-16 h-16 bg-[#feeadc] rounded-3xl flex items-center justify-center text-[#904d00] relative z-10">
            <Clock size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-bold text-[#707a6f] uppercase tracking-widest">Aguardando Emissão</p>
            <h3 className="text-[28px] font-black text-gray-900">14 Pedidos</h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-[#bfc9bd]/20 shadow-sm flex items-center gap-6 relative overflow-hidden group">
          <div className="w-16 h-16 bg-[#b7ffc1] rounded-3xl flex items-center justify-center text-green-700 relative z-10">
            <CheckCircle2 size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-bold text-[#707a6f] uppercase tracking-widest">Emitidas Hoje</p>
            <h3 className="text-[28px] font-black text-gray-900">42 Notas</h3>
          </div>
        </div>
        <div className="bg-[#ba1a1a] p-8 rounded-[40px] text-white flex items-center gap-6 relative overflow-hidden group shadow-xl shadow-red-900/10">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-white backdrop-blur-md relative z-10">
            <AlertCircle size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Falha na Sefaz</p>
            <h3 className="text-[28px] font-black text-white">03 Ocorrências</h3>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[40px] border border-[#bfc9bd]/20 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-[#bfc9bd]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-2xl font-black text-gray-900">Fila de Processamento</h3>
          <div className="flex gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bfc9bd]" />
              <input 
                type="text" 
                placeholder="Buscar pedido ou CNPJ..." 
                className="pl-12 pr-4 py-3 bg-gray-50 border border-[#bfc9bd]/20 rounded-2xl text-[13px] font-bold outline-none w-64 focus:ring-2 focus:ring-[#0b612e]/10 transition-all"
              />
            </div>
            <button className="p-3 bg-gray-50 border border-[#bfc9bd]/20 rounded-2xl text-[#707a6f] hover:bg-white transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[11px] font-black uppercase tracking-[0.2em] text-[#707a6f] border-y border-[#bfc9bd]/10">
              <tr>
                <th className="px-10 py-6">ID Pedido</th>
                <th className="px-6 py-6">Emitente / Vendor</th>
                <th className="px-6 py-6">Valor Total</th>
                <th className="px-6 py-6">Horário</th>
                <th className="px-10 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bfc9bd]/10">
              {pending.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-10 py-7">
                    <span className="text-[14px] font-black text-green-700">{item.id}</span>
                  </td>
                  <td className="px-6 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-700/5 rounded-xl flex items-center justify-center text-green-700">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="text-[15px] font-black text-gray-900">{item.vendor}</p>
                        <p className="text-[11px] font-bold text-[#707a6f]">CNPJ: {item.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-7">
                    <span className="text-[15px] font-black text-gray-900">{item.value}</span>
                  </td>
                  <td className="px-6 py-7 text-[14px] font-medium text-[#707a6f]">
                    {item.date}
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <button className="p-3 bg-white text-[#707a6f] hover:text-green-700 rounded-xl shadow-sm border border-[#bfc9bd]/20 transition-all">
                        <Eye size={18} />
                      </button>
                      <button className="bg-green-700 text-white px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-green-900/10 hover:bg-[#2d7a44] transition-all flex items-center gap-2">
                        Transmitir
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-[#bfc9bd]/10 flex justify-center">
          <p className="text-[13px] font-bold text-[#707a6f]">Mostrando 4 de 56 resultados</p>
        </div>
      </div>

      {/* Certification Warning */}
      <div className="bg-[#feeadc] p-10 rounded-[40px] border border-[#bfc9bd]/20 flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#904d00] shadow-sm shrink-0">
          <ShieldCheck size={40} />
        </div>
        <div className="flex-1">
          <h3 className="text-[20px] font-black text-gray-900 mb-2 tracking-tight">Configure sua Certificação Digital</h3>
          <p className="text-[15px] font-medium text-[#404940] leading-relaxed">
            Mantenha seu certificado <strong>A1</strong> atualizado para evitar interrupções no faturamento. O seu certificado atual expira em <strong>15 dias</strong>.
          </p>
        </div>
        <button className="px-8 py-4 bg-[#904d00] text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-lg shadow-orange-900/10 hover:bg-[#713b00] transition-all whitespace-nowrap">
          Renovar Agora
        </button>
      </div>

    </div>
  );
}
