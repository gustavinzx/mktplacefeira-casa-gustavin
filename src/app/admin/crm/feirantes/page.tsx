'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Phone, Mail, ChevronRight, Users, Calendar, TrendingUp, DollarSign, MapPin, Clock } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import { fetchCRMLeads, syncCRMLead, type CRMLead } from '@/lib/database';
import { useToast } from '@/components/Toast';

const etapas = ['todos', 'prospecto', 'contato', 'proposta', 'negociacao', 'onboarding'];
const etapaLabels: Record<string, string> = {
  todos: 'Todos',
  prospecto: 'Prospecto',
  contato: 'Contato Feito',
  proposta: 'Proposta Enviada',
  negociacao: 'Negociação',
  onboarding: 'Onboarding',
};

const etapaBadgeColors: Record<string, string> = {
  prospecto: 'bg-gray-100 text-gray-700',
  contato: 'bg-blue-100 text-blue-700',
  proposta: 'bg-yellow-100 text-yellow-700',
  negociacao: 'bg-orange-100 text-orange-700',
  onboarding: 'bg-green-100 text-green-700',
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? 'text-green-700 bg-green-50' : score >= 6 ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50';
  return <span className={`px-3 py-1 rounded-full text-[11px] font-black ${color}`}>{score.toFixed(1)}</span>;
}

export default function FeirantesProspeccaoPage() {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [etapaFiltro, setEtapaFiltro] = useState('todos');
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [novoModal, setNovoModal] = useState(false);
  const [form, setForm] = useState({ nome: '', cidade: '', categoria: '', fonte: 'Site', telefone: '', email: '', observacoes: '' });
  const { showToast } = useToast();

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    const data = await fetchCRMLeads('feirante');
    setLeads(data);
    setLoading(false);
  }

  async function handleCreateLead() {
    if (!form.nome) return;
    const newLead: CRMLead = {
      type: 'feirante',
      name: form.nome,
      city: form.cidade,
      category: form.categoria,
      source: form.fonte,
      phone: form.telefone,
      email: form.email,
      stage: 'prospecto',
      score: 5.0,
      history: [{ data: new Date().toLocaleDateString('pt-BR'), acao: form.observacoes || 'Lead criado no sistema' }]
    };

    const result = await syncCRMLead(newLead);
    if (result.success) {
      setNovoModal(false);
      setForm({ nome: '', cidade: '', categoria: '', fonte: 'Site', telefone: '', email: '', observacoes: '' });
      loadLeads();
    } else {
      showToast('Erro ao salvar lead.', 'error');
    }
  }

  const filtered = etapaFiltro === 'todos' ? leads : leads.filter(l => l.stage === etapaFiltro);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Prospecção de Feirantes</h1>
          <p className="text-gray-500 font-medium mt-1">Pipeline de captação de novos vendedores</p>
        </div>
        <button onClick={() => setNovoModal(true)} className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-[#0e4d27] transition-all shadow-lg shadow-[#125d30]/20">
          <Plus size={18} />
          Novo Feirante Lead
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Prospects Ativos', value: '64', icon: Users, color: '#125d30' },
          { label: 'Contatos Esta Semana', value: '22', icon: Phone, color: '#fc6c29' },
          { label: 'Convertidos Mês', value: '9', icon: TrendingUp, color: '#125d30' },
          { label: 'Potencial de Receita', value: 'R$18.400', icon: DollarSign, color: '#fc6c29' },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {etapas.map(e => (
          <button
            key={e}
            onClick={() => setEtapaFiltro(e)}
            className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${etapaFiltro === e ? 'bg-[#125d30] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#125d30] hover:text-[#125d30]'}`}
          >
            {etapaLabels[e]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Nome / Contato', 'Cidade', 'Categoria', 'Fonte', 'Etapa', 'Score', 'Último Contato', 'Ações'].map(h => (
                  <th key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-7 py-4 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr key={lead.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-7 py-4">
                    <p className="text-sm font-black text-gray-900">{lead.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{lead.email}</p>
                  </td>
                  <td className="px-7 py-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-sm text-gray-700 font-medium">{lead.city}</span>
                    </div>
                  </td>
                  <td className="px-7 py-4">
                    <span className="text-sm text-gray-700 font-medium">{lead.category}</span>
                  </td>
                  <td className="px-7 py-4">
                    <span className="text-sm text-gray-500 font-medium">{lead.source}</span>
                  </td>
                  <td className="px-7 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${etapaBadgeColors[lead.stage || 'prospecto']}`}>
                      {etapaLabels[lead.stage || 'prospecto']}
                    </span>
                  </td>
                  <td className="px-7 py-4">
                    <ScoreBadge score={lead.score || 0} />
                  </td>
                  <td className="px-7 py-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-sm text-gray-500 font-medium">{lead.updated_at ? new Date(lead.updated_at).toLocaleDateString('pt-BR') : 'Hoje'}</span>
                    </div>
                  </td>
                  <td className="px-7 py-4">
                    <div className="flex items-center gap-2">
                      <a href={`tel:${lead.phone}`} className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all" title="Ligar">
                        <Phone size={14} />
                      </a>
                      <a href={`mailto:${lead.email}`} className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all" title="E-mail">
                        <Mail size={14} />
                      </a>
                      <button onClick={() => setSelectedLead(lead)} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all" title="Detalhes">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Lead Modal */}
      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title="Perfil do Lead">
        {selectedLead && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#125d30] flex items-center justify-center text-white text-xl font-black">
                {selectedLead.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'LD'}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{selectedLead.name}</h2>
                <p className="text-gray-500 text-sm">{selectedLead.category} · {selectedLead.city}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Telefone', value: selectedLead.phone },
                { label: 'E-mail', value: selectedLead.email },
                { label: 'Fonte', value: selectedLead.source },
                { label: 'Score', value: `${selectedLead.score}/10` },
                { label: 'Etapa', value: etapaLabels[selectedLead.stage || 'prospecto'] },
                { label: 'Último Contato', value: selectedLead.updated_at ? new Date(selectedLead.updated_at).toLocaleDateString('pt-BR') : 'Hoje' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Histórico de Etapas</span>
              <div className="space-y-3">
                {(selectedLead.history || []).map((h: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#125d30] mt-1 flex-shrink-0" />
                      {i < (selectedLead.history?.length || 0) - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{h.acao}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{h.data}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Novo Lead Modal */}
      <Modal isOpen={novoModal} onClose={() => setNovoModal(false)} title="Novo Feirante Lead">
        <div className="space-y-5">
          {[
            { label: 'Nome completo', key: 'nome', type: 'text', placeholder: 'Ex: João da Silva' },
            { label: 'Cidade / Estado', key: 'cidade', type: 'text', placeholder: 'Ex: Campinas/SP' },
            { label: 'Categoria de Produtos', key: 'categoria', type: 'text', placeholder: 'Ex: Orgânicos, Hortaliças...' },
            { label: 'Telefone', key: 'telefone', type: 'tel', placeholder: '(11) 99999-9999' },
            { label: 'E-mail', key: 'email', type: 'email', placeholder: 'contato@email.com' },
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
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Fonte</label>
            <select value={form.fonte} onChange={e => setForm(p => ({ ...p, fonte: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#125d30]">
              {['Indicação', 'Site', 'Cold Call', 'Feira Presencial'].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Observações</label>
            <textarea
              placeholder="Informações relevantes sobre o feirante..."
              value={form.observacoes}
              onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#125d30] resize-none"
            />
          </div>
          <button
            onClick={handleCreateLead}
            className="w-full py-4 bg-[#125d30] text-white rounded-[20px] font-black text-sm hover:bg-[#0e4d27] transition-all"
          >
            Criar Lead
          </button>
        </div>
      </Modal>
    </div>
  );
}
