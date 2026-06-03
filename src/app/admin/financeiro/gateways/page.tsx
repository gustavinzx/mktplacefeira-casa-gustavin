'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  ChevronRight, 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Settings2, 
  RefreshCcw, 
  Save, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Lock,
  PieChart,
  Activity,
  QrCode,
  Wallet,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function AdminFinanceiroGatewaysPage() {
  const [activeGatewaySales, setActiveGatewaySales] = useState('Mercado Pago');
  const [activeGatewaySubs, setActiveGatewaySubs] = useState('Asaas');
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

  const gateways = [
    { id: 'asaas', name: 'Asaas', logo: 'https://cdn.asaas.com/brand/asaas-logo-blue.svg', type: 'Full Gateway', strength: 'Automação de PIX & Boleto', status: 'Conectado' },
    { id: 'mercadopago', name: 'Mercado Pago', logo: 'https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-1.png', type: 'PSP', strength: 'Alta Aprovação de Cartão', status: 'Conectado' },
    { id: 'stripe', name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', type: 'Global infrastructure', strength: 'Motor de Assinaturas (SaaS)', status: 'Testes' },
    { id: 'pagseguro', name: 'PagSeguro / PagBank', logo: 'https://logodownload.org/wp-content/uploads/2016/09/pagseguro-logo-1.png', type: 'Adquirente', strength: 'Confiança Regional', status: 'Desconectado' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/financeiro" className="hover:text-green-700 transition-colors">Financeiro & ERP</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Gateways de Pagamento</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Gateways</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Configure e gerencie as pontes financeiras do ecossistema. Escolha o melhor provedor para vendas diretas e assinaturas recorrentes.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-white border border-gray-200 rounded-[24px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
            <RefreshCcw size={20} />
            Testar Latência
          </button>
        </div>
      </div>

      {/* Global Routing Logic */}
      <div className="bg-gray-900 p-10 rounded-[40px] text-white shadow-xl shadow-gray-900/20 grid grid-cols-1 md:grid-cols-2 gap-10 relative overflow-hidden">
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Globe size={24} className="text-green-400" />
            </div>
            <h3 className="text-2xl font-black leading-tight">Orquestração Global</h3>
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">GATEWAY PARA VENDAS (MARKETPLACE)</label>
              <div className="flex gap-4 flex-wrap">
                {['Asaas', 'Mercado Pago', 'Stripe', 'PagSeguro'].map((g) => (
                  <button 
                    key={g}
                    onClick={() => setActiveGatewaySales(g)}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeGatewaySales === g ? 'bg-green-500 text-gray-900 shadow-lg' : 'bg-white/10 text-gray-400'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 h-full flex flex-col justify-center">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">GATEWAY PARA ASSINATURAS (FEIRANTES)</label>
            <div className="flex gap-4 flex-wrap">
              {['Asaas', 'Stripe', 'PagSeguro'].map((g) => (
                <button 
                  key={g}
                  onClick={() => setActiveGatewaySubs(g)}
                  className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeGatewaySubs === g ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/10 text-gray-400'}`}
                >
                  {g}
                </button>
              ))}
            </div>
            <p className="mt-6 text-xs text-gray-400 font-medium leading-relaxed italic">
              *A alteração do gateway de assinaturas requer processamento em lote (Batch) para portabilidade de tokens de cartão.
            </p>
          </div>
        </div>

        {/* Bg decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Providers Grid */}
        <div className="lg:col-span-7 space-y-6">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-4">PROVEDORES FINANCEIROS</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gateways.map((g) => (
              <button 
                key={g.id}
                onClick={() => setSelectedGateway(g.id)}
                className={`p-8 rounded-[40px] border transition-all text-left relative group ${
                  selectedGateway === g.id 
                    ? 'bg-white border-green-700 shadow-2xl shadow-green-900/10' 
                    : 'bg-white border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="h-10 w-auto max-w-[140px] flex items-center grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100">
                    <img src={g.logo} alt={g.name} className="h-full object-contain" />
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    g.status === 'Conectado' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {g.status}
                  </span>
                </div>
                
                <h3 className={`text-lg font-black mb-1 ${selectedGateway === g.id ? 'text-gray-900' : 'text-gray-500'}`}>{g.name}</h3>
                <p className="text-[11px] text-gray-400 font-bold mb-4 uppercase tracking-widest">{g.type}</p>
                <div className="p-3 bg-gray-50 rounded-2xl">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Destaque:</p>
                   <p className="text-xs font-bold text-gray-900 leading-tight">{g.strength}</p>
                </div>

                {selectedGateway === g.id && (
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-green-700 rounded-full flex items-center justify-center text-white">
                    <Zap size={20} fill="white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Configuration Panel */}
        <div className="lg:col-span-5">
           {selectedGateway ? (
             <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
                    <Settings2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">Configuração API</h3>
                    <p className="text-xs text-gray-400 font-medium">Credenciais de Produção: {gateways.find(g => g.id === selectedGateway)?.name}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* API KEY */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">PRODUCTION API KEY</label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="password" 
                        value="sk_live_51Mxxxxxxxxxxxxxxxxxx" 
                        readOnly
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent focus:border-blue-600/30 rounded-2xl outline-none font-mono text-xs transition-all"
                      />
                    </div>
                  </div>

                  {/* Webhook */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">WEBHOOK URL (CALLBACK)</label>
                    <div className="relative group">
                      <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-700 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="https://payments.feira.casa/v1/webhook" 
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 rounded-2xl outline-none font-bold text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4 pt-4">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">MÉTODOS HABILITADOS</p>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { label: 'Cartão de Crédito', icon: CreditCard, active: true },
                        { label: 'PIX Automático', icon: QrCode, active: true },
                        { label: 'Cartão de Débito (PIN)', icon: Wallet, active: false },
                      ].map((method) => (
                        <div key={method.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <method.icon size={16} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">{method.label}</span>
                          </div>
                          <div className={`w-10 h-5 rounded-full relative p-1 transition-all ${method.active ? 'bg-green-600' : 'bg-gray-200'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full transition-all ${method.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-[#125d30] text-white rounded-[24px] font-black text-sm flex items-center justify-center gap-2 hover:bg-green-800 transition-all shadow-lg shadow-green-900/10">
                    <Save size={18} />
                    Salvar Gateway
                  </button>
                </div>
             </div>
           ) : (
             <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-12 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[500px]">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm">
                  <DollarSign size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900">Selecione um Gateway</h4>
                  <p className="text-sm text-gray-400 font-medium max-w-[240px] mx-auto mt-2">Clique em um dos provedores à esquerda para gerenciar as credenciais e meios de pagamento.</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Security Note */}
      <div className="p-8 bg-orange-50 border border-orange-100 rounded-[40px] flex items-center gap-6">
         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm shrink-0">
            <Lock size={24} />
         </div>
         <div>
            <p className="text-sm font-black text-orange-800">Cuidado: Ambiente de Produção</p>
            <p className="text-xs font-medium text-orange-600/80 leading-relaxed">
              Alterar chaves de API ou trocar o gateway principal de assinaturas pode causar falhas temporárias no processamento de pagamentos. Recomendamos realizar testes em ambiente de Sandbox antes da virada de chave.
            </p>
         </div>
      </div>

    </div>
  );
}
