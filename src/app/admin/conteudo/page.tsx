'use client';

import React from 'react';
import { Megaphone, Bell, LayoutPanelLeft, Share2, Plus, Zap, BarChart3, ChevronRight } from 'lucide-react';

export default function ConteudoPage() {
  const tools = [
    { title: 'Notificações Push', desc: 'Envie avisos em tempo real para o app dos clientes.', icon: Bell, color: '#0e6b17' },
    { title: 'Gestão de Banners', desc: 'Controle as imagens e ofertas da Home.', icon: LayoutPanelLeft, color: '#0066cc' },
    { title: 'Mídia & Anúncios', desc: 'Gerencie espaços vendidos para feirantes.', icon: Megaphone, color: '#a63b00' },
    { title: 'Canais de Venda', desc: 'Integração com WhatsApp e redes sociais.', icon: Share2, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* PAGE HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-black text-[#1b1c19] font-sans tracking-tight">Conteúdo e Comunicação</h2>
          <p className="text-[#707a6f] font-medium">Gestão de toda a comunicação visual e estratégica do marketplace.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-[#1b1c19] text-white px-8 py-4 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg">
            <Zap size={20} />
            <span>Campanha Relâmpago</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <button key={i} className="bg-white p-8 rounded-[32px] border border-[#bfc9bd]/20 shadow-sm hover:shadow-2xl transition-all text-left flex flex-col gap-6 group">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12" 
                style={{ backgroundColor: `${tool.color}10`, color: tool.color }}
              >
                <Icon size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black font-sans mb-2">{tool.title}</h4>
                <p className="text-xs text-[#707a6f] font-medium leading-relaxed">{tool.desc}</p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                <span>Acessar módulo</span>
                <ChevronRight size={14} />
              </div>
            </button>
          );
        })}
      </div>

      {/* REVENUE PREVIEW */}
      <div className="bg-[#1b1c19] rounded-[40px] p-10 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-[#9ef892]" size={32} />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#9ef892]">Performance de Mídia</span>
            </div>
            <h3 className="text-3xl font-black font-sans mb-4 leading-tight">Geração de receita com anúncios.</h3>
            <p className="text-white/60 text-sm font-medium leading-relaxed">Este mês, a venda de espaços publicitários para parceiros gerou um incremento de 18% no faturamento bruto da plataforma.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 min-w-[160px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Impressões</p>
              <p className="text-2xl font-black font-sans">1.2M</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 min-w-[160px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">ROI Médio</p>
              <p className="text-2xl font-black font-sans">4.8x</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
