'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Star, MessageSquare, ArrowRight, BarChart2, Zap, Search, ChevronUp } from 'lucide-react';

interface NPSSegmento {
  label: string;
  score: number;
  promotores: number;
  neutros: number;
  detratores: number;
  cor: string;
}

interface ChurnRisk {
  nome: string;
  cidade: string;
  diasSemPedido: number;
  tendencia: 'queda_forte' | 'queda' | 'estavel';
  risco: 'alto' | 'medio';
}

interface Oportunidade {
  titulo: string;
  descricao: string;
  detalhe: string;
  potencial: string;
  icone: React.ElementType;
  cor: string;
}

interface FeatureRequest {
  feature: string;
  votos: number;
  maxVotos: number;
}

interface Insight {
  texto: string;
  data: string;
  tipo: 'oportunidade' | 'alerta' | 'tendencia';
}

const npsSegmentos: NPSSegmento[] = [
  { label: 'Feirantes', score: 72, promotores: 62, neutros: 22, detratores: 16, cor: '#125d30' },
  { label: 'Clientes', score: 68, promotores: 58, neutros: 22, detratores: 20, cor: '#3b82f6' },
  { label: 'Franqueados', score: 81, promotores: 74, neutros: 16, detratores: 10, cor: '#a855f7' },
  { label: 'Entregadores', score: 64, promotores: 55, neutros: 22, detratores: 23, cor: '#fc6c29' },
];

const churnRisks: ChurnRisk[] = [
  { nome: 'Horta do Seu Zé', cidade: 'Campinas/SP', diasSemPedido: 18, tendencia: 'queda_forte', risco: 'alto' },
  { nome: 'Laticínios Prado', cidade: 'Belo Horizonte/MG', diasSemPedido: 14, tendencia: 'queda', risco: 'alto' },
  { nome: 'Empório das Especiarias', cidade: 'Salvador/BA', diasSemPedido: 11, tendencia: 'queda', risco: 'medio' },
];

const oportunidades: Oportunidade[] = [
  {
    titulo: 'Expansão Nordeste',
    descricao: '3 cidades com alta demanda mas sem cobertura',
    detalhe: 'Maceió/AL, Natal/RN, Teresina/PI — buscas sem resultado crescem 34%/semana',
    potencial: 'R$42k/mês',
    icone: TrendingUp,
    cor: '#125d30',
  },
  {
    titulo: 'Chefs de Culinária Asiática',
    descricao: 'Gap identificado via pesquisa de busca interna',
    detalhe: '18% dos clientes buscam por ingredientes asiáticos sem retorno de resultado',
    potencial: '18% demanda não atendida',
    icone: Search,
    cor: '#fc6c29',
  },
  {
    titulo: 'Entrega Noturna 18–22h',
    descricao: 'Horário mais buscado sem cobertura de entrega',
    detalhe: '1.240 buscas sem resultado por semana — nenhum parceiro disponível neste slot',
    potencial: '1.240 buscas/sem.',
    icone: Zap,
    cor: '#3b82f6',
  },
];

const featureRequests: FeatureRequest[] = [
  { feature: 'Pagamento parcelado', votos: 284, maxVotos: 284 },
  { feature: 'App para feirantes', votos: 218, maxVotos: 284 },
  { feature: 'Assinatura mensal clientes', votos: 176, maxVotos: 284 },
  { feature: 'Chat com feirante', votos: 142, maxVotos: 284 },
  { feature: 'Rastreamento ao vivo', votos: 98, maxVotos: 284 },
];

const insightsFeed: Insight[] = [
  { texto: 'Feirantes de orgânicos têm 42% mais retenção — considere programa de destaque', data: 'Hoje', tipo: 'oportunidade' },
  { texto: '3 feirantes de Salvador não fizeram pedidos em 14 dias — risco de churn identificado', data: 'Ontem', tipo: 'alerta' },
  { texto: 'Busca por "frango caipira" cresceu 180% em 7 dias — oportunidade de captação', data: '08/05', tipo: 'tendencia' },
  { texto: 'Taxa de abandono de carrinho caiu 8% após melhoria no checkout', data: '07/05', tipo: 'oportunidade' },
  { texto: 'Pico de acessos às 12h–13h representa 28% do tráfego diário', data: '06/05', tipo: 'tendencia' },
];

const insightConfig: Record<string, { cor: string; bg: string; icone: React.ElementType }> = {
  oportunidade: { cor: 'text-green-700', bg: 'bg-green-50', icone: Lightbulb },
  alerta: { cor: 'text-red-600', bg: 'bg-red-50', icone: AlertTriangle },
  tendencia: { cor: 'text-blue-700', bg: 'bg-blue-50', icone: BarChart2 },
};

function NPSArc({ score, cor }: { score: number; cor: string }) {
  // Semicircle arc from 0–100
  const radius = 40;
  const cx = 60;
  const cy = 60;
  const circumference = Math.PI * radius; // half circle
  const filled = (score / 100) * circumference;
  const empty = circumference - filled;

  return (
    <svg width="120" height="70" viewBox="0 0 120 70">
      {/* Background arc */}
      <path
        d={`M 20 60 A ${radius} ${radius} 0 0 1 100 60`}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Filled arc using stroke-dasharray on a circle, clipped to semicircle */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={cor}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference * 2 - filled}`}
        strokeDashoffset={circumference}
        transform={`rotate(180 ${cx} ${cy})`}
      />
      {/* Score text */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="900" fill="#111827">{score}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fontWeight="700" fill="#9ca3af">NPS</text>
    </svg>
  );
}

export default function InsidersPage() {
  const [activeInsight, setActiveInsight] = useState<number | null>(null);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Insiders & Insights</h1>
        <p className="text-gray-500 font-medium mt-1">Inteligência de negócio — NPS, churn, oportunidades e tendências</p>
      </div>

      {/* NPS Section */}
      <div>
        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">NPS por Segmento</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {npsSegmentos.map((seg, i) => (
            <div key={i} className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{seg.label}</span>
              <NPSArc score={seg.score} cor={seg.cor} />
              <div className="mt-4 w-full space-y-2">
                {[
                  { label: 'Promotores', pct: seg.promotores, color: '#125d30' },
                  { label: 'Neutros', pct: seg.neutros, color: '#eab308' },
                  { label: 'Detratores', pct: seg.detratores, color: '#ef4444' },
                ].map(bar => (
                  <div key={bar.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{bar.label}</span>
                      <span className="text-[10px] font-black text-gray-700">{bar.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${bar.pct}%`, backgroundColor: bar.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Churn Risk */}
      <div>
        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Risco de Churn — Feirantes em Alerta</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {churnRisks.map((c, i) => (
            <div key={i} className={`bg-white rounded-[24px] border shadow-sm p-6 ${c.risco === 'alto' ? 'border-red-200' : 'border-yellow-200'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-black text-gray-900">{c.nome}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">{c.cidade}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${c.risco === 'alto' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {c.risco === 'alto' ? 'Alto' : 'Médio'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={16} className={c.risco === 'alto' ? 'text-red-500' : 'text-yellow-500'} />
                <p className="text-[11px] text-gray-600 font-medium">
                  <span className="font-black">{c.diasSemPedido} dias</span> sem pedido
                </p>
              </div>
              <div className="mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tendência de Receita</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className="flex-1 rounded-sm transition-all"
                      style={{
                        height: `${c.tendencia === 'queda_forte' ? Math.max(8, 32 - j * 6) : Math.max(8, 32 - j * 4)}px`,
                        backgroundColor: j > 2 ? (c.risco === 'alto' ? '#fca5a5' : '#fde68a') : '#e5e7eb',
                      }}
                    />
                  ))}
                </div>
              </div>
              <button className="w-full py-3 border border-[#125d30] text-[#125d30] rounded-2xl font-black text-[11px] hover:bg-[#125d30] hover:text-white transition-all flex items-center justify-center gap-2">
                <MessageSquare size={13} /> Acionar CRM
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Opportunities */}
      <div>
        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Oportunidades de Crescimento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {oportunidades.map((op, i) => {
            const Icon = op.icone;
            return (
              <div key={i} className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-7 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${op.cor}15` }}>
                  <Icon size={22} style={{ color: op.cor }} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">{op.titulo}</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">{op.descricao}</p>
                </div>
                <p className="text-[12px] text-gray-600 bg-gray-50 rounded-2xl px-4 py-3 leading-relaxed">{op.detalhe}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Potencial</span>
                    <span className="text-sm font-black" style={{ color: op.cor }}>{op.potencial}</span>
                  </div>
                  <button className="px-4 py-2 rounded-2xl text-[11px] font-black text-white flex items-center gap-1.5 hover:opacity-90 transition-all" style={{ backgroundColor: op.cor }}>
                    Explorar <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Requests */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Star size={20} className="text-[#fc6c29]" />
            <h2 className="text-base font-black text-gray-900">Funcionalidades Mais Pedidas</h2>
          </div>
          <div className="space-y-5">
            {featureRequests.map((fr, i) => {
              const pct = Math.round((fr.votos / fr.maxVotos) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-400 w-4">#{i + 1}</span>
                      <span className="text-sm font-black text-gray-900">{fr.feature}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChevronUp size={13} className="text-[#fc6c29]" />
                      <span className="text-sm font-black text-gray-700">{fr.votos}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: i === 0 ? '#fc6c29' : i === 1 ? '#125d30' : '#9ca3af' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights Feed */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb size={20} className="text-[#125d30]" />
            <h2 className="text-base font-black text-gray-900">Insights Recentes</h2>
          </div>
          <div className="space-y-3">
            {insightsFeed.map((ins, i) => {
              const cfg = insightConfig[ins.tipo];
              const Icon = cfg.icone;
              return (
                <div
                  key={i}
                  className={`rounded-2xl p-4 ${cfg.bg} cursor-pointer transition-all hover:shadow-sm ${activeInsight === i ? 'ring-2 ring-offset-1 ring-gray-200' : ''}`}
                  onClick={() => setActiveInsight(activeInsight === i ? null : i)}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={16} className={`${cfg.cor} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${cfg.cor} leading-snug`}>{ins.texto}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ins.data}</span>
                        <button className={`text-[10px] font-black ${cfg.cor} flex items-center gap-1 hover:underline`}>
                          Ver ação <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
