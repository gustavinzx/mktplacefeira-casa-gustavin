'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, getTableName } from '@/lib/supabase';
import {
  Search, Store, ShieldCheck, Loader2,
  Filter, X, Pencil,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Vendor {
  id: string;
  full_name: string | null;
  business_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
  status: string;
  city?: string;
  state?: string;
}

interface FairOption {
  id: string;
  name: string;
  city: string;
  state: string;
  operating_days: string[];
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const DAY_SHORT: Record<string, string> = {
  Segunda: 'Seg', Terça: 'Ter', Quarta: 'Qua', Quinta: 'Qui',
  Sexta: 'Sex', Sábado: 'Sáb', Domingo: 'Dom',
};

const safeStr = (v: string | null | undefined) => (v && v !== 'null' && v !== 'undefined' ? v : null);

export default function FeirantesPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [fairs, setFairs] = useState<FairOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedFair, setSelectedFair] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // map: fair_id → set of partner user_ids
  const [fairVendorMap, setFairVendorMap] = useState<Record<string, Set<string>>>({});
  const [fairDaysMap, setFairDaysMap] = useState<Record<string, string[]>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUserId(localStorage.getItem('user_id'));
    setCurrentUserRole(localStorage.getItem('user_role'));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: producers, error: pError } = await supabase
          .from('mktplace_feira_producers')
          .select(`
            id,
            stall_name,
            specialty,
            fair_id,
            profile:mktplace_feira_profiles!inner(full_name, avatar_url)
          `);

        if (pError) throw pError;

        const { data: producerFairs, error: pfError } = await supabase
          .from('mktplace_feira_producer_fairs')
          .select('producer_id, fair_id');

        if (pfError) throw pfError;

        const producerFairsMap: Record<string, string[]> = {};
        for (const pf of producerFairs || []) {
          if (!producerFairsMap[pf.producer_id]) producerFairsMap[pf.producer_id] = [];
          producerFairsMap[pf.producer_id].push(pf.fair_id);
        }

        const formattedVendors = (producers || [])
          .map((p: any) => {
            const joinedFairs = producerFairsMap[p.id] || [];
            // Se ele tiver fair_id na tabela principal, junta com as outras feiras
            const allFairIds = [...new Set([...joinedFairs, p.fair_id].filter(Boolean))];

            return {
              id: p.id,
              full_name: p.profile?.full_name,
              business_name: p.stall_name,
              specialty: p.specialty,
              avatar_url: p.profile?.avatar_url,
              fair_ids: allFairIds
            };
          });

        // 2. Load all active fairs
        const { data: fairsData, error: fError } = await supabase
          .from('mktplace_feira_fairs')
          .select('id, name, city, state, operating_days')
          .order('name');

        if (fError) throw fError;

        const fdMap: Record<string, string[]> = {};
        for (const f of fairsData || []) {
          fdMap[f.id] = f.operating_days || [];
        }

        const fvMap: Record<string, Set<string>> = {};
        for (const v of formattedVendors) {
          for (const fid of v.fair_ids || []) {
            if (!fvMap[fid]) fvMap[fid] = new Set();
            fvMap[fid].add(v.id);
          }
        }

        setFairVendorMap(fvMap);
        setFairDaysMap(fdMap);
        setVendors(formattedVendors);
        setFairs(fairsData || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const allStates = [...new Set(fairs.map(f => f.state).filter(Boolean))].sort();
  const allCities = [...new Set(fairs
    .filter(f => !selectedState || f.state === selectedState)
    .map(f => f.city).filter(Boolean))].sort();

  const displayedVendors = vendors.filter(v => {
    const matchSearch = !debouncedSearchTerm ||
      (v.business_name || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (v.full_name || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (v.specialty || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchFair = !selectedFair || (v.fair_ids || []).includes(selectedFair);
    
    // Find all fairs this vendor is associated with
    const vendorFairs = (v.fair_ids || []).map((fid: string) => fairs.find(f => f.id === fid)).filter(Boolean);
    
    // They match State if at least one of their fairs is in that state
    const matchState = !selectedState || vendorFairs.some((f: any) => f.state === selectedState);
    
    // They match City if at least one of their fairs is in that city
    const matchCity = !selectedCity || vendorFairs.some((f: any) => f.city === selectedCity);
    
    // Check if any of their fair's operating days match
    const matchDay = !selectedDay || 
      vendorFairs.some((f: any) => (f.operating_days || []).some((d: string) => d.startsWith(selectedDay.slice(0, 3))));

    return matchSearch && matchFair && matchState && matchCity && matchDay;
  });

  const hasFilters = selectedFair || selectedDay || selectedState || selectedCity || searchTerm;

  const clearFilters = () => {
    setSelectedFair('');
    setSelectedDay('');
    setSelectedState('');
    setSelectedCity('');
    setSearchTerm('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9f8' }}>
      <Header />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0e6b17 0%, #1a8a24 100%)', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'white', margin: '0 0 12px' }}>
            Nossos Feirantes
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, margin: '0 0 32px' }}>
            Conheça os produtores e vendedores que fazem as feiras acontecerem.
          </p>

          {/* Search */}
          <div style={{ background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', padding: '12px 20px', gap: 12, maxWidth: 600, margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            <Search size={20} style={{ color: '#888', flexShrink: 0 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, especialidade..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, fontFamily: 'inherit' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Filters bar */}
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', marginBottom: 28, border: '1px solid #e8e8e8', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0e6b17', fontWeight: 700, fontSize: 14 }}>
            <Filter size={16} /> Filtrar por:
          </div>

          {/* Fair select */}
          <select
            value={selectedFair}
            onChange={e => setSelectedFair(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#f8f8f8', cursor: 'pointer' }}
          >
            <option value="">Todas as Feiras</option>
            {fairs.map(f => (
              <option key={f.id} value={f.id}>{f.name} – {f.city}/{f.state}</option>
            ))}
          </select>

          {/* State select */}
          <select
            value={selectedState}
            onChange={e => { setSelectedState(e.target.value); setSelectedCity(''); }}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#f8f8f8', cursor: 'pointer' }}
          >
            <option value="">Estado</option>
            {allStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* City select */}
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#f8f8f8', cursor: 'pointer' }}
          >
            <option value="">Cidade</option>
            {allCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Day chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(d => d === day ? '' : day)}
                style={{
                  padding: '7px 13px', borderRadius: 9999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: selectedDay === day ? 'none' : '1px solid #e0e0e0',
                  background: selectedDay === day ? '#0e6b17' : '#f8f8f8',
                  color: selectedDay === day ? 'white' : '#555',
                  transition: 'all 0.15s',
                }}
              >
                {DAY_SHORT[day]}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: '#ba1a1a', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={14} /> Limpar filtros
            </button>
          )}
        </div>

      {error && (
        <div style={{ margin: '0 auto', maxWidth: 800, padding: 16, background: '#fee2e2', color: '#b91c1c', borderRadius: 8, marginBottom: 24 }}>
          <strong>Erro ao carregar dados:</strong> {error}
        </div>
      )}

        {/* Results count */}
        <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
          {loading ? 'Carregando…' : `${displayedVendors.length} feirante${displayedVendors.length !== 1 ? 's' : ''} encontrado${displayedVendors.length !== 1 ? 's' : ''}`}
        </p>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: '#0e6b17' }} />
          </div>
        ) : displayedVendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
            <Store size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <p style={{ fontSize: 18, fontWeight: 600 }}>Nenhum feirante encontrado</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Tente ajustar os filtros.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {displayedVendors.map(v => {
              const isOwner = currentUserId === v.id;
              const isPrivileged = currentUserRole === 'admin' || currentUserRole === 'franqueado';
              const canEdit = isOwner || isPrivileged;
              const editHref = isOwner
                ? '/portal/feirante/perfil'
                : `/admin/gestao/feirantes/${v.id}`;

              return (
                <div key={v.id} style={{ position: 'relative' }}>
                  {/* Edit button — only for owner / admin / franqueado */}
                  {canEdit && (
                    <Link
                      href={editHref}
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: 'absolute', top: 10, left: 10, zIndex: 10,
                        background: 'white', color: '#0e6b17', border: '1px solid #c8e6ca',
                        borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)', textDecoration: 'none',
                      }}
                    >
                      <Pencil size={11} /> Editar
                    </Link>
                  )}

                  <Link href={`/feirantes/${v.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div
                      style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid #e8e8e8', transition: 'all 0.2s', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                    >
                      {/* Avatar area */}
                      <div style={{ height: 120, background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {v.avatar_url ? (
                          <img src={v.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                        ) : (
                          <Store size={48} style={{ color: '#0e6b17', opacity: 0.5 }} />
                        )}
                        {v.status === 'approved' && (
                          <span style={{ position: 'absolute', top: 10, right: 10, background: 'white', color: '#0e6b17', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <ShieldCheck size={11} /> Verificado
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '16px 18px 20px' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.3 }}>
                          {safeStr(v.business_name) || safeStr(v.full_name) || 'Feirante'}
                        </h3>
                        {safeStr(v.specialty) && (
                          <p style={{ fontSize: 13, color: '#0e6b17', fontWeight: 600, margin: '0 0 8px' }}>{safeStr(v.specialty)}</p>
                        )}
                        <span style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Store size={12} /> Ver loja →
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
