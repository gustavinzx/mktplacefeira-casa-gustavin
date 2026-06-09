'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, getTableName } from '@/lib/supabase';
import {
  ArrowLeft, Store, MapPin, Package, ShieldCheck, Loader2, Calendar,
} from 'lucide-react';

interface Vendor {
  id: string;
  full_name: string | null;
  business_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
  status: string;
  phone: string | null;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  image_url: string | null;
  price?: number;
  promotion_price?: number;
  unit?: string;
  is_active?: boolean;
}

interface Fair {
  id: string;
  name: string;
  city: string;
  state: string;
}

export default function FeiranteProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorFairs, setVendorFairs] = useState<Fair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      // A ID passada agora é o producer_id, e não o user_id
      const { data: producer } = await supabase
        .from('mktplace_feira_producers')
        .select(`
          id,
          stall_name,
          specialty,
          created_at,
          profile:mktplace_feira_profiles (
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (!producer) { setLoading(false); return; }

      setVendor({
        id: producer.id,
        full_name: producer.profile?.full_name || null,
        business_name: producer.stall_name,
        specialty: producer.specialty,
        avatar_url: producer.profile?.avatar_url || null,
        status: 'approved',
        phone: producer.profile?.phone || null,
        created_at: producer.created_at
      });

      // Load products
      const { data: prods, error: prodsError } = await supabase
        .from('mktplace_feira_products')
        .select('id, title, image_url, price, unit, is_organic')
        .eq('producer_id', producer.id)
        .limit(12);
      
      if (prodsError) {
        console.error('Error fetching products:', prodsError);
      }
      
      setProducts(prods || []);

      // Load fairs from mktplace_feira_producer_fairs and main fair_id
      const { data: pfRows } = await supabase
        .from('mktplace_feira_producer_fairs')
        .select('fair_id')
        .eq('producer_id', producer.id);

      const fairIds = new Set<string>();
      pfRows?.forEach(r => fairIds.add(r.fair_id));

      // Obter feira principal se não veio junto
      const { data: mainProducer } = await supabase
        .from('mktplace_feira_producers')
        .select('fair_id')
        .eq('id', producer.id)
        .single();
        
      if (mainProducer?.fair_id) {
        fairIds.add(mainProducer.fair_id);
      }

      if (fairIds.size > 0) {
        const { data: fairs } = await supabase
          .from('mktplace_feira_fairs')
          .select('id, name, city, state')
          .in('id', Array.from(fairIds));
        setVendorFairs(fairs || []);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9f8' }}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#0e6b17' }} />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9f8' }}>
        <Header />
        <div style={{ maxWidth: 720, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Feirante não encontrado</h1>
          <Link href="/feirantes" style={{ color: '#0e6b17', fontWeight: 600 }}>← Voltar para Feirantes</Link>
        </div>
      </div>
    );
  }

  const displayName = vendor.business_name || vendor.full_name || 'Feirante';
  const joinYear = new Date(vendor.created_at).getFullYear();

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9f8' }}>
      <Header />

      {/* Profile hero */}
      <div style={{ background: 'linear-gradient(135deg, #0e6b17 0%, #1a8a24 100%)', padding: '48px 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link href="/feirantes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600, marginBottom: 24, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Todos os Feirantes
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid rgba(255,255,255,0.4)' }}>
              {vendor.avatar_url ? (
                <img src={vendor.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Store size={44} style={{ color: 'white' }} />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', margin: 0 }}>{displayName}</h1>
                {vendor.status === 'approved' && (
                  <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={12} /> Verificado
                  </span>
                )}
              </div>
              {vendor.specialty && (
                <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 4px', fontSize: 16 }}>{vendor.specialty}</p>
              )}
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 13 }}>
                Na plataforma desde {joinYear}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '-40px auto 0', padding: '0 24px 60px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

        {/* Products */}
        <div>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #e8e8e8', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={20} style={{ color: '#0e6b17' }} /> Produtos
            </h2>
            {products.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '24px 0' }}>Nenhum produto cadastrado ainda.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
                {products.map(p => {
                  const price = p.price;
                  return (
                    <div key={p.id} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #efefef', background: '#fafafa' }}>
                      <div style={{ height: 100, background: '#e8f5e9', overflow: 'hidden' }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={28} style={{ color: '#0e6b17', opacity: 0.4 }} />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <p style={{ fontWeight: 600, fontSize: 13, margin: '0 0 4px', lineHeight: 1.3 }}>{p.title}</p>
                        {price != null && price > 0 && (
                          <p style={{ color: '#0e6b17', fontWeight: 700, fontSize: 14, margin: 0 }}>
                            R$ {price.toFixed(2).replace('.', ',')}
                            {p.unit ? <span style={{ fontWeight: 400, fontSize: 11, color: '#888' }}> /{p.unit}</span> : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {vendorFairs.length > 0 && (
            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #e8e8e8' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} style={{ color: '#0e6b17' }} /> Presente nas Feiras
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {vendorFairs.map(f => (
                  <Link key={f.id} href={`/fairs/${f.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, border: '1px solid #efefef', background: '#fafafa', color: 'inherit' }}>
                    <MapPin size={14} style={{ color: '#0e6b17', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{f.name}</p>
                      <p style={{ color: '#888', fontSize: 12, margin: '1px 0 0' }}>{f.city}, {f.state}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#eef7f2', borderRadius: 20, padding: 20, border: '1px solid #c8e6ca', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#555', margin: '0 0 4px' }}>Produtos cadastrados</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#0e6b17', margin: 0 }}>{products.length}</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
