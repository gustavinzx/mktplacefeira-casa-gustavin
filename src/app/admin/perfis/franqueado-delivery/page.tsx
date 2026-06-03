'use client';

import { useState } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  History,
  Clock,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function AdminFranqueadoDetailPage() {
  const [perms, setPerms] = useState({ p1: true, p2: true, p3: true });
  const [saved, setSaved] = useState(false);
  const toggle = (k: keyof typeof perms) => setPerms(p => ({ ...p, [k]: !p[k] }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/usuarios" className="hover:text-green-700 transition-colors">Gestão de Perfis</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Franqueado Delivery</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Franqueado Delivery</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Este perfil possui autonomia para orquestrar a logística regional e validar o crescimento da rede através da aprovação de novos expositores.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all active:scale-95">
            Duplicar Perfil
          </button>
          <button onClick={handleSave} className={`px-8 py-4 rounded-[20px] font-bold shadow-lg transition-all active:scale-95 ${saved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-[#125d30] text-white hover:bg-green-800 shadow-green-900/10'}`}>
            {saved ? 'Salvo!' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content: Matriz de Permissões */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <ShieldCheck size={28} className="text-green-700" />
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Matriz de Permissões</h3>
          </div>

          <div className="space-y-8">
            {/* Monitoramento de Frotas */}
            <div className={`p-8 bg-[#f8f9f8] dark:bg-gray-800/50 rounded-[32px] border relative overflow-hidden group transition-all ${perms.p1 ? 'border-green-600/20 shadow-sm' : 'border-gray-200 opacity-60'}`}>
              <div className="flex justify-between items-start gap-8 mb-6 relative z-10">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">Monitoramento de Frotas Regionais</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">Acesso em tempo real ao posicionamento e status de carga dos entregadores parceiros.</p>
                </div>
                <button onClick={() => toggle('p1')} className={`relative w-11 h-6 rounded-full transition-all shrink-0 mt-1 ${perms.p1 ? 'bg-[#125d30]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${perms.p1 ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 relative z-10">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VISUALIZAÇÃO</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">Total</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">INTERVENÇÃO</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">Crítica</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ESCOPO</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">Regional</p>
                </div>
              </div>
              <Truck size={120} className="absolute -bottom-6 -right-6 text-gray-900/5 dark:text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>

            {/* Aprovação de Novas Feiras */}
            <div className={`p-8 bg-[#f8f9f8] dark:bg-gray-800/50 rounded-[32px] border transition-all group ${perms.p2 ? 'border-green-600/10 shadow-sm' : 'border-gray-200 opacity-60'}`}>
              <div className="flex justify-between items-start gap-8 mb-6">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">Aprovação de Novas Feiras</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">Poder de veto e homologação para expansão de novos pontos de venda físicos na região.</p>
                </div>
                <button onClick={() => toggle('p2')} className={`relative w-11 h-6 rounded-full transition-all shrink-0 mt-1 ${perms.p2 ? 'bg-[#125d30]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${perms.p2 ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-black text-gray-700 dark:text-gray-300 hover:border-green-600 hover:text-green-700 transition-all">Vistoria Prévia</button>
                <button className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-black text-gray-700 dark:text-gray-300 hover:border-green-600 hover:text-green-700 transition-all">Assinatura Digital</button>
                <button className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-black text-gray-700 dark:text-gray-300 hover:border-green-600 hover:text-green-700 transition-all">Gestão de Documentação</button>
              </div>
            </div>

            {/* Gestão de Taxas */}
            <div className={`p-8 bg-[#f8f9f8] dark:bg-gray-800/50 rounded-[32px] border transition-all ${perms.p3 ? 'border-green-600/10 shadow-sm' : 'border-gray-200 opacity-60'}`}>
              <div className="flex justify-between items-start gap-8 mb-6">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">Gestão de Taxas de Entrega Locais</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">Ajustes dinâmicos de valores baseados em zoneamento e horários de pico.</p>
                </div>
                <button onClick={() => toggle('p3')} className={`relative w-11 h-6 rounded-full transition-all shrink-0 mt-1 ${perms.p3 ? 'bg-[#125d30]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${perms.p3 ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 w-[75%] rounded-full shadow-[0_0_8px_rgba(220,38,38,0.3)]"></div>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase italic">*Alterações requerem 2FA (Autenticação de dois fatores)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Status do Perfil */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">STATUS DO PERFIL</p>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">Perfil Homologado</h4>
                <p className="text-xs text-gray-400 font-medium">Última revisão: Ontem, 14:30</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400">Nível de Acesso:</span>
                <span className="text-gray-900 dark:text-white font-black">Nível 4 (Franquia)</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400">Usuários com este perfil:</span>
                <div className="text-right">
                  <span className="text-gray-900 dark:text-white font-black block">12</span>
                  <span className="text-[10px] text-gray-400 font-black uppercase">Administradores</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Regional */}
          <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group">
            <div className="aspect-video relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt="Map Preview"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 backdrop-blur-[2px]">
                <h4 className="text-xl font-black text-white leading-tight">Preview Regional: São Paulo Sul</h4>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-sm font-medium text-gray-500 leading-relaxed italic">
                &quot;Acesso liberado para ajustar o raio de entrega em até 15km da sede da feira.&quot;
              </p>
              <button className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-green-700 hover:text-white transition-all">
                Ver Mapa de Calor
              </button>
            </div>
          </div>

          {/* Log de Segurança */}
          <div className="bg-[#fcfcfc] dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <History size={20} className="text-gray-400" />
              <h3 className="text-lg font-black text-gray-900 dark:text-white">LOG DE SEGURANÇA</h3>
            </div>
            <div className="space-y-8">
              {[
                { action: 'Taxa de entrega alterada', author: 'adm_carlos', time: '2h atrás' },
                { action: 'Novo feirante aprovado', author: 'adm_carlos', time: '5h atrás' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i === 0 && <div className="absolute left-[9px] top-6 w-[2px] h-10 bg-gray-100 dark:bg-gray-800"></div>}
                  <div className="p-1 bg-white dark:bg-gray-900 rounded-full border-2 border-gray-100 dark:border-gray-800 z-10">
                    <Clock size={12} className="text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{log.action}</p>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Por: {log.author} • {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-[#fc6c29] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50">
        <Zap size={28} fill="white" />
      </button>

    </div>
  );
}
