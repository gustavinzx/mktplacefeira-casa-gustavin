'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, FileText, ChevronLeft, ChevronRight, AlertCircle, Eye } from 'lucide-react';
import Modal from '@/components/admin/Modal';

interface Vendor {
  id: string;
  name: string;
  owner: string;
  category: string;
  categoryIcon: string;
  kyc: 'VALIDADO' | 'AGUARDANDO' | 'PENDENTE';
  docs: 'COMPLETA' | 'PENDENTE (1)' | 'PENDENTE';
  image: string;
}

const vendors: Vendor[] = [
  { id: '#FEI-0921', name: 'Banca do Sr. João', owner: 'João Almeida', category: 'Hortifrúti Orgânico', categoryIcon: '🌿', kyc: 'VALIDADO', docs: 'PENDENTE (1)', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200' },
  { id: '#FEI-1044', name: 'Empório das Castanhas', owner: 'Maria Torres', category: 'Grãos & Castanhas', categoryIcon: '🌰', kyc: 'AGUARDANDO', docs: 'COMPLETA', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200' },
  { id: '#FEI-1108', name: 'Queijaria do Vale', owner: 'Pedro Santos', category: 'Laticínios Artesanais', categoryIcon: '🧀', kyc: 'VALIDADO', docs: 'COMPLETA', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=200' },
  { id: '#FEI-1122', name: 'Mel das Flores', owner: 'Ana Lima', category: 'Mel & Apicultura', categoryIcon: '🍯', kyc: 'AGUARDANDO', docs: 'PENDENTE', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=200' },
  { id: '#FEI-1135', name: 'Pomar Feliz', owner: 'Carlos Gomes', category: 'Frutas Selecionadas', categoryIcon: '🍓', kyc: 'VALIDADO', docs: 'COMPLETA', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=200' },
];

const kycStyle: Record<string, string> = {
  VALIDADO: 'bg-green-50 text-green-700 border border-green-200',
  AGUARDANDO: 'bg-red-50 text-red-600 border border-red-200',
  PENDENTE: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
};

const docsStyle: Record<string, string> = {
  COMPLETA: 'bg-green-50 text-green-700 border border-green-200',
  'PENDENTE (1)': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  PENDENTE: 'bg-red-50 text-red-600 border border-red-200',
};

export default function FeirantesPage() {
  const [approveVendor, setApproveVendor] = useState<Vendor | null>(null);
  const [rejectVendor, setRejectVendor] = useState<Vendor | null>(null);
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);
  const [motivo, setMotivo] = useState('');
  const [list, setList] = useState(vendors);

  const handleApprove = () => {
    if (!approveVendor) return;
    setList(l => l.filter(v => v.id !== approveVendor.id));
    setApproveVendor(null);
  };

  const handleReject = () => {
    if (!rejectVendor) return;
    setList(l => l.filter(v => v.id !== rejectVendor.id));
    setRejectVendor(null);
    setMotivo('');
  };

  return (
    <div className="space-y-7 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Homologação Regional</span>
          <h1 className="text-[32px] font-black text-gray-900 leading-tight tracking-tight mt-1">Fila de Novos Parceiros</h1>
          <p className="text-gray-500 font-medium mt-1 max-w-lg">Gerencie os novos feirantes que desejam se integrar à plataforma feira.casa. Revise a documentação e o status KYC para garantir a segurança e qualidade da nossa feira.</p>
        </div>
        <div className="flex gap-4 shrink-0">
          <div className="bg-white border border-gray-100 rounded-[20px] px-6 py-4 text-center shadow-sm">
            <p className="text-2xl font-black text-green-700">{list.length}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aguardando</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-[20px] px-6 py-4 text-center shadow-sm">
            <p className="text-2xl font-black text-gray-900">28</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hoje</p>
          </div>
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="space-y-4">
        {list.map(vendor => (
          <div key={vendor.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
              <img src={vendor.image} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt={vendor.name} />

              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Nome da Banca</p>
                <p className="font-black text-gray-900 text-lg leading-tight">{vendor.name}</p>
                <p className="text-xs text-gray-400 font-medium">{vendor.owner} · {vendor.id}</p>
              </div>

              <div className="shrink-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Categoria</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{vendor.categoryIcon}</span>
                  <span className="text-sm font-bold text-gray-700">{vendor.category}</span>
                </div>
              </div>

              <div className="shrink-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status do KYC</p>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${kycStyle[vendor.kyc]}`}>
                  {vendor.kyc === 'VALIDADO' ? '✓ ' : '● '}{vendor.kyc}
                </span>
              </div>

              <div className="shrink-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Documentação</p>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${docsStyle[vendor.docs]}`}>
                  {vendor.docs === 'COMPLETA' ? '✓ ' : '⚠ '}{vendor.docs}
                </span>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => setViewVendor(vendor)} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all flex items-center gap-1.5">
                  <Eye size={13} /> Visualizar Documentos
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setApproveVendor(vendor)} className="flex-1 py-2 bg-[#125d30] text-white rounded-xl font-black text-xs hover:bg-green-800 transition-all shadow-md shadow-green-900/10">
                    Aprovar
                  </button>
                  <button onClick={() => setRejectVendor(vendor)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl font-black text-xs hover:bg-red-100 transition-all">
                    Solicitar Ajustes
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-400 transition-all">
          <ChevronLeft size={16} />
        </button>
        {[1, 2, 3].map(p => (
          <button key={p} className={`w-9 h-9 rounded-xl font-bold text-sm transition-all ${p === 1 ? 'bg-[#125d30] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}>
            {p}
          </button>
        ))}
        <button className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-400 transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* MODAL: Ver Documentos */}
      <Modal isOpen={!!viewVendor} onClose={() => setViewVendor(null)} title={`Documentos — ${viewVendor?.name}`}>
        {viewVendor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-[20px]">
              <img src={viewVendor.image} className="w-14 h-14 rounded-2xl object-cover" alt={viewVendor.name} />
              <div>
                <p className="font-black text-gray-900">{viewVendor.name}</p>
                <p className="text-xs text-gray-500">{viewVendor.owner} · {viewVendor.id}</p>
              </div>
            </div>
            {[
              { label: 'CNPJ / CPF', status: 'ok', file: 'cnpj_document.pdf' },
              { label: 'Alvará de Funcionamento', status: viewVendor.docs === 'COMPLETA' ? 'ok' : 'pending', file: 'alvara.pdf' },
              { label: 'Certidão Negativa', status: 'ok', file: 'certidao.pdf' },
              { label: 'Comprovante de Endereço', status: viewVendor.docs !== 'COMPLETA' ? 'pending' : 'ok', file: 'endereco.pdf' },
            ].map(({ label, status, file }) => (
              <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-[20px]">
                <div className="flex items-center gap-3">
                  <FileText size={16} className={status === 'ok' ? 'text-green-700' : 'text-yellow-600'} />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{label}</p>
                    <p className="text-[11px] text-gray-400">{file}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${status === 'ok' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {status === 'ok' ? '✓ OK' : '⚠ Pendente'}
                </span>
              </div>
            ))}
            <div className="flex gap-4 pt-2">
              <button onClick={() => { setViewVendor(null); setApproveVendor(viewVendor); }} className="flex-1 py-4 bg-[#125d30] text-white rounded-[20px] font-bold hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                <CheckCircle2 size={18} /> Aprovar Cadastro
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Aprovar */}
      <Modal isOpen={!!approveVendor} onClose={() => setApproveVendor(null)} title="Aprovar Feirante">
        {approveVendor && (
          <div className="space-y-5">
            <div className="p-5 bg-green-50 border border-green-100 rounded-[24px]">
              <p className="font-black text-green-800 text-lg">{approveVendor.name}</p>
              <p className="text-sm text-green-700">{approveVendor.owner} · {approveVendor.category}</p>
            </div>
            <p className="text-gray-600 text-sm font-medium">Ao aprovar, o feirante terá acesso imediato à plataforma e poderá publicar seus produtos.</p>
            <div className="flex gap-4">
              <button onClick={() => setApproveVendor(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-[20px] font-bold">Cancelar</button>
              <button onClick={handleApprove} className="flex-1 py-4 bg-[#125d30] text-white rounded-[20px] font-bold shadow-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Confirmar Aprovação
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Solicitar Ajustes */}
      <Modal isOpen={!!rejectVendor} onClose={() => setRejectVendor(null)} title="Solicitar Ajustes">
        {rejectVendor && (
          <div className="space-y-5">
            <div className="p-5 bg-yellow-50 border border-yellow-100 rounded-[24px]">
              <p className="font-black text-yellow-800">{rejectVendor.name}</p>
              <p className="text-sm text-yellow-600">{rejectVendor.owner}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Tipo de Ajuste</label>
              <select className="w-full px-6 py-4 bg-gray-50 rounded-[20px] outline-none font-bold text-sm appearance-none">
                <option>Documentação incompleta</option>
                <option>KYC reprovado</option>
                <option>Endereço inválido</option>
                <option>Categoria não permitida</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Descrição dos Ajustes</label>
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Detalhe o que precisa ser corrigido..."
                className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-yellow-400/40 focus:bg-white rounded-[24px] outline-none font-medium text-sm min-h-[100px] resize-none transition-all" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setRejectVendor(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-[20px] font-bold">Cancelar</button>
              <button onClick={handleReject} className="flex-1 py-4 bg-yellow-600 text-white rounded-[20px] font-bold hover:bg-yellow-700 transition-all flex items-center justify-center gap-2">
                <AlertCircle size={18} /> Enviar Solicitação
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
