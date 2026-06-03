'use client';

import React, { useState } from 'react';
import {
  ChevronRight, Search, Filter, CheckCircle2, XCircle, Clock, Eye,
  Building2, CreditCard, TrendingUp, AlertCircle, Check, X, FileText, Download, Plus
} from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/admin/Modal';

type Status = 'pendente' | 'aprovado' | 'reprovado' | 'analise';

interface Solicitacao {
  id: number;
  empresa: string;
  cnpj: string;
  contato: string;
  email: string;
  limiteSolicitado: number;
  limiteAtual: number;
  faturamento: number;
  tempo: string;
  status: Status;
  score: number;
  motivo?: string;
}

const solicitacoes: Solicitacao[] = [
  { id: 1, empresa: 'Restaurante Vila Verde', cnpj: '12.345.678/0001-99', contato: 'Carlos Mendes', email: 'carlos@vilaverde.com', limiteSolicitado: 25000, limiteAtual: 10000, faturamento: 85000, tempo: 'há 2 horas', status: 'pendente', score: 78 },
  { id: 2, empresa: 'Mercearia São Paulo', cnpj: '98.765.432/0001-11', contato: 'Ana Souza', email: 'ana@mercearia.com', limiteSolicitado: 50000, limiteAtual: 20000, faturamento: 210000, tempo: 'há 5 horas', status: 'pendente', score: 85 },
  { id: 3, empresa: 'Buffet Bom Sabor', cnpj: '45.678.901/0001-55', contato: 'Marcos Lima', email: 'marcos@buffet.com', limiteSolicitado: 15000, limiteAtual: 0, faturamento: 45000, tempo: 'há 1 dia', status: 'analise', score: 62 },
  { id: 4, empresa: 'Supermercado Fresco', cnpj: '33.221.100/0001-77', contato: 'Paula Castro', email: 'paula@fresco.com', limiteSolicitado: 100000, limiteAtual: 30000, faturamento: 380000, tempo: 'há 2 dias', status: 'aprovado', score: 92 },
  { id: 5, empresa: 'Lanchonete Centro', cnpj: '77.654.321/0001-44', contato: 'Thiago Nunes', email: 'thiago@lanche.com', limiteSolicitado: 8000, limiteAtual: 0, faturamento: 18000, tempo: 'há 3 dias', status: 'reprovado', score: 41, motivo: 'Score insuficiente e histórico de atraso' },
  { id: 6, empresa: 'Distribuidora Verde', cnpj: '55.443.221/0001-88', contato: 'Renata Braga', email: 'renata@dverde.com', limiteSolicitado: 60000, limiteAtual: 25000, faturamento: 195000, tempo: 'há 4 dias', status: 'pendente', score: 80 },
];

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  pendente: { label: 'Pendente', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Clock },
  aprovado: { label: 'Aprovado', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle2 },
  reprovado: { label: 'Reprovado', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle },
  analise: { label: 'Em Análise', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: AlertCircle },
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-black ${score >= 80 ? 'text-green-700' : score >= 60 ? 'text-yellow-700' : 'text-red-600'}`}>{score}</span>
    </div>
  );
}

export default function AdminB2BCreditoPage() {
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Solicitacao | null>(null);
  const [modalType, setModalType] = useState<'view' | 'approve' | 'reject' | null>(null);
  const [motivo, setMotivo] = useState('');
  const [limiteAprovado, setLimiteAprovado] = useState('');

  const openModal = (item: Solicitacao, type: 'view' | 'approve' | 'reject') => {
    setSelected(item);
    setModalType(type);
    setLimiteAprovado(String(item.limiteSolicitado));
    setMotivo('');
  };

  const filtered = solicitacoes.filter(s =>
    (filter === 'all' || s.status === filter) &&
    (search === '' || s.empresa.toLowerCase().includes(search.toLowerCase()) || s.cnpj.includes(search))
  );

  const counts = {
    all: solicitacoes.length,
    pendente: solicitacoes.filter(s => s.status === 'pendente').length,
    analise: solicitacoes.filter(s => s.status === 'analise').length,
    aprovado: solicitacoes.filter(s => s.status === 'aprovado').length,
    reprovado: solicitacoes.filter(s => s.status === 'reprovado').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/b2b" className="hover:text-green-700 transition-colors">B2B & Atacado</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Aprovação de Crédito</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Crédito B2B</h1>
          <p className="text-[16px] text-gray-500 font-medium">Gerencie solicitações de limite de crédito para compradores atacadistas.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-4 bg-white border border-gray-100 rounded-[24px] font-bold text-gray-500 flex items-center gap-2 shadow-sm hover:text-gray-900 transition-all">
            <Download size={18} />
            Exportar
          </button>
          <button className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all flex items-center gap-2">
            <Plus size={18} />
            Nova Política
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Aguardando', value: counts.pendente, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
          { label: 'Em Análise', value: counts.analise, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Aprovados (mês)', value: counts.aprovado, icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Reprovados (mês)', value: counts.reprovado, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`bg-white rounded-[32px] border ${border} p-8 shadow-sm`}>
            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
              <Icon size={24} className={color} />
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-4xl font-black text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar por empresa ou CNPJ..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[24px] outline-none font-bold text-sm shadow-sm focus:border-green-600/30 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pendente', 'analise', 'aprovado', 'reprovado'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                filter === f ? 'bg-[#125d30] text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-500 hover:text-gray-900 shadow-sm'
              }`}
            >
              {f === 'all' ? 'Todos' : statusConfig[f].label}
              <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Empresa</th>
                <th className="text-left px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Limite Solicitado</th>
                <th className="text-left px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Faturamento Anual</th>
                <th className="text-left px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest w-40">Score</th>
                <th className="text-left px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => {
                const cfg = statusConfig[s.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                          <Building2 size={18} className="text-green-700" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm">{s.empresa}</p>
                          <p className="text-[11px] text-gray-400 font-medium">{s.cnpj}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-black text-gray-900">R$ {s.limiteSolicitado.toLocaleString('pt-BR')}</p>
                      <p className="text-[11px] text-gray-400">Atual: R$ {s.limiteAtual.toLocaleString('pt-BR')}</p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-bold text-gray-700">R$ {s.faturamento.toLocaleString('pt-BR')}/ano</p>
                    </td>
                    <td className="px-6 py-6 w-40">
                      <ScoreBar score={s.score} />
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon size={12} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openModal(s, 'view')} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                          <Eye size={16} />
                        </button>
                        {(s.status === 'pendente' || s.status === 'analise') && (
                          <>
                            <button onClick={() => openModal(s, 'approve')} className="p-2.5 bg-green-50 rounded-xl text-green-700 hover:bg-green-700 hover:text-white transition-all">
                              <Check size={16} />
                            </button>
                            <button onClick={() => openModal(s, 'reject')} className="p-2.5 bg-red-50 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all">
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Detalhes */}
      <Modal isOpen={modalType === 'view' && !!selected} onClose={() => setModalType(null)} title="Detalhes da Solicitação">
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[24px]">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                <Building2 size={28} className="text-green-700" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{selected.empresa}</h3>
                <p className="text-sm text-gray-400 font-medium">{selected.cnpj}</p>
              </div>
              <div className="ml-auto">
                <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border ${statusConfig[selected.status].bg} ${statusConfig[selected.status].color}`}>
                  {statusConfig[selected.status].label}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Contato', value: selected.contato },
                { label: 'E-mail', value: selected.email },
                { label: 'Limite Solicitado', value: `R$ ${selected.limiteSolicitado.toLocaleString('pt-BR')}` },
                { label: 'Limite Atual', value: `R$ ${selected.limiteAtual.toLocaleString('pt-BR')}` },
                { label: 'Faturamento Anual', value: `R$ ${selected.faturamento.toLocaleString('pt-BR')}` },
                { label: 'Score de Crédito', value: `${selected.score}/100` },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-gray-50 rounded-[20px]">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="font-black text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            {selected.motivo && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-[20px]">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Motivo da Reprovação</p>
                <p className="text-sm font-medium text-red-700">{selected.motivo}</p>
              </div>
            )}
            <button className="w-full py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-900 flex items-center justify-center gap-2">
              <FileText size={18} />
              Baixar Relatório Completo
            </button>
          </div>
        )}
      </Modal>

      {/* MODAL: Aprovar */}
      <Modal isOpen={modalType === 'approve' && !!selected} onClose={() => setModalType(null)} title="Aprovar Limite de Crédito">
        {selected && (
          <div className="space-y-6">
            <div className="p-6 bg-green-50 border border-green-100 rounded-[24px]">
              <p className="font-black text-green-800 mb-1">{selected.empresa}</p>
              <p className="text-sm text-green-700 font-medium">Score: {selected.score}/100 — {selected.score >= 80 ? 'Risco Baixo' : selected.score >= 60 ? 'Risco Médio' : 'Risco Alto'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Limite a Aprovar (R$)</label>
              <input
                type="number"
                value={limiteAprovado}
                onChange={e => setLimiteAprovado(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[20px] outline-none font-black text-lg transition-all"
              />
              <p className="text-xs text-gray-400 ml-4">Solicitado: R$ {selected.limiteSolicitado.toLocaleString('pt-BR')}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Observações (opcional)</label>
              <textarea
                placeholder="Condições especiais, validade, etc."
                className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[24px] outline-none font-medium text-sm min-h-[100px] resize-none transition-all"
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button onClick={() => setModalType(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-900 transition-all">
                Cancelar
              </button>
              <button className="flex-1 py-4 bg-[#125d30] text-white rounded-[20px] font-bold shadow-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                Confirmar Aprovação
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Reprovar */}
      <Modal isOpen={modalType === 'reject' && !!selected} onClose={() => setModalType(null)} title="Reprovar Solicitação">
        {selected && (
          <div className="space-y-6">
            <div className="p-6 bg-red-50 border border-red-100 rounded-[24px]">
              <p className="font-black text-red-800 mb-1">{selected.empresa}</p>
              <p className="text-sm text-red-600 font-medium">Limite solicitado: R$ {selected.limiteSolicitado.toLocaleString('pt-BR')}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Motivo da Reprovação *</label>
              <textarea
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Descreva o motivo para a empresa..."
                className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-red-400/40 focus:bg-white rounded-[24px] outline-none font-medium text-sm min-h-[120px] resize-none transition-all"
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button onClick={() => setModalType(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-900">
                Cancelar
              </button>
              <button className="flex-1 py-4 bg-red-600 text-white rounded-[20px] font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                <XCircle size={18} />
                Confirmar Reprovação
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
