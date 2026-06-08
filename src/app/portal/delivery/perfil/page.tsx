'use client';

import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

export default function PerfilPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-black text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500">Gerencie seus dados de acesso.</p>
      </header>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm max-w-lg">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 border-4 border-white shadow-md overflow-hidden shrink-0">
            <img src="https://i.pravatar.cc/150?u=delivery" alt="Perfil" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Entregador Autorizado</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <ShieldCheck size={14} className="text-green-600" /> Conta Verificada
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nome Completo</label>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-900 font-bold">Entregador Feira.casa</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Veículo (Placa)</label>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-900 font-bold">Moto (ABC-1234)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
