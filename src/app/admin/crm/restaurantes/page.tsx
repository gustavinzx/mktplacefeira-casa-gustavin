'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Phone, Mail, ChevronRight, UtensilsCrossed, ChefHat, DollarSign, Calendar, MapPin, Filter } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import { fetchCRMLeads, syncCRMLead, type CRMLead } from '@/lib/database';
import { useToast } from '@/components/Toast';

const tipoLabels = ['Todos', 'Restaurante', 'Dark Kitchen', 'Chef Autônomo'];

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

const tipoColors: Record<string, string> = {
  'Restaurante': 'bg-orange-100 text-orange-800',
  'Dark Kitchen': 'bg-purple-100 text-purple-800',
  'Chef Autônomo': 'bg-blue-100 text-blue-800',
};

function PotencialBadge({ valor }: { valor: number }) {
  const formatted = `R$${(valor / 1000).toFixed(1)}k/mês`;
  const color = valor >= 5000 ? 'text-green-700 bg-green-50' : valor >= 2000 ? 'text-yellow-700 bg-yellow-50' : 'text-gray-600 bg-gray-100';
  return <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${color}`}>{formatted}</span>;
}

export default function RestaurantesProspeccaoPage() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [novoModal, setNovoModal] = useState(false);
  const [reuniaoModal, setReuniaoModal] = useState<CRMLead | null>(null);
  const [form, setForm] = useState({ nome: '', tipo: 'Restaurante', culinaria: '', cidade: '', telefone: '', email: '', potencial: '', reuniaoData: '', reuniaoHora: '' });

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    const data = await fetchCRMLeads('restaurante');
    setLeads(data);
    setLoading(false);
  }

  async function handleCreateLead() {
    if (!form.nome) return;
    const newLead: CRMLead = {
      type: 'restaurante',
      name: form.nome,
      city: form.cidade,
      category: form.culinaria,
      source: form.tipo, // used for type in this view
      phone: form.telefone,
      email: form.email,
      stage: 'prospecto',
      score: Number(form.potencial || 0),
      history: [{ data: new Date().toLocaleDateString('pt-BR'), acao: 'Lead criado no sistema' }]
    };

    const result = await syncCRMLead(newLead);
    if (result.success) {
      setNovoModal(false);
      setForm({ nome: '', tipo: 'Restaurante', culinaria: '', cidade: '', telefone: '', email: '', potencial: '', reuniaoData: '', reuniaoHora: '' });
      loadLeads();
    } else {
      showToast('Erro ao salvar lead.', 'error');
    }
  }

  const filtered = tipoFiltro === 'Todos' ? leads : leads.filter(l => l.source === tipoFiltro);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Restaurantes & Chefs</h1>
          <p className="text-gray-500 font-medium mt-1">Prospecção de parceiros B2B — restaurantes, dark kitchens e chefs</p>
        </div>
        <button onClick={() => setNovoModal(true)} className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-[#0e4d27] transition-all shadow-lg shadow-[#125d30]/20">
          <Plus size={18} />
          Novo Restaurant Lead
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Restaurantes Prospects', value: '38', icon: UtensilsCrossed, color: '#fc6c29' },
          { label: 'Chefs Cadastrados', value: '14', icon: ChefHat, color: '#125d30' },
          { label: 'Volume B2B Potencial', value: 'R$62k/mês', icon: DollarSign, color: '#125d30' },
          { label: 'Reuniões Esta Semana', value: '7', icon: Calendar, color: '#fc6c29' },
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
      <div className="flex items-center gap-3">
        <Filter size={14} className="text-gray-400" />
        <div className="flex gap-2">
          {tipoLabels.map(t => (
            <button
              key={t}
              onClick={() => setTipoFiltro(t)}
              className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${tipoFiltro === t ? 'bg-[#fc6c29] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#fc6c29] hover:text-[#fc6c29]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Restaurante / Chef', 'Tipo', 'Culinária', 'Cidade', 'Potencial B2B', 'Etapa', 'Reunião', 'Ações'].map(h => (
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
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${tipoColors[lead.source || 'Restaurante']}`}>{lead.source || 'Restaurante'}</span>
                  </td>
                  <td className="px-7 py-4">
                    <span className="text-sm text-gray-700 font-medium">{lead.category}</span>
                  </td>
                  <td className="px-7 py-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-sm text-gray-700 font-medium">{lead.city}</span>
                    </div>
                  </td>
                  <td className="px-7 py-4">
                    <PotencialBadge valor={lead.score || 0} />
                  </td>
                  <td className="px-7 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${etapaBadgeColors[lead.stage || 'prospecto']}`}>
                      {etapaLabels[lead.stage || 'prospecto']}
                    </span>
                  </td>
                  <td className="px-7 py-4">
                    {false ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[11px] font-black text-green-700">12/05</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReuniaoModal(lead)}
                        className="text-[11px] font-black text-gray-400 hover:text-[#125d30] transition-colors flex items-center gap-1"
                      >
                        <Calendar size={12} />
                        Agendar
                      </button>
                    )}
                  </td>
                  <td className="px-7 py-4">
                    <div className="flex items-center gap-2">
                      <a href={`tel:${lead.phone}`} className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all">
                        <Phone size={14} />
                      </a>
                      <a href={`mailto:${lead.email}`} className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">
                        <Mail size={14} />
                      </a>
                      <button onClick={() => setSelectedLead(lead)} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
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
      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title="Detalhes do Lead">
        {selectedLead && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#fc6c29] flex items-center justify-center text-white text-xl font-black">
                {selectedLead.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'LD'}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{selectedLead.name}</h2>
                <span className={`text-[11px] font-black px-3 py-1 rounded-full ${tipoColors[selectedLead.source || 'Restaurante']}`}>{selectedLead.source || 'Restaurante'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Culinária', value: selectedLead.category },
                { label: 'Cidade', value: selectedLead.city },
                { label: 'Potencial B2B', value: `R$${(selectedLead.score || 0).toLocaleString('pt-BR')}/mês` },
                { label: 'Etapa', value: etapaLabels[selectedLead.stage || 'prospecto'] },
                { label: 'Telefone', value: selectedLead.phone },
                { label: 'E-mail', value: selectedLead.email },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-orange-50 rounded-2xl p-4">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-1">Reunião</span>
              <p className="text-sm font-bold text-orange-800">
                Não agendada
              </p>
            </div>
            <div className="flex gap-3">
              <a href={`tel:${selectedLead.phone}`} className="flex-1 py-3 border border-[#fc6c29] text-[#fc6c29] rounded-[20px] font-bold text-sm text-center hover:bg-[#fc6c29] hover:text-white transition-all flex items-center justify-center gap-2">
                <Phone size={16} /> Ligar
              </a>
              <a href={`mailto:${selectedLead.email}`} className="flex-1 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm text-center hover:bg-[#0e4d27] transition-all flex items-center justify-center gap-2">
                <Mail size={16} /> E-mail
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Reunião Modal */}
      <Modal isOpen={!!reuniaoModal} onClose={() => setReuniaoModal(null)} title="Agendar Reunião">
        {reuniaoModal && (
          <div className="space-y-5">
            <div className="bg-orange-50 rounded-2xl p-4">
              <p className="text-sm font-black text-orange-800">{reuniaoModal.name}</p>
              <p className="text-[11px] text-orange-600 font-medium">{reuniaoModal.source} · {reuniaoModal.city}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Data da Reunião</label>
              <input type="date" className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#fc6c29]" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Horário</label>
              <input type="time" className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#fc6c29]" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Formato</label>
              <select className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#fc6c29]">
                <option>Videochamada (Google Meet)</option>
                <option>Presencial</option>
                <option>Telefone</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Pauta</label>
              <textarea rows={3} placeholder="Tópicos a discutir..." className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#fc6c29] resize-none" />
            </div>
            <button onClick={() => setReuniaoModal(null)} className="w-full py-4 bg-[#fc6c29] text-white rounded-[20px] font-black text-sm hover:bg-[#e55a1a] transition-all">
              Confirmar Agendamento
            </button>
          </div>
        )}
      </Modal>

      {/* Novo Lead Modal */}
      <Modal isOpen={novoModal} onClose={() => setNovoModal(false)} title="Novo Restaurant Lead">
        <div className="space-y-5">
          {[
            { label: 'Nome do Restaurante / Chef', key: 'nome', type: 'text', placeholder: 'Ex: Cantina São Paulo' },
            { label: 'Culinária', key: 'culinaria', type: 'text', placeholder: 'Ex: Italiana, Japonesa...' },
            { label: 'Cidade / Estado', key: 'cidade', type: 'text', placeholder: 'Ex: São Paulo/SP' },
            { label: 'Telefone', key: 'telefone', type: 'tel', placeholder: '(11) 99999-9999' },
            { label: 'E-mail', key: 'email', type: 'email', placeholder: 'contato@email.com' },
            { label: 'Potencial B2B (R$/mês)', key: 'potencial', type: 'number', placeholder: '3000' },
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
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Tipo</label>
            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#125d30]">
              {['Restaurante', 'Dark Kitchen', 'Chef Autônomo'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={handleCreateLead} className="w-full py-4 bg-[#125d30] text-white rounded-[20px] font-black text-sm hover:bg-[#0e4d27] transition-all">
            Criar Lead
          </button>
        </div>
      </Modal>
    </div>
  );
}
