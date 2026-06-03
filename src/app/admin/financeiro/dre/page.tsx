'use client';

import React, { useState } from 'react';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Equal,
  Minus,
  Plus,
} from 'lucide-react';

type Period = 'mes' | 'trimestre' | 'ano';

interface DRELine {
  label: string;
  value: number;
  indent?: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
  prefix?: string;
  suffix?: string;
  showMargin?: boolean;
  margin?: string;
}

const dreLines: DRELine[] = [
  { label: 'RECEITA BRUTA', value: 142800, isTotal: true, prefix: '(+)' },
  { label: 'Deduções e Impostos', value: -14280, indent: 1, prefix: '(-)' , suffix: '(10%)' },
  { label: 'RECEITA LÍQUIDA', value: 128520, isSubtotal: true, prefix: '(=)' },
  { label: 'Custo dos Serviços Prestados', value: -21400, indent: 1, prefix: '(-)' },
  { label: 'LUCRO BRUTO', value: 107120, isSubtotal: true, prefix: '(=)', showMargin: true, margin: '83.3%' },
  { label: 'Despesas Operacionais', value: -31560, indent: 1, prefix: '(-)' },
  { label: 'Marketing', value: -9400, indent: 2, prefix: '' },
  { label: 'RH & Pessoal', value: -28200, indent: 2, prefix: '' },
  { label: 'Tecnologia', value: -12800, indent: 2, prefix: '' },
  { label: 'Administrativo', value: -4840, indent: 2, prefix: '' },
  { label: 'Outros', value: -5800, indent: 2, prefix: '' },
  { label: 'EBITDA', value: 75560, isTotal: true, prefix: '(=)' },
  { label: 'Depreciação', value: -1200, indent: 1, prefix: '(-)' },
  { label: 'EBIT', value: 74360, isSubtotal: true, prefix: '(=)' },
  { label: 'RESULTADO LÍQUIDO', value: 74360, isTotal: true, prefix: '(=)', showMargin: true, margin: '52.1%' },
];

interface BalanceItem {
  label: string;
  value?: number;
  isGroup?: boolean;
  isTotal?: boolean;
  indent?: number;
}

const ativoItems: BalanceItem[] = [
  { label: 'ATIVO TOTAL', value: 220800, isTotal: true },
  { label: 'Ativo Circulante', isGroup: true },
  { label: 'Caixa e Equivalentes', value: 48200, indent: 1 },
  { label: 'Contas a Receber', value: 48200, indent: 1 },
  { label: 'Estoque / Outros', value: 12000, indent: 1 },
  { label: 'Ativo Não Circulante', isGroup: true },
  { label: 'Imobilizado', value: 12400, indent: 1 },
  { label: 'Intangível (Software)', value: 100000, indent: 1 },
];

const passivoItems: BalanceItem[] = [
  { label: 'PASSIVO + PL', value: 220800, isTotal: true },
  { label: 'Passivo Circulante', isGroup: true },
  { label: 'Contas a Pagar', value: 22100, indent: 1 },
  { label: 'Obrigações Fiscais', value: 8840, indent: 1 },
  { label: 'Patrimônio Líquido', isGroup: true },
  { label: 'Capital Social', value: 200000, indent: 1 },
  { label: 'Resultado do Exercício', value: 75560, indent: 1 },
  { label: 'Prejuízos Acumulados', value: -85700, indent: 1 },
];

function formatCurrency(v: number) {
  const abs = Math.abs(v);
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(abs);
  return v < 0 ? `(${formatted})` : formatted;
}

export default function DREPage() {
  const [period, setPeriod] = useState<Period>('mes');
  const [year, setYear] = useState('2026');

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Financeiro & ERP</p>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">DRE & Balanço Patrimonial</h1>
          <p className="text-gray-500 mt-1 font-medium">Demonstrativos financeiros consolidados</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center bg-white border border-gray-100 rounded-[20px] p-1 shadow-sm gap-1">
            {([
              { key: 'mes', label: 'Mês' },
              { key: 'trimestre', label: 'Trimestre' },
              { key: 'ano', label: 'Ano' },
            ] as { key: Period; label: string }[]).map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-[16px] text-sm font-black transition-colors ${
                  period === p.key ? 'bg-[#125d30] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Year selector */}
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="border border-gray-200 rounded-[20px] px-4 py-2.5 text-sm font-black text-gray-700 outline-none focus:border-[#125d30]/40 bg-white transition-colors"
          >
            <option>2026</option>
            <option>2025</option>
            <option>2024</option>
          </select>

          {/* Export PDF */}
          <button className="px-5 py-3 bg-[#fc6c29] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
            <Download size={16} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* === DRE === */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-50 bg-gradient-to-r from-green-50/60 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#125d30] rounded-xl"><TrendingUp size={18} className="text-white" /></div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Resultado</p>
                <h2 className="text-lg font-black text-gray-900">DRE — Demonstrativo de Resultado</h2>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-50 px-0">
            {dreLines.map((line, i) => {
              const isPositive = line.value > 0;
              const isNegative = line.value < 0;

              return (
                <div
                  key={i}
                  className={`flex items-center justify-between py-3 transition-colors ${
                    line.isTotal
                      ? 'bg-[#125d30]/5 px-7'
                      : line.isSubtotal
                      ? 'bg-gray-50/60 px-7'
                      : 'px-7 hover:bg-gray-50/40'
                  }`}
                  style={{
                    paddingLeft: line.indent
                      ? `${1.75 + line.indent * 1.25}rem`
                      : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {line.prefix && (
                      <span className="text-[10px] font-black text-gray-400 w-7 flex-shrink-0">{line.prefix}</span>
                    )}
                    <span
                      className={`text-sm truncate ${
                        line.isTotal
                          ? 'font-black text-gray-900 uppercase tracking-wide'
                          : line.isSubtotal
                          ? 'font-black text-gray-800'
                          : line.indent === 2
                          ? 'font-medium text-gray-500'
                          : 'font-bold text-gray-700'
                      }`}
                    >
                      {line.label}
                    </span>
                    {line.suffix && (
                      <span className="text-[10px] font-black text-gray-400 ml-1 flex-shrink-0">{line.suffix}</span>
                    )}
                    {line.showMargin && line.margin && (
                      <span className="text-[10px] font-black text-[#125d30] bg-green-50 px-2 py-0.5 rounded-full ml-1 flex-shrink-0">
                        {line.margin}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-black flex-shrink-0 ml-4 ${
                      line.isTotal
                        ? isPositive ? 'text-[#125d30]' : 'text-red-600'
                        : isNegative
                        ? 'text-red-500'
                        : 'text-[#125d30]'
                    }`}
                  >
                    {formatCurrency(line.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* === Balanço Patrimonial === */}
        <div className="space-y-5">

          {/* Ativo */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-50 bg-gradient-to-r from-blue-50/60 to-transparent">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Balanço Patrimonial</p>
              <h2 className="text-lg font-black text-gray-900">Ativo</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {ativoItems.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-3 ${
                    item.isTotal ? 'bg-[#125d30]/5 px-7' : item.isGroup ? 'bg-gray-50/60 px-7' : 'px-7 hover:bg-gray-50/40'
                  }`}
                  style={{ paddingLeft: item.indent ? `${1.75 + item.indent * 1.25}rem` : undefined }}
                >
                  <span className={`text-sm ${
                    item.isTotal ? 'font-black text-gray-900 uppercase tracking-wide' :
                    item.isGroup ? 'font-black text-gray-700' :
                    'font-medium text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                  {item.value !== undefined && (
                    <span className={`text-sm font-black flex-shrink-0 ml-4 ${item.isTotal ? 'text-[#125d30]' : item.value < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                      {formatCurrency(item.value)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Passivo + PL */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-50 bg-gradient-to-r from-orange-50/60 to-transparent">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Balanço Patrimonial</p>
              <h2 className="text-lg font-black text-gray-900">Passivo & Patrimônio Líquido</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {passivoItems.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-3 ${
                    item.isTotal ? 'bg-[#fc6c29]/5 px-7' : item.isGroup ? 'bg-gray-50/60 px-7' : 'px-7 hover:bg-gray-50/40'
                  }`}
                  style={{ paddingLeft: item.indent ? `${1.75 + item.indent * 1.25}rem` : undefined }}
                >
                  <span className={`text-sm ${
                    item.isTotal ? 'font-black text-gray-900 uppercase tracking-wide' :
                    item.isGroup ? 'font-black text-gray-700' :
                    'font-medium text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                  {item.value !== undefined && (
                    <span className={`text-sm font-black flex-shrink-0 ml-4 ${item.isTotal ? 'text-[#fc6c29]' : item.value < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                      {formatCurrency(item.value)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Balance check */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#125d30]"></div>
              <span className="text-sm font-black text-gray-700">Balanço Conferido</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black text-green-700 bg-green-50 px-3 py-1.5 rounded-full">Ativo = R$220.800</span>
              <span className="text-[11px] font-black text-[#fc6c29] bg-orange-50 px-3 py-1.5 rounded-full">Passivo + PL = R$220.800</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
