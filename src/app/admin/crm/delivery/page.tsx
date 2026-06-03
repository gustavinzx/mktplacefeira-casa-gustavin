'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Bike, Car, Truck, MapPin, ChevronRight, CheckCircle, Users, Clock, Zap, Filter } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import { fetchCRMLeads, syncCRMLead, type CRMLead } from '@/lib/database';

const etapaBadgeColors: Record<string, string> = {
  prospecto: 'bg-gray-100 text-gray-700',
  contato: 'bg-blue-100 text-blue-700',
  proposta: 'bg-yellow-100 text-yellow-700',
  negociacao: 'bg-orange-100 text-orange-700',
  onboarding: 'bg-green-100 text-green-700',
};
const etapaLabels: Record<string, string> = {
  prospecto: 'Prospecto',
  contato: 'Contato Feito',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  onboarding: 'Onboarding',
};

const veiculoIcons: Record<string, React.ElementType> = {
  Moto: Zap,
  Bike: Bike,
  Carro: Car,
  Van: Truck,
};

const veiculoColors: Record<string, string> = {
  Moto: 'bg-orange-100 text-orange-700',
  Bike: 'bg-green-100 text-green-700',
  Carro: 'bg-blue-100 text-blue-700',
  Van: 'bg-purple-100 text-purple-700',
};

const veiculoTypes = ['Todos', 'Moto', 'Bike', 'Carro', 'Van'];

function VeiculoChart({ parceiros }: { parceiros: CRMLead[] }) {
  const counts: Record<string, number> = { Moto: 0, Bike: 0, Carro: 0, Van: 0 };
  parceiros.forEach(p => { 
    const tipo = p.source || 'Moto';
    if (counts[tipo] !== undefined) counts[tipo]++; 
  });
  const total = parceiros.length;
  const colors: Record<string, string> = { Moto: '#fc6c29', Bike: '#125d30', Carro: '#3b82f6', Van: '#a855f7' };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
      <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Frota por Tipo de Veículo</h2>
      <div className="flex items-center gap-8">
        {/* Donut CSS */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {(() => {
              let offset = 0;
              return Object.entries(counts).map(([tipo, count]) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                const dashArray = `${pct} ${100 - pct}`;
                const el = (
                  <circle
                    key={tipo}
                    cx="18" cy="18" r="15.9"
                    fill="none"
                    stroke={colors[tipo]}
                    strokeWidth="4"
                    strokeDasharray={dashArray}
                    strokeDashoffset={-offset}
                  />
                );
                offset += pct;
                return el;
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-black text-gray-900">{total}</p>
              <p className="text-[9px] text-gray-400 font-bold">parceiros</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {Object.entries(counts).map(([tipo, count]) => {
            const Icon = veiculoIcons[tipo] || Bike;
            return (
              <div key={tipo} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[tipo] }} />
                <Icon size={14} className="text-gray-500" />
                <div>
                  <p className="text-sm font-black text-gray-900">{count}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{tipo}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DeliveryProspeccaoPage() {
  const [parceiros, setParceiros] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [veiculoFiltro, setVeiculoFiltro] = useState('Todos');
  const [novoModal, setNovoModal] = useState(false);
  const [raio, setRaio] = useState(10);
  const [cnh, setCnh] = useState(false);
  const [form, setForm] = useState({ nome: '', telefone: '', cidade: '', veiculo: '', tipoVeiculo: 'Moto', disponibilidade: 'Integral', observacoes: '' });

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    const data = await fetchCRMLeads('delivery');
    setParceiros(data);
    setLoading(false);
  }

  async function handleCreateLead() {
    if (!form.nome) return;
    const newLead: CRMLead = {
      type: 'delivery',
      name: form.nome,
      phone: form.telefone,
      city: form.cidade,
      category: form.veiculo, // e.g. "Moto Honda CG 160"
      source: form.tipoVeiculo, // e.g. "Moto"
      stage: 'prospecto',
      metadata: {
        cnh,
        disponibilidade: form.disponibilidade,
        raioKm: raio,
        observacoes: form.observacoes
      },
      history: [{ data: new Date().toLocaleDateString('pt-BR'), acao: 'Parceiro criado no sistema' }]
    };

    const result = await syncCRMLead(newLead);
    if (result.success) {
      setNovoModal(false);
      setForm({ nome: '', telefone: '', cidade: '', veiculo: '', tipoVeiculo: 'Moto', disponibilidade: 'Integral', observacoes: '' });
      loadLeads();
    } else {
      alert('Erro ao salvar parceiro.');
    }
  }

  const filtered = veiculoFiltro === 'Todos' ? parceiros : parceiros.filter(p => p.source === veiculoFiltro);
  const onboardingList = filtered.filter(p => p.stage === 'onboarding');

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Delivery Partners</h1>
          <p className="text-gray-500 font-medium mt-1">Prospecção e gestão de parceiros de entrega</p>
        </div>
        <button onClick={() => setNovoModal(true)} className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-[#0e4d27] transition-all shadow-lg shadow-[#125d30]/20">
          <Plus size={18} />
          Novo Parceiro
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Parceiros Prospects', value: '24', icon: Users, color: '#125d30' },
          { label: 'Cidades Cobertas', value: '9', icon: MapPin, color: '#fc6c29' },
          { label: 'Convertidos Esta Semana', value: '3', icon: CheckCircle, color: '#125d30' },
          { label: 'Capacidade de Entrega/Dia', value: '840', icon: Zap, color: '#fc6c29' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.label}</span>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter size={14} className="text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {veiculoTypes.map(v => (
                <button
                  key={v}
                  onClick={() => setVeiculoFiltro(v)}
                  className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${veiculoFiltro === v ? 'bg-[#125d30] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#125d30] hover:text-[#125d30]'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            {/* Batch Approve */}
            {onboardingList.length > 0 && (
              <div className="flex items-center justify-between px-7 py-4 bg-green-50 border-b border-green-100">
                <p className="text-sm font-black text-green-800">{onboardingList.length} parceiro(s) prontos para aprovação</p>
                <button className="px-4 py-2 bg-[#125d30] text-white rounded-2xl text-[11px] font-black hover:bg-[#0e4d27] transition-all flex items-center gap-1.5">
                  <CheckCircle size={13} /> Aprovar Todos
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Nome', 'Cidade', 'Veículo', 'CNH', 'Disponibilidade', 'Raio', 'Etapa', 'Ações'].map(h => (
                      <th key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const tipoVeiculo = p.source || 'Moto';
                    const Icon = veiculoIcons[tipoVeiculo] || Bike;
                    return (
                      <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                        <td className="px-7 py-4">
                          <p className="text-sm font-black text-gray-900">{p.name}</p>
                          <p className="text-[11px] text-gray-400 font-medium">{p.phone}</p>
                        </td>
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-gray-400" />
                            <span className="text-sm text-gray-700 font-medium">{p.city}</span>
                          </div>
                        </td>
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${veiculoColors[tipoVeiculo]}`}>
                              <Icon size={11} />
                              {tipoVeiculo}
                            </span>
                          </div>
                        </td>
                        <td className="px-7 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${p.metadata?.cnh ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {p.metadata?.cnh ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-sm text-gray-700 font-medium">{p.metadata?.disponibilidade || 'Integral'}</span>
                          </div>
                        </td>
                        <td className="px-7 py-4">
                          <span className="text-sm font-black text-gray-700">{p.metadata?.raioKm || 10}km</span>
                        </td>
                        <td className="px-7 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${etapaBadgeColors[p.stage || 'prospecto']}`}>
                            {etapaLabels[p.stage || 'prospecto']}
                          </span>
                        </td>
                        <td className="px-7 py-4">
                          <button className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Vehicle Chart */}
        <div>
          <VeiculoChart parceiros={parceiros} />
        </div>
      </div>

      {/* Novo Parceiro Modal */}
      <Modal isOpen={novoModal} onClose={() => setNovoModal(false)} title="Novo Parceiro de Entrega">
        <div className="space-y-5">
          {[
            { label: 'Nome completo', key: 'nome', type: 'text', placeholder: 'Ex: Roberto Dias' },
            { label: 'Telefone', key: 'telefone', type: 'tel', placeholder: '(11) 99999-9999' },
            { label: 'Cidade / Estado', key: 'cidade', type: 'text', placeholder: 'Ex: São Paulo/SP' },
            { label: 'Veículo', key: 'veiculo', type: 'text', placeholder: 'Ex: Moto Honda CG 160' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={(form as Record<string, string>)[field.key]}
                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#125d30] transition-all"
              />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Disponibilidade</label>
            <select value={form.disponibilidade} onChange={e => setForm(p => ({ ...p, disponibilidade: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#125d30]">
              {['Integral', 'Meio período', 'Manhãs', 'Tarde/Noite', 'Fins de semana'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          {/* CNH Toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-5 py-4">
            <div>
              <p className="text-sm font-black text-gray-900">Possui CNH</p>
              <p className="text-[11px] text-gray-400 font-medium">Carteira Nacional de Habilitação válida</p>
            </div>
            <button
              onClick={() => setCnh(!cnh)}
              className={`w-12 h-6 rounded-full transition-all relative ${cnh ? 'bg-[#125d30]' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${cnh ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          {/* Raio Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Raio de Atuação</label>
              <span className="text-sm font-black text-[#125d30]">{raio} km</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={raio}
              onChange={e => setRaio(Number(e.target.value))}
              className="w-full accent-[#125d30]"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
              <span>1km</span>
              <span>30km</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Observações</label>
            <textarea
              placeholder="Informações adicionais..."
              value={form.observacoes}
              onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#125d30] resize-none"
            />
          </div>
          <button onClick={handleCreateLead} className="w-full py-4 bg-[#125d30] text-white rounded-[20px] font-black text-sm hover:bg-[#0e4d27] transition-all">
            Cadastrar Parceiro
          </button>
        </div>
      </Modal>
    </div>
  );
}
