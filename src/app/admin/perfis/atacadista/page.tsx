'use client';

import React from 'react';
import { 
  ChevronRight, 
  Store, 
  Users, 
  Package, 
  BarChart3, 
  Tag, 
  Clock, 
  Mail, 
  CheckSquare, 
  Square,
  Save,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminWholesaleProfilePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Breadcrumb & Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-[13px] font-bold text-[#bfc9bd]">
            <Link href="/admin/perfis" className="hover:text-green-600 transition-colors">Gestão de Perfis</Link>
            <ChevronRight size={14} />
            <span className="text-green-600">Feirante Atacadista</span>
          </nav>
          <h2 className="text-[48px] font-black text-[#1b1c19] tracking-tight leading-none">Feirante Atacadista</h2>
          <p className="text-[16px] font-medium text-[#707a6b] mt-2">Configurações de permissões e matriz de acesso para grandes produtores.</p>
        </div>
        <div className="flex gap-4 pt-8">
          <button className="flex items-center gap-2 px-8 py-4 border border-[#efeee9] text-[#707a6b] rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-black text-[13px] uppercase tracking-widest shadow-xl shadow-green-900/20 hover:scale-105 transition-all">
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Specialized Profile Card */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm flex gap-8 items-center">
           <div className="w-24 h-32 bg-[#fff7f0] rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fc6c29]/10 to-transparent"></div>
              <Store size={48} className="text-[#fc6c29] relative z-10" />
           </div>
           <div className="space-y-3">
              <span className="px-3 py-1 bg-[#f0f9f1] text-green-600 rounded-md text-[10px] font-black uppercase tracking-widest">PERFIL ESPECIALIZADO</span>
              <h3 className="text-2xl font-black text-[#1b1c19]">Matriz de Competências B2B</h3>
              <p className="text-[15px] font-medium text-[#707a6b] leading-relaxed">
                 Usuários vinculados a este perfil possuem ferramentas avançadas para escoamento de produção em larga escala e faturamento direto para empresas.
              </p>
           </div>
        </div>

        {/* Active Users Count */}
        <div className="lg:col-span-4 bg-[#30852f] p-8 rounded-[32px] text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-green-900/20">
           <Users size={100} className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-700" />
           <div className="flex justify-between items-center">
              <Users size={24} />
              <span className="px-3 py-1 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest">Ativos</span>
           </div>
           <div>
              <h4 className="text-[64px] font-black leading-none mb-2 tracking-tighter">142</h4>
              <p className="text-sm font-bold text-white/80">Feirantes vinculados a este perfil</p>
           </div>
        </div>
      </div>

      {/* Specific Permission Matrix */}
      <div className="space-y-6">
         <h3 className="text-2xl font-black text-[#1b1c19] flex items-center gap-3">
            <span className="p-2 bg-[#f5f4ef] rounded-lg"><Package size={24} className="text-[#1b1c19]" /></span>
            Matriz de Permissões Específicas
         </h3>

         {/* Estoque */}
         <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-[#f5f4ef]/50 border-b border-gray-50 flex justify-between items-center px-10">
               <div className="flex items-center gap-3">
                  <Package size={20} className="text-green-600" />
                  <h4 className="text-[15px] font-black text-[#1b1c19]">Gestão de Estoque Atacado</h4>
               </div>
               <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Acesso Total</span>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="flex gap-4">
                  <div className="p-1 bg-green-600 text-white rounded-md h-fit"><CheckSquare size={16} /></div>
                  <div>
                     <p className="text-[14px] font-black text-[#1b1c19]">Controle de Lotes e Validade</p>
                     <p className="text-[11px] font-medium text-[#707a6b] mt-1">Rastreabilidade completa de produtos colhidos.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="p-1 bg-green-600 text-white rounded-md h-fit"><CheckSquare size={16} /></div>
                  <div>
                     <p className="text-[14px] font-black text-[#1b1c19]">Entrada por Manifestação de Carga</p>
                     <p className="text-[11px] font-medium text-[#707a6b] mt-1">Importação de NF-e via XML para estoque.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="p-1 bg-green-600 text-white rounded-md h-fit"><CheckSquare size={16} /></div>
                  <div>
                     <p className="text-[14px] font-black text-[#1b1c19]">Reserva de Mercadoria</p>
                     <p className="text-[11px] font-medium text-[#707a6b] mt-1">Bloqueio de itens para pedidos B2B futuros.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Faturamento */}
         <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-[#f5f4ef]/50 border-b border-gray-50 flex justify-between items-center px-10">
               <div className="flex items-center gap-3">
                  <BarChart3 size={20} className="text-[#fc6c29]" />
                  <h4 className="text-[15px] font-black text-[#1b1c19]">Faturamento B2B</h4>
               </div>
               <span className="text-[10px] font-black text-[#fc6c29] uppercase tracking-widest">Acesso Administrativo</span>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="flex gap-4">
                  <div className="p-1 bg-[#fc6c29] text-white rounded-md h-fit"><CheckSquare size={16} /></div>
                  <div>
                     <p className="text-[14px] font-black text-[#1b1c19]">Emissão de Notas de Débito</p>
                     <p className="text-[11px] font-medium text-[#707a6b] mt-1">Faturamento quinzenal ou mensal.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="p-1 bg-[#fc6c29] text-white rounded-md h-fit"><CheckSquare size={16} /></div>
                  <div>
                     <p className="text-[14px] font-black text-[#1b1c19]">Gestão de Crédito de Clientes</p>
                     <p className="text-[11px] font-medium text-[#707a6b] mt-1">Análise e liberação de limites para PJ.</p>
                  </div>
               </div>
               <div className="flex gap-4 opacity-40">
                  <div className="p-1 bg-[#f5f4ef] text-[#bfc9bd] rounded-md h-fit border border-gray-200"><Square size={16} /></div>
                  <div>
                     <p className="text-[14px] font-black text-[#1b1c19]">Cancelamento de Faturas</p>
                     <p className="text-[11px] font-medium text-[#707a6b] mt-1">Ação restrita a supervisores.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Preços */}
         <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-[#f5f4ef]/50 border-b border-gray-50 flex justify-between items-center px-10">
               <div className="flex items-center gap-3">
                  <Tag size={20} className="text-[#ba1a1a]" />
                  <h4 className="text-[15px] font-black text-[#1b1c19]">Preços Diferenciados</h4>
               </div>
               <span className="text-[10px] font-black text-[#ba1a1a] uppercase tracking-widest">Acesso Condicional</span>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="flex gap-4">
                  <div className="p-1 bg-[#ba1a1a] text-white rounded-md h-fit"><CheckSquare size={16} /></div>
                  <div>
                     <p className="text-[14px] font-black text-[#1b1c19]">Tabela de Preços por Volume</p>
                     <p className="text-[11px] font-medium text-[#707a6b] mt-1">Descontos progressivos por quantidade.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="p-1 bg-[#ba1a1a] text-white rounded-md h-fit"><CheckSquare size={16} /></div>
                  <div>
                     <p className="text-[14px] font-black text-[#1b1c19]">Acordos Comerciais Individuais</p>
                     <p className="text-[11px] font-medium text-[#707a6b] mt-1">Preços travados por contrato específico.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="p-1 bg-[#ba1a1a] text-white rounded-md h-fit"><CheckSquare size={16} /></div>
                  <div>
                     <p className="text-[14px] font-black text-[#1b1c19]">Sazonalidade Dinâmica</p>
                     <p className="text-[11px] font-medium text-[#707a6b] mt-1">Ajuste automático de preços por safra.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
            <h4 className="text-2xl font-black text-[#1b1c19]">Restrições de Horário</h4>
            <p className="text-[15px] font-medium text-[#707a6b]">Defina o período em que este perfil pode acessar as funções de faturamento.</p>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#bfc9bd] uppercase ml-1">INÍCIO</label>
                  <div className="w-full bg-[#f5f4ef] px-6 py-4 rounded-2xl flex items-center justify-between">
                     <span className="text-[15px] font-black text-[#1b1c19]">06:00 AM</span>
                     <Clock size={18} className="text-[#bfc9bd]" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#bfc9bd] uppercase ml-1">FIM</label>
                  <div className="w-full bg-[#f5f4ef] px-6 py-4 rounded-2xl flex items-center justify-between">
                     <span className="text-[15px] font-black text-[#1b1c19]">06:00 PM</span>
                     <Clock size={18} className="text-[#bfc9bd]" />
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
            <h4 className="text-2xl font-black text-[#1b1c19]">Relatórios Obrigatórios</h4>
            <p className="text-[15px] font-medium text-[#707a6b]">E-mail automático com resumo de movimentação diária para este perfil.</p>
            <div className="flex items-center gap-6 p-6 bg-[#f5f4ef] rounded-[24px]">
               <div className="w-14 h-8 bg-green-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all"></div>
               </div>
               <span className="text-[14px] font-black text-[#1b1c19]">Ativado para todos os usuários</span>
            </div>
         </div>
      </div>

    </div>
  );
}
