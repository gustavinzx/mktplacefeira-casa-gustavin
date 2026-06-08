'use client';

import React, { useState } from 'react';
import { Briefcase, Building, FileText, Users2, ShieldCheck, History, ArrowUpRight, FolderKanban, Plus } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function GestaoAdmPage() {
  const { showToast } = useToast();
  const [parcerias, setParcerias] = useState([
    { id: 1, name: 'Prefeitura de SP', desc: 'Convênio de fomento a feiras orgânicas municipais. Vencimento em 12 meses.', status: 'Ativo', icon: Building, color: 'text-[#a63b00]' },
    { id: 2, name: 'Sindicato Rural', desc: 'Programa de capacitação para produtores rurais. Aguardando renovação.', status: 'Pendente', icon: ShieldCheck, color: 'text-[#707a6f]' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newParceriaNome, setNewParceriaNome] = useState('');
  const [newParceriaDesc, setNewParceriaDesc] = useState('');

  const handleNovaParceria = () => {
    if (!newParceriaNome) return showToast('Nome é obrigatório', 'error');
    if (!newParceriaDesc) return showToast('Descrição é obrigatória', 'error');
    
    setParcerias([{
      id: Date.now(),
      name: newParceriaNome,
      desc: newParceriaDesc,
      status: 'Ativo',
      icon: Briefcase,
      color: 'text-[#0e6b17]'
    }, ...parcerias]);
    
    showToast('Nova parceria firmada com sucesso!', 'success');
    setIsModalOpen(false);
    setNewParceriaNome('');
    setNewParceriaDesc('');
  };

  const departments = [
    { id: 'fin', name: 'Financeiro', status: 'Operacional', color: '#0e6b17' },
    { id: 'log', name: 'Logística', status: 'Atenção', color: '#a63b00' },
    { id: 'jur', name: 'Jurídico', status: 'Operacional', color: '#0066cc' },
    { id: 'suport', name: 'Suporte', status: 'Sobrecarga', color: '#ba1a1a' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* PAGE HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-black text-[#1b1c19] font-['Plus_Jakarta_Sans'] tracking-tight">Gestão Administrativa</h2>
          <p className="text-[#707a6f] font-medium">Controle de departamentos, parcerias e integridade documental.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border border-[#bfc9bd]/30 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#f6f6f2] transition-all">
            <History size={18} />
            <span>Logs de Auditoria</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* DEPARTMENTS CARD */}
        <div className="bg-white p-8 rounded-[32px] border border-[#bfc9bd]/20 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Building className="text-green-600" size={24} />
            <h3 className="text-xl font-black font-['Plus_Jakarta_Sans']">Departamentos</h3>
          </div>
          <div className="space-y-4">
            {departments.map(dept => (
              <div key={dept.id} className="p-4 rounded-2xl bg-[#fbfaf5] border border-[#bfc9bd]/10 flex justify-between items-center group cursor-pointer hover:border-[#0e6b17] transition-all">
                <div>
                  <p className="text-sm font-black">{dept.name}</p>
                  <p className="text-[10px] font-bold text-[#707a6f] uppercase tracking-widest">{dept.status}</p>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-4 bg-[#f6f6f2] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#707a6f] hover:bg-green-600 hover:text-white transition-all">
            Gerenciar Departamentos
          </button>
        </div>

        {/* RECENT DOCUMENTS CARD */}
        <div className="bg-white p-8 rounded-[32px] border border-[#bfc9bd]/20 shadow-sm flex flex-col lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <FolderKanban className="text-[#0066cc]" size={24} />
              <h3 className="text-xl font-black font-['Plus_Jakarta_Sans']">Arquivos e Anexos</h3>
            </div>
            <button className="text-[10px] font-black text-[#0066cc] uppercase tracking-widest hover:underline">Ver Drive Admin</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Relatório_Trimestral_Q1.pdf', type: 'PDF', size: '2.4 MB', date: 'Hoje' },
              { name: 'Contrato_Parceria_Logística.docx', type: 'DOCX', size: '850 KB', date: 'Ontem' },
              { name: 'Certidões_Fiscais_Gerais.zip', type: 'ZIP', size: '15.2 MB', date: '05/05' },
              { name: 'Planejamento_Marketing_2024.pptx', type: 'PPTX', size: '8.1 MB', date: '04/05' },
            ].map((file, i) => (
              <div key={i} className="p-5 rounded-2xl border border-[#bfc9bd]/20 flex items-center gap-4 hover:bg-[#fbfaf5] transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-[#f6f6f2] flex items-center justify-center text-[#707a6f] group-hover:bg-[#0066cc]/10 group-hover:text-[#0066cc] transition-all">
                  <FileText size={24} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black truncate">{file.name}</p>
                  <p className="text-[10px] text-[#707a6f] font-bold uppercase tracking-widest">{file.size} • {file.date}</p>
                </div>
                <ArrowUpRight size={16} className="ml-auto text-[#bfc9bd] group-hover:text-[#0066cc] opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* PARTNERSHIPS SECTION */}
      <div className="bg-white p-10 rounded-[40px] border border-[#bfc9bd]/20 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Users2 className="text-[#a63b00]" size={28} />
            <div>
              <h3 className="text-2xl font-black font-['Plus_Jakarta_Sans'] mb-1">Parcerias e Convênios</h3>
              <p className="text-sm text-[#707a6f] font-medium">Gestão de contratos com prefeituras, associações e sindicatos.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#a63b00] text-white px-8 py-4 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#7f2b00] transition-all shadow-lg shadow-[#a63b00]/20"
          >
            <Plus size={20} />
            <span>Nova Parceria</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {parcerias.map(parceria => (
            <div key={parceria.id} className={`p-8 rounded-3xl bg-[#fbfaf5] border border-[#bfc9bd]/10 flex flex-col gap-4 ${parceria.status === 'Pendente' ? 'opacity-60 grayscale' : ''}`}>
              <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm ${parceria.color}`}>
                <parceria.icon size={20} />
              </div>
              <h4 className="text-lg font-black font-['Plus_Jakarta_Sans']">{parceria.name}</h4>
              <p className="text-xs text-[#707a6f] font-medium leading-relaxed">{parceria.desc}</p>
              <span className={`mt-auto inline-block px-3 py-1 text-[9px] font-black rounded-full uppercase self-start ${parceria.status === 'Ativo' ? 'bg-[#9ef892] text-[#002202]' : 'bg-[#efeee9] text-[#707a6f]'}`}>
                {parceria.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Nova instituição parceira</h3>
            <input 
              className="w-full border border-gray-200 rounded-lg p-3 mb-4 text-sm"
              placeholder="Nome da instituição"
              value={newParceriaNome}
              onChange={e => setNewParceriaNome(e.target.value)}
            />
            <input 
              className="w-full border border-gray-200 rounded-lg p-3 mb-4 text-sm"
              placeholder="Breve descrição"
              value={newParceriaDesc}
              onChange={e => setNewParceriaDesc(e.target.value)}
            />
            <div className="flex gap-4 justify-end">
              <button className="px-4 py-2 font-bold text-gray-500 hover:text-gray-900" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="px-4 py-2 font-bold bg-[#a63b00] text-white rounded-lg" onClick={handleNovaParceria}>Salvar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
