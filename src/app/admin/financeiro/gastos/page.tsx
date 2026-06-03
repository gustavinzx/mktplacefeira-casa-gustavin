'use client';

import React, { useState } from 'react';
import Modal from '@/components/admin/Modal';
import {
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Users,
  Monitor,
  Megaphone,
  Truck,
  Briefcase,
  MoreHorizontal,
} from 'lucide-react';

interface CostCenter {
  nome: string;
  icon: React.ElementType;
  orcamento: number;
  gasto: number;
  cor: string;
}

interface RecentExpense {
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  formaPagamento: string;
  status: 'aprovado' | 'pendente aprovação' | 'rejeitado';
}

const costCenters: CostCenter[] = [
  { nome: 'RH & Pessoal', icon: Users, orcamento: 30000, gasto: 28200, cor: 'red' },
  { nome: 'Tecnologia & Infra', icon: Monitor, orcamento: 15000, gasto: 12800, cor: 'red' },
  { nome: 'Marketing & Ads', icon: Megaphone, orcamento: 12000, gasto: 9400, cor: 'yellow' },
  { nome: 'Logística Operacional', icon: Truck, orcamento: 8000, gasto: 6200, cor: 'yellow' },
  { nome: 'Administrativo', icon: Briefcase, orcamento: 6000, gasto: 4840, cor: 'yellow' },
  { nome: 'Outros', icon: MoreHorizontal, orcamento: 9000, gasto: 5800, cor: 'green' },
];

const recentExpenses: RecentExpense[] = [
  { data: '08/05', descricao: 'Folha de Pagamento', categoria: 'RH & Pessoal', valor: 18200, formaPagamento: 'Transferência', status: 'aprovado' },
  { data: '07/05', descricao: 'Google Ads - Campanha Inverno', categoria: 'Marketing & Ads', valor: 3200, formaPagamento: 'Cartão', status: 'aprovado' },
  { data: '06/05', descricao: 'AWS Cloud - Servidores', categoria: 'Tecnologia & Infra', valor: 4200, formaPagamento: 'Boleto', status: 'pendente aprovação' },
  { data: '05/05', descricao: 'Combustível Frota', categoria: 'Logística Operacional', valor: 1800, formaPagamento: 'PIX', status: 'aprovado' },
  { data: '04/05', descricao: 'Material de Escritório', categoria: 'Administrativo', valor: 420, formaPagamento: 'Cartão', status: 'rejeitado' },
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
}

function getBarColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-yellow-400';
  return 'bg-[#125d30]';
}

function getBarBg(pct: number): string {
  if (pct >= 90) return 'bg-red-50';
  if (pct >= 70) return 'bg-yellow-50';
  return 'bg-green-50';
}

function StatusBadge({ status }: { status: RecentExpense['status'] }) {
  if (status === 'aprovado') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-green-50 text-green-700">
      <CheckCircle2 size={11} />Aprovado
    </span>
  );
  if (status === 'rejeitado') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-red-50 text-red-600">
      <XCircle size={11} />Rejeitado
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-yellow-50 text-yellow-700">
      <Clock size={11} />Pendente
    </span>
  );
}

export default function GastosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    categoria: '',
    descricao: '',
    valor: '',
    data: '',
    formaPagamento: '',
    centroCusto: '',
    aprovador: '',
  });

  function handleField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const totalOrcamento = costCenters.reduce((s, c) => s + c.orcamento, 0);
  const totalGasto = costCenters.reduce((s, c) => s + c.gasto, 0);
  const pctTotal = Math.round((totalGasto / totalOrcamento) * 100);
  const economizado = totalOrcamento - totalGasto;
  const noLimite = costCenters.filter(c => Math.round((c.gasto / c.orcamento) * 100) >= 90).length;

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Financeiro & ERP</p>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Centro de Custos</h1>
          <p className="text-gray-500 mt-1 font-medium">Controle orçamentário por categoria — maio/2026</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-green-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Gasto
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Orçamento Total</p>
          <p className="text-[28px] font-black text-gray-900 tracking-tight leading-none">{formatCurrency(totalOrcamento)}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Maio/2026</p>
        </div>
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Gasto Até Agora</p>
          <p className="text-[28px] font-black text-gray-900 tracking-tight leading-none">{formatCurrency(totalGasto)}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#fc6c29] rounded-full" style={{ width: `${pctTotal}%` }}></div>
            </div>
            <span className="text-xs font-black text-[#fc6c29]">{pctTotal}%</span>
          </div>
        </div>
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Economizado</p>
          <p className="text-[28px] font-black text-[#125d30] tracking-tight leading-none">{formatCurrency(economizado)}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Saldo restante do mês</p>
        </div>
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Categorias no Limite</p>
          <div className="flex items-baseline gap-2">
            <p className="text-[28px] font-black text-red-600 tracking-tight leading-none">{noLimite}</p>
            <span className="text-sm font-bold text-gray-400">categorias</span>
          </div>
          <p className="text-xs text-red-400 font-medium mt-1 flex items-center gap-1"><AlertTriangle size={11} />Atenção necessária</p>
        </div>
      </div>

      {/* Cost Centers */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-50">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Centros de Custo</p>
          <h2 className="text-lg font-black text-gray-900">Orçamento vs. Realizado</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {costCenters.map((c) => {
            const pct = Math.round((c.gasto / c.orcamento) * 100);
            return (
              <div key={c.nome} className="px-7 py-5 flex items-center gap-6 hover:bg-gray-50/50 transition-colors">
                <div className={`p-2.5 rounded-2xl ${getBarBg(pct)} flex-shrink-0`}>
                  <c.icon size={20} className={pct >= 90 ? 'text-red-500' : pct >= 70 ? 'text-yellow-500' : 'text-[#125d30]'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-black text-gray-900">{c.nome}</span>
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-xs font-bold text-gray-400">Orç: {formatCurrency(c.orcamento)}</span>
                      <span className="text-xs font-bold text-gray-400">Gasto: {formatCurrency(c.gasto)}</span>
                      <span className={`text-xs font-black w-10 ${pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-yellow-600' : 'text-[#125d30]'}`}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getBarColor(pct)}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <button className="flex-shrink-0 px-4 py-2 border border-gray-200 text-[11px] font-black text-gray-500 rounded-full hover:border-[#125d30] hover:text-[#125d30] transition-colors whitespace-nowrap">
                  Ver Lançamentos
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-50">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Lançamentos Recentes</p>
          <h2 className="text-lg font-black text-gray-900">Gastos do Período</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Data</th>
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Descrição</th>
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Categoria</th>
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-right">Valor</th>
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Pagamento</th>
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentExpenses.map((e, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-7 py-4 text-sm font-bold text-gray-500">{e.data}</td>
                  <td className="px-7 py-4 text-sm font-bold text-gray-900">{e.descricao}</td>
                  <td className="px-7 py-4 text-sm font-medium text-gray-500">{e.categoria}</td>
                  <td className="px-7 py-4 text-sm font-black text-red-600 text-right">{formatCurrency(e.valor)}</td>
                  <td className="px-7 py-4 text-sm font-medium text-gray-500">{e.formaPagamento}</td>
                  <td className="px-7 py-4 text-center"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Gasto */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Novo Gasto">
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Categoria</label>
            <select
              value={form.categoria}
              onChange={e => handleField('categoria', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors bg-white"
            >
              <option value="">Selecione...</option>
              <option>RH & Pessoal</option>
              <option>Tecnologia & Infra</option>
              <option>Marketing & Ads</option>
              <option>Logística Operacional</option>
              <option>Administrativo</option>
              <option>Outros</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Descrição</label>
            <input
              type="text"
              value={form.descricao}
              onChange={e => handleField('descricao', e.target.value)}
              placeholder="Descreva o gasto..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Valor (R$)</label>
              <input
                type="number"
                value={form.valor}
                onChange={e => handleField('valor', e.target.value)}
                placeholder="0,00"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={e => handleField('data', e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Forma de Pagamento</label>
            <select
              value={form.formaPagamento}
              onChange={e => handleField('formaPagamento', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors bg-white"
            >
              <option value="">Selecione...</option>
              <option>Transferência</option>
              <option>Cartão</option>
              <option>Boleto</option>
              <option>PIX</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Centro de Custo</label>
            <input
              type="text"
              value={form.centroCusto}
              onChange={e => handleField('centroCusto', e.target.value)}
              placeholder="Ex: Operações SP"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Aprovador</label>
            <input
              type="text"
              value={form.aprovador}
              onChange={e => handleField('aprovador', e.target.value)}
              placeholder="Nome do aprovador"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Comprovante</label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl px-4 py-6 text-center hover:border-[#125d30]/40 transition-colors cursor-pointer">
              <p className="text-sm font-bold text-gray-400">Clique para anexar comprovante</p>
              <p className="text-[11px] text-gray-300 mt-1">PDF, JPG ou PNG — máx. 5MB</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-3 rounded-[20px] border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm hover:bg-green-800 transition-colors"
            >
              Registrar Gasto
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
