'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  ChevronRight, 
  DollarSign, 
  ShieldCheck, 
  MapPin, 
  Bell, 
  Save, 
  Info, 
  Check, 
  FileCheck,
  Percent,
  Truck,
  Globe,
  Smartphone,
  AlertTriangle,
  Navigation,
  History
} from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/admin/Modal';

export default function AdminFranqueadoConfiguracoesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [switches, setSwitches] = useState({
    autoApproval: false,
    whatsappNotify: true,
    regionalRangeControl: true,
    mandatoryBackgroundCheck: true
  });

  const toggleSwitch = (key: keyof typeof switches) => {
    setSwitches(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/franqueados" className="hover:text-green-700 transition-colors">Gestão de Franquias</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Configurações Globais</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Configurações de Franquia</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Defina as regras de expansão, taxas de royalties e padrões de logística regional.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-white border border-gray-200 rounded-[24px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
          >
            Resetar Padrões
          </button>
          <button className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2">
            <Save size={20} />
            Salvar Configurações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Financial & Regional Rules */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Royalties e Taxas */}
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-700 rounded-2xl">
                <DollarSign size={24} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Royalties e Comissionamento</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] border border-transparent hover:border-green-100 transition-all space-y-6">
                <div className="flex justify-between items-start">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">TAXA DE ROYALTY MENSAL</p>
                  <Percent size={18} className="text-green-700" />
                </div>
                <div className="flex items-baseline gap-2">
                  <input type="text" defaultValue="5" className="w-20 bg-transparent text-4xl font-black text-gray-900 dark:text-white outline-none border-b-2 border-green-700/20 focus:border-green-700 transition-all" />
                  <span className="text-xl font-black text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">Sobre o faturamento bruto das taxas de entrega da região.</p>
              </div>

              <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] border border-transparent hover:border-green-100 transition-all space-y-6">
                <div className="flex justify-between items-start">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">COMISSÃO POR NOVO FEIRANTE</p>
                  <DollarSign size={18} className="text-[#904d00]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-gray-400">R$</span>
                  <input type="text" defaultValue="500,00" className="w-40 bg-transparent text-4xl font-black text-gray-900 dark:text-white outline-none border-b-2 border-orange-700/20 focus:border-orange-700 transition-all" />
                </div>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">Bônus pago ao franqueado pela homologação de novos expositores.</p>
              </div>
            </div>
          </div>

          {/* Regras de Atuação Regional */}
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
                <Navigation size={24} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Parâmetros Logísticos</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">RAIO PADRÃO DE ENTREGA (KM)</label>
                  <input type="number" defaultValue="15" className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-600/30 rounded-[20px] outline-none font-black text-sm transition-all" />
               </div>
               <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">CAPACIDADE MÁX. DE PEDIDOS/HORA</label>
                  <input type="number" defaultValue="200" className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-600/30 rounded-[20px] outline-none font-black text-sm transition-all" />
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Experience & Automation */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Automação e Notificações */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-blue-600" />
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">CONTROLES AUTOMÁTICOS</p>
            </div>

            <div className="space-y-6">
              {[
                { key: 'autoApproval', label: 'Aprovação Automática de Unidades', desc: 'Novas feiras entram no ar sem revisão master.', icon: Globe },
                { key: 'regionalRangeControl', label: 'Bloqueio Geofencing Dinâmico', desc: 'Impedir pedidos fora do raio de cobertura.', icon: MapPin },
                { key: 'whatsappNotify', label: 'Alertas de Crise Regional (Franqueado)', desc: 'Notificar atrasos críticos via WhatsApp.', icon: Smartphone },
                { key: 'mandatoryBackgroundCheck', label: 'Background Check Obrigatório', desc: 'Exigir verificação criminal de entregadores.', icon: ShieldCheck }
              ].map((item) => (
                <div key={item.key} className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <item.icon size={18} className="text-gray-400" />
                      <span className="text-sm font-bold">{item.label}</span>
                    </div>
                    <button 
                      onClick={() => toggleSwitch(item.key as keyof typeof switches)}
                      className={`w-12 h-6 rounded-full transition-all relative p-1 ${switches[item.key as keyof typeof switches] ? 'bg-green-700' : 'bg-gray-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${switches[item.key as keyof typeof switches] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium pl-8 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-8 bg-[#125d30] rounded-[40px] text-white shadow-xl shadow-green-900/20 relative overflow-hidden group">
            <Info size={24} className="mb-4 opacity-60" />
            <h4 className="text-lg font-black mb-2">Manual do Franqueador</h4>
            <p className="text-sm opacity-80 leading-relaxed font-medium">
              As configurações regionais podem ser sobrescritas por franqueados individuais apenas se a &quot;Autonomia de Regras&quot; estiver ativa no perfil de acesso.
            </p>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
          </div>

          {/* Audit Log Preview */}
          <div className="bg-[#f5f4ef] p-8 rounded-[40px] border border-[#efeee9] flex flex-col gap-6">
             <h4 className="text-[11px] font-black text-[#bfc9bd] uppercase tracking-widest">HISTÓRICO DE ALTERAÇÕES</h4>
             <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="p-2 bg-white rounded-lg text-green-700 shadow-sm"><History size={16} /></div>
                   <div>
                      <p className="text-[12px] font-bold text-gray-900">Taxa de Royalty alterada</p>
                      <p className="text-[10px] font-medium text-gray-400">adm_master - 2 dias atrás</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* MODAL: RESETAR PADRÕES */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Confirmar Reset de Franquia"
      >
        <div className="space-y-8">
           <div className="flex items-center gap-6 p-8 bg-red-50 rounded-[32px] border border-red-100">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-600 shrink-0 shadow-sm">
                 <AlertTriangle size={32} />
              </div>
              <div>
                 <h4 className="text-lg font-black text-red-900">Ação Crítica</h4>
                 <p className="text-sm text-red-800 font-medium leading-relaxed mt-1">
                    Esta ação resetará todas as taxas de royalties e parâmetros logísticos para o padrão global da franqueadora.
                 </p>
              </div>
           </div>

           <p className="text-sm text-gray-500 font-medium text-center px-10">
              Deseja realmente prosseguir com o reset das configurações de franquia?
           </p>

           <div className="flex gap-4 pt-4">
             <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-900 transition-all active:scale-95"
             >
                Cancelar
             </button>
             <button className="flex-1 py-4 bg-red-600 text-white rounded-[20px] font-bold shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95">
                Sim, Resetar Agora
             </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
