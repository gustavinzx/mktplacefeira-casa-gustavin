'use client';

import React from 'react';
import { 
  Download, 
  Send, 
  Calendar, 
  Calculator, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Info, 
  CheckSquare, 
  Square,
  BarChart3,
  TrendingUp,
  User,
  Users,
  Building2
} from 'lucide-react';

export default function AdminReportsPage() {
  const tableData = [
    { date: '28/09/23 14:22', note: '001 - 24.892', client: 'Mercado das Frutas LTDA', type: 'B2B (CNPJ)', gross: 'R$ 1.250,00', base: 'R$ 1.250,00', rate: '18%', tax: 'R$ 225,00', color: 'orange' },
    { date: '28/09/23 15:05', note: '001 - 24.893', client: 'Ana Maria Silva', type: 'B2C (CPF)', gross: 'R$ 84,50', base: 'R$ 84,50', rate: '7%', tax: 'R$ 5,91', color: 'blue' },
    { date: '28/09/23 15:40', note: '001 - 24.894', client: 'Restaurante Sabor Verde', type: 'B2B (CNPJ)', gross: 'R$ 4.300,00', base: 'R$ 4.300,00', rate: '12%', tax: 'R$ 516,00', color: 'orange' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">CONTABILIDADE & FISCAL</p>
          <h2 className="text-[40px] font-black text-[#1b1c19] tracking-tight leading-none">Relatório para Contador</h2>
          <p className="text-[16px] font-medium text-[#707a6b] mt-3 max-w-xl">Consolidação de dados fiscais e faturamento para exportação mensal.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-8 py-4 bg-[#efeee9] text-[#1b1c19] rounded-full font-black text-[13px] uppercase tracking-widest hover:bg-gray-200 transition-all">
            <Send size={18} />
            Enviar para Contador
          </button>
          <button className="flex items-center gap-3 px-8 py-4 bg-[#fc6c29] text-white rounded-full font-black text-[13px] uppercase tracking-widest shadow-xl shadow-orange-900/20 hover:scale-105 transition-all">
            <Download size={18} />
            Exportar Tudo
          </button>
        </div>
      </div>

      {/* Filter Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Período */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-6">
          <h4 className="text-sm font-black text-[#1b1c19] flex items-center gap-2">
            <Calendar size={18} className="text-green-600" />
            Período de Apuração
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#bfc9bd] uppercase ml-1">Mês</label>
              <select className="w-full bg-[#f5f4ef] border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none">
                <option>Setembro 2023</option>
                <option>Agosto 2023</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#bfc9bd] uppercase ml-1">Tipo de Dado</label>
              <select className="w-full bg-[#f5f4ef] border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none">
                <option>Faturamento Bruto</option>
                <option>Faturamento Líquido</option>
              </select>
            </div>
          </div>
        </div>

        {/* Impostos */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-6">
          <h4 className="text-sm font-black text-[#1b1c19] flex items-center gap-2">
            <Calculator size={18} className="text-[#ba1a1a]" />
            Impostos
          </h4>
          <div className="space-y-3">
             <div className="flex items-center gap-3 text-xs font-bold text-[#40493c] cursor-pointer">
                <div className="p-1 bg-green-600 text-white rounded-md"><CheckSquare size={14} /></div>
                ICMS / ST
             </div>
             <div className="flex items-center gap-3 text-xs font-bold text-[#40493c] cursor-pointer">
                <div className="p-1 bg-green-600 text-white rounded-md"><CheckSquare size={14} /></div>
                PIS / COFINS
             </div>
             <div className="flex items-center gap-3 text-xs font-bold text-[#40493c] cursor-pointer">
                <div className="p-1 bg-gray-100 text-[#bfc9bd] rounded-md"><Square size={14} /></div>
                ISS Retido
             </div>
          </div>
        </div>

        {/* Formato */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-6">
          <h4 className="text-sm font-black text-[#1b1c19]">Formato</h4>
          <div className="flex gap-2">
             <button className="flex-1 py-3 bg-[#f5f4ef] rounded-lg text-[11px] font-black uppercase text-[#707a6b] hover:bg-gray-100">PDF</button>
             <button className="flex-1 py-3 bg-green-600 rounded-lg text-[11px] font-black uppercase text-white shadow-lg shadow-green-900/10">CSV</button>
             <button className="flex-1 py-3 bg-[#f5f4ef] rounded-lg text-[11px] font-black uppercase text-[#707a6b] hover:bg-gray-100">XML</button>
          </div>
          <p className="text-[10px] font-medium text-[#bfc9bd] italic text-center">Arquivo pronto para integração com softwares contábeis (Alterdata, Domínio).</p>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm border-l-8 border-l-[#0e6b17]">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[11px] font-black text-[#bfc9bd] uppercase tracking-widest">FATURAMENTO TOTAL</p>
            <div className="p-2 bg-[#f0f9f1] text-green-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
          <h3 className="text-[32px] font-black text-[#1b1c19] tracking-tighter">R$ 142.850,00</h3>
          <p className="text-[11px] font-black text-green-600 mt-2 uppercase tracking-widest">↗ +12.4% vs mês anterior</p>
        </div>
        
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm border-l-8 border-l-[#fc6c29]">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[11px] font-black text-[#bfc9bd] uppercase tracking-widest">VENDAS B2C (CPF)</p>
            <div className="p-2 bg-[#fff7f0] text-[#fc6c29] rounded-lg"><User size={20} /></div>
          </div>
          <h3 className="text-[32px] font-black text-[#1b1c19] tracking-tighter">R$ 58.420,00</h3>
          <p className="text-[11px] font-bold text-[#707a6b] mt-2">41% do volume total</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm border-l-8 border-l-[#0e6b17]">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[11px] font-black text-[#bfc9bd] uppercase tracking-widest">VENDAS B2B (CNPJ)</p>
            <div className="p-2 bg-[#f0f9f1] text-green-600 rounded-lg"><Building2 size={20} /></div>
          </div>
          <h3 className="text-[32px] font-black text-[#1b1c19] tracking-tighter">R$ 84.430,00</h3>
          <p className="text-[11px] font-bold text-[#707a6b] mt-2">59% do volume total</p>
        </div>
      </div>

      {/* Detailed Notes Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-[#1b1c19]">Detalhamento de Notas por Categoria</h3>
          <div className="flex gap-3">
             <span className="px-4 py-1.5 bg-[#f0f9f1] text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">742 NOTAS GERADAS</span>
             <span className="px-4 py-1.5 bg-[#fff7f0] text-[#fc6c29] rounded-full text-[10px] font-black uppercase tracking-widest">PROCESSAMENTO OK</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f5f4ef] text-[10px] font-black uppercase tracking-[0.2em] text-[#40493c]">
              <tr>
                <th className="px-8 py-5">DATA/HORA</th>
                <th className="px-6 py-5">SÉRIE / Nº NOTA</th>
                <th className="px-6 py-5">CLIENTE / TIPO</th>
                <th className="px-6 py-5">VALOR BRUTO</th>
                <th className="px-6 py-5">BASE CÁLCULO ICMS</th>
                <th className="px-6 py-5">ALÍQUOTA</th>
                <th className="px-6 py-5">IMPOSTO DEVIDO</th>
                <th className="px-8 py-5 text-right">AÇÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-all group">
                  <td className="px-8 py-5 text-[12px] font-medium text-[#707a6b]">{row.date}</td>
                  <td className="px-6 py-5 text-[13px] font-black text-[#1b1c19]">{row.note}</td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-[13px] font-black text-[#1b1c19]">{row.client}</p>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        row.color === 'orange' ? 'bg-[#fff7f0] text-[#fc6c29]' : 'bg-[#f0f7ff] text-[#0066ff]'
                      }`}>{row.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[13px] font-bold text-[#40493c]">{row.gross}</td>
                  <td className="px-6 py-5 text-[13px] font-medium text-[#707a6b]">{row.base}</td>
                  <td className="px-6 py-5 text-[13px] font-bold text-[#40493c]">{row.rate}</td>
                  <td className="px-6 py-5 text-[13px] font-black text-[#ba1a1a]">{row.tax}</td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-[#bfc9bd] hover:text-[#1b1c19]"><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-10 py-6 bg-[#f5f4ef]/30 flex items-center justify-between border-t border-gray-50">
          <p className="text-[11px] text-[#707a6b] font-black uppercase tracking-widest italic">Mostrando 3 de 742 lançamentos contábeis.</p>
          <div className="flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-white border border-gray-100 text-[#bfc9bd] disabled:opacity-30" disabled><ChevronLeft size={18} /></button>
            <button className="w-10 h-10 rounded-xl bg-green-600 text-white text-[11px] font-black">1</button>
            <button className="w-10 h-10 rounded-xl bg-white text-[#707a6b] text-[11px] font-black hover:bg-gray-100 transition-all">2</button>
            <button className="w-10 h-10 rounded-xl bg-white text-[#707a6b] text-[11px] font-black hover:bg-gray-100 transition-all">3</button>
            <button className="p-3 rounded-2xl bg-white border border-gray-100 text-[#bfc9bd] hover:text-green-600 transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* Important Notice Alert */}
      <div className="bg-[#f0f9f1] p-8 rounded-[32px] border border-green-100 flex items-start gap-6">
        <div className="p-4 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-900/10">
          <Info size={24} />
        </div>
        <div>
          <h4 className="text-[18px] font-black text-green-600 mb-1">Aviso Importante</h4>
          <p className="text-[14px] font-medium text-[#40493c] leading-relaxed">
            Este relatório utiliza a base de dados sincronizada com a <span className="font-black">SEFAZ</span>. Eventuais cancelamentos de notas devem ser validados diretamente no portal nacional antes do envio definitivo para o <span className="font-black text-green-600">SPED Fiscal</span>.
          </p>
        </div>
      </div>

    </div>
  );
}
