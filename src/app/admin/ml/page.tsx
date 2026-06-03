'use client';

import React, { useEffect, useState } from 'react';
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, Zap, Sparkles,
  ShoppingBag, ChevronRight, Users, Clock, ShieldAlert, BarChart3,
  Loader2, RefreshCcw, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface MLInsights {
  produtosEmAlta: { id: string; name: string; count: number; revenue: number }[];
  feirantesEmRisco: { id: string; nome: string; diasSemVenda: number }[];
  melhorHorario: { hora: string; pedidos: number; recomendacao: string };
  previsaoProximos7: { dia: string; pedidosPrevistoss: number }[];
  alertaPico: string | null;
  pedidosSuspeitos: { id: string; valor: string; data: string; motivo: string }[];
  totalOrdersAnalisados: number;
  generatedAt: string;
}

export default function AdminMLPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<MLInsights | null>(null);
  const [error, setError] = useState('');

  async function fetchInsights() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { setError('Sessão expirada. Faça login novamente.'); return; }

      const res = await fetch('/api/admin/ml/insights', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());

      if (res.success) {
        setInsights(res.data);
        setError('');
      } else {
        setError(res.error || 'Erro ao carregar insights.');
      }
    } catch (e: any) {
      setError('Falha na conexão com a API de ML.');
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchInsights(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsights();
  };

  const maxPrev = Math.max(...(insights?.previsaoProximos7.map(d => d.pedidosPrevistoss) || [1]), 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin" className="hover:text-green-700 transition-colors">Admin</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Machine Learning & IA</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-2xl">
              <Brain size={28} className="text-purple-700" />
            </div>
            <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight">Inteligência Artificial</h1>
          </div>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed max-w-2xl">
            Insights gerados por algoritmos de Machine Learning em cima dos dados reais da plataforma. Atualizado a cada acesso.
          </p>
          {insights && (
            <p className="text-xs text-gray-400 font-bold mt-1">
              Baseado em <span className="text-green-700">{insights.totalOrdersAnalisados} pedidos</span> analisados • 
              Última atualização: {new Date(insights.generatedAt).toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-[20px] font-bold hover:bg-purple-800 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-purple-900/20"
        >
          <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Atualizando...' : 'Atualizar Insights'}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-[24px] flex items-center gap-4">
          <AlertTriangle className="text-red-600 shrink-0" size={24} />
          <p className="font-bold text-red-700">{error}</p>
        </div>
      )}

      {/* Pico Alert */}
      {insights?.alertaPico && (
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-[24px] flex items-center gap-4 animate-pulse">
          <Zap className="text-amber-600 shrink-0" size={24} />
          <div>
            <p className="font-black text-amber-800 text-sm uppercase tracking-widest mb-1">⚡ Alerta de Pico de Demanda</p>
            <p className="font-medium text-amber-700">{insights.alertaPico}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative">
            <Brain size={48} className="text-purple-200" />
            <Loader2 size={24} className="animate-spin text-purple-700 absolute -top-1 -right-1" />
          </div>
          <p className="font-bold text-gray-500">Rodando algoritmos de ML nos dados da plataforma...</p>
        </div>
      )}

      {!loading && insights && (
        <>
          {/* Row 1: Produtos em Alta + Melhor Horário */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Produtos em Alta */}
            <div className="lg:col-span-7 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-xl"><TrendingUp size={20} className="text-green-700" /></div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Produtos em Alta</h3>
                    <p className="text-xs text-gray-400 font-medium">Top 5 mais vendidos nos últimos 30 dias</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">ML · Frequência</span>
              </div>
              {insights.produtosEmAlta.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBag size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="font-bold text-gray-400">Nenhum dado de venda disponível ainda.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {insights.produtosEmAlta.map((p, i) => (
                    <div key={p.id} className="px-8 py-4 flex items-center justify-between group hover:bg-gray-50/50 transition-all">
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          i === 1 ? 'bg-gray-100 text-gray-500' : 
                          i === 2 ? 'bg-orange-50 text-orange-600' : 
                          'bg-gray-50 text-gray-400'
                        }`}>#{i+1}</span>
                        <div>
                          <p className="font-black text-gray-900 text-sm">{p.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{p.count} unidades vendidas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-green-700 text-sm">
                          {p.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">faturamento</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Melhor Horário */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-purple-700 text-white p-8 rounded-[40px] shadow-xl shadow-purple-900/20 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={20} className="text-purple-200" />
                    <p className="text-[11px] font-black text-purple-200 uppercase tracking-widest">MELHOR HORÁRIO PARA PROMOÇÕES</p>
                  </div>
                  <h2 className="text-[56px] font-black leading-none mb-2">{insights.melhorHorario.hora}</h2>
                  <p className="text-sm font-bold text-purple-200 mb-6">
                    {insights.melhorHorario.pedidos} pedidos neste horário nos últimos 30 dias
                  </p>
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-sm font-medium text-purple-100">{insights.melhorHorario.recomendacao}</p>
                  </div>
                </div>
                <Clock size={140} className="absolute -bottom-8 -right-8 opacity-5" />
              </div>
            </div>
          </div>

          {/* Row 2: Previsão de Demanda */}
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl"><BarChart3 size={20} className="text-blue-700" /></div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Previsão de Demanda</h3>
                  <p className="text-xs text-gray-400 font-medium">Próximos 7 dias — Regressão Linear baseada no histórico</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">ML · Regressão Linear</span>
            </div>
            <div className="flex items-end gap-4 h-48">
              {insights.previsaoProximos7.map((d, i) => {
                const h = Math.max(8, Math.round((d.pedidosPrevistoss / maxPrev) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                    <span className="text-xs font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-all">
                      {d.pedidosPrevistoss}
                    </span>
                    <div className="w-full bg-gray-50 rounded-2xl relative overflow-hidden flex-1">
                      <div 
                        className="absolute bottom-0 left-0 right-0 rounded-2xl bg-gradient-to-t from-blue-700 to-blue-400 opacity-70 group-hover:opacity-100 transition-all duration-700"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{d.dia}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 3: Churn + Antifraude */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Feirantes em Risco de Churn */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-xl"><TrendingDown size={20} className="text-orange-600" /></div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Risco de Churn</h3>
                    <p className="text-xs text-gray-400 font-medium">Feirantes sem vendas há +15 dias</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full">ML · Churn</span>
              </div>
              {insights.feirantesEmRisco.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 size={40} className="text-green-200 mx-auto mb-3" />
                  <p className="font-bold text-gray-400">Todos os feirantes estão ativos! 🎉</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {insights.feirantesEmRisco.map(f => (
                    <div key={f.id} className="px-8 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center font-black text-orange-600 text-sm">
                          {f.nome[0]?.toUpperCase()}
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{f.nome}</p>
                      </div>
                      <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        +{f.diasSemVenda} dias
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detecção de Anomalias */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-xl"><ShieldAlert size={20} className="text-red-600" /></div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Detecção de Anomalias</h3>
                    <p className="text-xs text-gray-400 font-medium">Pedidos com desvio padrão suspeito</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">ML · Antifraude</span>
              </div>
              {insights.pedidosSuspeitos.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 size={40} className="text-green-200 mx-auto mb-3" />
                  <p className="font-bold text-gray-400">Nenhuma anomalia detectada. ✅</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {insights.pedidosSuspeitos.map(p => (
                    <div key={p.id} className="px-8 py-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-black text-gray-900 text-sm">Pedido #{p.id}</p>
                        <p className="font-black text-red-600 text-sm">{p.valor}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 font-medium">{p.motivo}</p>
                        <p className="text-xs text-gray-400 font-medium">{p.data}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
