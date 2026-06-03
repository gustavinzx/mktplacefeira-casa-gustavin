'use client';

import { useState } from 'react';
import {
  CheckCircle2, XCircle, FileText, Eye, Clock,
  MapPin, Building2, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import Modal from '@/components/admin/Modal';

interface FranchiseApp {
  id: string;
  name: string;
  owner: string;
  cnpj: string;
  region: string;
  city: string;
  capital: string;
  submitted: string;
  kyc: 'validado' | 'aguardando' | 'pendente';
  docs: 'completa' | 'pendente';
  priority: boolean;
}

const applications: FranchiseApp[] = [
  { id: '#AP-0041', name: 'Franquia Minas Gerais', owner: 'Rodrigo Ferreira', cnpj: '45.678.901/0001-23', region: 'Sudeste', city: 'Belo Horizonte, MG', capital: 'R$ 280.000', submitted: 'Hoje, 09:15', kyc: 'validado', docs: 'completa', priority: true },
  { id: '#AP-0042', name: 'Franquia Ceará', owner: 'Luciana Matos', cnpj: '56.789.012/0001-34', region: 'Nordeste', city: 'Fortaleza, CE', capital: 'R$ 210.000', submitted: 'Hoje, 11:40', kyc: 'aguardando', docs: 'pendente', priority: false },
  { id: '#AP-0043', name: 'Franquia Santa Catarina', owner: 'Marcos Bittencourt', cnpj: '67.890.123/0001-45', region: 'Sul', city: 'Florianópolis, SC', capital: 'R$ 320.000', submitted: 'Ontem, 14:22', kyc: 'validado', docs: 'completa', priority: true },
  { id: '#AP-0044', name: 'Franquia Pará', owner: 'Juliana Neves', cnpj: '78.901.234/0001-56', region: 'Norte', city: 'Belém, PA', capital: 'R$ 180.000', submitted: 'Ontem, 16:05', kyc: 'pendente', docs: 'pendente', priority: false },
];

const kycStyle: Record<string, string> = {
  validado: 'bg-green-50 text-green-700 border border-green-200',
  aguardando: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  pendente: 'bg-red-50 text-red-600 border border-red-200',
};

export default function FranqueadosAprovacaoPage() {
  const [list, setList] = useState(applications);
  const [viewApp, setViewApp] = useState<FranchiseApp | null>(null);
  const [approveApp, setApproveApp] = useState<FranchiseApp | null>(null);
  const [rejectApp, setRejectApp] = useState<FranchiseApp | null>(null);
  const [motivo, setMotivo] = useState('');

  const handleApprove = () => {
    if (!approveApp) return;
    setList(l => l.filter(a => a.id !== approveApp.id));
    setApproveApp(null);
  };

  const handleReject = () => {
    if (!rejectApp) return;
    setList(l => l.filter(a => a.id !== rejectApp.id));
    setRejectApp(null);
    setMotivo('');
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Aprovação de Franquias</h1>
          <p className="text-gray-500 font-medium mt-1">Analise as solicitações de novas franquias e verifique KYC e documentação.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="bg-white border border-gray-100 rounded-[20px] px-6 py-4 text-center shadow-sm">
            <p className="text-2xl font-black text-yellow-600">{list.length}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aguardando</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-[20px] px-6 py-4 text-center shadow-sm">
            <p className="text-2xl font-black text-green-700">3</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aprovadas hoje</p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {list.map(app => (
          <div key={app.id} className={`bg-white rounded-[24px] border shadow-sm p-6 transition-all ${app.priority ? 'border-l-4 border-l-[#fc6c29] border-gray-100' : 'border-gray-100'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              {/* Identity */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-[#125d30]/10 rounded-2xl flex items-center justify-center font-black text-[#125d30] text-lg shrink-0">
                  {app.name.split(' ')[1]?.[0] ?? 'F'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-black text-gray-900">{app.name}</p>
                    {app.priority && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-black rounded-full border border-orange-200">PRIORIDADE</span>}
                  </div>
                  <p className="text-xs text-gray-400">{app.owner} · CNPJ {app.cnpj} · {app.id}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={10} />{app.city} · Capital: {app.capital}</p>
                </div>
              </div>

              {/* KYC + Docs */}
              <div className="flex gap-3 shrink-0">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">KYC</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${kycStyle[app.kyc]}`}>
                    {app.kyc === 'validado' ? '✓ ' : '● '}{app.kyc.charAt(0).toUpperCase() + app.kyc.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Documentação</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${app.docs === 'completa' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                    {app.docs === 'completa' ? '✓ Completa' : '⚠ Pendente'}
                  </span>
                </div>
              </div>

              {/* Time */}
              <div className="text-right shrink-0 hidden lg:block">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enviado</p>
                <p className="text-sm font-bold text-gray-600 flex items-center gap-1 justify-end"><Clock size={12} />{app.submitted}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => setViewApp(app)} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all flex items-center gap-1.5">
                  <Eye size={13} /> Ver Documentos
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setApproveApp(app)} disabled={app.kyc !== 'validado' || app.docs !== 'completa'}
                    className="flex-1 py-2 bg-[#125d30] text-white rounded-xl font-black text-xs hover:bg-green-800 transition-all shadow-md shadow-green-900/10 disabled:opacity-40 disabled:cursor-not-allowed">
                    Aprovar
                  </button>
                  <button onClick={() => setRejectApp(app)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl font-black text-xs hover:bg-red-100 transition-all">
                    Recusar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div className="bg-white rounded-[32px] border border-gray-100 p-16 text-center shadow-sm">
            <CheckCircle2 size={40} className="text-green-600 mx-auto mb-4" />
            <p className="font-black text-gray-900 text-lg">Tudo em dia!</p>
            <p className="text-gray-400 font-medium mt-1">Nenhuma franquia aguardando aprovação.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"><ChevronLeft size={16} /></button>
        <button className="w-9 h-9 bg-[#125d30] text-white rounded-xl font-bold text-sm">1</button>
        <button className="w-9 h-9 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-500 hover:border-gray-400 transition-all">2</button>
        <button className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"><ChevronRight size={16} /></button>
      </div>

      {/* MODAL: Ver Documentos */}
      <Modal isOpen={!!viewApp} onClose={() => setViewApp(null)} title={`Documentos — ${viewApp?.name}`}>
        {viewApp && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-[20px]">
              <p className="font-black text-gray-900">{viewApp.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{viewApp.owner} · CNPJ {viewApp.cnpj}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={11} />{viewApp.city} · Capital declarado: {viewApp.capital}</p>
            </div>
            {[
              { doc: 'Contrato Social', status: 'ok' },
              { doc: 'CNPJ Ativo (Receita Federal)', status: 'ok' },
              { doc: 'Comprovante de Capital', status: viewApp.docs === 'completa' ? 'ok' : 'pendente' },
              { doc: 'Alvará de Funcionamento', status: viewApp.kyc === 'validado' ? 'ok' : 'pendente' },
              { doc: 'Certidão Negativa de Débitos', status: 'ok' },
            ].map(({ doc, status }) => (
              <div key={doc} className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px]">
                <div className="flex items-center gap-3">
                  <FileText size={15} className={status === 'ok' ? 'text-green-700' : 'text-yellow-600'} />
                  <span className="font-bold text-gray-900 text-sm">{doc}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${status === 'ok' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {status === 'ok' ? '✓ OK' : '⚠ Pendente'}
                </span>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setViewApp(null); setApproveApp(viewApp); }}
                disabled={viewApp.kyc !== 'validado' || viewApp.docs !== 'completa'}
                className="flex-1 py-4 bg-[#125d30] text-white rounded-[20px] font-bold hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
                <CheckCircle2 size={18} /> Aprovar Franquia
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Aprovar */}
      <Modal isOpen={!!approveApp} onClose={() => setApproveApp(null)} title="Aprovar Franquia">
        {approveApp && (
          <div className="space-y-5">
            <div className="p-5 bg-green-50 border border-green-100 rounded-[24px]">
              <p className="font-black text-green-800 text-lg">{approveApp.name}</p>
              <p className="text-sm text-green-700">{approveApp.owner} · {approveApp.city}</p>
            </div>
            <p className="text-sm text-gray-600 font-medium">A aprovação liberará o acesso ao painel do franqueado e iniciará o processo de onboarding regional.</p>
            <div className="flex gap-4">
              <button onClick={() => setApproveApp(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-[20px] font-bold">Cancelar</button>
              <button onClick={handleApprove} className="flex-1 py-4 bg-[#125d30] text-white rounded-[20px] font-bold shadow-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Confirmar Aprovação
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Recusar */}
      <Modal isOpen={!!rejectApp} onClose={() => setRejectApp(null)} title="Recusar Solicitação">
        {rejectApp && (
          <div className="space-y-5">
            <div className="p-5 bg-red-50 border border-red-100 rounded-[24px]">
              <p className="font-black text-red-800">{rejectApp.name}</p>
              <p className="text-sm text-red-600">{rejectApp.owner}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Motivo da Recusa</label>
              <select className="w-full px-6 py-4 bg-gray-50 rounded-[20px] outline-none font-bold text-sm appearance-none">
                <option>KYC reprovado</option>
                <option>Documentação incompleta</option>
                <option>Capital insuficiente</option>
                <option>Região já ocupada</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Observações</label>
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Detalhe o motivo para o solicitante..."
                className="w-full px-6 py-4 bg-gray-50 rounded-[24px] outline-none font-medium text-sm min-h-[90px] resize-none" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setRejectApp(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-[20px] font-bold">Cancelar</button>
              <button onClick={handleReject} className="flex-1 py-4 bg-red-600 text-white rounded-[20px] font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                <XCircle size={18} /> Recusar Franquia
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
