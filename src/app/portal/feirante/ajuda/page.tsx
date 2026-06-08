'use client';

import React from 'react';
import PortalTopbar from '@/components/PortalTopbar';
import PortalSidebar from '@/components/PortalSidebar';
import { HelpCircle, Book, MessageSquare, Phone } from 'lucide-react';

export default function AjudaPage() {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
      <PortalSidebar />
      <div className="flex-1 flex flex-col pl-[280px]">
        <PortalTopbar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Central de Ajuda</h1>
            <p className="text-gray-500 mb-8">Como podemos ajudar você hoje?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-3 bg-green-50 text-green-700 rounded-xl"><Book size={24} /></div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Manuais e Tutoriais</h3>
                  <p className="text-sm text-gray-500">Aprenda a cadastrar produtos, gerenciar pedidos e configurar sua banca.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl"><MessageSquare size={24} /></div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Chat de Suporte</h3>
                  <p className="text-sm text-gray-500">Fale ao vivo com nossa equipe de atendimento ao produtor.</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Dúvidas Frequentes</h2>
            <div className="space-y-4">
              {[
                'Como recebo os pagamentos das minhas vendas?',
                'Como funciona a logística e coleta de produtos?',
                'Posso pausar minha banca se eu sair de férias?',
                'Qual é a taxa cobrada pela plataforma?'
              ].map((q, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 flex items-center gap-3">
                  <HelpCircle size={20} className="text-gray-400" />
                  <span className="font-medium text-gray-700">{q}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-[#125d30] rounded-3xl p-8 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Ainda precisa de ajuda?</h3>
                <p className="text-green-100">Nossa equipe de suporte técnico está disponível das 08h às 18h.</p>
              </div>
              <button className="px-6 py-3 bg-white text-[#125d30] font-bold rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors">
                <Phone size={18} /> (11) 4000-0000
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
