'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  ShieldCheck, 
  Activity, 
  User, 
  Clock, 
  Database,
  Lock,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { fetchAuditLogs } from '@/lib/database';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/usuarios" className="hover:text-green-700 transition-colors">Usuários</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Logs de Auditoria</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Logs de Auditoria</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Rastreie cada ação realizada por administradores e parceiros. Garanta a transparência e segurança operacional do ecossistema.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-white border border-gray-200 rounded-[24px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download size={20} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Activity size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações Hoje</p>
            <p className="text-3xl font-black text-gray-900">1,284</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Integridade</p>
            <p className="text-3xl font-black text-gray-900">100%</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Lock size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bloqueios</p>
            <p className="text-3xl font-black text-gray-900">03</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-700 transition-colors" />
          <input 
            type="text" 
            placeholder="Filtrar por ação, módulo ou usuário..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none text-sm font-medium transition-all shadow-sm focus:ring-2 focus:ring-green-500/10"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-50 transition-all">
          <Filter size={20} />
          Módulos
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Evento / Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuário</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ação Realizada</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Módulo</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">IP / Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-gray-400">Carregando logs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                        <History size={40} />
                      </div>
                      <p className="text-sm font-bold text-gray-400">Nenhum log de auditoria encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">
                            {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(log.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 text-green-700 rounded-full flex items-center justify-center font-black text-xs border border-green-100">
                          {log.profiles?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{log.profiles?.full_name || 'Desconhecido'}</p>
                          <p className="text-xs text-gray-400">{log.profiles?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="px-4 py-2 bg-gray-100 rounded-xl inline-block border border-gray-200">
                        <p className="text-xs font-black text-gray-700 tracking-tight">{log.action}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{log.module}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-bold text-gray-900">{log.ip_address || '127.0.0.1'}</p>
                        <p className="text-[10px] font-medium text-gray-400 uppercase">Sistema / Chrome</p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
          <p className="text-sm text-gray-400 font-medium">
            Mostrando <span className="text-gray-900 font-black">1-50</span> de <span className="text-gray-900 font-black">{logs.length}</span> eventos
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-green-700 disabled:opacity-50 transition-all shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-green-700 text-white text-sm font-black shadow-lg shadow-green-900/20">1</button>
            <button className="w-10 h-10 rounded-xl bg-white text-gray-500 text-sm font-bold hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200">2</button>
            <button className="p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-green-700 transition-all shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
