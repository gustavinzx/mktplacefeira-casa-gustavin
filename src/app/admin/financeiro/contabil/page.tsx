'use client';

import React, { useState } from 'react';
import Modal from '@/components/admin/Modal';
import {
  Plus,
  Download,
  BookOpen,
  LayoutList,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface JournalEntry {
  data: string;
  contaDebito: string;
  contaCredito: string;
  historico: string;
  valor: number;
}

const journalEntries: JournalEntry[] = [
  { data: '09/05', contaDebito: '1.1.1 Caixa', contaCredito: '3.2 Resultado', historico: 'Comissões recebidas de feirantes', valor: 28400 },
  { data: '08/05', contaDebito: '3.2 Resultado', contaCredito: '2.1.1 A Pagar', historico: 'Folha de pagamento — Maio/26', valor: 18200 },
  { data: '07/05', contaDebito: '1.1.1 Caixa', contaCredito: '3.2 Resultado', historico: 'Assinaturas mensais recebidas', valor: 14800 },
  { data: '06/05', contaDebito: '3.2 Resultado', contaCredito: '2.1.1 A Pagar', historico: 'Fornecedores de TI — AWS', valor: 8400 },
  { data: '05/05', contaDebito: '1.1.1 Caixa', contaCredito: '3.2 Resultado', historico: 'Taxas de delivery — Maio/26', valor: 9200 },
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
}

interface ChartNode {
  code: string;
  name: string;
  value?: number;
  level: 0 | 1 | 2;
  type?: 'group' | 'item';
}

const chartOfAccounts: ChartNode[] = [
  { code: '1', name: 'ATIVO', level: 0 },
  { code: '1.1', name: 'Ativo Circulante', level: 1 },
  { code: '1.1.1', name: 'Caixa e Equivalentes', level: 2, value: 48200 },
  { code: '1.1.2', name: 'Contas a Receber', level: 2, value: 48200 },
  { code: '1.2', name: 'Ativo Não Circulante', level: 1 },
  { code: '1.2.1', name: 'Imobilizado', level: 2, value: 12400 },
  { code: '2', name: 'PASSIVO', level: 0 },
  { code: '2.1', name: 'Passivo Circulante', level: 1 },
  { code: '2.1.1', name: 'Contas a Pagar', level: 2, value: 22100 },
  { code: '2.1.2', name: 'Obrigações Fiscais', level: 2, value: 8840 },
  { code: '3', name: 'PATRIMÔNIO LÍQUIDO', level: 0 },
  { code: '3.1', name: 'Capital Social', level: 1, value: 200000 },
  { code: '3.2', name: 'Resultado do Exercício', level: 1, value: 75560 },
];

const contasOptions = [
  '1.1.1 Caixa e Equivalentes',
  '1.1.2 Contas a Receber',
  '1.2.1 Imobilizado',
  '2.1.1 Contas a Pagar',
  '2.1.2 Obrigações Fiscais',
  '3.1 Capital Social',
  '3.2 Resultado do Exercício',
];

export default function ContabilPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    data: '',
    contaDebito: '',
    contaCredito: '',
    historico: '',
    valor: '',
  });

  function handleField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Financeiro & ERP</p>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Contabilidade</h1>
          <p className="text-gray-500 mt-1 font-medium">Plano de contas e lançamentos contábeis — 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-3 border border-gray-200 text-gray-600 rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Exportar SPED
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-green-800 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: 'Contas Ativas', value: '13', sub: 'No plano de contas' },
          { label: 'Lançamentos do Mês', value: '148', sub: 'Maio/2026' },
          { label: 'Saldo Geral', value: 'R$75.560', sub: 'Resultado positivo' },
          { label: 'Pendentes Conciliação', value: '6', sub: 'Requer atenção' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{k.label}</p>
            <p className="text-[28px] font-black text-gray-900 tracking-tight leading-none">{k.value}</p>
            <p className="text-xs text-gray-400 font-medium mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart of Accounts */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-50 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-xl text-[#125d30]"><BookOpen size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Estrutura Contábil</p>
            <h2 className="text-lg font-black text-gray-900">Plano de Contas</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {chartOfAccounts.map((node) => {
            const isGroup = node.level === 0;
            const isSubGroup = node.level === 1 && node.value === undefined;
            const isL1WithValue = node.level === 1 && node.value !== undefined;
            const isLeaf = node.level === 2;

            return (
              <div
                key={node.code}
                className={`flex items-center justify-between transition-colors hover:bg-gray-50/50 ${
                  isGroup ? 'px-7 py-4 bg-gray-50/80' : isLeaf ? 'px-7 py-3.5' : 'px-7 py-3.5'
                }`}
                style={{ paddingLeft: isLeaf ? '3.5rem' : isL1WithValue || isSubGroup ? '2.5rem' : undefined }}
              >
                <div className="flex items-center gap-3">
                  {isGroup && <div className="w-1.5 h-5 rounded-full bg-[#125d30]"></div>}
                  {(isSubGroup || isL1WithValue) && <ChevronRight size={14} className="text-gray-300" />}
                  {isLeaf && <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>}
                  <span className={`font-black ${
                    isGroup ? 'text-gray-900 text-sm uppercase tracking-wider' :
                    isSubGroup ? 'text-gray-700 text-sm' :
                    'text-gray-600 text-sm'
                  }`}>
                    {node.code}
                  </span>
                  <span className={`${
                    isGroup ? 'text-gray-900 text-sm font-black uppercase tracking-wider' :
                    isSubGroup ? 'text-gray-700 text-sm font-bold' :
                    'text-gray-600 text-sm font-medium'
                  }`}>
                    {node.name}
                  </span>
                </div>
                {node.value !== undefined && (
                  <span className={`text-sm font-black ${
                    node.code.startsWith('1') ? 'text-[#125d30]' : 'text-red-600'
                  }`}>
                    {formatCurrency(node.value)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Journal Entries */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-50 flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-xl text-[#fc6c29]"><LayoutList size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Diário Contábil</p>
            <h2 className="text-lg font-black text-gray-900">Lançamentos do Mês</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Data</th>
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Conta Débito</th>
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left"></th>
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Conta Crédito</th>
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Histórico</th>
                <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {journalEntries.map((e, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-7 py-4 text-sm font-bold text-gray-500">{e.data}</td>
                  <td className="px-7 py-4 text-sm font-bold text-gray-900">{e.contaDebito}</td>
                  <td className="px-7 py-1 text-gray-300"><ArrowRight size={14} /></td>
                  <td className="px-7 py-4 text-sm font-bold text-gray-900">{e.contaCredito}</td>
                  <td className="px-7 py-4 text-sm font-medium text-gray-500 max-w-xs truncate">{e.historico}</td>
                  <td className="px-7 py-4 text-sm font-black text-gray-900 text-right">{formatCurrency(e.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Lançamento */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Novo Lançamento Contábil">
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Data do Lançamento</label>
            <input
              type="date"
              value={form.data}
              onChange={e => handleField('data', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Conta Débito</label>
            <select
              value={form.contaDebito}
              onChange={e => handleField('contaDebito', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors bg-white"
            >
              <option value="">Selecione...</option>
              {contasOptions.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Conta Crédito</label>
            <select
              value={form.contaCredito}
              onChange={e => handleField('contaCredito', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors bg-white"
            >
              <option value="">Selecione...</option>
              {contasOptions.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Histórico</label>
            <input
              type="text"
              value={form.historico}
              onChange={e => handleField('historico', e.target.value)}
              placeholder="Descreva o lançamento..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors"
            />
          </div>

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
              Registrar Lançamento
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
