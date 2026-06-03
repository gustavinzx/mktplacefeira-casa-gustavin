'use client';
import { useState } from 'react';
import { Plus, Eye, ToggleLeft, ToggleRight, BarChart2, Layers, MousePointerClick, FlaskConical } from 'lucide-react';
import Modal from '@/components/admin/Modal';

type CampStatus = 'ativa' | 'pausada';
type CampTipo = 'popup' | 'banner' | 'email';
type CampGatilho = '1ª visita' | 'Exit Intent' | 'Tempo (30s)' | 'Agendado sexta';

type Campaign = {
  nome: string;
  tipo: CampTipo;
  gatilho: CampGatilho;
  publico: string;
  impressoes: string;
  conversao: string;
  status: CampStatus;
};

const initialCampaigns: Campaign[] = [
  { nome: 'Bem-vindo Novato', tipo: 'popup', gatilho: '1ª visita', publico: 'Novos visitantes', impressoes: '12.400', conversao: '8,2%', status: 'ativa' },
  { nome: 'Abandono de Carrinho', tipo: 'popup', gatilho: 'Exit Intent', publico: 'Com carrinho', impressoes: '8.800', conversao: '5,1%', status: 'ativa' },
  { nome: 'Black Feira', tipo: 'banner', gatilho: 'Tempo (30s)', publico: 'Todos', impressoes: '21.000', conversao: '3,4%', status: 'pausada' },
  { nome: 'Newsletter Semanal', tipo: 'email', gatilho: 'Agendado sexta', publico: 'Assinantes', impressoes: '4.200', conversao: '22,0%', status: 'ativa' },
];

const tipoOptions: CampTipo[] = ['popup', 'banner', 'email'];
const gatilhoOptions: CampGatilho[] = ['1ª visita', 'Exit Intent', 'Tempo (30s)', 'Agendado sexta'];

const tipoBadge: Record<CampTipo, string> = {
  popup: 'bg-purple-100 text-purple-700',
  banner: 'bg-blue-100 text-blue-700',
  email: 'bg-orange-100 text-orange-700',
};

const statusBadge: Record<CampStatus, string> = {
  ativa: 'bg-green-100 text-green-700',
  pausada: 'bg-yellow-100 text-yellow-700',
};

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [newModal, setNewModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState({
    nome: '',
    tipo: tipoOptions[0] as CampTipo,
    gatilho: gatilhoOptions[0] as CampGatilho,
    publico: '',
    conteudo: '',
    abTest: false,
  });

  const toggleStatus = (index: number) => {
    setCampaigns((prev) =>
      prev.map((c, i) =>
        i === index ? { ...c, status: c.status === 'ativa' ? 'pausada' : 'ativa' } : c
      )
    );
  };

  const handleSubmit = () => {
    setNewModal(false);
    setForm({ nome: '', tipo: tipoOptions[0], gatilho: gatilhoOptions[0], publico: '', conteudo: '', abTest: false });
  };

  const ativas = campaigns.filter((c) => c.status === 'ativa').length;
  const totalImpressoes = campaigns.reduce((acc, c) => acc + parseInt(c.impressoes.replace('.', ''), 10), 0);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Campanhas & Popups</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie campanhas de conversão, popups e email marketing.</p>
        </div>
        <button
          onClick={() => setNewModal(true)}
          className="px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-green-800 transition-all shadow-lg shrink-0"
        >
          <Plus size={16} /> Nova Campanha
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Campanhas Ativas', value: `${ativas}`, icon: BarChart2, color: 'text-green-700 bg-green-50' },
          { label: 'Impressões Popup', value: totalImpressoes.toLocaleString('pt-BR'), icon: Layers, color: 'text-blue-700 bg-blue-50' },
          { label: 'Taxa Conversão', value: '6,8%', icon: MousePointerClick, color: 'text-orange-700 bg-orange-50' },
          { label: 'A/B Tests Ativos', value: '2', icon: FlaskConical, color: 'text-purple-700 bg-purple-50' },
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
          <p className="font-black text-gray-900 text-lg">Todas as Campanhas</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Nome', 'Tipo', 'Gatilho', 'Público', 'Impressões', 'Conversão', 'Status', 'Ações'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 text-sm whitespace-nowrap">{c.nome}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black capitalize ${tipoBadge[c.tipo]}`}>{c.tipo}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{c.gatilho}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{c.publico}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.impressoes}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{c.conversao}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${statusBadge[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewCampaign(c)} className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => toggleStatus(i)} className="text-gray-400 hover:text-[#125d30] transition-colors">
                        {c.status === 'ativa' ? <ToggleRight size={22} className="text-[#125d30]" /> : <ToggleLeft size={22} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Campaign Modal */}
      <Modal isOpen={newModal} onClose={() => setNewModal(false)} title="Nova Campanha">
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Nome da Campanha</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
              placeholder="Ex: Bem-vindo Novato"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Tipo</label>
              <select
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as CampTipo })}
              >
                {tipoOptions.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Gatilho</label>
              <select
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                value={form.gatilho}
                onChange={(e) => setForm({ ...form, gatilho: e.target.value as CampGatilho })}
              >
                {gatilhoOptions.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Público</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
              placeholder="Ex: Novos visitantes"
              value={form.publico}
              onChange={(e) => setForm({ ...form, publico: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Conteúdo</label>
            <textarea
              rows={4}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30 resize-none"
              placeholder="Texto do popup, assunto do email, etc."
              value={form.conteudo}
              onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
            <div>
              <p className="text-sm font-bold text-gray-900">Ativar A/B Test</p>
              <p className="text-[11px] text-gray-400">Divide o tráfego entre duas versões</p>
            </div>
            <button
              onClick={() => setForm({ ...form, abTest: !form.abTest })}
              className="text-gray-400 hover:text-[#125d30] transition-colors"
            >
              {form.abTest ? <ToggleRight size={28} className="text-[#125d30]" /> : <ToggleLeft size={28} />}
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setNewModal(false)} className="flex-1 px-5 py-3 rounded-[20px] border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="flex-1 px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm hover:bg-green-800 transition-all shadow-lg">
              Criar Campanha
            </button>
          </div>
        </div>
      </Modal>

      {/* View Campaign Modal */}
      <Modal isOpen={!!viewCampaign} onClose={() => setViewCampaign(null)} title={viewCampaign?.nome ?? ''}>
        {viewCampaign && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Impressões', value: viewCampaign.impressoes },
                { label: 'Conversão', value: viewCampaign.conversao },
                { label: 'Status', value: viewCampaign.status },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-xl font-black text-gray-900">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-2xl p-5">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Pré-visualização</p>
              <div className="border-2 border-dashed border-gray-200 rounded-xl h-36 flex items-center justify-center">
                <p className="text-gray-400 text-sm font-medium">Prévia do conteúdo da campanha</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setViewCampaign(null)} className="flex-1 px-5 py-3 rounded-[20px] border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
