'use client';

import React, { useState } from 'react';
import Modal from '@/components/admin/Modal';
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CreditCard,
} from 'lucide-react';

type TabType = 'receber' | 'pagar';

interface ContaReceber {
  num: string;
  devedor: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: 'a vencer' | 'vencido' | 'pago';
}

interface ContaPagar {
  num: string;
  credor: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: 'a vencer' | 'vencido' | 'pago';
}

const contasReceber: ContaReceber[] = [
  { num: '#001', devedor: 'Feirante João Silva', descricao: 'Comissão Mai/26', vencimento: '15/05', valor: 1840, status: 'a vencer' },
  { num: '#002', devedor: 'FazendaOrg Ltda', descricao: 'Assinatura Pro', vencimento: '12/05', valor: 299, status: 'a vencer' },
  { num: '#003', devedor: 'Franquia Nordeste', descricao: 'Royalties Abr', vencimento: '05/05', valor: 3200, status: 'vencido' },
  { num: '#004', devedor: 'Mercado Fresco', descricao: 'Banner Homepage', vencimento: '20/05', valor: 2800, status: 'a vencer' },
  { num: '#005', devedor: 'NutriChef Rest.', descricao: 'Comissão B2B', vencimento: '28/05', valor: 640, status: 'pago' },
];

const contasPagar: ContaPagar[] = [
  { num: '#P001', credor: 'AWS Cloud', descricao: 'Infra/Hospedagem', vencimento: '10/05', valor: 4200, status: 'a vencer' },
  { num: '#P002', credor: 'Equipe Dev', descricao: 'Freelancers', vencimento: '08/05', valor: 8400, status: 'pago' },
  { num: '#P003', credor: 'Google Ads', descricao: 'Marketing', vencimento: '15/05', valor: 2800, status: 'a vencer' },
  { num: '#P004', credor: 'Contador CRC', descricao: 'Contabilidade', vencimento: '30/05', valor: 1800, status: 'a vencer' },
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
}

function StatusBadge({ status }: { status: 'a vencer' | 'vencido' | 'pago' }) {
  if (status === 'pago') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-green-50 text-green-700">
      <CheckCircle2 size={11} />Pago
    </span>
  );
  if (status === 'vencido') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-red-50 text-red-600">
      <AlertCircle size={11} />Vencido
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-yellow-50 text-yellow-700">
      <Clock size={11} />A Vencer
    </span>
  );
}

export default function ContasPage() {
  const [activeTab, setActiveTab] = useState<TabType>('receber');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    tipo: 'receber',
    nome: '',
    descricao: '',
    valor: '',
    vencimento: '',
    categoria: '',
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
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Contas a Pagar & Receber</h1>
          <p className="text-gray-500 mt-1 font-medium">Gestão de fluxo de caixa e obrigações financeiras</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-green-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Lançamento
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-xl text-[#125d30]"><ArrowUpRight size={18} /></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total a Receber</p>
          </div>
          <p className="text-[26px] font-black text-gray-900 tracking-tight">R$48.200</p>
        </div>
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600"><Clock size={18} /></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">A Vencer em 7 dias</p>
          </div>
          <p className="text-[26px] font-black text-gray-900 tracking-tight">R$18.400</p>
        </div>
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-xl text-red-500"><AlertCircle size={18} /></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Vencido</p>
          </div>
          <p className="text-[26px] font-black text-red-600 tracking-tight">R$3.800</p>
        </div>
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-xl text-[#fc6c29]"><ArrowDownRight size={18} /></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total a Pagar</p>
          </div>
          <p className="text-[26px] font-black text-gray-900 tracking-tight">R$22.100</p>
        </div>
      </div>

      {/* Tabs + Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-7 pt-5 gap-2">
          <button
            onClick={() => setActiveTab('receber')}
            className={`px-5 py-3 rounded-t-2xl text-sm font-black transition-colors ${
              activeTab === 'receber'
                ? 'bg-[#125d30] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2"><ArrowUpRight size={15} />Contas a Receber</span>
          </button>
          <button
            onClick={() => setActiveTab('pagar')}
            className={`px-5 py-3 rounded-t-2xl text-sm font-black transition-colors ${
              activeTab === 'pagar'
                ? 'bg-[#125d30] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2"><ArrowDownRight size={15} />Contas a Pagar</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'receber' ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">#</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Devedor</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Descrição</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Vencimento</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-right">Valor</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-center">Status</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contasReceber.map((c) => (
                  <tr key={c.num} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-7 py-4 text-[11px] font-black text-gray-400">{c.num}</td>
                    <td className="px-7 py-4 text-sm font-bold text-gray-900">{c.devedor}</td>
                    <td className="px-7 py-4 text-sm font-medium text-gray-500">{c.descricao}</td>
                    <td className="px-7 py-4 text-sm font-bold text-gray-700">{c.vencimento}</td>
                    <td className="px-7 py-4 text-sm font-black text-[#125d30] text-right">{formatCurrency(c.valor)}</td>
                    <td className="px-7 py-4 text-center"><StatusBadge status={c.status} /></td>
                    <td className="px-7 py-4 text-center">
                      {c.status !== 'pago' && (
                        <button className="px-3 py-1.5 rounded-full text-[11px] font-black border border-[#125d30] text-[#125d30] hover:bg-[#125d30] hover:text-white transition-colors">
                          Marcar Pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">#</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Credor</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Descrição</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left">Vencimento</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-right">Valor</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-center">Status</th>
                  <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contasPagar.map((c) => (
                  <tr key={c.num} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-7 py-4 text-[11px] font-black text-gray-400">{c.num}</td>
                    <td className="px-7 py-4 text-sm font-bold text-gray-900">{c.credor}</td>
                    <td className="px-7 py-4 text-sm font-medium text-gray-500">{c.descricao}</td>
                    <td className="px-7 py-4 text-sm font-bold text-gray-700">{c.vencimento}</td>
                    <td className="px-7 py-4 text-sm font-black text-red-600 text-right">{formatCurrency(c.valor)}</td>
                    <td className="px-7 py-4 text-center"><StatusBadge status={c.status} /></td>
                    <td className="px-7 py-4 text-center">
                      {c.status !== 'pago' && (
                        <button className="px-3 py-1.5 rounded-full text-[11px] font-black border border-[#125d30] text-[#125d30] hover:bg-[#125d30] hover:text-white transition-colors">
                          Marcar Pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Novo Lançamento */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Novo Lançamento">
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Tipo</label>
            <div className="flex gap-3">
              {(['receber', 'pagar'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleField('tipo', t)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-black border-2 transition-colors ${
                    form.tipo === t
                      ? 'border-[#125d30] bg-[#125d30] text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {t === 'receber' ? 'A Receber' : 'A Pagar'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
              {form.tipo === 'receber' ? 'Devedor' : 'Credor'}
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={e => handleField('nome', e.target.value)}
              placeholder={form.tipo === 'receber' ? 'Nome do devedor' : 'Nome do credor'}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Descrição</label>
            <input
              type="text"
              value={form.descricao}
              onChange={e => handleField('descricao', e.target.value)}
              placeholder="Ex: Comissão Mai/26"
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
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Vencimento</label>
              <input
                type="date"
                value={form.vencimento}
                onChange={e => handleField('vencimento', e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Categoria</label>
            <select
              value={form.categoria}
              onChange={e => handleField('categoria', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#125d30]/50 transition-colors bg-white"
            >
              <option value="">Selecione...</option>
              <option>Receita / Comissão</option>
              <option>Assinatura</option>
              <option>Royalties</option>
              <option>Tecnologia / Infra</option>
              <option>Marketing</option>
              <option>RH & Pessoal</option>
              <option>Administrativo</option>
              <option>Outros</option>
            </select>
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
              Salvar Lançamento
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
