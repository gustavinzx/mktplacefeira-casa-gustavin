'use client';

import React from 'react';
import { useToast } from '@/components/Toast';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  Eye, 
  Send,
  MoreVertical,
  Building2,
  ShieldCheck,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';

export default function AdminNotasFiscaisPage() {
  const [notas, setNotas] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [transmitting, setTransmitting] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'pendente' | 'autorizada'>('all');
  const { showToast } = useToast();

  const fetchNotas = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      if (!session?.access_token) return;

      const res = await fetch('/api/admin/nfe', { headers: { Authorization: `Bearer ${session.access_token}` } }).then(r => r.json());
      if (res.success) {
        setNotas(res.data.notas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotas();
  }, []);

  const handleTransmitir = async (orderId: string) => {
    try {
      setTransmitting(orderId);
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      if (!session?.access_token) return;

      const res = await fetch('/api/admin/nfe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ action: 'transmitir', orderIds: [orderId] })
      }).then(r => r.json());

      if (res.success) {
        showToast('Nota Fiscal emitida com sucesso', 'success');
        fetchNotas();
      } else {
        showToast(res.error || 'Erro ao emitir NF', 'error');
      }
    } catch (err) {
      showToast('Erro interno', 'error');
    } finally {
      setTransmitting(null);
    }
  };

  const handleTransmitirLote = async () => {
    const pendentesIds = notas.filter(n => n.status === 'pendente').map(n => n.id);
    if (pendentesIds.length === 0) {
      return showToast('Nenhuma nota pendente para lote', 'info');
    }
    
    try {
      setTransmitting('lote');
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      if (!session?.access_token) return;

      const res = await fetch('/api/admin/nfe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ action: 'transmitir', orderIds: pendentesIds })
      }).then(r => r.json());

      if (res.success) {
        showToast('Lote de notas emitido com sucesso', 'success');
        fetchNotas();
      } else {
        showToast(res.error || 'Erro ao emitir Lote', 'error');
      }
    } catch (err) {
      showToast('Erro interno no lote', 'error');
    } finally {
      setTransmitting(null);
    }
  };

  const pendentesCount = notas.filter(n => n.status === 'pendente').length;
  const emitidasCount = notas.filter(n => n.status === 'autorizada').length;
  const falhaCount = notas.filter(n => n.status === 'rejeitada').length;

  const filteredNotas = notas.filter(n => {
    const matchesSearch = n.id.toLowerCase().includes(searchTerm.toLowerCase()) || n.cnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#b7ffc1] text-green-700 rounded-lg">
              <FileText size={20} />
            </div>
            <span className="text-[12px] font-black text-green-700 uppercase tracking-widest">Faturamento Eletrônico</span>
          </div>
          <h2 className="text-[36px] font-black text-gray-900 tracking-tight leading-tight">Emissor de Notas Fiscais</h2>
          <p className="text-[16px] font-medium text-[#404940] mt-1">Gerencie o faturamento e a emissão de documentos eletrônicos (NFe) dos pedidos.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { showToast('Sincronizando com a SEFAZ...', 'info'); fetchNotas(); }}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3.5 bg-white border border-[#bfc9bd]/30 rounded-2xl text-[14px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`text-green-700 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar SEFAZ
          </button>
          <button 
            onClick={handleTransmitirLote} 
            disabled={transmitting === 'lote' || pendentesCount === 0}
            className="flex items-center gap-2 px-6 py-3.5 bg-green-700 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest shadow-xl shadow-green-900/20 hover:bg-[#2d7a44] transition-all disabled:opacity-50"
          >
            <Send size={18} />
            {transmitting === 'lote' ? 'Processando...' : 'Emissão em Lote'}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-[#bfc9bd]/20 shadow-sm flex items-center gap-6 relative overflow-hidden group">
          <div className="w-16 h-16 bg-[#feeadc] rounded-3xl flex items-center justify-center text-[#904d00] relative z-10">
            <Clock size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-bold text-[#707a6f] uppercase tracking-widest">Aguardando Emissão</p>
            <h3 className="text-[28px] font-black text-gray-900">{pendentesCount} Pedidos</h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-[#bfc9bd]/20 shadow-sm flex items-center gap-6 relative overflow-hidden group">
          <div className="w-16 h-16 bg-[#b7ffc1] rounded-3xl flex items-center justify-center text-green-700 relative z-10">
            <CheckCircle2 size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-bold text-[#707a6f] uppercase tracking-widest">Emitidas</p>
            <h3 className="text-[28px] font-black text-gray-900">{emitidasCount} Notas</h3>
          </div>
        </div>
        <div className="bg-[#ba1a1a] p-8 rounded-[40px] text-white flex items-center gap-6 relative overflow-hidden group shadow-xl shadow-red-900/10">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-white backdrop-blur-md relative z-10">
            <AlertCircle size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Falhas na Sefaz</p>
            <h3 className="text-[28px] font-black text-white">{falhaCount} Ocorrências</h3>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[40px] border border-[#bfc9bd]/20 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-[#bfc9bd]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-[20px] font-black text-gray-900 mb-6">Fila de Processamento</h2>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar pedido ou CNPJ..." 
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-[#bfc9bd]/30 rounded-2xl text-[14px] font-medium focus:ring-2 focus:ring-green-700 outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => setStatusFilter(prev => prev === 'all' ? 'pendente' : prev === 'pendente' ? 'autorizada' : 'all')}
              className={`p-3.5 border rounded-2xl transition-all flex items-center justify-center ${statusFilter !== 'all' ? 'bg-green-700 text-white border-green-700' : 'bg-white border-[#bfc9bd]/30 text-gray-500 hover:text-green-700 hover:bg-gray-50'}`}
              title={`Filtro atual: ${statusFilter}`}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[11px] font-black uppercase tracking-[0.2em] text-[#707a6f] border-y border-[#bfc9bd]/10">
              <tr>
                <th className="px-10 py-6">ID Pedido</th>
                <th className="px-6 py-6">Emitente / Vendor</th>
                <th className="px-6 py-6">Valor Total</th>
                <th className="px-6 py-6">Horário</th>
                <th className="px-10 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bfc9bd]/10">
              {loading && <tr><td colSpan={5} className="p-10 text-center font-bold text-green-700">Carregando fila...</td></tr>}
              {!loading && filteredNotas.length === 0 && <tr><td colSpan={5} className="p-10 text-center font-bold text-green-700">Nenhum pedido encontrado.</td></tr>}
              {filteredNotas.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-10 py-7">
                    <span className="text-[14px] font-black text-green-700">#{item.id.split('-')[0].toUpperCase()}</span>
                    {item.status === 'autorizada' && (
                       <p className="text-[9px] font-bold text-green-600 mt-1 uppercase">Autorizada ✓</p>
                    )}
                    {item.status === 'pendente' && (
                       <p className="text-[9px] font-bold text-orange-600 mt-1 uppercase">Pendente</p>
                    )}
                  </td>
                  <td className="px-6 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-700/5 rounded-xl flex items-center justify-center text-green-700">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="text-[15px] font-black text-gray-900">{item.vendor}</p>
                        <p className="text-[11px] font-bold text-[#707a6f]">CNPJ: {item.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-7">
                    <span className="text-[15px] font-black text-gray-900">{item.value}</span>
                  </td>
                  <td className="px-6 py-7 text-[14px] font-medium text-[#707a6f]">
                    {item.date}
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      {item.status === 'autorizada' ? (
                        <>
                          <button className="p-3 bg-white text-[#707a6f] hover:text-green-700 rounded-xl shadow-sm border border-[#bfc9bd]/20 transition-all">
                            <Eye size={18} />
                          </button>
                          <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                            Download PDF
                            <Download size={16} />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleTransmitir(item.id)}
                          disabled={transmitting === item.id}
                          className="bg-green-700 text-white px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-green-900/10 hover:bg-[#2d7a44] transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {transmitting === item.id ? 'Emitindo...' : 'Transmitir'}
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-[#bfc9bd]/10 flex justify-center">
          <p className="text-[13px] font-bold text-[#707a6f]">Mostrando {filteredNotas.length} resultados</p>
        </div>
      </div>

      {/* Certification Warning */}
      <div className="bg-[#feeadc] p-10 rounded-[40px] border border-[#bfc9bd]/20 flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#904d00] shadow-sm shrink-0">
          <ShieldCheck size={40} />
        </div>
        <div className="flex-1">
          <h3 className="text-[20px] font-black text-gray-900 mb-2 tracking-tight">Configure sua Certificação Digital</h3>
          <p className="text-[15px] font-medium text-[#404940] leading-relaxed">
            Mantenha seu certificado <strong>A1</strong> atualizado para evitar interrupções no faturamento. O seu certificado atual expira em <strong>15 dias</strong>.
          </p>
        </div>
        <button className="px-8 py-4 bg-[#904d00] text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-lg shadow-orange-900/10 hover:bg-[#713b00] transition-all whitespace-nowrap">
          Renovar Agora
        </button>
      </div>

    </div>
  );
}
