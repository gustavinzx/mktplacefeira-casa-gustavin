'use client';

import React, { useState, useEffect } from 'react';
import { 
  Tags, 
  Layers, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Grid, 
  List,
  FolderOpen,
  Tag as TagIcon,
  Palette,
  Check,
  Zap,
  Leaf,
  Clock,
  ShieldCheck,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { fetchLogisticsTags, syncLogisticsTag, deleteLogisticsTag, type LogisticsTag } from '@/lib/database';
import { useToast } from '@/components/Toast';

const DEFAULT_TAGS: LogisticsTag[] = [
  // Tipos de Feira
  { name: 'Feira Livre', group_type: 'tipo_feira', color: '#125d30' },
  { name: 'Feira de Orgânicos', group_type: 'tipo_feira', color: '#15803d' },
  { name: 'Feira Agroecológica', group_type: 'tipo_feira', color: '#166534' },
  { name: 'Mercado Municipal', group_type: 'tipo_feira', color: '#0284c7' },
  { name: 'Outro', group_type: 'tipo_feira', color: '#6b7280' },

  // Modalidades
  { name: 'Varejo', group_type: 'modalidade', color: '#4f46e5' },
  { name: 'Atacado', group_type: 'modalidade', color: '#7c3aed' },
  { name: 'Misto (Atacado e Varejo)', group_type: 'modalidade', color: '#2563eb' },

  // Periodicidade
  { name: 'Diária', group_type: 'periodicidade', color: '#ea580c' },
  { name: 'Semanal', group_type: 'periodicidade', color: '#d97706' },
  { name: 'Quinzenal', group_type: 'periodicidade', color: '#ca8a04' },
  { name: 'Mensal', group_type: 'periodicidade', color: '#65a30d' }
];

export default function AdminLogisticaTagsPage() {
  const [activeTab, setActiveTab] = useState<'tipo_feira' | 'modalidade' | 'periodicidade'>('tipo_feira');
  const [tags, setTags] = useState<LogisticsTag[]>([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<LogisticsTag | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagGroup, setTagGroup] = useState<'tipo_feira' | 'modalidade' | 'periodicidade'>('tipo_feira');
  const [tagColor, setTagColor] = useState('#125d30');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch tags from DB or use fallback
  const loadTags = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const data = await fetchLogisticsTags();
      if (data && data.length > 0) {
        setTags(data);
      } else {
        // Se retornar vazio, ou a tabela não existe ou está vazia.
        // Vamos usar os defaults
        setTags(DEFAULT_TAGS);
        // Verificar se há erro silencioso ou se apenas veio vazio
        // Se a chamada de Supabase falhar internamente, fetchLogisticsTags captura e retorna []
      }
    } catch (error: any) {
      console.error(error);
      setTags(DEFAULT_TAGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTag(null);
    setTagName('');
    setTagGroup(activeTab);
    setTagColor('#125d30');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tag: LogisticsTag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagGroup(tag.group_type);
    setTagColor(tag.color || '#125d30');
    setIsModalOpen(true);
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setIsSaving(true);
    setDbError(null);

    const tagData: LogisticsTag = {
      id: editingTag?.id,
      name: tagName.trim(),
      group_type: tagGroup,
      color: tagColor
    };

    const result = await syncLogisticsTag(tagData);

    if (result.success) {
      setIsModalOpen(false);
      loadTags();
    } else {
      // Falha ao salvar no banco (provavelmente tabela não criada)
      setDbError(result.error || 'Erro ao sincronizar com o banco.');
      
      // Modificar localmente para simular o comportamento se falhar no banco (para fins de demonstração)
      if (editingTag) {
        setTags(prev => prev.map(t => t.id === editingTag.id || (t.name === editingTag.name && t.group_type === editingTag.group_type) ? { ...t, ...tagData } : t));
      } else {
        setTags(prev => [...prev, { ...tagData, id: String(Date.now()) }]);
      }
      setIsModalOpen(false);
      showToast('Aviso: Os dados foram salvos temporariamente na sessão local, pois a tabela mktplace_feira_logistics_tags ainda não foi criada no Supabase. Por favor, execute a migration SQL correspondente.', 'success');
    }
    setIsSaving(false);
  };

  const handleDelete = async (tag: LogisticsTag) => {
    if (!confirm(`Deseja realmente excluir a tag "${tag.name}"?`)) return;

    if (tag.id) {
      const result = await deleteLogisticsTag(tag.id);
      if (result.success) {
        loadTags();
      } else {
        showToast('Erro ao excluir do banco de dados.', 'error');
        // Excluir localmente como fallback
        setTags(prev => prev.filter(t => t.id !== tag.id));
      }
    } else {
      // Excluir localmente (caso seja padrão sem ID)
      setTags(prev => prev.filter(t => !(t.name === tag.name && t.group_type === tag.group_type)));
    }
  };

  // Filter tags based on current tab and search term
  const filteredTags = tags.filter(tag => {
    const matchesTab = tag.group_type === activeTab;
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTabLabel = (tab: typeof activeTab) => {
    switch (tab) {
      case 'tipo_feira': return 'Tipos de Feira';
      case 'modalidade': return 'Modalidades de Venda';
      case 'periodicidade': return 'Periodicidades';
    }
  };

  const getTabDescription = (tab: typeof activeTab) => {
    switch (tab) {
      case 'tipo_feira': return 'Tags para diferenciar os tipos de feira (Ex: Orgânicos, Convencional, Mercado)';
      case 'modalidade': return 'Modos em que a feira comercializa (Ex: Varejo, Atacado, Misto)';
      case 'periodicidade': return 'Frequência com que a feira ocorre fisicamente (Ex: Diária, Semanal, Mensal)';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/logistica" className="hover:text-green-700 transition-colors">Logística</Link>
        <ChevronRight size={14} />
        <Link href="/admin/logistica/rotas" className="hover:text-green-700 transition-colors">Gestão de Rotas</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Tags e Categorias</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Classificação de Feiras</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Gerencie os tipos de feira, modalidades de venda e periodicidades que estarão disponíveis no cadastro de feiras.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleOpenAddModal}
            className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Tag / Filtro
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-100 dark:border-gray-800">
        {(['tipo_feira', 'modalidade', 'periodicidade'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-black transition-all relative ${activeTab === tab ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className="flex items-center gap-2">
              {tab === 'tipo_feira' && <Layers size={18} />}
              {tab === 'modalidade' && <Zap size={18} />}
              {tab === 'periodicidade' && <Clock size={18} />}
              {getTabLabel(tab)}
            </div>
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-700 rounded-t-full"></div>}
          </button>
        ))}
      </div>

      {/* Tab Header Info */}
      <div className="p-6 bg-gray-50 rounded-3xl">
        <p className="text-sm font-semibold text-gray-600">{getTabDescription(activeTab)}</p>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Buscar tags de ${getTabLabel(activeTab).toLowerCase()}...`} 
            className="w-full pl-16 pr-6 py-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] outline-none font-bold text-sm shadow-sm transition-all focus:border-green-600/30"
          />
        </div>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredTags.length === 0 && !loading && (
          <div className="col-span-full bg-white border border-gray-100 rounded-[40px] p-12 text-center text-gray-400">
            Nenhuma tag encontrada para este filtro. Clique em "Nova Tag" para criar a primeira!
          </div>
        )}
        
        {loading && (
          <div className="col-span-full bg-white border border-gray-100 rounded-[40px] p-12 text-center text-gray-400">
            Carregando tags...
          </div>
        )}

        {filteredTags.map((tag, idx) => (
          <div 
            key={tag.id || idx} 
            className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 rounded-3xl" style={{ backgroundColor: `${tag.color || '#125d30'}15`, color: tag.color || '#125d30' }}>
                <TagIcon size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenEditModal(tag)}
                  className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-all hover:bg-gray-100"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(tag)}
                  className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 transition-all hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{getTabLabel(tag.group_type)}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{tag.name}</h3>
            
            <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Visualização do Selo</p>
              <div className="px-4 py-2 rounded-xl flex items-center gap-3 w-fit text-white shadow-lg" style={{ backgroundColor: tag.color || '#125d30' }}>
                <TagIcon size={14} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-widest">{tag.name}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add New Tag Card */}
        <div 
          onClick={handleOpenAddModal}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-12 text-center group hover:border-green-600 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-green-700 shadow-sm mb-4 transition-all group-hover:scale-110">
            <Plus size={32} />
          </div>
          <h4 className="text-lg font-black text-gray-900">Nova Tag / Filtro</h4>
          <p className="text-xs text-gray-400 font-medium mt-1">Crie opções customizadas de classificação.</p>
        </div>
      </div>

      {/* SQL Migration Advice */}
      <div className="p-10 bg-gray-900 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-10">
        <div className="p-5 bg-green-700 rounded-3xl shrink-0">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2 flex-1">
          <h4 className="text-2xl font-black">Persistência no Banco de Dados</h4>
          <p className="text-sm font-medium opacity-60 leading-relaxed max-w-2xl">
            Essas tags são armazenadas na tabela <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-green-300">mktplace_feira_logistics_tags</code> no Supabase. Certifique-se de executar o script de migração <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-green-300">supabase/migration_logistics_tags.sql</code> no console SQL do Supabase.
          </p>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.mktplace_feira_logistics_tags (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL,
  group_type    TEXT        NOT NULL,
  color         TEXT        DEFAULT '#125d30',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT mktplace_feira_logistics_tags_name_group_unique UNIQUE (name, group_type)
);`);
            showToast('SQL de criação copiado para a área de transferência!', 'info');
          }}
          className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black text-sm whitespace-nowrap hover:bg-green-50 transition-all active:scale-95"
        >
          Copiar DDL SQL
        </button>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-[500px] bg-white rounded-[40px] shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <header className="px-10 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                {editingTag ? 'Editar Tag / Filtro' : 'Nova Tag / Filtro'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </header>

            <form onSubmit={handleSaveTag} className="p-10 space-y-6">
              {dbError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{dbError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grupo da Tag</label>
                <select 
                  value={tagGroup} 
                  onChange={(e) => setTagGroup(e.target.value as any)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 rounded-2xl outline-none font-bold text-sm transition-all"
                >
                  <option value="tipo_feira">Tipo de Feira</option>
                  <option value="modalidade">Modalidade de Venda</option>
                  <option value="periodicidade">Periodicidade</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome da Tag</label>
                <input 
                  type="text" 
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Ex: Orgânica, Semanal, Atacado..."
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 rounded-2xl outline-none font-bold text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cor Visual (Hex)</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none overflow-hidden"
                  />
                  <input 
                    type="text" 
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    placeholder="#125d30"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                    className="flex-1 px-6 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 rounded-2xl outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <footer className="pt-6 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-4 bg-[#125d30] text-white rounded-[20px] font-black text-xs shadow-xl shadow-green-900/20 hover:bg-green-800 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Confirmar e Salvar'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
