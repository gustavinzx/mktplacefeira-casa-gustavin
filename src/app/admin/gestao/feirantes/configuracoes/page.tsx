'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ChevronRight, 
  DollarSign, 
  ShieldCheck, 
  Layout, 
  Bell, 
  Save, 
  Info, 
  Check, 
  FileCheck,
  Percent,
  Clock,
  Globe,
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/admin/Modal';
import { supabase } from '@/lib/supabase';

export default function AdminFeiranteConfiguracoesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switches, setSwitches] = useState({
    autoApproval: false,
    whatsappNotify: true,
    emailDaily: true,
    b2bContract: true
  });
  const [comissoes, setComissoes] = useState({
    varejo: '12',
    atacado: '8'
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase.from('mktplace_feira_site_settings').select('*');
        if (data) {
          const map = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);
          setSwitches({
            autoApproval: map['feirante_auto_approval'] === 'true',
            whatsappNotify: map['feirante_whatsapp_notify'] !== 'false',
            emailDaily: map['feirante_email_daily'] !== 'false',
            b2bContract: map['feirante_b2b_contract'] !== 'false',
          });
          setComissoes({
            varejo: map['feirante_comissao_varejo'] || '12',
            atacado: map['feirante_comissao_atacado'] || '8'
          });
        }
      } catch (err) {
        console.error('Error loading settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const toggleSwitch = (key: keyof typeof switches) => {
    setSwitches(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = [
      { key: 'feirante_auto_approval', value: String(switches.autoApproval) },
      { key: 'feirante_whatsapp_notify', value: String(switches.whatsappNotify) },
      { key: 'feirante_email_daily', value: String(switches.emailDaily) },
      { key: 'feirante_b2b_contract', value: String(switches.b2bContract) },
      { key: 'feirante_comissao_varejo', value: comissoes.varejo },
      { key: 'feirante_comissao_atacado', value: comissoes.atacado },
    ];
    try {
      await supabase.from('mktplace_feira_site_settings').upsert(updates, { onConflict: 'key' });
      alert('Configurações salvas com sucesso!');
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/gestao/feirantes" className="hover:text-green-700 transition-colors">Gestão de Feirantes</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Configurações Globais</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Configurações</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Regras de negócio, comissões e padrões operacionais aplicados a todos os feirantes do ecossistema.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-white border border-gray-200 rounded-[24px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
          >
            Resetar Padrões
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={20} />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Financial & Rules */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Comissionamento */}
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-700 rounded-2xl">
                <DollarSign size={24} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Regras de Comissionamento</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] border border-transparent hover:border-green-100 transition-all space-y-6">
                <div className="flex justify-between items-start">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">FEIRANTE VAREJO (B2C)</p>
                  <Percent size={18} className="text-green-700" />
                </div>
                <div className="flex items-baseline gap-2">
                  <input type="text" value={comissoes.varejo} onChange={e => setComissoes(c => ({...c, varejo: e.target.value}))} className="w-20 bg-transparent text-4xl font-black text-gray-900 dark:text-white outline-none border-b-2 border-green-700/20 focus:border-green-700 transition-all" />
                  <span className="text-xl font-black text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">Taxa padrão aplicada sobre cada venda direta ao consumidor final.</p>
              </div>

              <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] border border-transparent hover:border-green-100 transition-all space-y-6">
                <div className="flex justify-between items-start">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">FEIRANTE ATACADISTA (B2B)</p>
                  <Percent size={18} className="text-[#904d00]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <input type="text" value={comissoes.atacado} onChange={e => setComissoes(c => ({...c, atacado: e.target.value}))} className="w-20 bg-transparent text-4xl font-black text-gray-900 dark:text-white outline-none border-b-2 border-orange-700/20 focus:border-orange-700 transition-all" />
                  <span className="text-xl font-black text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">Taxa reduzida para operações de grande volume e faturamento faturado.</p>
              </div>
            </div>
          </div>

          {/* Documentação e Compliance */}
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Documentação Obrigatória</h3>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Inscrição Estadual / Produtor Rural', required: true },
                { title: 'Certificado Sanitário Atualizado', required: true },
                { title: 'Contrato de Adesão ao Ecossistema', required: true },
                { title: 'Comprovante de Origem dos Produtos', required: false },
                { title: 'Certificação Orgânica (Opcional)', required: false }
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-transparent hover:border-purple-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm">
                      <FileCheck size={20} className={doc.required ? 'text-purple-700' : 'text-gray-300'} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {doc.required && <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded">Obrigatório</span>}
                    <div className="w-10 h-6 bg-gray-200 rounded-full p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Experience & Automation */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Padrões de Vitrine */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">PADRÕES DE VITRINE</p>
            <div className="grid grid-cols-1 gap-4">
              <button className="w-full p-6 border-2 border-green-700 bg-green-50/50 rounded-[24px] flex items-center gap-4 text-left group">
                <Layout size={24} className="text-green-700" />
                <div>
                  <p className="text-sm font-black text-gray-900">Layout Minimalista</p>
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Padrão do Sistema</p>
                </div>
              </button>
              <button className="w-full p-6 border-2 border-transparent bg-gray-50 rounded-[24px] flex items-center gap-4 text-left hover:border-gray-200 transition-all">
                <Smartphone size={24} className="text-gray-400" />
                <div>
                  <p className="text-sm font-black text-gray-500">Layout Mobile First</p>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Opcional</p>
                </div>
              </button>
            </div>
          </div>

          {/* Automação e Notificações */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-blue-600" />
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">AUTOMAÇÃO E ALERTAS</p>
            </div>

            <div className="space-y-6">
              {[
                { key: 'autoApproval', label: 'Aprovação Automática de Novos Produtos', desc: 'Produtos novos entram no ar sem revisão prévia.', icon: Globe },
                { key: 'whatsappNotify', label: 'Notificação via WhatsApp', desc: 'Envio automático de novos pedidos.', icon: Smartphone },
                { key: 'emailDaily', label: 'Relatórios de Fechamento Diário', desc: 'Resumo financeiro automático via e-mail.', icon: Clock },
                { key: 'b2bContract', label: 'Contrato Digital Automático', desc: 'Geração de PDF no aceite do cadastro.', icon: FileCheck }
              ].map((item) => (
                <div key={item.key} className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">{item.label}</span>
                    </div>
                    <button 
                      onClick={() => toggleSwitch(item.key as keyof typeof switches)}
                      className={`w-12 h-6 rounded-full transition-all relative p-1 ${switches[item.key as keyof typeof switches] ? 'bg-green-700' : 'bg-gray-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${switches[item.key as keyof typeof switches] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium pl-8">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-8 bg-[#125d30] rounded-[40px] text-white shadow-xl shadow-green-900/20 relative overflow-hidden group">
            <Info size={24} className="mb-4 opacity-60" />
            <h4 className="text-lg font-black mb-2">Dica de Gestão</h4>
            <p className="text-sm opacity-80 leading-relaxed font-medium">
              Manter a taxa de comissão B2B abaixo de 10% incentiva feirantes a operarem no modelo de atacado, aumentando o faturamento global do ecossistema.
            </p>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
          </div>

        </div>
      </div>

      {/* MODAL: RESETAR PADRÕES */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Confirmar Reset de Padrões"
      >
        <div className="space-y-8">
           <div className="flex items-center gap-6 p-8 bg-red-50 rounded-[32px] border border-red-100">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-600 shrink-0 shadow-sm">
                 <AlertTriangle size={32} />
              </div>
              <div>
                 <h4 className="text-lg font-black text-red-900">Esta ação é irreversível</h4>
                 <p className="text-sm text-red-800 font-medium leading-relaxed mt-1">
                    Todas as taxas de comissão, regras de documentação e automações voltarão para os valores originais de fábrica.
                 </p>
              </div>
           </div>

           <p className="text-sm text-gray-500 font-medium text-center px-10">
              Deseja realmente prosseguir com o reset global das configurações de feirante?
           </p>

           <div className="flex gap-4 pt-4">
             <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-900 transition-all active:scale-95"
             >
                Cancelar
             </button>
             <button className="flex-1 py-4 bg-red-600 text-white rounded-[20px] font-bold shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95">
                Sim, Resetar Tudo
             </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
