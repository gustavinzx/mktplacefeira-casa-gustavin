'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tags, Layers, Plus, Search, Edit2, Trash2, ChevronRight,
  FolderOpen, Palette, Loader2, ChevronDown, ChevronRight as ChevronRightIcon, X, Save, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Category = {
  id: string;
  name: string;
  icon: string | null;
  slug: string;
  parent_id: string | null;
  children?: Category[];
};

type FormState = {
  id?: string;
  name: string;
  icon: string;
  slug: string;
  parent_id: string;
};

type Tag = {
  id: string;
  name: string;
  color: string;
  type: string;
  icon: string | null;
};

type TagFormState = {
  id?: string;
  name: string;
  color: string;
  type: string;
  icon: string;
};

const TAG_COLORS = [
  '#125d30','#fc6c29','#1d4ed8','#7e22ce','#be185d',
  '#dc2626','#d97706','#0891b2','#059669','#374151',
  '#9333ea','#0284c7','#65a30d','#b45309','#db2777',
];

const TAG_TYPES = ['Geral','Selo de Qualidade','Frescor','Logística','Compliance','Marketing','Promoção','Origem','Certificação'];

const EMOJI_GROUPS = [
  { label: 'Frutas', emojis: ['🍎','🍊','🍋','🍌','🍍','🥭','🍑','🍒','🍓','🫐','🥝','🍇','🍈','🍐','🍉','🍅','🥥','🫒'] },
  { label: 'Verduras & Legumes', emojis: ['🥬','🥦','🥒','🥕','🌽','🍆','🧅','🧄','🥔','🌶️','🫑','🫛','🍠','🥗'] },
  { label: 'Carnes & Proteínas', emojis: ['🥩','🍗','🍖','🥓','🥚','🐟','🦐','🦞','🦀','🦑','🐙','🦪','🐠','🦈'] },
  { label: 'Laticínios', emojis: ['🧀','🥛','🧈','🍦','🥄'] },
  { label: 'Bebidas', emojis: ['🍷','🍺','🧃','🥤','🧋','🍵','☕','🫖','🍻','🧉','🍾','🥂','🍶','🫗'] },
  { label: 'Padaria & Doces', emojis: ['🍞','🥖','🥐','🥨','🧁','🎂','🍰','🥧','🍩','🍪','🫓','🍫','🍬','🍭','🍡'] },
  { label: 'Mercearia & Grãos', emojis: ['🍯','🫙','🫚','🧂','🥫','🌾','🫘','🌰','🥜','🍚','🍜','🫕','🍱','🥣'] },
  { label: 'Temperos & Plantas', emojis: ['🌿','🌱','🍃','🪴','🌻','🌾','🍄','🪸','🌹','🌺','🌼','🌵'] },
  { label: 'Animais & Fazenda', emojis: ['🐄','🐓','🐖','🐑','🐐','🐇','🥩','🐝','🪵','🌳'] },
  { label: 'Geral & Loja', emojis: ['📦','🛒','🏪','🧺','🎁','⭐','🏆','💚','🧊','🔖','🏷️','🪣','⚖️','🫶'] },
];

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildTree(flat: Category[]): Category[] {
  const map = new Map<string, Category>();
  flat.forEach(c => map.set(c.id, { ...c, children: [] }));
  const roots: Category[] = [];
  map.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children!.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

export default function AdminCategoriasTagsPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [topLevel, setTopLevel] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagForm, setTagForm] = useState<TagFormState | null>(null);
  const [savingTag, setSavingTag] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mktplace_feira_categories')
        .select('id, name, icon, slug, parent_id')
        .order('name');
      if (data) {
        setCategories(data);
        setTopLevel(data.filter((c: any) => !c.parent_id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const fetchTags = useCallback(async () => {
    setLoadingTags(true);
    try {
      const { data } = await supabase.from('mktplace_feira_tags').select('*').order('name');
      if (data) setTags(data);
    } catch (e) { console.error(e); }
    finally { setLoadingTags(false); }
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const openNewTag = () => {
    setTagForm({ name: '', color: TAG_COLORS[0], type: 'Geral', icon: '' });
    setIsTagModalOpen(true);
  };
  const openEditTag = (tag: Tag) => {
    setTagForm({ id: tag.id, name: tag.name, color: tag.color, type: tag.type, icon: tag.icon ?? '' });
    setIsTagModalOpen(true);
  };
  const handleDeleteTag = async (id: string) => {
    if (!confirm('Remover este selo/tag?')) return;
    await supabase.from('mktplace_feira_tags').delete().eq('id', id);
    fetchTags();
  };
  const handleSaveTag = async () => {
    if (!tagForm || !tagForm.name.trim()) return;
    setSavingTag(true);
    try {
      const payload = { name: tagForm.name.trim(), color: tagForm.color, type: tagForm.type || 'Geral', icon: tagForm.icon.trim() || null };
      if (tagForm.id) {
        await supabase.from('mktplace_feira_tags').update(payload).eq('id', tagForm.id);
      } else {
        await supabase.from('mktplace_feira_tags').insert(payload);
      }
      setIsTagModalOpen(false);
      fetchTags();
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSavingTag(false);
    }
  };

  const openNew = (parentId = '') => {
    setForm({ name: '', icon: '', slug: '', parent_id: parentId });
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ id: cat.id, name: cat.name, icon: cat.icon ?? '', slug: cat.slug, parent_id: cat.parent_id ?? '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta categoria? Subcategorias ficarão órfãs.')) return;
    await supabase.from('mktplace_feira_categories').delete().eq('id', id);
    fetchCategories();
  };

  const handleSave = async () => {
    if (!form || !form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        icon: form.icon.trim() || null,
        slug: form.slug || slugify(form.name),
        parent_id: form.parent_id || null,
      };
      if (form.id) {
        await supabase.from('mktplace_feira_categories').update(payload).eq('id', form.id);
      } else {
        await supabase.from('mktplace_feira_categories').insert(payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const tree = buildTree(categories);
  const searchLower = search.toLowerCase();
  const filteredFlat = search
    ? categories.filter(c => c.name.toLowerCase().includes(searchLower) || c.slug.includes(searchLower))
    : null;

  const renderRow = (cat: Category, depth = 0) => {
    const hasChildren = (cat.children?.length ?? 0) > 0;
    const isOpen = expanded.has(cat.id);

    return (
      <React.Fragment key={cat.id}>
        <tr className="group hover:bg-gray-50/50 transition-all border-b border-gray-50 last:border-0">
          <td className="px-8 py-5">
            <div className="flex items-center gap-3" style={{ paddingLeft: depth * 28 }}>
              {hasChildren ? (
                <button onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRightIcon size={16} />}
                </button>
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg border border-gray-100 shrink-0">
                {cat.icon || <FolderOpen size={18} className="text-gray-300" />}
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">{cat.name}</p>
                <p className="text-[10px] text-gray-400 font-medium">{cat.slug}</p>
              </div>
            </div>
          </td>
          <td className="px-8 py-5">
            {cat.parent_id ? (
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {categories.find(c => c.id === cat.parent_id)?.name ?? '—'}
              </span>
            ) : (
              <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Categoria raiz</span>
            )}
          </td>
          <td className="px-8 py-5">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-bold">
              <FolderOpen size={14} className="text-gray-300" />
              {(cat.children?.length ?? 0)} subcategorias
            </div>
          </td>
          <td className="px-8 py-5 text-right">
            <div className="flex items-center justify-end gap-2">
              {!cat.parent_id && (
                <button onClick={() => openNew(cat.id)} title="+ Subcategoria"
                  className="p-2 bg-white text-gray-400 hover:text-[#125d30] rounded-lg shadow-sm border border-gray-100 transition-colors">
                  <Plus size={16} />
                </button>
              )}
              <button onClick={() => openEdit(cat)}
                className="p-2 bg-white text-gray-400 hover:text-green-700 rounded-lg shadow-sm border border-gray-100 transition-colors">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(cat.id)}
                className="p-2 bg-white text-gray-400 hover:text-red-600 rounded-lg shadow-sm border border-gray-100 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
        {isOpen && hasChildren && cat.children!.map(child => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  const rowsToRender = filteredFlat
    ? filteredFlat.map(c => renderRow(c, 0))
    : tree.map(c => renderRow(c, 0));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/gestao/feirantes" className="hover:text-green-700 transition-colors">Gestão de Feirantes</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Categorias & Tags</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Classificação</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Organize o catálogo através de categorias hierárquicas e tags inteligentes.
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'categories' && (
            <button onClick={fetchCategories} className="p-4 bg-white border border-gray-200 rounded-[20px] text-gray-400 hover:text-green-700 hover:border-green-700 transition-all shadow-sm">
              <RefreshCw size={18} />
            </button>
          )}
          {activeTab === 'tags' && (
            <button onClick={fetchTags} className="p-4 bg-white border border-gray-200 rounded-[20px] text-gray-400 hover:text-green-700 hover:border-green-700 transition-all shadow-sm">
              <RefreshCw size={18} />
            </button>
          )}
          <button
            onClick={() => activeTab === 'categories' ? openNew() : openNewTag()}
            className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} />
            {activeTab === 'categories' ? 'Nova Categoria' : 'Nova Tag'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-100">
        {[
          { id: 'categories', label: 'Categorias de Produtos', Icon: Layers },
          { id: 'tags', label: 'Tags & Selos', Icon: Tags },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`pb-4 text-sm font-black transition-all relative flex items-center gap-2 ${activeTab === t.id ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'}`}>
            <t.Icon size={18} /> {t.label}
            {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700 rounded-t-full" />}
          </button>
        ))}
      </div>

      {activeTab === 'categories' ? (
        <>
          {/* Search */}
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar categorias..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none text-sm font-medium shadow-sm focus:border-green-600/30 transition-all" />
          </div>

          {/* Table */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 size={24} className="animate-spin" />
                <span className="font-bold text-sm">Carregando categorias...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Ícone & Nome</th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Subcategorias</th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rowsToRender.length > 0 ? rowsToRender : (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center text-gray-300">
                        <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-bold">Nenhuma categoria encontrada</p>
                        <button onClick={() => openNew()} className="mt-4 px-6 py-2.5 bg-[#125d30] text-white rounded-xl font-bold text-sm">
                          Criar primeira categoria
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            <div className="px-8 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium">{categories.length} categorias cadastradas</p>
              <p className="text-xs text-gray-400 font-medium">{topLevel.length} raiz · {categories.length - topLevel.length} subcategorias</p>
            </div>
          </div>
        </>
      ) : (
        /* Tags Grid */
        <>
          {loadingTags ? (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 size={24} className="animate-spin" />
              <span className="font-bold text-sm">Carregando selos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {tags.map(tag => (
                <div key={tag.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-4xl shrink-0" style={{ backgroundColor: `${tag.color}18` }}>
                      {tag.icon || '🏷️'}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditTag(tag)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteTag(tag.id)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{tag.type}</p>
                  <h3 className="text-2xl font-black text-gray-900 mb-6">{tag.name}</h3>
                  <div className="pt-6 border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Preview do Selo</p>
                    <div className="px-4 py-2 rounded-xl flex items-center gap-2 w-fit text-white" style={{ backgroundColor: tag.color }}>
                      <span className="text-sm">{tag.icon || '🏷️'}</span>
                      <span className="text-[11px] font-black uppercase tracking-widest">{tag.name}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div onClick={openNewTag} className="bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center hover:border-green-600 transition-all cursor-pointer group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-green-700 shadow-sm mb-4 transition-all">
                  <Plus size={28} />
                </div>
                <h4 className="text-base font-black text-gray-900">Nova Tag/Selo</h4>
                <p className="text-xs text-gray-400 font-medium mt-1">Selos visuais para destacar diferenciais.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom tip */}
      <div className="p-10 bg-gray-900 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-10">
        <div className="p-5 bg-green-700 rounded-3xl shrink-0"><Palette size={40} /></div>
        <div className="space-y-1">
          <h4 className="text-2xl font-black">Guia de Experiência Visual</h4>
          <p className="text-sm font-medium opacity-60 leading-relaxed max-w-2xl">
            Categorias com ícones claros e selos com cores contrastantes ajudam o cliente a identificar rapidamente o que procura.
          </p>
        </div>
      </div>

      {/* Modal Nova/Editar Categoria */}
      {isModalOpen && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col" style={{ width: '80vw', height: '80vh' }}>
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{form.id ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5 flex-1 overflow-y-auto">
              {/* Nome */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome da Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Hortifruti"
                  value={form.name}
                  onChange={e => setForm(f => f ? {
                    ...f,
                    name: e.target.value,
                    slug: f.id ? f.slug : slugify(e.target.value),
                  } : f)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-black outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Slug (URL)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => f ? { ...f, slug: slugify(e.target.value) } : f)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-green-500/20 text-gray-500"
                />
              </div>

              {/* Ícone */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ícone (emoji)</label>
                <div className="flex gap-3 items-center mb-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-4xl border border-gray-100 shrink-0">
                    {form.icon || '📦'}
                  </div>
                  <div>
                    <input
                      type="text"
                      maxLength={4}
                      value={form.icon}
                      onChange={e => setForm(f => f ? { ...f, icon: e.target.value } : f)}
                      placeholder="Cole ou selecione abaixo"
                      className="w-48 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Digite diretamente ou escolha abaixo</p>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50 max-h-52 overflow-y-auto">
                  {EMOJI_GROUPS.map(group => (
                    <div key={group.label} className="px-4 py-3 border-b border-gray-100 last:border-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{group.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.emojis.map(emoji => (
                          <button key={emoji} type="button" onClick={() => setForm(f => f ? { ...f, icon: emoji } : f)}
                            className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110 ${form.icon === emoji ? 'bg-green-100 ring-2 ring-green-500 scale-110' : 'bg-white hover:bg-gray-100 border border-gray-100'}`}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categoria pai */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Categoria Pai (opcional)</label>
                <select
                  value={form.parent_id}
                  onChange={e => setForm(f => f ? { ...f, parent_id: e.target.value } : f)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="">— Categoria raiz —</option>
                  {topLevel.filter(c => c.id !== form.id).map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 px-8 pb-8">
              <button onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex-1 py-4 bg-[#125d30] text-white rounded-xl font-bold hover:bg-[#0e4d27] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova/Editar Tag */}
      {isTagModalOpen && tagForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col" style={{ width: '80vw', height: '80vh' }}>
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{tagForm.id ? 'Editar Selo/Tag' : 'Novo Selo/Tag'}</h2>
              <button onClick={() => setIsTagModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5 flex-1 overflow-y-auto">
              {/* Nome */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Selo</label>
                <input type="text" placeholder="Ex: Orgânico" value={tagForm.name}
                  onChange={e => setTagForm(f => f ? { ...f, name: e.target.value } : f)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-black outline-none focus:ring-2 focus:ring-green-500/20" />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tipo / Categoria do Selo</label>
                <select value={tagForm.type} onChange={e => setTagForm(f => f ? { ...f, type: e.target.value } : f)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20">
                  {TAG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Cor */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cor</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {TAG_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setTagForm(f => f ? { ...f, color: c } : f)}
                      className={`w-10 h-10 rounded-xl transition-all hover:scale-110 ${tagForm.color === c ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" value={tagForm.color} onChange={e => setTagForm(f => f ? { ...f, color: e.target.value } : f)}
                    className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer" />
                  <input type="text" value={tagForm.color} onChange={e => setTagForm(f => f ? { ...f, color: e.target.value } : f)}
                    className="w-36 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-mono font-bold outline-none" />
                  <div className="px-4 py-2 rounded-xl flex items-center gap-2 text-white text-sm font-black" style={{ backgroundColor: tagForm.color }}>
                    <span>{tagForm.icon || '🏷️'}</span>
                    <span className="text-[11px] uppercase tracking-widest">{tagForm.name || 'Preview'}</span>
                  </div>
                </div>
              </div>

              {/* Ícone */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ícone (emoji)</label>
                <div className="flex gap-3 items-center mb-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-4xl border border-gray-100 shrink-0">
                    {tagForm.icon || '🏷️'}
                  </div>
                  <input type="text" maxLength={4} value={tagForm.icon}
                    onChange={e => setTagForm(f => f ? { ...f, icon: e.target.value } : f)}
                    placeholder="Cole ou selecione abaixo"
                    className="w-48 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20" />
                </div>
                <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50 max-h-48 overflow-y-auto">
                  {EMOJI_GROUPS.map(group => (
                    <div key={group.label} className="px-4 py-3 border-b border-gray-100 last:border-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{group.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.emojis.map(emoji => (
                          <button key={emoji} type="button" onClick={() => setTagForm(f => f ? { ...f, icon: emoji } : f)}
                            className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110 ${tagForm.icon === emoji ? 'bg-green-100 ring-2 ring-green-500 scale-110' : 'bg-white hover:bg-gray-100 border border-gray-100'}`}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 px-8 pb-8">
              <button onClick={() => setIsTagModalOpen(false)}
                className="flex-1 py-4 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveTag} disabled={savingTag || !tagForm.name.trim()}
                className="flex-1 py-4 bg-[#125d30] text-white rounded-xl font-bold hover:bg-[#0e4d27] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                {savingTag ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {savingTag ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
