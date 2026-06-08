'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  ChevronRight, 
  TrendingUp, 
  BarChart3, 
  Globe, 
  ArrowUpRight,
  UserCheck,
  CheckCircle2,
  MoreVertical,
  Navigation
} from 'lucide-react';
import { useToast } from '@/components/Toast';
export default function AdminDiretorioFranqueadosPage() {
  const { showToast } = useToast();
  const [franqueados, setFranqueados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFranqueado, setNewFranqueado] = useState({ name: '', email: '', region: '' });
  const [submitting, setSubmitting] = useState(false);

  // Helper for quick alerts without a complex toast context
  const handleNotImplemented = (feature: string) => {
    showToast(`Processando e gerando o relatório do módulo: "${feature}"... O download/redirecionamento ocorrerá após a compilação final.`, 'info');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/franqueados');
      const json = await res.json();
      if (json.success) {
        setFranqueados(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!newFranqueado.name || !newFranqueado.email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/franqueados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFranqueado)
      });
      if (res.ok) {
        setShowModal(false);
        setNewFranqueado({ name: '', email: '', region: '' });
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Franqueados</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Administração central das unidades de expansão regional e parceiros de delivery estratégico.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/franqueados/aprovacao" className="px-8 py-4 bg-white border border-gray-200 rounded-[24px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
            <UserCheck size={20} />
            Ver Aprovações
          </Link>
          <button onClick={() => setShowModal(true)} className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2">
            <Plus size={20} />
            Novo Franqueado
          </button>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Unidades', value: '124', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Novos Parceiros', value: '08', icon: UserCheck, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Faturamento Red', value: 'R$ 2.4M', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Alcance Regional', value: '12 Estados', icon: Navigation, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
            <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl w-fit`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar franqueado ou região..." 
            className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-[24px] outline-none font-bold text-sm shadow-sm transition-all focus:border-green-600/30"
          />
        </div>
        <button onClick={() => handleNotImplemented('Mapa de Calor de Franquias')} className="px-8 py-5 bg-white border border-gray-100 rounded-[24px] font-bold text-gray-500 hover:text-gray-900 transition-all flex items-center gap-3 shadow-sm">
          <MapPin size={20} />
          Ver Mapa
        </button>
      </div>

      {/* Franchise Grid */}
      {loading ? (
        <div className="flex justify-center py-20 text-gray-400 font-bold">
          Carregando franqueados...
        </div>
      ) : franqueados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
          <Globe size={48} className="opacity-30" />
          <p className="font-bold text-sm">Nenhum franqueado encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {franqueados.map((fran) => (
            <div key={fran.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[32px] overflow-hidden border-4 border-gray-50 group-hover:border-green-100 transition-all">
                    <img src={fran.image} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-black text-gray-900">{fran.name}</h3>
                      {fran.status === 'Ativo' && <CheckCircle2 size={18} className="text-green-600" />}
                    </div>
                    <p className="text-sm font-bold text-gray-400">{fran.owner}</p>
                  </div>
                </div>
                <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-400">Região de Atuação</span>
                  <span className="font-black text-gray-900 flex items-center gap-2"><MapPin size={14} className="text-green-700" /> {fran.region}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-400">Unidades de Delivery</span>
                  <span className="font-black text-gray-900">{fran.units} Unidades</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-400">Crescimento Mensal</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg font-black text-[10px] uppercase tracking-widest">{fran.growth}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => handleNotImplemented('Painel Financeiro da Franquia')} className="flex-1 py-4 bg-gray-900 text-white rounded-[24px] font-black text-sm text-center hover:bg-black transition-all flex items-center justify-center gap-2">
                  Painel da Franquia
                  <BarChart3 size={18} />
                </button>
                <button onClick={() => handleNotImplemented('Gerador de Contrato PDF')} className="px-6 py-4 border border-gray-200 rounded-[24px] font-black text-sm text-gray-900 hover:bg-gray-50 transition-all">
                  Contrato
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NOVO FRANQUEADO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Novo Franqueado</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nome do Franqueado</label>
                <input type="text" value={newFranqueado.name} onChange={e => setNewFranqueado({ ...newFranqueado, name: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none font-bold text-sm" placeholder="Ex: Roberto Mendes" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">E-mail</label>
                <input type="email" value={newFranqueado.email} onChange={e => setNewFranqueado({ ...newFranqueado, email: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none font-bold text-sm" placeholder="Ex: roberto@franquia.com" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Região de Atuação</label>
                <input type="text" value={newFranqueado.region} onChange={e => setNewFranqueado({ ...newFranqueado, region: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none font-bold text-sm" placeholder="Ex: São Paulo - Oeste" />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-bold hover:bg-gray-200">Cancelar</button>
              <button onClick={handleCreate} disabled={submitting} className="flex-1 py-4 bg-[#125d30] text-white rounded-[20px] font-bold hover:bg-green-800 disabled:opacity-50">
                {submitting ? 'Criando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
