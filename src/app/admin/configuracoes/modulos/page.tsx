'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, Package, MapPin, BarChart3,
  Store, RefreshCcw, CreditCard, User, Heart, Lock,
  Eye, EyeOff, Save, Loader2, Check, AlertTriangle,
  Leaf, Truck, Building2, ChefHat, Info,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Module definitions ────────────────────────────────────────────────────────

interface ModuleDef {
  key: string;
  label: string;
  portal: string;
  portalColor: string;
  icon: React.ElementType;
  wip?: boolean;
}

const MODULES: ModuleDef[] = [
  // Feirante
  { key: 'feirante_dashboard',   label: 'Dashboard',           portal: 'Feirante', portalColor: 'bg-green-100 text-green-800', icon: LayoutDashboard },
  { key: 'feirante_pedidos',     label: 'Meus Pedidos',        portal: 'Feirante', portalColor: 'bg-green-100 text-green-800', icon: ShoppingBag },
  { key: 'feirante_produtos',    label: 'Meus Produtos',       portal: 'Feirante', portalColor: 'bg-green-100 text-green-800', icon: Package },
  { key: 'feirante_feiras',      label: 'Minhas Feiras',       portal: 'Feirante', portalColor: 'bg-green-100 text-green-800', icon: MapPin },
  { key: 'feirante_relatorio',   label: 'Relatório de Ganhos', portal: 'Feirante', portalColor: 'bg-green-100 text-green-800', icon: BarChart3,  wip: true },
  { key: 'feirante_pos',         label: 'Pontos de Venda',     portal: 'Feirante', portalColor: 'bg-green-100 text-green-800', icon: Store,      wip: true },
  { key: 'feirante_devolucoes',  label: 'Devoluções',          portal: 'Feirante', portalColor: 'bg-green-100 text-green-800', icon: RefreshCcw, wip: true },
  { key: 'feirante_assinatura',  label: 'Assinatura',          portal: 'Feirante', portalColor: 'bg-green-100 text-green-800', icon: CreditCard, wip: true },
  { key: 'feirante_perfil',      label: 'Meu Perfil',          portal: 'Feirante', portalColor: 'bg-green-100 text-green-800', icon: User },

  // Comprador
  { key: 'usuario_inicio',       label: 'Início / Dashboard',  portal: 'Comprador', portalColor: 'bg-orange-100 text-orange-700', icon: LayoutDashboard },
  { key: 'usuario_pedidos',      label: 'Meus Pedidos',        portal: 'Comprador', portalColor: 'bg-orange-100 text-orange-700', icon: ShoppingBag,   wip: true },
  { key: 'usuario_favoritos',    label: 'Lista de Desejos',    portal: 'Comprador', portalColor: 'bg-orange-100 text-orange-700', icon: Heart,         wip: true },
  { key: 'usuario_perfil',       label: 'Meu Perfil',          portal: 'Comprador', portalColor: 'bg-orange-100 text-orange-700', icon: User },
  { key: 'usuario_virar_feirante',label: 'Botão Virar Feirante',portal: 'Comprador', portalColor: 'bg-orange-100 text-orange-700', icon: Leaf },
  { key: 'usuario_virar_fornecedor',label:'Botão Virar Fornecedor',portal:'Comprador',portalColor:'bg-orange-100 text-orange-700',icon: Truck, wip: true },
  { key: 'usuario_franqueado',   label: 'Botão Ser Franqueado',portal: 'Comprador', portalColor: 'bg-orange-100 text-orange-700', icon: Building2 },

  // Chef
  { key: 'chef_dashboard',       label: 'Dashboard',           portal: 'Chef',     portalColor: 'bg-purple-100 text-purple-700', icon: LayoutDashboard, wip: true },
  { key: 'chef_receitas',        label: 'Minhas Receitas',     portal: 'Chef',     portalColor: 'bg-purple-100 text-purple-700', icon: ChefHat,         wip: true },
  { key: 'chef_pedidos',         label: 'Pedidos B2B',         portal: 'Chef',     portalColor: 'bg-purple-100 text-purple-700', icon: ShoppingBag,     wip: true },

  // Restaurante
  { key: 'restaurante_dashboard', label: 'Dashboard B2B',       portal: 'Restaurante', portalColor: 'bg-red-100 text-red-700', icon: LayoutDashboard, wip: true },
  { key: 'restaurante_cardapio',  label: 'Cardápio / Insumos',  portal: 'Restaurante', portalColor: 'bg-red-100 text-red-700', icon: Package, wip: true },
  { key: 'restaurante_compras',   label: 'Compras e Estoque',   portal: 'Restaurante', portalColor: 'bg-red-100 text-red-700', icon: ShoppingBag, wip: true },

  // Logístico
  { key: 'logistico_painel',      label: 'Painel de Entregas',  portal: 'Logístico', portalColor: 'bg-blue-100 text-blue-700', icon: Truck, wip: true },
  { key: 'logistico_rotas',       label: 'Gestão de Rotas',     portal: 'Logístico', portalColor: 'bg-blue-100 text-blue-700', icon: MapPin, wip: true },
  { key: 'logistico_faturamento', label: 'Faturamento',         portal: 'Logístico', portalColor: 'bg-blue-100 text-blue-700', icon: CreditCard, wip: true },

  // Parceiro
  { key: 'parceiro_painel',       label: 'Painel do Parceiro',  portal: 'Parceiro', portalColor: 'bg-teal-100 text-teal-700', icon: LayoutDashboard, wip: true },
  { key: 'parceiro_relatorios',   label: 'Relatórios de Vendas',portal: 'Parceiro', portalColor: 'bg-teal-100 text-teal-700', icon: BarChart3, wip: true },
];

const PORTAL_ORDER = ['Feirante', 'Chef', 'Restaurante', 'Comprador', 'Logístico', 'Parceiro'];

type VisibilityMap = Record<string, { hidden_globally: boolean }>;

const DEFAULT_VISIBILITY: VisibilityMap = Object.fromEntries(
  MODULES.map(m => [m.key, { hidden_globally: m.wip ?? false }])
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminModulosPage() {
  const [visibility, setVisibility] = useState<VisibilityMap>(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    supabase
      .from('mktplace_feira_admin_settings')
      .select('value')
      .eq('key', 'module_visibility')
      .maybeSingle()
      .then((res: any) => {
        const data = res.data;
        if (data?.value) setVisibility({ ...DEFAULT_VISIBILITY, ...(data.value as VisibilityMap) });
        setLoading(false);
      });
  }, []);

  function toggle(key: string) {
    setVisibility(prev => ({
      ...prev,
      [key]: { hidden_globally: !prev[key]?.hidden_globally },
    }));
  }

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('mktplace_feira_admin_settings')
      .upsert({ key: 'module_visibility', value: visibility, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setToast('Configurações salvas!');
    setTimeout(() => setToast(''), 3000);
    setSaving(false);
  }

  const portals = PORTAL_ORDER;
  const hiddenCount = Object.values(visibility).filter(v => v.hidden_globally).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-green-700" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Módulos & Visibilidade</h1>
          <p className="text-gray-500 font-medium mt-1">
            Controle quais módulos ficam visíveis para cada portal. Oculte funcionalidades em desenvolvimento.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-sm hover:bg-green-800 transition-all flex items-center gap-2 disabled:opacity-60 active:scale-95"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Salvar Configurações
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center mb-4"><Eye size={20} className="text-green-700" /></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Visíveis</p>
          <p className="text-3xl font-black text-gray-900">{MODULES.length - hiddenCount}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">de {MODULES.length} módulos</p>
        </div>
        <div className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center mb-4"><EyeOff size={20} className="text-red-500" /></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ocultos</p>
          <p className="text-3xl font-black text-gray-900">{hiddenCount}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">ocultos para todos</p>
        </div>
        <div className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="w-11 h-11 bg-yellow-50 rounded-2xl flex items-center justify-center mb-4"><AlertTriangle size={20} className="text-yellow-500" /></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Em Desenvolvimento</p>
          <p className="text-3xl font-black text-gray-900">{MODULES.filter(m => m.wip).length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">marcados como WIP</p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 font-medium">
          <strong>Oculto para todos</strong> — o módulo desaparece do menu de todos os usuários daquele portal. Use para esconder funcionalidades que ainda estão sendo desenvolvidas. Você (admin) ainda consegue acessar diretamente pela URL.
        </p>
      </div>

      {/* Modules per portal */}
      {portals.map(portalName => {
        const portalModules = MODULES.filter(m => m.portal === portalName);
        return (
          <div key={portalName} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">Portal {portalName}</h2>
              <p className="text-sm text-gray-400 font-medium mt-0.5">
                {portalModules.filter(m => !visibility[m.key]?.hidden_globally).length} de {portalModules.length} módulos visíveis
              </p>
            </div>

            <div className="divide-y divide-gray-50">
              {portalModules.map(mod => {
                const isHidden = visibility[mod.key]?.hidden_globally ?? false;
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.key}
                    className={`flex items-center justify-between px-8 py-5 transition-colors ${isHidden ? 'bg-red-50/30' : 'hover:bg-gray-50/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHidden ? 'bg-red-100 text-red-400' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-black ${isHidden ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {mod.label}
                          </p>
                          {mod.wip && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[9px] font-black uppercase tracking-widest rounded-full">WIP</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                          {isHidden ? 'Oculto para todos os usuários' : 'Visível no menu lateral'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isHidden && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest">
                          <Lock size={11} /> Oculto
                        </span>
                      )}
                      <button
                        onClick={() => toggle(mod.key)}
                        className={`relative w-12 h-6 rounded-full transition-all ${isHidden ? 'bg-red-200' : 'bg-green-600'}`}
                        title={isHidden ? 'Clique para tornar visível' : 'Clique para ocultar'}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isHidden ? 'left-0.5' : 'left-6'}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 bg-green-700 text-white rounded-2xl shadow-2xl text-sm font-bold animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Check size={18} /> {toast}
        </div>
      )}

    </div>
  );
}
