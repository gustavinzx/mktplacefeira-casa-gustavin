'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ShoppingBag, Store, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Vendor {
  id: string;
  name: string;
  type: string;
  image: string;
  location: string;
}

export default function MenusFeirantePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    async function loadFeirante() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('mktplace_feira_partners')
          .select('id, business_name, full_name, user_type, avatar_url')
          .eq('id', id)
          .maybeSingle();

        if (data) {
          setVendor({
            id: data.id,
            name: data.business_name || data.full_name || 'Feirante sem nome',
            type: data.user_type === 'atacadista' ? 'Atacadista' : data.user_type === 'chef' ? 'Chef' : 'Varejista',
            image: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.business_name || data.full_name || 'F')}&background=random`,
            location: '—', // Placeholder
          });
        }
      } catch (err) {
        console.error('Error loading vendor:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeirante();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-green-700" size={48} />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Carregando Menus do Feirante...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-10 text-gray-500 font-bold space-y-4">
        <p>Feirante não encontrado ou ID inválido.</p>
        <Link href="/admin/gestao/feirantes" className="inline-flex items-center gap-2 text-green-700 hover:underline">
          <ArrowLeft size={16} /> Voltar para Gestão de Feirantes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/gestao/feirantes" className="hover:text-green-700 transition-colors">Gestão de Feirantes</Link>
        <ChevronRight size={14} />
        <Link href={`/admin/gestao/feirantes/${vendor.id}`} className="hover:text-green-700 transition-colors">Perfil: {vendor.name}</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Menus e Catálogo</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-sm shrink-0">
            <img src={vendor.image} className="w-full h-full object-cover" alt={vendor.name} />
          </div>
          <div>
            <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Menus do Feirante</h1>
            <p className="text-[16px] text-gray-500 font-medium leading-relaxed flex items-center gap-2">
              <Store size={18} /> {vendor.name} 
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 ml-2">{vendor.type}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm text-center py-20">
        <div className="w-24 h-24 bg-green-50 text-green-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={48} />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-4">Gestão de Menus e Cardápio</h3>
        <p className="text-gray-500 max-w-lg mx-auto font-medium">
          Módulo de criação e associação de cardápios e kits para os PDVs vinculados ao feirante. Importe produtos do catálogo master e precifique especificamente para este parceiro.
        </p>
      </div>

    </div>
  );
}
