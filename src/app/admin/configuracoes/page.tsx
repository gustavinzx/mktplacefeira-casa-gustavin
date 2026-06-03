'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  ShieldCheck, 
  Database, 
  Code, 
  History, 
  Save,
  LogOut,
  Key,
  Globe,
  Clock,
  Fingerprint,
  FileText,
  Activity,
  HardDrive,
  ChevronRight,
  ShieldAlert,
  Share2,
  MapPin
} from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-extrabold text-[#1b1c19] tracking-tight">Configurações Master</h2>
          <p className="text-base text-[#40493c] font-medium">Controle total sobre seu perfil, segurança e parâmetros globais do ecossistema.</p>
        </div>
        <button className="bg-green-600 text-white px-8 py-4 rounded-[20px] font-black flex items-center gap-2 shadow-xl shadow-green-900/10 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]">
          <Save size={18} />
          Salvar Alterações
        </button>
      </div>

      {/* ATALHO — Configurações do Site */}
      <Link href="/admin/configuracoes/site" className="block group">
        <div className="bg-gradient-to-r from-[#0e6b17] to-[#1a8a25] rounded-[32px] p-8 text-white flex items-center justify-between shadow-xl shadow-green-900/20 hover:shadow-2xl hover:shadow-green-900/30 hover:scale-[1.01] active:scale-[0.99] transition-all">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Globe size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Módulo Principal</p>
              <h3 className="text-2xl font-black leading-tight">Configurações do Site</h3>
              <p className="text-white/70 text-sm font-medium mt-1">
                Textos &quot;Sobre nós&quot;, links do header, redes sociais, contato e raio de cobertura.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex gap-2">
              <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-black flex items-center gap-1.5">
                <Share2 size={12} /> Redes Sociais
              </div>
              <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-black flex items-center gap-1.5">
                <MapPin size={12} /> Raio
              </div>
            </div>
            <ChevronRight size={22} className="opacity-60 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile & Identity */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0e6b17] to-[#30852f] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-green-900/20">
                TI
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-[#1b1c19]">TI Feira.Casa</h3>
                <p className="text-sm text-[#707a6b] font-bold uppercase tracking-widest mt-1">Master Administrator • Root Access</p>
              </div>
            </div>
            
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#707a6b] uppercase tracking-widest ml-1">Nome de Exibição</label>
                <input type="text" defaultValue="TI Feira.Casa" className="w-full bg-[#f5f4ef] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0e6b17]/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#707a6b] uppercase tracking-widest ml-1">Email Master</label>
                <input type="email" defaultValue="ti@feiracasa.com.br" className="w-full bg-[#f5f4ef] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0e6b17]/10" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-[#707a6b] uppercase tracking-widest ml-1">Biografia Profissional</label>
                <textarea defaultValue="Responsável pela infraestrutura crítica e governança de dados do ecossistema Feira.Casa." className="w-full bg-[#f5f4ef] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0e6b17]/10 h-32 resize-none" />
              </div>
            </div>
          </div>

          {/* Platform Operational Params */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#1b1c19] mb-8 flex items-center gap-2">
              <Globe size={18} className="text-green-600" />
              Parâmetros da Plataforma
            </h4>
            <div className="space-y-4">
              {[
                { title: 'Checkout Global', desc: 'Define se o marketplace está aberto para compras.', icon: Clock, active: true },
                { title: 'Notificações Push', desc: 'Regras de disparo automático para campanhas.', icon: Bell, active: true },
                { title: 'Modo Manutenção', desc: 'Bloqueia o acesso de todos os usuários comuns.', icon: ShieldAlert, active: false },
              ].map((param, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-[#faf9f4] rounded-3xl border border-gray-50 group hover:border-[#0e6b17]/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:text-green-600 transition-colors">
                      <param.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#1b1c19]">{param.title}</p>
                      <p className="text-[10px] font-bold text-[#707a6b] uppercase tracking-widest">{param.desc}</p>
                    </div>
                  </div>
                  <div className={`w-14 h-7 rounded-full relative cursor-pointer transition-all ${param.active ? 'bg-green-600' : 'bg-[#bfc9bd]'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${param.active ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Security & Technical */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Security & 2FA */}
          <div className="bg-[#1b1c19] text-white p-10 rounded-[40px] shadow-2xl overflow-hidden relative group">
            <Fingerprint className="absolute -bottom-10 -right-10 text-white/10 w-48 h-48 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h4 className="text-xl font-black tracking-tight mb-8">Segurança Master</h4>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group/btn">
                  <div className="flex items-center gap-3">
                    <Key size={18} className="text-green-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Alterar Senha</span>
                  </div>
                  <ChevronRight size={14} className="opacity-30 group-hover/btn:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group/btn">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Configurar 2FA</span>
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 bg-green-500 text-black rounded uppercase tracking-tighter">ATIVO</span>
                </button>
                <button className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group/btn">
                  <div className="flex items-center gap-3">
                    <History size={18} className="text-orange-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logs de Acesso</span>
                  </div>
                  <ChevronRight size={14} className="opacity-30 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* CTO / Health Check */}
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <h4 className="text-[10px] font-black text-[#707a6b] uppercase tracking-[0.3em] text-center">Saúde do Ecossistema</h4>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-green-500" />
                  <span className="text-xs font-bold text-[#1b1c19]">API Gateway</span>
                </div>
                <span className="text-[10px] font-black text-green-600">ONLINE</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Database size={18} className="text-blue-500" />
                  <span className="text-xs font-bold text-[#1b1c19]">Supabase DB</span>
                </div>
                <span className="text-[10px] font-black text-green-600">HEALTHY</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <HardDrive size={18} className="text-orange-500" />
                  <span className="text-xs font-bold text-[#1b1c19]">Media Storage</span>
                </div>
                <span className="text-[10px] font-black text-[#1b1c19]">92% FREE</span>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
              <p className="text-[10px] font-black text-[#707a6b] uppercase tracking-widest text-center mb-4">Versão do Core</p>
              <div className="p-3 bg-[#f5f4ef] rounded-xl text-center">
                <span className="text-xs font-black text-green-600">v2.4.8-STABLE-ROOT</span>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <button className="w-full py-6 text-[#ba1a1a] font-black text-xs uppercase tracking-[0.3em] hover:bg-red-50 rounded-[24px] transition-all border-2 border-dashed border-red-100 flex items-center justify-center gap-3 group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            Encerrar Sessão Master
          </button>

        </div>

      </div>

    </div>
  );
}
