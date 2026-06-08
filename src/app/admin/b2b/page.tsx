'use client';

import React, { useState } from 'react';
import { 
  Handshake, 
  TrendingUp, 
  Users, 
  Plus,
  ChevronRight,
  Search,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Download,
  Building2,
  Clock,
  ShieldCheck,
  ChefHat,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

export default function AdminB2BPage() {
  const { showToast } = useToast();
  
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const [pendRes, contRes] = await Promise.all([
        fetch('/api/admin/b2b?status=pending', {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }),
        fetch('/api/admin/b2b?status=active', {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }),
      ]);
      const [pendData, contData] = await Promise.all([pendRes.json(), contRes.json()]);
      if (pendData.success) {
        setPendentes(pendData.data.map((p: any) => ({
          id: p.id,
          name: p.restaurant?.full_name || p.producer?.full_name || 'Desconhecido',
          status: p.status === 'pending' ? 'PENDENTE' : p.status,
        })));
      }
      if (contData.success) {
        setContratos(contData.data.map((c: any) => ({
          id: c.id,
          name: c.restaurant?.full_name || c.producer?.full_name || 'Desconhecido',
          cat: c.category || 'Misto',
          date: new Date(c.created_at).toLocaleDateString('pt-BR'),
          credit: `R$ ${c.credit_limit || '0,00'}`,
          status: c.status === 'active' ? 'NORMALIZADO' : c.status,
          color: c.status === 'active' ? 'green' : 'orange',
        })));
      }
    };
    load();
  }, []);

  const aprovarCredito = async (id: string, name: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/admin/b2b', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ id, status: 'active' }),
    });
    const data = await res.json();
    if (data.success) {
      setPendentes(prev => prev.filter(p => p.id !== id));
      setContratos(prev => [{
        id: data.data.id,
        name: name,
        cat: data.data.category || 'Misto',
        date: new Date(data.data.created_at || Date.now()).toLocaleDateString('pt-BR'),
        credit: `R$ ${data.data.credit_limit || '0,00'}`,
        status: 'NORMALIZADO',
        color: 'green'
      }, ...prev]);
      showToast(`Crédito aprovado para ${name}. Contrato ativado!`, 'success');
    } else {
      showToast('Erro ao aprovar: ' + data.error, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[32px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">Gestão B2B & Atacado</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Controle comercial de grandes contas e ecossistema profissional.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-gray-50 active:scale-95 text-sm">
            <Download size={18} />
            Exportar Relatórios
          </button>
          <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/10 transition-all active:scale-95 text-sm">
            <Plus size={20} />
            Novo Contrato B2B
          </button>
        </div>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Aprovação de Crédito Card */}
        <div className="md:col-span-4 bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">APROVAÇÃO DE CRÉDITO</p>
                <h3 className="text-[42px] font-black text-gray-900 dark:text-white leading-none">14</h3>
                <p className="text-orange-600 text-[12px] font-bold mt-1">Empresas aguardando análise</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl text-orange-600">
                <ShieldCheck size={28} />
              </div>
            </div>

            <div className="space-y-3">
              {pendentes.length === 0 ? (
                <div className="text-center py-6 text-gray-400 font-bold text-sm">
                  Nenhuma empresa na fila.
                </div>
              ) : (
                pendentes.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center text-xs font-black text-gray-400 border border-gray-100 dark:border-gray-800">{p.id}</div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${p.status === 'PENDENTE' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{p.status}</span>
                      <button 
                        onClick={() => aprovarCredito(p.id, p.name)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                        title="Aprovar Crédito"
                      >
                        <CheckCircle size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <button className="mt-8 text-green-700 dark:text-green-400 text-xs font-black uppercase tracking-widest hover:underline text-center">Ver fila completa</button>
        </div>

        {/* Faturamento Atacado Chart Card */}
        <div className="md:col-span-8 bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Faturamento Atacado (30 dias)</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
              <button className="px-4 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-[10px] font-black shadow-sm">Volume</button>
              <button className="px-4 py-1.5 text-gray-400 dark:text-gray-500 text-[10px] font-black hover:text-gray-600 transition-colors">Receita</button>
            </div>
          </div>

          <div className="h-48 flex items-end gap-2 mb-8">
            {[45, 30, 60, 40, 75, 55, 65, 50, 35, 85, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-green-100 dark:bg-green-900/30 rounded-t-lg group relative cursor-pointer hover:bg-green-200 dark:hover:bg-green-800 transition-all" style={{ height: `${h}%` }}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">R$ 1.2k</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-12 pt-8 border-t border-gray-50 dark:border-gray-800">
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">TICKET MÉDIO</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">R$ 1.450,00</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">VOLUME TOTAL</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">42.8 Tons</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">NOVOS CONTRATOS</p>
              <p className="text-2xl font-black text-green-600 tracking-tighter">+12.4%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Contratos & Receitas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contratos de Fornecimento Table */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-8 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Contratos de Fornecimento</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-wider">85 ATIVOS</span>
              <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-wider">3 VENCENDO</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-4">CLIENTE / RESTAURANTE</th>
                  <th className="px-4 py-4">CATEGORIA</th>
                  <th className="px-4 py-4">RENOVAÇÃO</th>
                  <th className="px-4 py-4">CRÉDITO</th>
                  <th className="px-8 py-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {contratos.map((row, i) => (
                  <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-black text-gray-900 dark:text-white text-sm">{row.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold italic">ID: {row.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm font-medium text-gray-500 dark:text-gray-400">{row.cat}</td>
                    <td className="px-4 py-5">
                      <p className={`text-sm font-bold ${row.warning ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{row.date}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{row.credit}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        row.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Receitas e Metas */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Receitas do Chef Card */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/10 rounded-bl-full -z-0 opacity-50"></div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white relative z-10">Receitas do Chef</h3>
            <p className="text-[12px] text-gray-500 font-medium mb-6 relative z-10">Produtos patrocinados em destaque.</p>
            
            <div className="space-y-4 relative z-10">
              {[
                { title: 'Salada da Estação', chef: 'Roberta Sudbrack', tags: ['Tomate Grape', 'Rúcula Hidro'], img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=100&auto=format&fit=crop' },
                { title: 'Risoto de Açafrão', chef: 'Alex Atala', tags: ['Arroz Arbóreo', 'Queijo Meia Cura'], img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=100&auto=format&fit=crop' },
              ].map((recipe, i) => (
                <div key={i} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:shadow-md transition-all group cursor-pointer border border-transparent hover:border-green-600/20">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <img src={recipe.img} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white group-hover:text-green-700 transition-colors">{recipe.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold mb-2">Chef {recipe.chef}</p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.map((tag, j) => (
                        <span key={j} className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[8px] font-black uppercase">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:border-green-600 hover:text-green-700 transition-all">
                <Plus size={16} />
                Vincular Novo Produto
              </button>
            </div>
          </div>

          {/* Meta Mensal Card */}
          <div className="bg-[#a63b00] p-8 rounded-[32px] text-white shadow-xl shadow-orange-900/20 relative overflow-hidden group">
            <Building2 size={120} className="absolute -bottom-10 -right-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <h3 className="text-xl font-black mb-4">Meta de Atacado Mensal</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-wider">EM PROGRESSO</span>
              <span className="text-xl font-black">72%</span>
            </div>
            <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden mb-6">
              <div className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{ width: '72%' }}></div>
            </div>
            <p className="text-xs font-bold text-white/80 leading-relaxed">
              R$ 1.2M de R$ 1.8M faturados no mercado profissional.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Diretório de Atacadistas */}
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">Diretório de Atacadistas</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select className="appearance-none pl-11 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-xs font-black text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-green-600/20 cursor-pointer">
                <option>Filtrar por Região</option>
                <option>São Paulo</option>
                <option>Rio de Janeiro</option>
              </select>
              <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
              <button className="p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm">
                <LayoutGrid size={18} />
              </button>
              <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 transition-colors">
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Central de Pomares', tag: 'MASTER DISTRIBUIDOR', color: 'green', code: 'CP', logistics: 'Alta', region: 'Grande SP' },
            { name: 'Log Horta Vale', tag: 'LOGÍSTICO', color: 'orange', code: 'LH', logistics: 'Média', region: 'Vale Paraíba' },
            { name: 'Frutos da Amazônia', tag: 'INATIVO', color: 'gray', code: 'FA', logistics: '-', region: 'Norte' },
            { name: 'Solo Direto Sul', tag: 'PRODUTOR MASTER', color: 'blue', code: 'SD', logistics: 'Máxima', region: 'Sul' },
          ].map((card, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
                  card.color === 'green' ? 'bg-green-50 text-green-700' : 
                  card.color === 'orange' ? 'bg-orange-50 text-orange-700' : 
                  card.color === 'gray' ? 'bg-gray-100 text-gray-400' : 
                  'bg-blue-50 text-blue-700'
                }`}>
                  {card.code}
                </div>
                <MoreVertical size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors cursor-pointer" />
              </div>
              <h4 className="font-black text-gray-900 dark:text-white mb-1 group-hover:text-green-700 transition-colors">{card.name}</h4>
              <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                card.color === 'green' ? 'bg-green-100 text-green-700' : 
                card.color === 'orange' ? 'bg-orange-100 text-orange-700' : 
                card.color === 'gray' ? 'bg-gray-100 text-gray-400' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {card.tag}
              </span>

              <div className="mt-8 space-y-2 pt-6 border-t border-gray-50 dark:border-gray-800">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 font-bold">Capacidade Logística:</span>
                  <span className="text-gray-900 dark:text-white font-black">{card.logistics}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 font-bold">Região:</span>
                  <span className="text-gray-900 dark:text-white font-black">{card.region}</span>
                </div>
              </div>

              <button className={`w-full mt-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                card.color === 'gray' ? 'bg-gray-50 text-gray-400 hover:bg-gray-100' : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-green-700 hover:text-white'
              }`}>
                {card.color === 'gray' ? 'Reativar' : 'Gerenciar Preços'}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
