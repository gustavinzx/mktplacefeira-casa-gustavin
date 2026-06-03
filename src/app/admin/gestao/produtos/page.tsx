'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronRight, Plus, Search, Package, Tag, Image as ImageIcon,
  Settings2, Trash2, Save, ArrowUpRight, X, Info, Loader2, RefreshCw,
  Camera, Upload, CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/admin/Modal';
import { supabase } from '@/lib/supabase';

type CatalogProduct = {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  created_at: string;
  has_image: boolean;
  thumb_url: string | null;
};

type EditForm = {
  id?: string;
  title: string;
  description: string;
  category_id: string;
  subcategory_id: string;
  imageFiles: File[];
  imagePreviews: string[];
  existingImageUrl: string | null;
  loadingImage: boolean;
};

type Category = { id: string; name: string; parent_id: string | null; };

export default function AdminCatalogoMasterPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateProgress, setMigrateProgress] = useState('');
  const [form, setForm] = useState<EditForm | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega somente metadados — NÃO inclui image_url (pode ser base64 gigante)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Inclui image_url no SELECT — após migração todas são URLs curtas (≪ 10MB)
      const { data, error } = await supabase
        .from('mktplace_feira_products')
        .select('id, title, description, category_id, created_at, image_url')
        .order('title');

      if (!error && data) {
        setProducts(data.map((p: any) => ({
          ...p,
          has_image: !!(p.image_url),
          // Só exibe thumbnail se for URL de storage (não base64 residual)
          thumb_url: p.image_url?.startsWith('http') ? p.image_url : null,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    supabase
      .from('mktplace_feira_categories')
      .select('id, name, parent_id')
      .order('name')
      .then((res: any) => {
        const data = res.data;
        if (data) {
          setAllCategories(data);
          setCategories(data.filter((c: any) => !c.parent_id));
        }
      });
  }, [fetchProducts]);

  const openNew = () => {
    setForm({ title: '', description: '', category_id: '', subcategory_id: '', imageFiles: [], imagePreviews: [], existingImageUrl: null, loadingImage: false });
    setIsModalOpen(true);
  };

  // Abre edição e busca image_url isolado (evita carregar toda a lista com base64)
  const openEdit = async (p: CatalogProduct) => {
    const cat = allCategories.find(c => c.id === p.category_id);
    const isSubcat = cat && cat.parent_id;
    setForm({
      id: p.id,
      title: p.title,
      description: p.description ?? '',
      category_id: isSubcat ? (cat.parent_id ?? '') : (p.category_id ?? ''),
      subcategory_id: isSubcat ? (p.category_id ?? '') : '',
      imageFiles: [],
      imagePreviews: [],
      existingImageUrl: null,
      loadingImage: p.has_image,
    });
    setIsModalOpen(true);

    if (p.has_image) {
      const { data } = await supabase
        .from('mktplace_feira_products')
        .select('image_url')
        .eq('id', p.id)
        .single();
      setForm(f => f ? { ...f, existingImageUrl: data?.image_url ?? null, loadingImage: false } : f);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const previews = files.map(f => URL.createObjectURL(f));
    setForm(prev => prev ? { ...prev, imageFiles: [...prev.imageFiles, ...files], imagePreviews: [...prev.imagePreviews, ...previews] } : prev);
    e.target.value = '';
  };

  const ensureBucket = async (name: string) => {
    const { error } = await supabase.storage.createBucket(name, {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });
    // "already exists" is not a real error
    if (error && !error.message.toLowerCase().includes('already exists')) {
      console.warn(`[Bucket] Não foi possível criar ${name}:`, error.message);
    }
  };

  const uploadToStorage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `catalog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    let { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });

    if (error?.message?.toLowerCase().includes('not found')) {
      await ensureBucket('product-images');
      const retry = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      error = retry.error;
    }

    if (!error) {
      return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    }

    console.warn('[Upload] product-images falhou:', error.message);
    await ensureBucket('catalog-images');
    const { error: e2 } = await supabase.storage.from('catalog-images').upload(path, file, { upsert: true });
    if (e2) { console.warn('[Upload] catalog-images também falhou:', e2.message); return null; }
    return supabase.storage.from('catalog-images').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!form || !form.title.trim()) return;
    setSaving(true);
    try {
      const resolvedCategoryId = form.subcategory_id || form.category_id || null;

      // Payload base — SEM image_url (não toca no campo se não houver novo arquivo)
      const payload: Record<string, any> = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category_id: resolvedCategoryId,
      };

      if (form.imageFiles.length > 0) {
        // Usuário escolheu novo arquivo → faz upload para storage
        const url = await uploadToStorage(form.imageFiles[0]);
        payload.image_url = url; // URL limpa do storage (ou null se falhou)
      } else if (!form.id && form.existingImageUrl === null) {
        // Novo produto sem imagem
        payload.image_url = null;
      }
      // Edição sem novo arquivo → NÃO inclui image_url no payload (mantém o que está no banco)

      if (form.id) {
        const { error } = await supabase.from('mktplace_feira_products').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('mktplace_feira_products').insert(payload);
        if (error) throw error;
      }

      form.imagePreviews.forEach(u => URL.revokeObjectURL(u));
      setIsModalOpen(false);
      fetchProducts();
    } catch (e: any) {
      alert('Erro ao salvar: ' + (e.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este produto do catálogo?')) return;
    await supabase.from('mktplace_feira_products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Migra base64 → Supabase Storage para todos os produtos
  // Busca IDs primeiro (sem image_url) para não estourar o limite de 10MB do PostgREST
  const handleMigrateImages = async () => {
    if (!confirm('Isso vai migrar todos os base64 do banco para o Supabase Storage.\nPode demorar alguns minutos. Continuar?')) return;
    setMigrating(true);

    // Só IDs — evita baixar todos os base64 de uma vez
    const { data: toMigrate } = await supabase
      .from('mktplace_feira_products')
      .select('id, title')
      .not('image_url', 'is', null)
      .neq('image_url', '')
      .not('image_url', 'ilike', 'http%');

    let done = 0;
    let skipped = 0;
    const total = toMigrate?.length ?? 0;
    setMigrateProgress(`0 / ${total}`);

    for (const prod of (toMigrate ?? [])) {
      try {
        // Busca image_url de um produto por vez (evita estouro de memória)
        const { data: row } = await supabase
          .from('mktplace_feira_products')
          .select('image_url')
          .eq('id', prod.id)
          .single();

        const imageUrl = row?.image_url;
        if (!imageUrl?.startsWith('data:image/')) { skipped++; done++; setMigrateProgress(`${done} / ${total}`); continue; }

        const [, b64] = imageUrl.split(',');
        const mimeMatch = imageUrl.match(/data:(image\/\w+);/);
        const mime = mimeMatch?.[1] ?? 'image/jpeg';
        const ext = mime.split('/')[1];
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const file = new File([bytes], `migrated.${ext}`, { type: mime });
        const url = await uploadToStorage(file);
        if (url) {
          await supabase.from('mktplace_feira_products').update({ image_url: url }).eq('id', prod.id);
        }
      } catch (e) {
        console.warn(`Falhou migrar produto ${prod.title}:`, e);
      }
      done++;
      setMigrateProgress(`${done} / ${total}`);
    }

    setMigrating(false);
    setMigrateProgress('');
    alert(`Migração concluída! ${done - skipped} imagens enviadas ao Storage.`);
    fetchProducts();
  };

  const filtered = products.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));
  const currentImage = form ? (form.imagePreviews[0] ?? form.existingImageUrl ?? null) : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/gestao/feiras" className="hover:text-green-700 transition-colors">Gestão</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Catálogo Master</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Catálogo Master</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Base global de produtos. Os feirantes pesquisam aqui ao cadastrar seus produtos.{' '}
            <strong>Preços são definidos por cada feirante individualmente.</strong>
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={fetchProducts} className="p-4 bg-white border border-gray-200 rounded-[24px] text-gray-500 hover:text-green-700 hover:border-green-700 transition-all shadow-sm" title="Atualizar">
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleMigrateImages}
            disabled={migrating}
            className="px-6 py-4 bg-orange-50 text-orange-700 border border-orange-200 rounded-[24px] font-bold hover:bg-orange-100 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60 text-sm"
          >
            {migrating ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {migrating ? `Migrando ${migrateProgress}` : 'Migrar Imagens'}
          </button>
          <button
            onClick={openNew}
            className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
          <div className="p-4 bg-green-50 text-green-700 rounded-2xl w-fit"><Package size={24} /></div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">{products.length} Produtos</h3>
            <p className="text-sm text-gray-400 font-medium mt-1">No catálogo global</p>
          </div>
          <ArrowUpRight size={100} className="absolute -bottom-8 -right-8 opacity-5" />
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl w-fit"><ImageIcon size={24} /></div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">{products.filter(p => p.has_image).length} com Imagem</h3>
            <p className="text-sm text-gray-400 font-medium mt-1">Aparecem com foto na busca</p>
          </div>
          <ArrowUpRight size={100} className="absolute -bottom-8 -right-8 opacity-5" />
        </div>
        <div className="bg-[#1b1c19] p-8 rounded-[40px] text-white space-y-4 relative overflow-hidden">
          <div className="p-4 bg-white/10 rounded-2xl w-fit"><Tag size={24} className="text-blue-400" /></div>
          <div>
            <h3 className="text-2xl font-black">{products.filter(p => p.description).length} com Descrição</h3>
            <p className="text-sm opacity-50 font-medium mt-1">Exibidos com detalhes na busca</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar produto no catálogo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-green-500/20"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-400 font-medium self-center">{filtered.length} produtos</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 size={24} className="animate-spin" />
            <span className="font-bold text-sm">Carregando catálogo...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Produto</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Imagem</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl shrink-0 border overflow-hidden flex items-center justify-center ${p.thumb_url ? 'border-green-100' : p.has_image ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                          {p.thumb_url ? (
                            <img
                              src={p.thumb_url}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <Camera size={18} />
                          )}
                        </div>
                        <p className="text-sm font-black text-gray-900">{p.title}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {(() => {
                        const cat = allCategories.find(c => c.id === p.category_id);
                        return cat
                          ? <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                          : <span className="text-[10px] text-gray-300 font-bold">—</span>;
                      })()}
                    </td>
                    <td className="px-8 py-5">
                      {p.has_image
                        ? <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><CheckCircle2 size={10} /> Com imagem</span>
                        : <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Sem imagem</span>}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-green-700 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors">
                          <Settings2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-gray-300">
                      <Package size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-bold">Nenhum produto encontrado</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); form?.imagePreviews.forEach(u => URL.revokeObjectURL(u)); }} title={form?.id ? 'Editar Produto' : 'Novo Produto'}>
        {form && (
          <div className="space-y-6">
            <div className="p-5 bg-blue-50 border border-blue-100 rounded-[20px] flex gap-3">
              <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-blue-800/80 leading-relaxed">
                Catálogo base padrão. Preço, estoque e disponibilidade são configurados por cada feirante ao usar este produto.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Maçã Fuji"
                  value={form.title}
                  onChange={e => setForm(f => f ? { ...f, title: e.target.value } : f)}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-black outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição</label>
                <textarea
                  placeholder="Descreva o produto brevemente..."
                  value={form.description}
                  onChange={e => setForm(f => f ? { ...f, description: e.target.value } : f)}
                  rows={2}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Categoria</label>
                  <select
                    value={form.category_id}
                    onChange={e => setForm(f => f ? { ...f, category_id: e.target.value, subcategory_id: '' } : f)}
                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20"
                  >
                    <option value="">— Categoria —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subcategoria</label>
                  {(() => {
                    const subs = allCategories.filter(c => c.parent_id === form.category_id);
                    return subs.length > 0 ? (
                      <select
                        value={form.subcategory_id}
                        onChange={e => setForm(f => f ? { ...f, subcategory_id: e.target.value } : f)}
                        className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20"
                      >
                        <option value="">— Subcategoria —</option>
                        {subs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    ) : (
                      <div className="w-full px-5 py-3.5 bg-gray-50/50 rounded-2xl text-sm text-gray-300 font-bold border border-dashed border-gray-200">
                        {form.category_id ? 'Sem subcategorias' : 'Selecione a categoria'}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Imagem do Produto</label>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />

                <div className="flex gap-4 items-start">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-600 transition-all cursor-pointer bg-gray-50 shrink-0 overflow-hidden"
                  >
                    {form.loadingImage ? (
                      <Loader2 size={24} className="animate-spin text-gray-300" />
                    ) : currentImage ? (
                      <img
                        src={currentImage}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <>
                        <ImageIcon size={28} className="mb-1" />
                        <p className="text-[10px] font-bold text-center px-2">Clique para adicionar</p>
                      </>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {(currentImage || form.loadingImage) && !form.loadingImage && (
                      <button
                        onClick={() => {
                          form.imagePreviews.forEach(u => URL.revokeObjectURL(u));
                          setForm(f => f ? { ...f, imageFiles: [], imagePreviews: [], existingImageUrl: null } : f);
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X size={14} /> Remover imagem
                      </button>
                    )}
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                      PNG/JPG/WEBP. A imagem será salva no Supabase Storage como URL pública.
                    </p>
                    {form.imageFiles.length > 0 && (
                      <p className="text-[10px] text-green-700 font-bold">Nova imagem selecionada — será enviada ao salvar.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setIsModalOpen(false); form.imagePreviews.forEach(u => URL.revokeObjectURL(u)); }}
                className="flex-1 py-4 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="flex-1 py-4 bg-[#125d30] text-white rounded-xl font-bold hover:bg-[#0e4d27] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
