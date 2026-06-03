'use client';

import React from 'react';
import { 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Settings, 
  History, 
  Save, 
  Copy, 
  CheckCircle2, 
  Map as MapIcon, 
  Activity, 
  Clock,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function AdminFranchiseProfilePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Breadcrumb & Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-[13px] font-bold text-[#bfc9bd]">
            <Link href="/admin/perfis" className="hover:text-green-600 transition-colors">Gestão de Perfis</Link>
            <ChevronRight size={14} />
            <span className="text-green-600">Franqueado Delivery</span>
          </nav>
          <h2 className="text-[48px] font-black text-[#1b1c19] tracking-tight leading-none">Franqueado Delivery</h2>
          <p className="text-[16px] font-medium text-[#707a6b] max-w-2xl mt-4">Este perfil possui autonomia para orquestrar a logística regional e validar o crescimento da rede através da aprovação de novos expositores.</p>
        </div>
        <div className="flex gap-4 pt-8">
          <button className="flex items-center gap-2 px-8 py-4 border-2 border-[#efeee9] text-[#1b1c19] rounded-full font-black text-[13px] uppercase tracking-widest hover:bg-gray-50 transition-all">
            <Copy size={18} />
            Duplicar Perfil
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-full font-black text-[13px] uppercase tracking-widest shadow-xl shadow-green-900/20 hover:scale-105 transition-all">
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Permission Matrix */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
          <h3 className="text-2xl font-black text-[#1b1c19] flex items-center gap-3">
             <ShieldCheck size={28} className="text-green-600" />
             Matriz de Permissões
          </h3>

          {/* Frotas Regionais */}
          <div className="p-8 bg-[#faf9f4] rounded-[32px] border-l-8 border-[#0e6b17] relative group transition-all hover:shadow-md">
             <div className="flex justify-between items-start gap-8 mb-6 relative z-10">
                <div className="flex-1 min-w-0">
                   <h4 className="text-[20px] font-black text-[#1b1c19] leading-tight">Monitoramento de Frotas Regionais</h4>
                   <p className="text-[14px] font-medium text-[#707a6b] mt-1 leading-relaxed">Acesso em tempo real ao posicionamento e status de carga dos entregadores parceiros.</p>
                </div>
                <span className="px-3 py-1 bg-[#f0f9f1] text-green-600 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shrink-0 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" /> ATIVO
                </span>
             </div>
             <div className="grid grid-cols-3 gap-4 relative z-10">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 text-center space-y-1">
                   <p className="text-[9px] font-black text-[#bfc9bd] uppercase tracking-widest">VISUALIZAÇÃO</p>
                   <p className="text-[15px] font-black text-[#1b1c19]">Total</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 text-center space-y-1">
                   <p className="text-[9px] font-black text-[#bfc9bd] uppercase tracking-widest">INTERVENÇÃO</p>
                   <p className="text-[15px] font-black text-[#1b1c19]">Crítica</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 text-center space-y-1">
                   <p className="text-[9px] font-black text-[#bfc9bd] uppercase tracking-widest">ESCOPO</p>
                   <p className="text-[15px] font-black text-[#1b1c19]">Regional</p>
                </div>
             </div>
             <Truck size={80} className="absolute top-1/2 right-10 -translate-y-1/2 text-[#bfc9bd] opacity-10 group-hover:scale-110 transition-transform" />
          </div>

          {/* Aprovação de Feiras */}
          <div className="p-8 bg-[#faf9f4] rounded-[32px] border-l-8 border-[#a63b00] relative transition-all hover:shadow-md">
             <div className="flex justify-between items-start gap-8 mb-6 relative z-10">
                <div className="flex-1 min-w-0">
                   <h4 className="text-[20px] font-black text-[#1b1c19] leading-tight">Aprovação de Novas Feiras</h4>
                   <p className="text-[14px] font-medium text-[#707a6b] mt-1 leading-relaxed">Poder de veto e homologação para expansão de novos pontos de venda físicos na região.</p>
                </div>
                <span className="px-3 py-1 bg-[#f0f9f1] text-green-600 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shrink-0 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-600" /> ATIVO
                </span>
             </div>
             <div className="flex flex-wrap gap-3 relative z-10">
                <span className="px-5 py-2.5 bg-white rounded-full text-[11px] font-bold text-[#40493c] border border-gray-100">Vistoria Prévia</span>
                <span className="px-5 py-2.5 bg-white rounded-full text-[11px] font-bold text-[#40493c] border border-gray-100">Assinatura Digital</span>
                <span className="px-5 py-2.5 bg-white rounded-full text-[11px] font-bold text-[#40493c] border border-gray-100">Gestão de Documentação</span>
             </div>
          </div>

          {/* Taxas de Entrega */}
          <div className="p-8 bg-[#faf9f4] rounded-[32px] border-l-8 border-[#ba1a1a] transition-all hover:shadow-md">
             <div className="flex justify-between items-start gap-8 mb-6">
                <div className="flex-1 min-w-0">
                   <h4 className="text-[20px] font-black text-[#1b1c19] leading-tight">Gestão de Taxas de Entrega Locais</h4>
                   <p className="text-[14px] font-medium text-[#707a6b] mt-1 leading-relaxed">Ajustes dinâmicos de valores baseados em zoneamento e horários de pico.</p>
                </div>
                <span className="px-3 py-1 bg-[#f0f9f1] text-green-600 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shrink-0 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-600" /> ATIVO
                </span>
             </div>
             <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-red-600 w-[80%] rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
             </div>
             <p className="text-[10px] font-bold text-[#707a6b] italic">*Alterações requerem 2FA (Autenticação de dois fatores)</p>
          </div>
        </div>

        {/* Side Info */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Status Card */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
             <h4 className="text-[11px] font-black text-[#bfc9bd] uppercase tracking-widest">STATUS DO PERFIL</h4>
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#f0f9f1] text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
                   <CheckCircle2 size={32} />
                </div>
                <div>
                   <p className="text-[16px] font-black text-[#1b1c19]">Perfil Homologado</p>
                   <p className="text-[11px] font-medium text-[#707a6b]">Última revisão: Ontem, 14:30</p>
                </div>
             </div>
             <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center"><span className="text-sm font-medium text-[#707a6b]">Nível de Acesso:</span><span className="text-sm font-black text-[#1b1c19]">Nível 4 (Franquia)</span></div>
                <div className="flex justify-between items-center"><span className="text-sm font-medium text-[#707a6b]">Usuários com este perfil:</span><span className="text-sm font-black text-[#1b1c19] text-right leading-tight">12<br/>Administradores</span></div>
             </div>
          </div>

          {/* Preview Regional */}
          <div className="bg-[#1b1c19] rounded-[40px] overflow-hidden group shadow-2xl">
             <div className="h-48 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600')] bg-cover relative">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                   <h5 className="text-white font-black text-lg tracking-tight">Preview Regional: São Paulo Sul</h5>
                </div>
             </div>
             <div className="p-8">
                <p className="text-[12px] font-medium text-white/60 italic leading-relaxed mb-6">&quot;Acesso liberado para ajustar o raio de entrega em até 15km da sede da feira.&quot;</p>
                <button className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-[#1b1c19] font-black rounded-2xl text-[11px] uppercase tracking-widest transition-all border border-white/20">
                   Ver Mapa de Calor
                </button>
             </div>
          </div>

          {/* Security Log */}
          <div className="bg-[#f5f4ef] p-8 rounded-[40px] border border-[#efeee9] flex flex-col gap-6">
             <h4 className="text-[11px] font-black text-[#bfc9bd] uppercase tracking-widest">LOG DE SEGURANÇA</h4>
             <div className="space-y-6">
                <div className="flex gap-4">
                   <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm"><History size={18} /></div>
                   <div>
                      <p className="text-[13px] font-bold text-[#1b1c19]">Taxa de entrega alterada</p>
                      <p className="text-[11px] font-medium text-[#707a6b]">Por: adm_carlos - 2h atrás</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm"><History size={18} /></div>
                   <div>
                      <p className="text-[13px] font-bold text-[#1b1c19]">Novo feirante aprovado</p>
                      <p className="text-[11px] font-medium text-[#707a6b]">Por: adm_carlos - 5h atrás</p>
                   </div>
                </div>
             </div>
             <button className="absolute bottom-6 right-6 w-14 h-14 bg-[#fc6c29] text-white rounded-full flex items-center justify-center shadow-xl shadow-orange-900/30 hover:scale-110 transition-all rotate-12">
                <Plus size={24} />
             </button>
          </div>

        </div>
      </div>

    </div>
  );
}
