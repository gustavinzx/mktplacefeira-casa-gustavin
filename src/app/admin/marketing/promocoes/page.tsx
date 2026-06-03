'use client';
import { useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, Edit2, Tag, Users, Percent, TrendingUp } from 'lucide-react';
import Modal from '@/components/admin/Modal';

type PromoStatus = 'ativa' | 'encerrada';
type PromoTipo = 'Desconto%' | 'Frete Grátis' | 'Destaque' | 'B2B';

type Promo = {
  codigo: string;
  nome: string;
  tipo: PromoTipo;
  desconto: string;
  usos: number;
  periodo: string;
  status: PromoStatus;
};

const initialPromos: Promo[] = [
  { codigo: 'FRETE10', nome: 'Frete Grátis', tipo: 'Frete Grátis', desconto: '10%', usos: 248, periodo: '01/05–31/05', status: 'ativa' },
  { codigo: 'BEMVINDO20', nome: 'Desconto Boas-vindas', tipo: 'Desconto%', desconto: '20%', usos: 89, periodo: 'Permanente', status: 'ativa' },
  { codigo: 'ATACADO15', nome: 'Atacado B2B', tipo: 'B2B', desconto: '15%', usos: 12, periodo: '01/05–15/05', status: 'ativa' },
  { codigo: 'SABADO', nome: 'Destaque de Sábado', tipo: 'Destaque', desconto: '—', usos: 5, periodo: 'Todo sábado', status: 'ativa' },
  { codigo: 'VERAO30', nome: 'Verão -30%', tipo: 'Desconto%', desconto: '30%', usos: 402, periodo: '01/01–31/01', status: 'encerrada' },
];

const tipoOptions: PromoTipo[] = ['Desconto%', 'Frete Grátis', 'Destaque', 'B2B'];
const publicoOptions = ['Todos', 'Feirantes', 'Clientes', 'Categoria'];

const tipoBadge: Record<PromoTipo, string> = {
  'Desconto%': 'bg-blue-100 text-blue-700',
  'Frete Grátis': 'bg-teal-100 text-teal-700',
  'Destaque': 'bg-orange-100 text-orange-700',
  'B2B': 'bg-purple-100 text-purple-700',
};

export default function PromocoesPage() {
  const [promos, setPromos] = useState<Promo[]>(initialPromos);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nome: '',
    tipo: tipoOptions[0] as PromoTipo,
    codigo: '',
    desconto: '',
    publico: 'Todos',
    dataInicio: '',
    dataFim: '',
    limiteUsos: '',
  });

  const toggleStatus = (index: number) => {
    setPromos((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, status: p.status === 'ativa' ? 'encerrada' : 'ativa' } : p
      )
    );
  };

  const handleClose = () => {
    setModalOpen(false);
    setStep(1);
    setForm({ nome: '', tipo: tipoOptions[0], codigo: '', desconto: '', publico: 'Todos', dataInicio: '', dataFim: '', limiteUsos: '' });
  };

  const handleSubmit = () => {
    handleClose();
  };

  const ativas = promos.filter((p) => p.status === 'ativa').length;
  const usosHoje = 42;

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Promoções</h1>
          <p className="text-gray-500 font-medium mt-1">Cupons, descontos e destaques para o ecossistema feira.casa.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-green-800 transition-all shadow-lg shrink-0"
        >
          <Plus size={16} /> Nova Promoção
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Promos Ativas', value: `${ativas}`, icon: Tag, color: 'text-green-700 bg-green-50' },
          { label: 'Usos Hoje', value: `${usosHoje}`, icon: Users, color: 'text-blue-700 bg-blue-50' },
          { label: 'Desconto Médio', value: '18,7%', icon: Percent, color: 'text-orange-700 bg-orange-50' },
          { label: 'Receita Impactada', value: 'R$14.200', icon: TrendingUp, color: 'text-purple-700 bg-purple-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-6 border-b border-gray-100">
          <p className="font-black text-gray-900 text-lg">Promoções Cadastradas</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Código', 'Nome', 'Tipo', 'Desconto', 'Usos', 'Período', 'Status', 'Ações'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promos.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 font-black text-gray-900 text-sm tracking-wider">{p.codigo}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">{p.nome}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${tipoBadge[p.tipo]}`}>{p.tipo}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{p.desconto}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.usos}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{p.periodo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${p.status === 'ativa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStatus(i)} className="text-gray-400 hover:text-[#125d30] transition-colors">
                        {p.status === 'ativa' ? <ToggleRight size={22} className="text-[#125d30]" /> : <ToggleLeft size={22} />}
                      </button>
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal wizard */}
      <Modal isOpen={modalOpen} onClose={handleClose} title={`Nova Promoção — Passo ${step} de 2`}>
        {step === 1 ? (
          <div className="space-y-5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dados da Promoção</p>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Nome</label>
              <input
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                placeholder="Ex: Frete Grátis Maio"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Tipo</label>
              <select
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as PromoTipo })}
              >
                {tipoOptions.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Código do Cupom</label>
              <input
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium font-mono focus:outline-none focus:ring-2 focus:ring-[#125d30]/30 uppercase"
                placeholder="Ex: FRETE10"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Valor (%)</label>
              <input
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                placeholder="Ex: 10"
                value={form.desconto}
                onChange={(e) => setForm({ ...form, desconto: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleClose} className="flex-1 px-5 py-3 rounded-[20px] border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button onClick={() => setStep(2)} className="flex-1 px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm hover:bg-green-800 transition-all shadow-lg">
                Próximo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Segmentação e Vigência</p>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Público-alvo</label>
              <select
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                value={form.publico}
                onChange={(e) => setForm({ ...form, publico: e.target.value })}
              >
                {publicoOptions.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Data Início</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                  value={form.dataInicio}
                  onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Data Fim</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                  value={form.dataFim}
                  onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Limite de Usos</label>
              <input
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                placeholder="Deixe em branco para ilimitado"
                value={form.limiteUsos}
                onChange={(e) => setForm({ ...form, limiteUsos: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 px-5 py-3 rounded-[20px] border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                Voltar
              </button>
              <button onClick={handleSubmit} className="flex-1 px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm hover:bg-green-800 transition-all shadow-lg">
                Criar Promoção
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
