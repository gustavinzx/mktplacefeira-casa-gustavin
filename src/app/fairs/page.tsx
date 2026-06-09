'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import styles from './page.module.css';
import { Search, Calendar, Clock, Navigation, Loader2 } from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { SkeletonCard, Skeleton } from '@/components/Skeleton';

import dynamic from 'next/dynamic';

const FairsMap = dynamic(() => import('@/components/FairsMap'), {
  ssr: false,
  loading: () => <Skeleton width="100%" height="100%" className="rounded-2xl" />,
});

interface DBFair {
  id: string;
  name: string;
  address: string;
  neighborhood: string | null;
  city: string;
  state: string;
  operating_days: string[];
  operating_hours: string;
  hours?: string;
  image_url: string | null;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

const DAY_ORDER = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function parseOperatingHoursStr(raw: string | null): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) return raw;
    const entries = (Object.entries(parsed) as Array<[string, { start: string; end: string }]>)
      .sort((a, b) => {
        const ai = DAY_ORDER.findIndex(d => a[0].startsWith(d));
        const bi = DAY_ORDER.findIndex(d => b[0].startsWith(d));
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
    const groups: Array<{ days: string[]; start: string; end: string }> = [];
    for (const [day, hours] of entries) {
      const last = groups[groups.length - 1];
      const lastIdx = last ? DAY_ORDER.findIndex(d => last.days[last.days.length - 1].startsWith(d)) : -1;
      const curIdx = DAY_ORDER.findIndex(d => day.startsWith(d));
      if (last && last.start === hours.start && last.end === hours.end && curIdx === lastIdx + 1) {
        last.days.push(day);
      } else {
        groups.push({ days: [day], start: hours.start, end: hours.end });
      }
    }
    return groups.map(g => {
      const label =
        g.days.length === 1
          ? g.days[0]
          : g.days.length === 2
          ? `${g.days[0]} e ${g.days[1]}`
          : `${g.days[0]} a ${g.days[g.days.length - 1]}`;
      return `${label}: ${g.start}-${g.end}`;
    }).join(' | ');
  } catch {
    return raw;
  }
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function FairsPageInner() {
  const searchParams = useSearchParams();
  const [userLat, setUserLat] = useState<number | null>(parseFloat(searchParams.get('lat') ?? '') || null);
  const [userLng, setUserLng] = useState<number | null>(parseFloat(searchParams.get('lng') ?? '') || null);
  const radiusKm = parseFloat(searchParams.get('radius') ?? '') || 30;

  useEffect(() => {
    // If not in URL, try to get from localStorage
    if (!userLat || !userLng) {
      try {
        const saved = localStorage.getItem('feira_region');
        if (saved) {
          const region = JSON.parse(saved);
          if (region.lat && region.lng) {
            setUserLat(region.lat);
            setUserLng(region.lng);
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved region', e);
      }
    }
  }, [userLat, userLng]);

  const [fairs, setFairs] = useState<DBFair[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [flyTrigger, setFlyTrigger] = useState(0);
  const { showToast } = useToast();
  const { locate, locating, error: geoError } = useGeolocation();

  const handleLocateUser = async () => {
    const pos = await locate();
    if (geoError) {
      showToast(geoError, 'error');
    } else if (pos) {
      setUserLat(pos.lat);
      setUserLng(pos.lng);
      setFlyTrigger(prev => prev + 1);
    }
  };

  useEffect(() => {
    async function fetchFairs() {
      setLoading(true);
      try {
        const res = await fetch('/api/fairs');
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to fetch fairs');
        
        const data = (json.data || []).filter((f: any) => f.is_active !== false);

        const mappedFairs: DBFair[] = (data || [])
          .filter((f: any) => f.latitude && f.longitude)
          .map((f: any) => {
            const distance =
              userLat && userLng
                ? haversineKm(userLat, userLng, f.latitude, f.longitude)
                : undefined;
            return {
              ...f,
              operating_days: f.operating_days || [],
              hours: parseOperatingHoursStr(f.operating_hours),
              latitude: f.latitude,
              longitude: f.longitude,
              distance,
            };
          })
          .filter((f: DBFair) =>
            userLat && userLng && f.distance !== undefined
              ? f.distance <= radiusKm
              : true
          )
          .sort((a: DBFair, b: DBFair) =>
            (a.distance ?? 999) - (b.distance ?? 999)
          );

        setFairs(mappedFairs);
      } catch (err) {
        console.error('Error fetching fairs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFairs();
  }, [userLat, userLng, radiusKm]);

  const filteredFairs = fairs.filter(
    f =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.neighborhood || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mapCenter = userLat && userLng
    ? { lat: userLat, lng: userLng }
    : filteredFairs.length > 0
    ? { lat: filteredFairs[0].latitude!, lng: filteredFairs[0].longitude! }
    : { lat: -15.7975, lng: -47.8919 };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.mapArea}>
          <FairsMap
            fairs={filteredFairs
              .filter(f => f.latitude && f.longitude)
              .map(f => ({
                id: f.id,
                name: f.name,
                address: f.address,
                lat: f.latitude!,
                lng: f.longitude!,
              }))}
            centerLat={mapCenter.lat}
            centerLng={mapCenter.lng}
            flyTrigger={flyTrigger}
            onLocationChange={(lat, lng) => {
              setUserLat(lat);
              setUserLng(lng);
              setFlyTrigger(prev => prev + 1);
            }}
          />
          <div className={styles.mapSearch}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar feira ou bairro..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button 
              className={styles.locateBtn} 
              onClick={handleLocateUser} 
              disabled={locating}
              title="Obter localização exata"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: locating ? '#aaa' : '#0e6b17', display: 'flex', alignItems: 'center' }}
            >
              {locating ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
            </button>
          </div>
        </section>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.titleRow}>
              <h1>Feiras Próximas</h1>
              <span className={styles.radiusBadge}>Raio {radiusKm}km</span>
            </div>
            <div className={styles.filterChips}>
              <button className={styles.btnFilter}>
                <Navigation size={14} /> Filtrar
              </button>
              <button className={styles.chip}>Hoje</button>
              <button className={styles.chip}>Orgânicas</button>
              <button className={styles.chip}>Noturnas</button>
            </div>
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : filteredFairs.length > 0 ? (
              filteredFairs.map(fair => (
                <div key={fair.id} className={styles.fairCard}>
                  <div className={styles.fairImage}>
                    <img
                      src={fair.image_url || 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400'}
                      alt={fair.name}
                    />
                  </div>
                  <div className={styles.fairInfo}>
                    <div className={styles.fairTitleRow}>
                      <h3>{fair.name}</h3>
                      {fair.distance !== undefined && (
                        <span className={styles.distance}>
                          {fair.distance < 1
                            ? `${Math.round(fair.distance * 1000)}m`
                            : `${fair.distance.toFixed(1)}km`}
                        </span>
                      )}
                    </div>
                    <p className={styles.address}>
                      {fair.address}
                      {fair.neighborhood ? ` - ${fair.neighborhood}` : ''}
                    </p>
                    <div className={styles.tags}>
                      <span className={styles.tagOrange}>
                        <Calendar size={12} /> {fair.operating_days?.join(', ') || 'Sem dias'}
                      </span>
                      <span className={styles.tagGray}>
                        <Clock size={12} /> {fair.hours || fair.operating_hours}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                {userLat && userLng ? (
                  <p>Nenhuma feira encontrada num raio de {radiusKm}km.</p>
                ) : (
                  <p>Nenhuma feira encontrada.</p>
                )}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default function FairsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <FairsPageInner />
    </Suspense>
  );
}
