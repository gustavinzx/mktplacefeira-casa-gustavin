'use client';

import { useState } from 'react';
import { Download, ChevronDown, TrendingUp, TrendingDown, MapPin, Store, Users, DollarSign } from 'lucide-react';

const regions = [
  { name: 'Franquia Nordeste', city: 'Salvador, BA', revenue: 167800, commission: 13424, feiras: 15, feirantes: 188, growth: 18.4, rating: 4.9 },
  { name: 'Franquia Sudeste', city: 'São Paulo, SP', revenue: 142500, commission: 11400, feiras: 12, feirantes: 142, growth: 12.0, rating: 4.8 },
  { name: 'Franquia RJ', city: 'Rio de Janeiro, RJ', revenue: 115000, commission: 9200, feiras: 9, feirantes: 112, growth: -3.2, rating: 3.2 },
  { name: 'Franquia Sul', city: 'Curitiba, PR', revenue: 98200, commission: 7856, feiras: 8, feirantes: 96, growth: 8.7, rating: 4.7 },
  { name: 'Franquia Centro-Oeste', city: 'Brasília, DF', revenue: 48000, commission: 3840, feiras: 5, feirantes: 54, growth: 5.1, rating: 0 },
  { name: 'Franquia Norte', city: 'Manaus, AM', revenue: 21400, commission: 1712, feiras: 3, feirantes: 28, growth: 22.0, rating: 0 },
];

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
const networkData = [320, 380, 415, 450, 490, 593];
const maxVal = Math.max(...networkData);

export default function FranqueadosMetricasPage() {
  const [period, setPeriod] = useState('Últimos 30 dias');

  const totalRevenue = regions.reduce((a, r) => a + r.revenue, 0);
  const totalCommission = regions.reduce((a, r) => a + r.commission, 0);
  const totalFeiras = regions.reduce((a, r) => a + r.feiras, 0);
  const totalFeirantes = regions.reduce((a, r) => a + r.feirantes, 0);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Métricas Regionais</h1>
          <p className="text-gray-500 font-medium mt-1">Performance consolidada de toda a rede de franquias.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-[20px] font-bold text-sm text-gray-700 hover:border-gray-400 transition-all shadow-sm">
            <span>📅</span> {period} <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm hover:bg-green-800 transition-all shadow-lg shadow-green-900/10">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Fat. Total Rede', value: `R$ ${(totalRevenue / 1000).toFixed(0)}k`, sub: '+14.2% vs mês ant.', up: true, icon: DollarSign, bg: 'bg-green-50', color: 'text-green-700' },
          { label: 'Comissão Rede', value: `R$ ${(totalCommission / 1000).toFixed(1)}k`, sub: '8% sobre vendas', up: true, icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Total de Feiras', value: totalFeiras, sub: `${regions.length} franquias ativas`, up: true, icon: Store, bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Total de Feirantes', value: totalFeirantes, sub: '+18 este mês', up: true, icon: Users, bg: 'bg-orange-50', color: 'text-orange-600' },
        ].map(({ label, value, sub, up, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />} {sub}
              </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Network Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-gray-900">Evolução do Faturamento da Rede</h2>
            <span className="text-xs font-bold text-gray-400">Últimos 6 meses</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {months.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-gray-500">R${networkData[i]}k</span>
                <div className="w-full bg-gray-100 rounded-t-xl overflow-hidden" style={{ height: '100px' }}>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-700 ${i === months.length - 1 ? 'bg-[#125d30]' : 'bg-green-200'}`}
                    style={{ height: `${(networkData[i] / maxVal) * 100}%`, marginTop: `${100 - (networkData[i] / maxVal) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] font-black text-gray-400">{m}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Regions */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-7">
          <h2 className="font-black text-gray-900 mb-5">Ranking de Franquias</h2>
          <div className="space-y-4">
            {[...regions].sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((r, i) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{r.name.replace('Franquia ', '')}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-[#125d30] rounded-full" style={{ width: `${(r.revenue / regions[0].revenue) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs font-black text-gray-900 shrink-0">R${(r.revenue / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-50">
          <h2 className="font-black text-gray-900">Detalhamento por Franquia</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                {['Franquia', 'Localização', 'Feiras', 'Feirantes', 'Faturamento', 'Comissão', 'Crescimento'].map(h => (
                  <th key={h} className="text-left px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {regions.map(r => (
                <tr key={r.name} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-7 py-5">
                    <p className="font-black text-gray-900 text-sm">{r.name}</p>
                    {r.rating > 0 && <p className="text-[11px] text-yellow-600 font-bold">{r.rating} ★</p>}
                  </td>
                  <td className="px-7 py-5">
                    <p className="text-sm font-bold text-gray-600 flex items-center gap-1"><MapPin size={11} className="text-gray-400" />{r.city}</p>
                  </td>
                  <td className="px-7 py-5"><p className="font-black text-gray-900">{r.feiras}</p></td>
                  <td className="px-7 py-5"><p className="font-black text-gray-900">{r.feirantes}</p></td>
                  <td className="px-7 py-5">
                    <p className="font-black text-gray-900">R$ {r.revenue.toLocaleString('pt-BR')}</p>
                  </td>
                  <td className="px-7 py-5">
                    <p className="font-black text-green-700">R$ {r.commission.toLocaleString('pt-BR')}</p>
                  </td>
                  <td className="px-7 py-5">
                    <div className={`flex items-center gap-1 text-sm font-black ${r.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {r.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {r.growth >= 0 ? '+' : ''}{r.growth.toFixed(1)}%
                    </div>
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
