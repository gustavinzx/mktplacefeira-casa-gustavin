'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp, ShoppingBasket, Users, Truck, Plus, Calendar, Download,
  AlertCircle, CheckCircle2, Eye, Megaphone, BarChart3,
  ArrowUpRight, ArrowDownRight, Loader2, X, RefreshCw, ChevronDown,
  Package, Info, Store, CheckCircle, Slash, ExternalLink,
  Shield, BarChart2, LineChart,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CarouselHero from '@/components/CarouselHero';
import { useToast } from '@/components/Toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type DateRange = '7d' | '30d' | '90d';

type KPI = {
  vendasB2C: number;
  vendasB2B: number;
  novosLojistas: number;
  prevB2C: number;
  prevB2B: number;
  prevLojistas: number;
};

type WeekBar = { day: string; b2c: number; b2b: number };

type PendingApproval = {
  id: string;
  stall_name: string;
  type: 'Feirante';
  region: string;
  fair_name: string;
  created_at: string;
};

type Alert = {
  id: string;
  title: string;
  description: string;
  level: 'critical' | 'warning' | 'info';
  time: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function pctChange(curr: number, prev: number): { label: string; up: boolean } {
  if (!prev && !curr) return { label: '—', up: true };
  if (!prev) return { label: '+100%', up: true };
  const p = ((curr - prev) / prev) * 100;
  return { label: `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`, up: p >= 0 };
}

function rangeFrom(range: DateRange): string {
  const d = new Date();
  d.setDate(d.getDate() - (range === '7d' ? 7 : range === '30d' ? 30 : 90));
  return d.toISOString();
}

function prevRangeFrom(range: DateRange): string {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days * 2);
  return d.toISOString();
}

const RANGE_LABELS: Record<DateRange, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
};

const WEEK_DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

// Demo data used when there are no real orders yet
const DEMO_BARS: WeekBar[] = [
  { day: 'SEG', b2c: 8200,  b2b: 3100  },
  { day: 'TER', b2c: 14500, b2b: 5800  },
  { day: 'QUA', b2c: 21000, b2b: 9200  },
  { day: 'QUI', b2c: 16800, b2b: 7100  },
  { day: 'SEX', b2c: 18300, b2b: 8400  },
  { day: 'SAB', b2c: 27600, b2b: 12100 },
  { day: 'DOM', b2c: 11200, b2b: 4700  },
];

// ── WeeklyChart component ──────────────────────────────────────────────────────

function WeeklyChart({
  data, loading, onRefresh,
}: {
  data: WeekBar[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [type, setType] = React.useState<'bar' | 'line'>('bar');

  const bars = data;
  const maxVal = Math.max(...bars.map(b => Math.max(b.b2c, b.b2b)), 1);

  // SVG layout constants
  const W = 700, H = 200;
  const PT = 16, PB = 32, PL = 28, PR = 28;
  const cW = W - PL - PR;
  const cH = H - PT - PB;
  const n = bars.length;
  const xOf = (i: number) => PL + (i / (n - 1)) * cW;
  const yOf = (v: number) => PT + cH - (v / maxVal) * cH;

  const smoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const mx = (pts[i - 1].x + pts[i].x) / 2;
      d += ` C ${mx} ${pts[i - 1].y} ${mx} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  };

  const b2cPts = bars.map((b, i) => ({ x: xOf(i), y: yOf(b.b2c) }));
  const b2bPts = bars.map((b, i) => ({ x: xOf(i), y: yOf(b.b2b) }));
  const b2cPath = smoothPath(b2cPts);
  const b2bPath = smoothPath(b2bPts);
  const baseY = PT + cH;

  return (
    <div className="lg:col-span-8 bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">

      {/* Header row */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Desempenho Semanal</h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Legend */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">B2C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">B2B</span>
            </div>
          </div>

          {/* Chart type toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setType('bar')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-black transition-all ${
                type === 'bar'
                  ? 'bg-white dark:bg-gray-700 text-green-700 shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <BarChart2 size={13} /> Colunas
            </button>
            <button
              onClick={() => setType('line')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-black transition-all ${
                type === 'line'
                  ? 'bg-white dark:bg-gray-700 text-green-700 shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <LineChart size={13} /> Linhas
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 text-gray-300 hover:text-green-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
        </div>
      </div>

      {/* Chart body */}
      {loading ? (
        <div className="flex items-end gap-2 h-56 px-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0">
              <div className="w-full flex items-end justify-center gap-1 flex-1">
                <div className="rounded-t-lg bg-gray-100 animate-pulse" style={{ width: '40%', height: `${25 + i * 10}%` }} />
                <div className="rounded-t-lg bg-gray-50 animate-pulse" style={{ width: '40%', height: `${12 + i * 6}%` }} />
              </div>
              <div className="w-6 h-2.5 bg-gray-100 rounded animate-pulse mt-3" />
            </div>
          ))}
        </div>
      ) : type === 'bar' ? (
        /* ── Bar chart ── */
        <div className="flex items-end gap-1.5 px-1" style={{ height: '224px' }}>
          {bars.map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group" style={{ height: '100%' }}>
              <div className="w-full flex items-end justify-center gap-1 flex-1">
                <div
                  className="transition-all duration-500 group-hover:opacity-80"
                  style={{
                    width: '42%',
                    height: `${Math.max(6, (bar.b2c / maxVal) * 100)}%`,
                    background: 'linear-gradient(to top, #15803d, #4ade80)',
                    borderRadius: '6px 6px 0 0',
                  }}
                />
                <div
                  className="transition-all duration-500 group-hover:opacity-80"
                  style={{
                    width: '42%',
                    height: `${Math.max(6, (bar.b2b / maxVal) * 100)}%`,
                    background: 'linear-gradient(to top, #c2410c, #fb923c)',
                    borderRadius: '6px 6px 0 0',
                  }}
                />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2.5 mb-0.5">
                {bar.day}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* ── Line chart ── */
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="224"
          overflow="visible"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="gB2C" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gB2B" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <line
              key={t}
              x1={PL} y1={PT + t * cH}
              x2={W - PR} y2={PT + t * cH}
              stroke="#f3f4f6" strokeWidth="1"
            />
          ))}

          {/* Filled areas */}
          <path
            d={`${b2cPath} L ${xOf(n - 1)} ${baseY} L ${xOf(0)} ${baseY} Z`}
            fill="url(#gB2C)"
          />
          <path
            d={`${b2bPath} L ${xOf(n - 1)} ${baseY} L ${xOf(0)} ${baseY} Z`}
            fill="url(#gB2B)"
          />

          {/* Lines */}
          <path d={b2cPath} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={b2bPath} fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots */}
          {bars.map((b, i) => (
            <g key={i}>
              <circle cx={xOf(i)} cy={yOf(b.b2c)} r="5" fill="white" stroke="#16a34a" strokeWidth="2.5" />
              <circle cx={xOf(i)} cy={yOf(b.b2b)} r="5" fill="white" stroke="#ea580c" strokeWidth="2.5" />
            </g>
          ))}

          {/* X-axis labels */}
          {bars.map((b, i) => (
            <text
              key={i}
              x={xOf(i)} y={H - 4}
              textAnchor="middle"
              fontSize="10" fontWeight="800"
              fill="#9ca3af"
              letterSpacing="1.5"
            >
              {b.day}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [range, setRange] = useState<DateRange>('7d');
  const { showToast } = useToast();
  const [showRangeMenu, setShowRangeMenu] = useState(false);

  const [loadingKpi, setLoadingKpi] = useState(true);
  const [loadingApprovals, setLoadingApprovals] = useState(true);

  const [kpi, setKpi] = useState<KPI | null>(null);
  const [weekData, setWeekData] = useState<WeekBar[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [totalPending, setTotalPending] = useState<number | null>(null);

  const [approvalDetail, setApprovalDetail] = useState<PendingApproval | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ── Fetch KPIs ──────────────────────────────────────────────────────────────

  const fetchKpi = useCallback(async () => {
    setLoadingKpi(true);
    try {
      const from = rangeFrom(range);
      const prevFrom = prevRangeFrom(range);

      const [
        { data: b2cCurr },
        { data: b2cPrev },
        { count: lojCurr },
        { count: lojPrev },
      ] = await Promise.all([
        supabase.from('mktplace_feira_orders').select('total_amount').gte('created_at', from),
        supabase.from('mktplace_feira_orders').select('total_amount').gte('created_at', prevFrom).lt('created_at', from),
        supabase.from('mktplace_feira_producers').select('id', { count: 'exact', head: true }).gte('created_at', from),
        supabase.from('mktplace_feira_producers').select('id', { count: 'exact', head: true }).gte('created_at', prevFrom).lt('created_at', from),
      ]);

      const sum = (rows: any[], col: string) =>
        (rows ?? []).reduce((s: number, r: any) => s + Number(r[col] ?? 0), 0);

      setKpi({
        vendasB2C: sum(b2cCurr ?? [], 'total_amount'),
        vendasB2B: 0,
        novosLojistas: lojCurr ?? 0,
        prevB2C: sum(b2cPrev ?? [], 'total_amount'),
        prevB2B: 0,
        prevLojistas: lojPrev ?? 0,
      });

      // Weekly chart — always last 7 days
      const bars: WeekBar[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d); end.setHours(23, 59, 59, 999);
        const [{ data: db2c }] = await Promise.all([
          supabase.from('mktplace_feira_orders').select('total_amount')
            .gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
        ]);
        bars.push({
          day: WEEK_DAYS[d.getDay()],
          b2c: sum(db2c ?? [], 'total_amount'),
          b2b: 0,
        });
      }
      setWeekData(bars);
    } catch (e) {
      console.error('fetchKpi error', e);
    } finally {
      setLoadingKpi(false);
    }
  }, [range]);

  // ── Fetch Approvals + Alerts ────────────────────────────────────────────────

  const fetchApprovals = useCallback(async () => {
    setLoadingApprovals(true);
    try {
      // Total count of pending approvals (for the counter badge)
      const { count: pendingCount } = await supabase
        .from('mktplace_feira_producers')
        .select('id', { count: 'exact', head: true })
        .eq('is_verified', false)
        .neq('status', 'rejected');

      setTotalPending(pendingCount ?? 0);

      // 5 most recent pending producers for the dashboard preview
      const { data: prods } = await supabase
        .from('mktplace_feira_producers')
        .select('id, stall_name, created_at, fair:fair_id(name, location)')
        .eq('is_verified', false)
        .neq('status', 'rejected')
        .order('created_at', { ascending: false })
        .limit(5);

      if (prods) {
        setApprovals(
          prods.map((p: any) => ({
            id: p.id,
            stall_name: p.stall_name,
            type: 'Feirante' as const,
            region: p.fair?.location ?? '—',
            fair_name: p.fair?.name ?? '—',
            created_at: p.created_at,
          }))
        );
      }

      // Alerts from pending devolucoes
      const { data: devs } = await supabase
        .from('mktplace_feira_devolucoes')
        .select('id, order_number, reason, severity, created_at')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false })
        .limit(4);

      if (devs?.length) {
        setAlerts(
          devs.map((d: any) => ({
            id: d.id,
            title: `Devolução: ${d.reason}`,
            description: `Pedido ${d.order_number} aguardando análise`,
            level: (d.severity === 'Alta' ? 'critical' : d.severity === 'Media' ? 'warning' : 'info') as Alert['level'],
            time: new Date(d.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          }))
        );
      } else {
        setAlerts([]);
      }
    } catch (e) {
      console.error('fetchApprovals error', e);
    } finally {
      setLoadingApprovals(false);
    }
  }, []);

  useEffect(() => { fetchKpi(); }, [fetchKpi]);
  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await supabase
        .from('mktplace_feira_producers')
        .update({ is_verified: true, status: 'approved' })
        .eq('id', id);
      setApprovals(prev => prev.filter(a => a.id !== id));
      setApprovalDetail(null);
    } catch (e: any) {
      showToast('Erro ao aprovar: ' + e.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await supabase
        .from('mktplace_feira_producers')
        .update({ status: 'rejected' })
        .eq('id', id);
      setApprovals(prev => prev.filter(a => a.id !== id));
      setApprovalDetail(null);
      showToast('Rejeitado com sucesso.', 'success');
    } catch (e: any) {
      showToast('Erro ao rejeitar: ' + e.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const lines = [
        'Métrica,Valor,Período',
        `Vendas B2C,${kpi?.vendasB2C ?? 0},${RANGE_LABELS[range]}`,
        `Vendas B2B,${kpi?.vendasB2B ?? 0},${RANGE_LABELS[range]}`,
        `Novos Lojistas,${kpi?.novosLojistas ?? 0},${RANGE_LABELS[range]}`,
        `Aprovações Pendentes,${approvals.length},—`,
        `Alertas Ativos,${alerts.length},—`,
        '',
        'Dia,B2C,B2B',
        ...weekData.map(b => `${b.day},${b.b2c},${b.b2b}`),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${range}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    } finally {
      setExporting(false);
    }
  };

  const b2cCh = kpi ? pctChange(kpi.vendasB2C, kpi.prevB2C) : null;
  const b2bCh = kpi ? pctChange(kpi.vendasB2B, kpi.prevB2B) : null;
  const lojCh = kpi ? pctChange(kpi.novosLojistas, kpi.prevLojistas) : null;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <CarouselHero />

      {/* ── Header ── */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[32px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">Overview do Ecossistema</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Bem-vindo de volta. Aqui está o que aconteceu na feira.</p>
        </div>
        <div className="flex gap-3">
          {/* Date range */}
          <div className="relative">
            <button
              onClick={() => setShowRangeMenu(v => !v)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 active:scale-95 text-sm shadow-sm transition-all"
            >
              <Calendar size={16} className="text-gray-400" />
              {RANGE_LABELS[range]}
              <ChevronDown size={13} className={`text-gray-400 transition-transform ${showRangeMenu ? 'rotate-180' : ''}`} />
            </button>
            {showRangeMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRangeMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden min-w-[190px]">
                  {(['7d', '30d', '90d'] as DateRange[]).map(r => (
                    <button key={r} onClick={() => { setRange(r); setShowRangeMenu(false); }}
                      className={`w-full px-5 py-3.5 text-sm font-bold text-left hover:bg-gray-50 transition-colors ${range === r ? 'text-green-700 bg-green-50/50' : 'text-gray-700'}`}>
                      {RANGE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/10 active:scale-95 text-sm transition-all"
          >
            <Download size={16} />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* B2C */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-green-50 rounded-2xl text-green-700"><ShoppingBasket size={24} /></div>
            {loadingKpi
              ? <div className="w-14 h-5 bg-gray-100 rounded animate-pulse" />
              : b2cCh && (
                <span className={`flex items-center gap-0.5 text-[11px] font-black ${b2cCh.up ? 'text-green-600' : 'text-red-600'}`}>
                  {b2cCh.label} {b2cCh.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                </span>
              )}
          </div>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-1">VENDAS B2C</p>
          {loadingKpi
            ? <div className="h-8 w-36 bg-gray-100 rounded-lg animate-pulse mt-1" />
            : <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{fmtCurrency(kpi!.vendasB2C)}</h3>}
        </div>

        {/* B2B */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600"><TrendingUp size={24} /></div>
            {loadingKpi
              ? <div className="w-14 h-5 bg-gray-100 rounded animate-pulse" />
              : b2bCh && (
                <span className={`flex items-center gap-0.5 text-[11px] font-black ${b2bCh.up ? 'text-green-600' : 'text-red-600'}`}>
                  {b2bCh.label} {b2bCh.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                </span>
              )}
          </div>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-1">VENDAS B2B</p>
          {loadingKpi
            ? <div className="h-8 w-36 bg-gray-100 rounded-lg animate-pulse mt-1" />
            : <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{fmtCurrency(kpi!.vendasB2B)}</h3>}
        </div>

        {/* Novos Lojistas */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Users size={24} /></div>
            {loadingKpi
              ? <div className="w-14 h-5 bg-gray-100 rounded animate-pulse" />
              : lojCh && (
                <span className={`flex items-center gap-0.5 text-[11px] font-black ${lojCh.up ? 'text-green-600' : 'text-red-600'}`}>
                  {lojCh.label} {lojCh.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                </span>
              )}
          </div>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-1">NOVOS LOJISTAS</p>
          {loadingKpi
            ? <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse mt-1" />
            : <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{kpi!.novosLojistas}</h3>}
        </div>

        {/* Eficiência Logística */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><Truck size={24} /></div>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-[9px] font-black uppercase tracking-wider">EM ROTA</span>
          </div>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-1">EFICIÊNCIA LOGÍSTICA</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">94.8%</h3>
        </div>
      </div>

      {/* ── Chart + Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <WeeklyChart data={weekData} loading={loadingKpi} onRefresh={fetchKpi} />


        {/* Alerts */}
        <div className="lg:col-span-4 bg-gray-50 dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertCircle size={18} /></div>
              Alertas
            </h3>
            {alerts.length > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">{alerts.length}</span>
            )}
          </div>

          {loadingApprovals ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-green-300" />
              <p className="text-sm font-bold text-gray-400">Nenhum alerta ativo</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {alerts.map(a => (
                <div key={a.id} className={`p-4 bg-white rounded-2xl border-l-4 shadow-sm ${
                  a.level === 'critical' ? 'border-red-500' : a.level === 'warning' ? 'border-orange-400' : 'border-green-500'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-black leading-tight ${
                      a.level === 'critical' ? 'text-red-600' : a.level === 'warning' ? 'text-orange-600' : 'text-green-700'
                    }`}>{a.title}</h4>
                    <span className="text-[9px] font-bold text-gray-400 ml-2 shrink-0">{a.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{a.description}</p>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/gestao/feirantes/devolucoes"
            className="w-full py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-green-700 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            Ver devoluções <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      {/* ── Approvals Table ── */}
      <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-8 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Fila de Aprovações Pendentes</h3>
            <p className="text-xs text-gray-400 font-bold mt-0.5">Feirantes aguardando verificação de cadastro.</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="px-4 py-1.5 bg-gray-50 rounded-lg">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Total: {loadingApprovals ? '—' : (totalPending ?? approvals.length)}
              </span>
            </div>
            <button onClick={fetchApprovals} className="p-2 text-gray-300 hover:text-green-700 rounded-xl hover:bg-gray-50 transition-all">
              {loadingApprovals ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            </button>
            <Link href="/admin/gestao/feirantes"
              className="text-[11px] font-black text-green-700 uppercase tracking-widest hover:underline">
              Ver fila completa
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">SOLICITANTE</th>
                <th className="px-6 py-5">TIPO</th>
                <th className="px-6 py-5">REGIÃO</th>
                <th className="px-6 py-5">DATA SOLICITAÇÃO</th>
                <th className="px-6 py-5">STATUS DOC.</th>
                <th className="px-8 py-5 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingApprovals ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center">
                    <Loader2 size={22} className="animate-spin mx-auto text-gray-300" />
                  </td>
                </tr>
              ) : approvals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-14 text-center">
                    <CheckCircle2 size={36} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-sm font-bold text-gray-400">Nenhuma aprovação pendente</p>
                  </td>
                </tr>
              ) : (
                approvals.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex-shrink-0 flex items-center justify-center">
                          <Store size={18} className="text-orange-400" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm">{row.stall_name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{row.fair_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-orange-50 text-orange-600">
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-500">{row.region}</td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-900">
                      {new Date(row.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                        <span className="text-[11px] font-bold text-gray-600">Pendente</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setApprovalDetail(row)}
                          className="p-2 text-gray-300 hover:text-green-700 transition-all rounded-xl hover:bg-gray-100"
                          title="Ver detalhes"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          onClick={() => handleReject(row.id)}
                          disabled={processingId === row.id}
                          className="p-2 text-gray-300 hover:text-red-600 transition-all rounded-xl hover:bg-red-50 disabled:opacity-50"
                          title="Rejeitar"
                        >
                          {processingId === row.id
                            ? <Loader2 size={17} className="animate-spin" />
                            : <Slash size={17} />}
                        </button>
                        <button
                          onClick={() => handleApprove(row.id)}
                          disabled={processingId === row.id}
                          className="px-4 py-2 bg-green-600 text-white text-[10px] font-black rounded-xl hover:bg-green-700 shadow-md disabled:opacity-60 flex items-center gap-1.5 transition-all"
                        >
                          {processingId === row.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <CheckCircle size={12} />}
                          Aprovar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* "Ver mais" footer when there are more than 5 pending */}
        {!loadingApprovals && totalPending !== null && totalPending > 5 && (
          <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-bold">
              Exibindo <span className="text-gray-700">5</span> de{' '}
              <span className="text-orange-600 font-black">{totalPending}</span> solicitações pendentes
            </p>
            <Link
              href="/admin/gestao/feirantes"
              className="text-xs font-black text-green-700 hover:underline flex items-center gap-1.5"
            >
              Ver todas as {totalPending} pendentes <ExternalLink size={11} />
            </Link>
          </div>
        )}
      </div>

      {/* ── Footer Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        <Link href="/admin/gestao/feirantes"
          className="bg-green-800 p-8 rounded-[40px] text-white group cursor-pointer hover:bg-green-900 transition-all shadow-xl shadow-green-900/10 relative overflow-hidden">
          <Plus size={100} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="p-3 bg-white/10 w-fit rounded-2xl mb-6"><Plus size={24} /></div>
          <h4 className="text-xl font-black mb-2">Cadastrar Novo Feirante</h4>
          <p className="text-xs text-white/70 font-medium leading-relaxed">Inicie o onboarding manual de um novo parceiro estratégico.</p>
        </Link>

        <Link href="/admin/marketing/campanhas"
          className="bg-[#fc6c29] p-8 rounded-[40px] text-white group cursor-pointer hover:bg-[#e65a1d] transition-all shadow-xl shadow-orange-900/10 relative overflow-hidden">
          <Megaphone size={100} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="p-3 bg-white/10 w-fit rounded-2xl mb-6"><Megaphone size={24} /></div>
          <h4 className="text-xl font-black mb-2">Lançar Campanha B2B</h4>
          <p className="text-xs text-white/70 font-medium leading-relaxed">Crie cupons de desconto exclusivos para compras em atacado.</p>
        </Link>

        <Link href="/admin/relatorios"
          className="bg-gray-100 dark:bg-gray-900 p-8 rounded-[40px] group cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-all shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <BarChart3 size={100} className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform text-gray-900" />
          <div className="p-3 bg-gray-200 dark:bg-gray-800 w-fit rounded-2xl mb-6 text-gray-900 dark:text-white"><BarChart3 size={24} /></div>
          <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">Relatório de Logística</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Analise os gargalos de entrega por região metropolitana.</p>
        </Link>
      </div>

      {/* ── Approval Detail Modal ── */}
      {approvalDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 w-[480px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-7">
              <h3 className="text-lg font-black text-gray-900">Detalhes do Cadastro</h3>
              <button onClick={() => setApprovalDetail(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-orange-50 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Store size={22} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-black text-gray-900">{approvalDetail.stall_name}</p>
                  <p className="text-xs text-gray-400 font-medium">{approvalDetail.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Feira</p>
                  <p className="text-sm font-bold text-gray-800">{approvalDetail.fair_name}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Região</p>
                  <p className="text-sm font-bold text-gray-800">{approvalDetail.region}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 col-span-2">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Data de Cadastro</p>
                  <p className="text-sm font-bold text-gray-800">
                    {new Date(approvalDetail.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                <Info size={14} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-bold">
                  Ao aprovar, o feirante será marcado como verificado e poderá publicar produtos.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleReject(approvalDetail.id)}
                disabled={!!processingId}
                className="flex-1 py-3.5 border border-red-200 text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Rejeitar
              </button>
              <button
                onClick={() => handleApprove(approvalDetail.id)}
                disabled={!!processingId}
                className="flex-1 py-3.5 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {processingId ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                Aprovar Feirante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Export Modal ── */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 w-[420px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-7">
              <h3 className="text-lg font-black text-gray-900">Exportar Relatório</h3>
              <button onClick={() => setShowExportModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-8">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Período selecionado</p>
                <p className="text-sm font-bold text-gray-800">{RANGE_LABELS[range]}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 space-y-3">
                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Resumo dos dados</p>
                {[
                  ['Vendas B2C', fmtCurrency(kpi?.vendasB2C ?? 0)],
                  ['Vendas B2B', fmtCurrency(kpi?.vendasB2B ?? 0)],
                  ['Novos Lojistas', String(kpi?.novosLojistas ?? 0)],
                  ['Aprovações Pendentes', String(approvals.length)],
                  ['Alertas Ativos', String(alerts.length)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-xs font-bold text-green-800">{k}</span>
                    <span className="text-xs font-black text-green-900">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3">
                <Package size={14} className="text-blue-500 shrink-0" />
                <p className="text-[11px] text-blue-700 font-medium">O arquivo incluirá também os dados do gráfico semanal.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowExportModal(false)}
                className="flex-1 py-3.5 border border-gray-200 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleExport} disabled={exporting || loadingKpi}
                className="flex-1 py-3.5 bg-green-700 text-white rounded-2xl font-black text-sm hover:bg-green-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Baixar CSV
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
