'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users, Map, Building2, TrendingUp, Calendar, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import { fetchCRMLeads, syncCRMLead, type CRMLead } from '@/lib/database';

interface Territorio {
  nome: string;
  status: 'disponivel' | 'negociando' | 'fechado';
  responsavel?: string;
}

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

const investimentos = ['R$150k', 'R$300k', 'R$500k+'];

const territorios: Territorio[] = [
  { nome: 'SP-Interior', status: 'disponivel' },
  { nome: 'PR', status: 'disponivel' },
  { nome: 'CE', status: 'negociando', responsavel: 'Rodrigo Campos' },
  { nome: 'PE', status: 'negociando', responsavel: 'Ana Lima' },
  { nome: 'AM', status: 'disponivel' },
  { nome: 'SC', status: 'fechado', responsavel: 'Franquia Sul Ltda' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  disponivel: { label: 'Disponível', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  negociando: { label: 'Negociando', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  fechado: { label: 'Fechado', color: 'bg-gray-200 text-gray-600', icon: Building2 },
};

export default function FranqueadosProspeccaoPage() {
  const [franqueados, setFranqueados] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFranqueado, setSelectedFranqueado] = useState<CRMLead | null>(null);
  const [novoModal, setNovoModal] = useState(false);
  const [form, setForm] = useState({ nome: '', cidade: '', estado: '', territorioInteresse: '', capacidadeInvestimento: 'R$150k', statusJuridico: 'PF', experienciaAnterior: '', comoConheceu: '' });

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    const data = await fetchCRMLeads('franqueado');
    setFranqueados(data);
    setLoading(false);
  }

  async function handleCreateLead() {
    if (!form.nome) return;
    const newLead: CRMLead = {
      type: 'franqueado',
      name: form.nome,
      city: `${form.cidade}/${form.estado}`,
      source: form.comoConheceu,
      stage: 'prospecto',
      score: 50, // NPS Score baseline
      category: form.capacidadeInvestimento, // mapped for capability
      history: [{ data: new Date().toLocaleDateString('pt-BR'), acao: 'Candidato criado no sistema' }]
    };

    const result = await syncCRMLead(newLead);
    if (result.success) {
      setNovoModal(false);
      setForm({ nome: '', cidade: '', estado: '', territorioInteresse: '', capacidadeInvestimento: 'R$150k', statusJuridico: 'PF', experienciaAnterior: '', comoConheceu: '' });
      loadLeads();
    } else {
      alert('Erro ao salvar candidato.');
    }
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Prospecção de Franqueados</h1>
          <p className="text-gray-500 font-medium mt-1">Candidatos à expansão territorial da feira.casa</p>
        </div>
        <button onClick={() => setNovoModal(true)} className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-[#0e4d27] transition-all shadow-lg shadow-[#125d30]/20">
          <Plus size={18} />
          Novo Candidato
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Candidatos Ativos', value: '6', icon: Users, color: '#125d30' },
          { label: 'Territórios Disponíveis', value: '3', icon: Map, color: '#fc6c29' },
          { label: 'Franquias Abertas Mês', value: '1', icon: Building2, color: '#125d30' },
          { label: 'Investimento Médio', value: 'R$320k', icon: TrendingUp, color: '#fc6c29' },
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

      {/* Candidate Cards Grid */}
      <div>
        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Candidatos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {franqueados.map(f => (
            <div key={f.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-black text-gray-900">{f.name}</p>
                  <p className="text-[12px] text-gray-500 font-medium">{f.city}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${etapaBadgeColors[f.stage || 'prospecto']}`}>
                  {etapaLabels[f.stage || 'prospecto']}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-2xl p-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Origem</span>
                  <p className="text-sm font-black text-gray-900">{f.source || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Investimento</span>
                  <p className="text-sm font-black text-gray-900">{f.category || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Telefone</span>
                  <p className="text-sm font-black text-gray-900">{f.phone || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">NPS Inicial</span>
                  <p className="text-sm font-black" style={{ color: (f.score || 0) >= 80 ? '#125d30' : (f.score || 0) >= 60 ? '#eab308' : '#ef4444' }}>{f.score || 0}</p>
                </div>
              </div>

              {f.stage === 'onboarding' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Onboarding</span>
                    <span className="text-[11px] font-black text-[#125d30]">0%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#125d30] rounded-full transition-all" style={{ width: `0%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                <button className="flex-1 py-2 text-[11px] font-black text-[#125d30] border border-[#125d30] rounded-2xl hover:bg-[#125d30] hover:text-white transition-all flex items-center justify-center gap-1.5">
                  <Calendar size={12} /> Agendar
                </button>
                <button onClick={() => setSelectedFranqueado(f)} className="flex-1 py-2 text-[11px] font-black text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5">
                  <ChevronRight size={12} /> Análise
                </button>
                <button className="flex-1 py-2 text-[11px] font-black text-white bg-[#fc6c29] rounded-2xl hover:bg-[#e55a1a] transition-all">
                  Avançar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Territory Map */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <Map size={22} className="text-[#125d30]" />
          <h2 className="text-xl font-black text-gray-900">Mapa de Territórios</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {territorios.map(t => {
            const cfg = statusConfig[t.status];
            const Icon = cfg.icon;
            return (
              <div key={t.nome} className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-gray-900">{t.nome}</span>
                  <Icon size={16} className={t.status === 'disponivel' ? 'text-green-600' : t.status === 'negociando' ? 'text-yellow-600' : 'text-gray-400'} />
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-black self-start ${cfg.color}`}>{cfg.label}</span>
                {t.responsavel && <p className="text-[10px] text-gray-400 font-medium">{t.responsavel}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* View Modal */}
      <Modal isOpen={!!selectedFranqueado} onClose={() => setSelectedFranqueado(null)} title="Análise do Candidato">
        {selectedFranqueado && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-xl font-black">
                {selectedFranqueado.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'FR'}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{selectedFranqueado.name}</h2>
                <p className="text-gray-500 text-sm">{selectedFranqueado.city}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Telefone', value: selectedFranqueado.phone },
                { label: 'Capacidade de Investimento', value: selectedFranqueado.category },
                { label: 'Origem', value: selectedFranqueado.source },
                { label: 'NPS Score', value: `${selectedFranqueado.score || 0}/100` },
                { label: 'Etapa', value: etapaLabels[selectedFranqueado.stage || 'prospecto'] },
                { label: 'E-mail', value: selectedFranqueado.email || '—' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            {selectedFranqueado.stage === 'onboarding' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progresso Onboarding</span>
                  <span className="text-sm font-black text-[#125d30]">0%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#125d30] rounded-full" style={{ width: `0%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Novo Candidato Modal */}
      <Modal isOpen={novoModal} onClose={() => setNovoModal(false)} title="Novo Candidato a Franqueado">
        <div className="space-y-5">
          {[
            { label: 'Nome / Razão Social', key: 'nome', type: 'text', placeholder: 'Ex: João Silva ou Silva Ltda' },
            { label: 'Cidade', key: 'cidade', type: 'text', placeholder: 'Ex: Campinas' },
            { label: 'Estado (UF)', key: 'estado', type: 'text', placeholder: 'Ex: SP' },
            { label: 'Território de Interesse', key: 'territorioInteresse', type: 'text', placeholder: 'Ex: SP-Interior, PR...' },
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Capacidade de Investimento</label>
              <select value={form.capacidadeInvestimento} onChange={e => setForm(p => ({ ...p, capacidadeInvestimento: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#125d30]">
                {investimentos.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Status Jurídico</label>
              <select value={form.statusJuridico} onChange={e => setForm(p => ({ ...p, statusJuridico: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#125d30]">
                <option>PF</option>
                <option>PJ</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Experiência Anterior</label>
            <textarea
              placeholder="Descreva a experiência anterior no setor..."
              value={form.experienciaAnterior}
              onChange={e => setForm(p => ({ ...p, experienciaAnterior: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#125d30] resize-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Como nos conheceu?</label>
            <input
              type="text"
              placeholder="Ex: Indicação, Site, Evento..."
              value={form.comoConheceu}
              onChange={e => setForm(p => ({ ...p, comoConheceu: e.target.value }))}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#125d30] transition-all"
            />
          </div>
          <button onClick={handleCreateLead} className="w-full py-4 bg-[#125d30] text-white rounded-[20px] font-black text-sm hover:bg-[#0e4d27] transition-all">
            Criar Candidato
          </button>
        </div>
      </Modal>
    </div>
  );
}
