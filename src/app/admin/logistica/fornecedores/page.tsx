'use client';

import React, { useState } from 'react';
import { Plus, Search, Building2, UploadCloud, FileText, CheckCircle2, Navigation, Edit2, Trash2, MapPin } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import { supabase } from '@/lib/supabase';

interface FornecedorLogistico {
  id: string;
  name: string;
  cnpj: string;
  contactEmail: string;
  contactPhone: string;
  status: 'ativo' | 'analise' | 'inativo';
  hasContract: boolean;
  hasRoutesTable: boolean;
}



export default function FornecedoresLogisticaPage() {
  const [fornecedores, setFornecedores] = useState<FornecedorLogistico[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadFornecedores() {
      const { data } = await supabase.from('mktplace_feira_logistics_providers').select('*');
      if (data) {
        setFornecedores(data.map(d => ({
          id: d.id,
          name: d.name,
          cnpj: d.integration_key || '—', // Used as a placeholder for CNPJ since integration_key is present in our schema
          contactEmail: d.contact_phone || '', // Reuse or ignore
          contactPhone: d.contact_phone || '',
          status: (d.status === 'Ativo' ? 'ativo' : 'inativo') as any,
          hasContract: true,
          hasRoutesTable: true,
        })));
      }
      setLoading(false);
    }
    loadFornecedores();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<FornecedorLogistico>>({ name: '', cnpj: '', contactEmail: '', contactPhone: '', status: 'analise' });

  const filtered = fornecedores.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.cnpj.includes(searchTerm));

  const handleSave = async () => {
    const dbPayload = {
      name: formData.name,
      type: 'Transportadora',
      status: formData.status === 'ativo' ? 'Ativo' : 'Inativo',
      integration_key: formData.cnpj, // store CNPJ here for now
      contact_phone: formData.contactPhone
    };
    const { data } = await supabase.from('mktplace_feira_logistics_providers').insert(dbPayload).select().single();
    if (data) {
      setFornecedores([...fornecedores, { ...formData, id: data.id, hasContract: true, hasRoutesTable: true } as FornecedorLogistico]);
    }
    setIsModalOpen(false);
    setFormData({ name: '', cnpj: '', contactEmail: '', contactPhone: '', status: 'analise' });
  };

  return (
    <div className="p-8 pb-32">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Navigation className="text-green-700" size={32} />
            Fornecedores Logísticos
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Gerencie as empresas e frota terceira de entregas da plataforma.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-800 transition-colors shadow-lg shadow-green-900/20"
        >
          <Plus size={20} />
          Novo Parceiro
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CNPJ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white outline-none text-sm font-medium focus:border-green-600 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
                <th className="p-5 pl-8">Empresa</th>
                <th className="p-5">Contato</th>
                <th className="p-5">Documentos</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-gray-900">
              {filtered.map(forn => (
                <tr key={forn.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="p-5 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{forn.name}</p>
                        <p className="text-xs text-gray-400 font-bold">{forn.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-gray-700">{forn.contactPhone}</p>
                    <p className="text-xs text-gray-400">{forn.contactEmail}</p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${forn.hasContract ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                        <FileText size={12} /> Contrato
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${forn.hasRoutesTable ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                        <MapPin size={12} /> Tabela de Rotas
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    {forn.status === 'ativo' ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                        <CheckCircle2 size={14} /> Ativo
                      </span>
                    ) : forn.status === 'inativo' ? (
                      <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Inativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-orange-500 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-orange-500" /> Em Análise
                      </span>
                    )}
                  </td>
                  <td className="p-5 pr-8 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remover">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Fornecedor Logístico">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Razão Social / Nome Fantasia</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 rounded-[16px] px-5 py-4 border border-transparent focus:bg-white focus:border-green-600/30 outline-none transition-all font-bold text-sm" placeholder="Ex: Lalamove Transportes LTDA" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">CNPJ</label>
              <input type="text" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} className="w-full bg-gray-50 rounded-[16px] px-5 py-4 border border-transparent focus:bg-white focus:border-green-600/30 outline-none transition-all font-bold text-sm" placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Telefone / WhatsApp</label>
              <input type="text" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="w-full bg-gray-50 rounded-[16px] px-5 py-4 border border-transparent focus:bg-white focus:border-green-600/30 outline-none transition-all font-bold text-sm" placeholder="(11) 9999-9999" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">E-mail Comercial</label>
              <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full bg-gray-50 rounded-[16px] px-5 py-4 border border-transparent focus:bg-white focus:border-green-600/30 outline-none transition-all font-bold text-sm" placeholder="contato@empresa.com" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-2 space-y-4">
            <h4 className="text-sm font-black text-gray-900">Documentos & Anexos</h4>
            
            {/* Fake Uploaders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-green-500 hover:bg-green-50/50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center text-gray-400 group-hover:text-green-600 mb-3 transition-colors">
                  <UploadCloud size={20} />
                </div>
                <p className="text-xs font-bold text-gray-900">Upload de Contrato</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">PDF, DOC ou Imagem</p>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-green-500 hover:bg-green-50/50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center text-gray-400 group-hover:text-green-600 mb-3 transition-colors">
                  <UploadCloud size={20} />
                </div>
                <p className="text-xs font-bold text-gray-900">Tabela de Rotas</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">CSV ou Planilha (XLSX)</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl font-bold transition-colors">Cancelar</button>
            <button onClick={handleSave} className="flex-1 py-4 bg-green-700 hover:bg-green-800 text-white rounded-2xl font-black transition-colors shadow-lg">Cadastrar Parceiro</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
