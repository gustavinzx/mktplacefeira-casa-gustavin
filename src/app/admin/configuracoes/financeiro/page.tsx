'use client';

import React, { useState } from 'react';
import { DollarSign, Save, Percent, Truck, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function FinanceiroSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [config, setConfig] = useState({
    taxaPlataforma: 15,
    diasRepasse: 2,
    taxaFixaSaque: 0,
    freteMinimo: 5.0,
    markupFrete: 10, // A plataforma cobra 10% a mais no frete repassado pela logistica?
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: Number(e.target.value) });
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulação de salvar no backend
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-8 pb-32 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <DollarSign className="text-green-700" size={32} />
          Configurações Financeiras
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Defina as regras globais de repasse, taxas de intermediação e custos base do Feira.Casa.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Card: Taxas do Marketplace */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700">
              <Percent size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Taxas do Marketplace</h2>
              <p className="text-sm font-medium text-gray-500">Percentuais e valores retidos sobre as vendas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Taxa de Intermediação (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  name="taxaPlataforma" 
                  value={config.taxaPlataforma} 
                  onChange={handleChange}
                  className="w-full bg-gray-50 rounded-[16px] px-5 py-4 border border-transparent focus:bg-white focus:border-green-600/30 outline-none transition-all font-black text-lg text-gray-900" 
                />
                <Percent size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 ml-1 font-medium">Descontado do valor bruto do produto (sem frete).</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Taxa Fixa por Saque PIX (R$)</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  name="taxaFixaSaque" 
                  value={config.taxaFixaSaque} 
                  onChange={handleChange}
                  className="w-full bg-gray-50 rounded-[16px] pl-12 pr-5 py-4 border border-transparent focus:bg-white focus:border-green-600/30 outline-none transition-all font-black text-lg text-gray-900" 
                />
              </div>
              <p className="text-xs text-gray-400 ml-1 font-medium">Custo bancário de transferência PIX repassado ao vendedor.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Prazo de Liberação (Dias)</label>
              <input 
                type="number" 
                name="diasRepasse" 
                value={config.diasRepasse} 
                onChange={handleChange}
                className="w-full bg-gray-50 rounded-[16px] px-5 py-4 border border-transparent focus:bg-white focus:border-green-600/30 outline-none transition-all font-bold text-sm text-gray-900" 
              />
              <p className="text-xs text-gray-400 ml-1 font-medium">Dias úteis para o valor ficar disponível para saque após a entrega do pedido.</p>
            </div>
          </div>
        </div>

        {/* Card: Regras de Frete — movido para Logística > Gestão de Rotas */}
        <div className="bg-orange-50 rounded-3xl border border-orange-100 p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm shrink-0">
            <Truck size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-orange-800">Markup & Regras de Frete</p>
            <p className="text-xs font-medium text-orange-600 mt-0.5">Esta configuração foi movida para <strong>Logística → Gestão de Rotas</strong>, onde fica junto com as demais regras logísticas.</p>
          </div>
          <a href="/admin/logistica/rotas" className="shrink-0 px-4 py-2 bg-orange-500 text-white text-xs font-black rounded-xl hover:bg-orange-600 transition-colors">
            Ir para Rotas →
          </a>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4">
          {success ? (
            <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl">
              <CheckCircle2 size={20} />
              Configurações Atualizadas!
            </div>
          ) : <div />}
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-900/20"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>

      </div>
    </div>
  );
}
