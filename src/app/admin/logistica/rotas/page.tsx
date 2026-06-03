'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { NovaZonaModal } from '@/components/NovaZonaModal';
import { 
  fetchDeliveryZones, 
  syncLogisticsConfig, 
  deleteLogisticsConfig, 
  fetchLogisticsTags, 
  syncDeliveryZone, 
  syncEngineConfig, 
  fetchEngineConfig, 
  fetchFairsByCity,
  syncFair,
  deleteFair,
  type DeliveryZone, 
  type LogisticsTag 
} from '@/lib/database';
import { 
  Navigation, 
  ChevronRight, 
  MapPin, 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Layers,
  ArrowUpRight,
  Maximize2,
  Settings2,
  Map as MapIcon,
  Globe,
  TrendingUp,
  Zap,
  Building2,
  Wallet,
  Car,
  CheckCircle2,
  Trash2,
  ImagePlus,
  Cloud,
  ImageIcon,
  Pencil,
  Store,
  X,
  DollarSign,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const FRETE_LABEL: Record<string, string> = {
  distancia: 'Distância', fixo: 'Fixo', retirada: 'Retirada', consulta: 'Consulta',
};
const PARCEIRO_LABEL: Record<string, string> = {
  pickn: 'PicknGo', loggi: 'Loggi Express', uber: 'Uber Direct',
  ifood: 'iFood Delivery', propria: 'Logística Própria',
};

function zoneToRota(z: DeliveryZone) {
  const idx = z.id?.slice(-4).toUpperCase() ?? '0000';
  return {
    id: `ROTA-${z.estado}-${idx}`,
    region: `${z.cidade} - ${z.estado}`,
    city: z.cidade,
    estado: z.estado,
    shippingTypes: z.tipos_frete.map((t: string) => FRETE_LABEL[t] ?? t),
    partner: PARCEIRO_LABEL[z.parceiro] ?? z.parceiro,
    drivers: 0,
    orders: 0,
    status: z.status === 'ativa' ? 'Otimizada' : 'Pendente',
    time: z.created_at ? new Date(z.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
  };
}

interface LeafletMapProps {
  selectedCity: string;
  estado: string;
  fairs?: any[];
  onSelectCoordinates?: (lat: string, lng: string) => void;
  isPicker?: boolean;
  defaultLat?: string;
  defaultLng?: string;
}

const LeafletMap = ({ selectedCity, fairs, onSelectCoordinates, isPicker = false, defaultLat, defaultLng }: LeafletMapProps) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerGroupRef = React.useRef<any>(null);
  const pickerMarkerRef = React.useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = React.useState(false);

  React.useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.crossOrigin = '';
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  React.useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    const L = (window as any).L;

    let centerLat = -15.793889;
    let centerLng = -47.882778;

    if (isPicker && defaultLat && defaultLng) {
      const dLat = Number(defaultLat);
      const dLng = Number(defaultLng);
      if (!isNaN(dLat) && !isNaN(dLng) && dLat !== 0 && dLng !== 0) {
        centerLat = dLat;
        centerLng = dLng;
      }
    } else if (fairs && fairs.length > 0) {
      const validFairs = fairs.filter(f => f.latitude && f.longitude && !isNaN(Number(f.latitude)) && !isNaN(Number(f.longitude)));
      if (validFairs.length > 0) {
        centerLat = validFairs.reduce((acc, f) => acc + Number(f.latitude), 0) / validFairs.length;
        centerLng = validFairs.reduce((acc, f) => acc + Number(f.longitude), 0) / validFairs.length;
      } else {
        if (selectedCity === 'Brasília') {
          centerLat = -15.793889;
          centerLng = -47.882778;
        }
      }
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: isPicker ? 15 : 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps'
      }).addTo(map);

      mapInstanceRef.current = map;
      markerGroupRef.current = L.layerGroup().addTo(map);

      if (isPicker && onSelectCoordinates) {
        const pinIcon = L.divIcon({
          className: 'picker-pin',
          html: `<div class="relative flex flex-col items-center">
                   <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white animate-bounce">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                   </div>
                   <div class="w-2 h-2 bg-blue-600 rotate-45 -mt-1 shadow-md"></div>
                 </div>`,
          iconSize: [32, 40],
          iconAnchor: [16, 38]
        });

        const pickerMarker = L.marker([centerLat, centerLng], { icon: pinIcon, draggable: true }).addTo(map);
        pickerMarkerRef.current = pickerMarker;

        const updateCoords = (latlng: any) => {
          onSelectCoordinates(latlng.lat.toFixed(6), latlng.lng.toFixed(6));
        };

        pickerMarker.on('dragend', () => {
          updateCoords(pickerMarker.getLatLng());
        });

        map.on('click', (e: any) => {
          pickerMarker.setLatLng(e.latlng);
          updateCoords(e.latlng);
        });
      }
    } else {
      mapInstanceRef.current.setView([centerLat, centerLng], isPicker ? 15 : 12);
    }

    if (markerGroupRef.current && !isPicker) {
      markerGroupRef.current.clearLayers();

      fairs?.forEach(fair => {
        if (!fair.latitude || !fair.longitude || isNaN(Number(fair.latitude)) || isNaN(Number(fair.longitude))) return;

        const pinIcon = L.divIcon({
          className: 'fair-pin-custom',
          html: `<div class="relative flex flex-col items-center group/pin-item">
                   <div class="w-10 h-10 rounded-full bg-green-700 border-2 border-white shadow-xl flex items-center justify-center text-white transform hover:scale-110 transition-all cursor-pointer">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                       <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                       <polyline points="9 22 9 12 15 12 15 22"/>
                     </svg>
                   </div>
                   <div class="w-2 h-2 bg-green-700 rotate-45 -mt-1 shadow-md"></div>
                 </div>`,
          iconSize: [40, 48],
          iconAnchor: [20, 44],
          popupAnchor: [0, -44]
        });

        L.marker([Number(fair.latitude), Number(fair.longitude)], { icon: pinIcon })
          .addTo(markerGroupRef.current)
          .bindPopup(`
            <div class="p-3 min-w-[180px] font-sans">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm">🏠</span>
                <h4 class="font-black text-xs text-gray-900 leading-tight">${fair.name}</h4>
              </div>
              <p class="text-[10px] text-gray-500 font-medium mb-2">${fair.city || ''} ${fair.cep ? '• CEP ' + fair.cep : ''}</p>
              <div class="flex items-center justify-between border-t border-gray-100 pt-1.5 text-[8px] font-black uppercase tracking-widest text-gray-400">
                <span>${fair.neighborhood || fair.address || ''}</span>
                <span class="text-green-700 font-bold">${fair.type || 'Feira'}</span>
              </div>
            </div>
          `);
      });

      // Re-center map to fit all visible markers
      if (mapInstanceRef.current) {
        const validFairs = (fairs || []).filter(f => f.latitude && f.longitude && !isNaN(Number(f.latitude)) && !isNaN(Number(f.longitude)));
        if (validFairs.length === 1) {
          mapInstanceRef.current.setView([Number(validFairs[0].latitude), Number(validFairs[0].longitude)], 13);
        } else if (validFairs.length > 1) {
          const bounds = L.latLngBounds(validFairs.map((f: any) => [Number(f.latitude), Number(f.longitude)]));
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
      }
    }
  }, [leafletLoaded, fairs, selectedCity, isPicker]);

  React.useEffect(() => {
    if (!leafletLoaded || !isPicker || !mapInstanceRef.current || !pickerMarkerRef.current) return;
    const latNum = Number(defaultLat);
    const lngNum = Number(defaultLng);
    if (!isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0) {
      const currentLatLng = pickerMarkerRef.current.getLatLng();
      if (currentLatLng.lat !== latNum || currentLatLng.lng !== lngNum) {
        pickerMarkerRef.current.setLatLng([latNum, lngNum]);
        mapInstanceRef.current.setView([latNum, lngNum], 15);
      }
    }
  }, [defaultLat, defaultLng, leafletLoaded, isPicker]);

  return (
    <div className="w-full h-full relative">
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 20px !important;
          padding: 2px !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
          border: 1px solid #f3f4f6 !important;
        }
        .leaflet-container {
          font-family: inherit !important;
        }
        .leaflet-popup-content {
          margin: 8px 12px !important;
        }
      `}</style>
      {!leafletLoaded && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Carregando Mapa...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }} />
    </div>
  );
};

export default function AdminLogisticaRotasPage() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [rotas, setRotas] = React.useState([
    { id: 'ROTA-DF-248B', region: 'Brasília - DF', city: 'Brasília', estado: 'DF', shippingTypes: ['Distância'], partner: 'PicknGo', drivers: 8, orders: 95, status: 'Otimizada', time: '19:20' },
  ]);

  const [loadingZones, setLoadingZones] = React.useState(true);
  const [dbTags, setDbTags] = React.useState<LogisticsTag[]>([]);

  React.useEffect(() => {
    fetchLogisticsTags().then(tags => {
      if (tags && tags.length > 0) {
        setDbTags(tags);
      } else {
        setDbTags([
          { name: 'Feira Livre', group_type: 'tipo_feira' },
          { name: 'Feira de Orgânicos', group_type: 'tipo_feira' },
          { name: 'Feira Agroecológica', group_type: 'tipo_feira' },
          { name: 'Mercado Municipal', group_type: 'tipo_feira' },
          { name: 'Varejo', group_type: 'modalidade' },
          { name: 'Atacado', group_type: 'modalidade' },
          { name: 'Misto (Atacado e Varejo)', group_type: 'modalidade' },
          { name: 'Diária', group_type: 'periodicidade' },
          { name: 'Semanal', group_type: 'periodicidade' },
          { name: 'Quinzenal', group_type: 'periodicidade' },
          { name: 'Mensal', group_type: 'periodicidade' },
        ]);
      }
    });
  }, []);

  React.useEffect(() => {
    fetchDeliveryZones()
      .then(zones => {
        if (zones.length > 0) {
          setRotas(prev => {
            const dbRegioes = new Set(zones.map(z => `${z.cidade}-${z.estado}`));
            const filtered = prev.filter(r => !dbRegioes.has(`${r.city}-${r.estado}`));
            return [...zones.map(zoneToRota), ...filtered];
          });
        }
      })
      .finally(() => setLoadingZones(false));
  }, []);

  const [engineConfig, setEngineConfig] = React.useState({
    defaultRadius: 24,
    dispatchPriority: 'Menor Tempo (ETA)',
    smartRerouting: true
  });
  const [isSavingEngine, setIsSavingEngine] = React.useState(false);

  const [freteConfig, setFreteConfig] = React.useState({ freteMinimo: 5.0, markupFrete: 10 });
  const [isSavingFrete, setIsSavingFrete] = React.useState(false);
  const [freteSaved, setFreteSaved] = React.useState(false);

  const handleSaveFreteConfig = async () => {
    setIsSavingFrete(true);
    await new Promise(r => setTimeout(r, 600));
    setIsSavingFrete(false);
    setFreteSaved(true);
    setTimeout(() => setFreteSaved(false), 2500);
  };

  React.useEffect(() => {
    fetchEngineConfig().then(config => {
      setEngineConfig(config);
    });
  }, []);


  const handleZoneCreated = (zone: DeliveryZone) => {
    setRotas(prev => [zoneToRota(zone), ...prev]);
  };

  const [showZoneModal, setShowZoneModal] = React.useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);
  const [googleApiKey, setGoogleApiKey] = React.useState('');
  const [showMapPicker, setShowMapPicker] = React.useState(false);
  const [selectedCity, setSelectedCity] = React.useState<string | null>(null);
  const [editingZone, setEditingZone] = React.useState<DeliveryZone | null>(null);
  const [viewMode, setViewMode] = React.useState<'list' | 'map'>('list');
  const [configStep, setConfigStep] = React.useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = React.useState(false);
  const [registeredFairs, setRegisteredFairs] = React.useState<any[]>([]);
  const [loadingRegisteredFairs, setLoadingRegisteredFairs] = React.useState(false);

  const [logisticsConfig, setLogisticsConfig] = React.useState({
    city: 'Brasília',
    uf: 'DF',
    cep: '70000-000',
    rainTax: 15,
    weekendTax: 10,
    fairs: [] as any[],
    distanceTiers: [
      { min: 0, max: 2, value: 10.00, fee: 2.00 },
      { min: 2, max: 5, value: 15.00, fee: 3.50 },
      { min: 5, max: 10, value: 25.00, fee: 5.00 }
    ],
    vehicles: [
      { type: 'Bicicleta', active: true, multiplier: 0.8, baseAdded: 0 },
      { type: 'Moto', active: true, multiplier: 1.0, baseAdded: 0 },
      { type: 'Carro', active: true, multiplier: 1.5, baseAdded: 5.00 },
      { type: 'Van / Caminhão', active: false, multiplier: 2.5, baseAdded: 15.00 }
    ],
    tiposFrete: [] as string[],
    // Frete Fixo
    fixedFreightValue: 15.00,
    freeAbove: 0,        // R$ mínimo para frete grátis (0 = desabilitado)
    // Sob Consulta / Atacado
    minOrderAtacado: 500.00,
  });

  const [selectedMapCity, setSelectedMapCity] = React.useState('');
  const [allMapFairs, setAllMapFairs] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (viewMode === 'map') {
      supabase
        .from('mktplace_feira_fairs')
        .select('id, name, city, state, latitude, longitude, neighborhood, cep, operating_hours, type, status')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .then(({ data }) => {
          setAllMapFairs(data || []);
        });
    }
  }, [viewMode]);

  const [isAddingFair, setIsAddingFair] = React.useState(false);
  const [editingFairIndex, setEditingFairIndex] = React.useState<number | null>(null);
  const [isLoadingCEP, setIsLoadingCEP] = React.useState(false);
  const [deletedFairIds, setDeletedFairIds] = React.useState<string[]>([]);

  const [newFair, setNewFair] = React.useState<{
    id?: string;
    name: string; cep: string; address: string; neighborhood: string;
    city: string; uf: string; complement: string; latitude: string; longitude: string;
    type: string; modality: string; periodicity: string; status: string;
    imageUrl: string; howToGetThere: string; history: string;
    days: string[]; hours: Record<string, { start: string; end: string }>;
  }>({
    id: undefined,
    name: '',
    cep: '',
    address: '',
    neighborhood: '',
    city: 'Brasília',
    uf: 'DF',
    complement: '',
    latitude: '',
    longitude: '',
    type: 'Feira Livre',
    modality: 'Varejo',
    periodicity: 'Semanal',
    status: 'Ativo',
    imageUrl: '',
    howToGetThere: '',
    history: '',
    days: ['Sábado'],
    hours: { 'Sábado': { start: '07:00', end: '13:00' } },
  });

  const handleCEPChange = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    setNewFair(prev => ({ ...prev, cep }));

    if (cleanCEP.length === 8) {
      setIsLoadingCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setNewFair(prev => ({
            ...prev,
            city: data.localidade,
            uf: data.uf,
            neighborhood: data.bairro,
            address: data.logradouro
          }));

          // Buscar geolocalização automaticamente pelo endereço via OpenStreetMap Nominatim
          try {
            const addressString = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, Brazil`;
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}`);
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              const { lat, lon } = geoData[0];
              setNewFair(prev => ({
                ...prev,
                latitude: lat,
                longitude: lon
              }));
            }
          } catch (err) {
            console.error('Erro de geolocalização automática:', err);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setIsLoadingCEP(false);
      }
    }
  };

  const handleDeleteCity = async (city: string, uf: string) => {
    if (confirm(`Tem certeza que deseja excluir a configuração de ${city}-${uf}?`)) {
      const result = await deleteLogisticsConfig(city, uf);
      if (result.success) {
        alert('Configuração excluída com sucesso!');
        setRotas(prev => prev.filter(r => !(r.city === city && r.estado === uf)));
      } else {
        alert('Erro ao excluir: ' + result.error);
      }
    }
  };

  const handleEditZone = (city: string, uf: string) => {
    fetchDeliveryZones().then(zones => {
      const zone = zones.find(z => z.cidade === city && z.estado === uf);
      if (zone) {
        setEditingZone(zone);
        setShowZoneModal(true);
      }
    });
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // 1. Sincroniza a configuração de logística
      const result = await syncLogisticsConfig(logisticsConfig);
      if (!result.success) {
        alert('Erro ao salvar: ' + result.error);
        setIsSaving(false);
        return;
      }

      // 2. Sincroniza os tipos de frete na delivery_zone correspondente
      // Buscamos se já existe para manter o ID se houver
      const zones = await fetchDeliveryZones();
      const matchingZone = zones.find(z => z.cidade === logisticsConfig.city && z.estado === logisticsConfig.uf);
      
      const zoneData: DeliveryZone = {
        id: matchingZone?.id,
        cidade: logisticsConfig.city,
        estado: logisticsConfig.uf,
        cep: logisticsConfig.cep || (matchingZone?.cep ?? ''),
        tipos_frete: logisticsConfig.tiposFrete || [],
        parceiro: matchingZone?.parceiro ?? 'propria', // Mantém o parceiro ou define padrão
        status: matchingZone?.status ?? 'ativa'
      };

      const zoneResult = await syncDeliveryZone(zoneData);
      if (!zoneResult.success) {
        console.error('Erro ao atualizar zona de entrega:', zoneResult.error);
      }

      // 3. Exclui feiras removidas da tabela unificada
      for (const id of deletedFairIds) {
        await deleteFair(id);
      }
      setDeletedFairIds([]);

      // 4. Sincroniza cada feira individualmente na tabela unificada
      if (logisticsConfig.fairs && logisticsConfig.fairs.length > 0) {
        for (const fair of logisticsConfig.fairs) {
          await syncFair({
            ...fair,
            city: logisticsConfig.city,
            state: logisticsConfig.uf
          });
        }
      }

      alert('Configurações da cidade salvas com sucesso!');
      const updatedZones = await fetchDeliveryZones();
      setRotas(updatedZones.map(zoneToRota));
      setSelectedCity(null);
    } catch (err) {
      alert('Erro inesperado ao conectar com o banco.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEngineConfig = async () => {
    setIsSavingEngine(true);
    try {
      const result = await syncEngineConfig(engineConfig);
      if (result.success) {
        alert('Configurações do motor aplicadas com sucesso!');
      } else {
        alert('Erro ao salvar configurações do motor: ' + result.error);
      }
    } catch (err) {
      alert('Erro inesperado ao salvar configurações do motor.');
    } finally {
      setIsSavingEngine(false);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/logistica" className="hover:text-green-700 transition-colors">Logística</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Gestão de Rotas</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Engenharia de Rotas</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Otimize trajetos, gerencie zonas de entrega e configure o despacho inteligente para feiras regionais.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowApiKeyModal(true)}
            className="px-8 py-4 bg-white border border-gray-200 rounded-[24px] font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Settings2 size={20} />
            Configurar API Maps
          </button>
          <button 
            onClick={() => setShowZoneModal(true)}
            className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Zona de Entrega
          </button>
        </div>
      </div>

      {/* Route Engine Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-[#1b1c19] p-10 rounded-[40px] text-white shadow-xl shadow-gray-900/20 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
               <div className="p-3 bg-white/10 rounded-2xl">
                  <Navigation size={24} className="text-blue-400" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Motor de Otimização</span>
            </div>
            <div className="mt-8 relative z-10">
               <p className="text-sm opacity-50 font-medium">Economia em KM</p>
               <h3 className="text-[48px] font-black leading-none mt-1">24.5<span className="text-xl opacity-40">%</span></h3>
               <p className="text-xs text-green-400 font-bold mt-2 flex items-center gap-1">
                  <TrendingUp size={14} /> Otimização por IA Ativa
               </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full"></div>
         </div>

         <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
               <div className="p-3 bg-green-50 text-green-700 rounded-2xl">
                  <MapPin size={24} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Hubs Ativos</span>
            </div>
            <div>
               <p className="text-sm text-gray-400 font-medium">Zonas de Entrega Ativas</p>
               <h3 className="text-[40px] font-black text-gray-900 leading-none mt-1">{rotas.length}</h3>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sincronizado com Mapas</p>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
               <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                  <Truck size={24} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Frotas</span>
            </div>
            <div>
               <p className="text-sm text-gray-400 font-medium">Capacidade de Carga</p>
               <h3 className="text-[40px] font-black text-gray-900 leading-none mt-1">85%</h3>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-orange-500 w-[85%] rounded-full"></div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         <div className="lg:col-span-8 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[750px]">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
               <div className="flex gap-4">
                  <button 
                     onClick={() => setViewMode('list')}
                     className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white border border-gray-200 text-gray-900 shadow-sm' : 'text-gray-400 hover:bg-white'}`}
                  >
                     <Navigation size={14} /> Lista
                  </button>
                  <button 
                     onClick={() => setViewMode('map')}
                     className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white border border-gray-200 text-gray-900 shadow-sm' : 'text-gray-400 hover:bg-white'}`}
                  >
                     <MapIcon size={14} /> Mapa
                  </button>
               </div>
               <button className="text-gray-300 hover:text-gray-900 transition-all">
                  <Maximize2 size={16} />
               </button>
            </div>

            {viewMode === 'list' ? (
               <div className="flex-1 overflow-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-gray-50/30 border-b border-gray-50">
                           <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Id Rota</th>
                           <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cidade / Zona</th>
                           <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Frete</th>
                           <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Logística Partner</th>
                           <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {loadingZones && (
                           <tr>
                              <td colSpan={5} className="px-8 py-10 text-center text-gray-400">Carregando...</td>
                           </tr>
                        )}
                        {rotas.map((r, idx) => (
                           <tr key={idx} className="group hover:bg-green-50/30 transition-all">
                              <td className="px-8 py-6">
                                 <p className="font-black text-gray-900 text-sm">{r.id}</p>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Atualizado {r.time}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                       <MapPin size={18} />
                                    </div>
                                    <div>
                                       <p className="font-black text-gray-900 text-sm">{r.region}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex flex-col gap-1.5">
                                    {(r.shippingTypes as string[]).map((type, i) => (
                                       <div key={i} className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${type === 'Retirada' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                          <p className="font-black text-gray-900 text-[11px] uppercase tracking-tight">{type}</p>
                                       </div>
                                    ))}
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="font-black text-gray-900 text-sm">{r.partner}</p>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Empresa Atribuída</p>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex items-center justify-end gap-3">
                                    <button 
                                       onClick={async () => {
                                          setSelectedCity(r.city);
                                          setConfigStep(1);
                                          setDeletedFairIds([]);

                                          // Buscar zona correspondente para pegar as formas de frete
                                          const zones = await fetchDeliveryZones();
                                          const matchingZone = zones.find(z => z.cidade === r.city && z.estado === r.estado);
                                          const currentTiposFrete = matchingZone ? (matchingZone.tipos_frete || []) : [];

                                          // Buscar feiras da cidade — usa delivery_zone_id quando disponível
                                          const dbFairs = await fetchFairsByCity(
                                            r.city,
                                            r.estado,
                                            matchingZone?.id,
                                          );
                                          const mappedFairs = dbFairs.map((f: any) => ({
                                             id: f.id,
                                             name: f.name,
                                             cep: f.cep,
                                             address: f.address,
                                             neighborhood: f.neighborhood,
                                             city: f.city,
                                             uf: f.state,
                                             latitude: f.latitude?.toString(),
                                             longitude: f.longitude?.toString(),
                                             type: f.type,
                                             modality: f.modality,
                                             periodicity: f.periodicity,
                                             status: f.status,
                                             imageUrl: f.image_url,
                                             howToGetThere: f.how_to_get_there,
                                             history: f.history,
                                             days: f.operating_days || [],
                                             hours: typeof f.operating_hours === 'string' && f.operating_hours.startsWith('{') 
                                                ? JSON.parse(f.operating_hours) 
                                                : { 'Sábado': { start: '07:00', end: '13:00' } }
                                          }));

                                          // Buscar configuração existente no banco
                                          const { data, error } = await supabase
                                             .from('mktplace_feira_logistics_configs')
                                             .select('*')
                                             .eq('cidade', r.city)
                                             .eq('estado', r.estado)
                                             .single();
                                          
                                          if (data) {
                                             const fc = data.freight_config || {};
                                             setLogisticsConfig({
                                                city: data.cidade,
                                                uf: data.estado,
                                                cep: data.cep || '',
                                                rainTax: data.rain_tax || 0,
                                                weekendTax: data.weekend_tax || 0,
                                                fairs: mappedFairs,
                                                distanceTiers: data.distance_tiers || [],
                                                vehicles: data.fleet || [],
                                                tiposFrete: currentTiposFrete,
                                                fixedFreightValue: fc.fixedFreightValue ?? 15.00,
                                                freeAbove: fc.freeAbove ?? 0,
                                                minOrderAtacado: fc.minOrderAtacado ?? 500.00,
                                             });
                                          } else {
                                             setLogisticsConfig(prev => ({ 
                                                ...prev, 
                                                city: r.city, 
                                                uf: r.estado || 'DF',
                                                fairs: mappedFairs,
                                                tiposFrete: currentTiposFrete
                                             }));
                                          }
                                       }}
                                       className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all shadow-sm active:scale-95 group/btn"
                                       title="Configurar Logística e Frete"
                                    >
                                       <Truck size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                    <button 
                                       onClick={() => handleEditZone(r.city, r.estado)}
                                       className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95 group/btn"
                                       title="Editar Dados da Cidade"
                                    >
                                       <Pencil size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                    <button 
                                       onClick={() => handleDeleteCity(r.city, r.estado)}
                                       className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95 group/btn"
                                       title="Excluir Configuração"
                                    >
                                       <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            ) : (
               <div className="flex-1 relative bg-gray-100 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
                  {/* City filter overlay */}
                  <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 flex-wrap">
                     <button
                        onClick={() => setSelectedMapCity('')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm ${selectedMapCity === '' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-100'}`}
                     >
                        Todas as cidades
                     </button>
                     {[...new Set(allMapFairs.map(f => f.city).filter(Boolean))].sort().map(city => (
                        <button
                           key={city}
                           onClick={() => setSelectedMapCity(city)}
                           className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm ${selectedMapCity === city ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-100'}`}
                        >
                           {city}
                        </button>
                     ))}
                  </div>
                  <LeafletMap
                     selectedCity={selectedMapCity || 'Brasil'}
                     estado=""
                     fairs={selectedMapCity ? allMapFairs.filter(f => f.city === selectedMapCity) : allMapFairs}
                  />
               </div>
            )}
         </div>

         {/* Right Column: Engine Config */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
                     <Settings2 size={24} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">Configurações do Motor</h3>
               </div>

               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">RAIO DE ENTREGA PADRÃO</label>
                     <div className="flex items-center gap-4">
                        <input 
                           type="range" 
                           min={5}
                           max={100}
                           value={engineConfig.defaultRadius}
                           onChange={(e) => setEngineConfig(prev => ({ ...prev, defaultRadius: Number(e.target.value) }))}
                           className="flex-1 accent-green-700 cursor-pointer" 
                        />
                        <span className="text-sm font-black text-gray-900 min-w-12 text-right">{engineConfig.defaultRadius}km</span>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">PRIORIDADE DE DESPACHO</label>
                     <select 
                        value={engineConfig.dispatchPriority}
                        onChange={(e) => setEngineConfig(prev => ({ ...prev, dispatchPriority: e.target.value }))}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 rounded-2xl outline-none font-bold text-sm transition-all appearance-none cursor-pointer"
                     >
                        <option value="Menor Tempo (ETA)">Menor Tempo (ETA)</option>
                        <option value="Menor Custo (KM)">Menor Custo (KM)</option>
                        <option value="Equilíbrio de Frota">Equilíbrio de Frota</option>
                     </select>
                  </div>

                  <div 
                     onClick={() => setEngineConfig(prev => ({ ...prev, smartRerouting: !prev.smartRerouting }))}
                     className="p-6 bg-gray-50 rounded-3xl space-y-4 cursor-pointer hover:bg-gray-100/50 transition-all select-none"
                  >
                     <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-gray-900">Smart Rerouting</p>
                        <div className={`w-10 h-5 rounded-full relative p-1 transition-all ${engineConfig.smartRerouting ? 'bg-green-600' : 'bg-gray-300'}`}>
                           <div className={`w-3 h-3 bg-white rounded-full transition-all ${engineConfig.smartRerouting ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                     </div>
                     <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Permitir que a IA recalcule rotas em tempo real com base no tráfego e novas coletas.</p>
                  </div>
               </div>

               <button
                  onClick={handleSaveEngineConfig}
                  disabled={isSavingEngine}
                  className="w-full py-4 bg-[#125d30] text-white rounded-[24px] font-black text-sm flex items-center justify-center gap-2 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/10"
               >
                  <Zap size={18} className={isSavingEngine ? 'animate-bounce' : ''} />
                  {isSavingEngine ? 'Aplicando...' : 'Aplicar Configurações'}
               </button>
            </div>

         </div>
      </div>

      </div>

      {/* Modal: Engenharia Logística por Cidade (Drill-down) */}
      {selectedCity && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setSelectedCity(null)} 
          />
          <div className="relative w-[80%] max-w-[1200px] h-[90vh] bg-white rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] flex flex-col border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <header className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 sticky top-0 z-20">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-700 border border-gray-100">
                     <Globe size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-gray-900">{selectedCity}</h2>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Engenharia Logística • CEP: {logisticsConfig.cep}
                     </p>
                  </div>
               </div>
               <button onClick={() => setSelectedCity(null)} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                  <Plus size={24} className="rotate-45" />
               </button>
            </header>

            <nav className="flex px-8 border-b border-gray-50 bg-white sticky top-0 z-10">
               {[
                  { step: 1, label: 'Dados & Feiras', icon: Zap },
                  { step: 2, label: 'Tabela de Preços', icon: Wallet },
                  { step: 3, label: 'Frota & Parceiros', icon: Car }
               ].map((item) => (
                  <button
                     key={item.step}
                     onClick={() => setConfigStep(item.step as any)}
                     className={`flex-1 flex items-center justify-center gap-3 py-6 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all relative ${
                        configStep === item.step 
                        ? 'border-green-600 text-green-700 bg-green-50/20' 
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                     }`}
                  >
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${configStep === item.step ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {item.step}
                     </div>
                     {item.label}
                  </button>
               ))}
            </nav>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
               {configStep === 1 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
                     <div className="space-y-6">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 px-2">
                           <MapPin size={14} /> Feiras na Unidade
                        </h3>
                        
                        {isAddingFair ? (
                           <div className="bg-white border border-gray-100 rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                              <header className="px-10 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                 <h3 className="text-lg font-black text-gray-900 tracking-tight">Central de Feiras - Cadastro Detalhado</h3>
                                 <button onClick={() => setIsAddingFair(false)} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                                    <Plus size={20} className="rotate-45" />
                                 </button>
                              </header>
                              <div className="p-10 space-y-8">

                                 {/* ── Selector: feiras já cadastradas ── */}
                                 {(loadingRegisteredFairs || registeredFairs.length > 0) && (
                                    <div className="bg-green-50 border border-green-100 rounded-[28px] p-6 space-y-4">
                                       <div className="flex items-center gap-2">
                                          <Store size={16} className="text-green-700 shrink-0" />
                                          <p className="text-[11px] font-black text-green-800 uppercase tracking-widest">
                                             Feiras já cadastradas em {logisticsConfig.city}
                                          </p>
                                          <span className="ml-auto text-[10px] font-bold text-green-600">Clique para pré-preencher o formulário</span>
                                       </div>
                                       {loadingRegisteredFairs ? (
                                          <div className="flex items-center gap-2 text-green-700">
                                             <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                                             <span className="text-xs font-bold">Buscando feiras cadastradas...</span>
                                          </div>
                                       ) : (
                                          <div className="flex flex-wrap gap-2">
                                             {registeredFairs.map((rf) => (
                                                <button
                                                   key={rf.id}
                                                   type="button"
                                                   onClick={() => {
                                                      setNewFair(prev => ({
                                                         ...prev,
                                                         name: rf.name || '',
                                                         cep: rf.cep || '',
                                                         address: rf.address || '',
                                                         neighborhood: rf.neighborhood || '',
                                                         city: rf.city || prev.city,
                                                         uf: rf.state || prev.uf,
                                                         latitude: rf.latitude?.toString() || '',
                                                         longitude: rf.longitude?.toString() || '',
                                                         type: rf.type || 'Feira Livre',
                                                         modality: rf.modality || 'Varejo',
                                                         periodicity: rf.periodicity || 'Semanal',
                                                         status: rf.status || 'Ativo',
                                                         imageUrl: rf.image_url || '',
                                                         howToGetThere: rf.how_to_get_there || '',
                                                         history: rf.history || '',
                                                         days: rf.operating_days || ['Sábado'],
                                                         hours: typeof rf.operating_hours === 'string' && rf.operating_hours.startsWith('{')
                                                            ? JSON.parse(rf.operating_hours)
                                                            : { 'Sábado': { start: '07:00', end: '13:00' } },
                                                      }));
                                                   }}
                                                   className="flex items-center gap-2 px-4 py-2.5 bg-white border border-green-200 rounded-2xl text-xs font-black text-green-800 hover:bg-green-700 hover:text-white hover:border-green-700 transition-all shadow-sm"
                                                >
                                                   <MapPin size={12} />
                                                   {rf.name}
                                                   {rf.neighborhood && <span className="font-medium text-green-600 group-hover:text-white">• {rf.neighborhood}</span>}
                                                </button>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 )}

                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Coluna 1: Dados Gerais, Endereço e Foto */}
                                    <div className="space-y-6">
                                       {/* Foto da Feira */}
                                       <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100/50 space-y-4">
                                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Foto da Feira</label>
                                          <div className="flex flex-col sm:flex-row gap-6 items-center">
                                             <div className="w-24 h-24 rounded-3xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                {newFair.imageUrl ? (
                                                   <img src={newFair.imageUrl} alt="Foto da feira" className="w-full h-full object-cover" />
                                                ) : (
                                                   <ImageIcon size={32} className="text-gray-300" />
                                                )}
                                             </div>
                                             <div className="flex-1 w-full space-y-3">
                                                <input 
                                                   type="text" 
                                                   placeholder="Cole o link/URL da imagem..." 
                                                   value={newFair.imageUrl || ''}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, imageUrl: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-green-600/30"
                                                />
                                                <div className="flex items-center gap-3">
                                                   <input 
                                                      type="file" 
                                                      id="fairImageFile" 
                                                      accept="image/*"
                                                      hidden
                                                      onChange={(e) => {
                                                         const file = e.target.files?.[0];
                                                         if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                               setNewFair(prev => ({ ...prev, imageUrl: reader.result as string }));
                                                            };
                                                            reader.readAsDataURL(file);
                                                         }
                                                      }}
                                                   />
                                                   <label 
                                                      htmlFor="fairImageFile"
                                                      className="px-5 py-3 bg-green-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-green-800 transition-all flex items-center gap-2 shadow-md shadow-green-950/10"
                                                   >
                                                      <ImagePlus size={14} /> Subir do Computador
                                                   </label>
                                                   {newFair.imageUrl && (
                                                      <button 
                                                         type="button" 
                                                         onClick={() => setNewFair(prev => ({ ...prev, imageUrl: '' }))}
                                                         className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
                                                      >
                                                         Remover
                                                      </button>
                                                   )}
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       {/* CEP e Endereço */}
                                       <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100/50 space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">CEP (Busca)</label>
                                                <div className="relative">
                                                   <input 
                                                      type="text" 
                                                      placeholder="00000-000" 
                                                      value={newFair.cep || ''}
                                                      onChange={(e) => handleCEPChange(e.target.value)}
                                                      className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-green-600/30"
                                                   />
                                                   {isLoadingCEP && (
                                                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                                                   )}
                                                </div>
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Nome da Feira</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="Ex: Feira do Produtor" 
                                                   value={newFair.name || ''}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, name: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-green-600/30"
                                                />
                                             </div>
                                          </div>

                                          <div className="grid grid-cols-3 gap-4">
                                             <div className="col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Cidade</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="Ex: Brasília" 
                                                   value={newFair.city || ''}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, city: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-green-600/30"
                                                />
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">UF</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="Ex: DF" 
                                                   value={newFair.uf || ''}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, uf: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-green-600/30"
                                                />
                                             </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Bairro</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="Ex: Asa Norte" 
                                                   value={newFair.neighborhood || ''}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, neighborhood: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-green-600/30"
                                                />
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Rua / Endereço</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="Ex: SCLN 310 Bloco B" 
                                                   value={newFair.address || ''}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, address: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-green-600/30"
                                                />
                                             </div>
                                          </div>

                                          <div className="space-y-2">
                                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Complemento (opcional)</label>
                                             <input 
                                                type="text" 
                                                placeholder="Ex: Próximo ao mercado Pão de Açúcar" 
                                                value={newFair.complement || ''}
                                                onChange={(e) => setNewFair(prev => ({ ...prev, complement: e.target.value }))}
                                                className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-green-600/30"
                                             />
                                          </div>
                                       </div>

                                       {/* Coordenadas Geográficas */}
                                       <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100/50 space-y-4">
                                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex justify-between items-center">
                                             <span>Coordenadas Geográficas</span>
                                             <button 
                                                type="button" 
                                                onClick={async () => {
                                                   if (!newFair.latitude || !newFair.longitude) {
                                                      const fullAddress = `${newFair.address || ''}, ${newFair.neighborhood || ''}, ${newFair.city || ''} - ${newFair.uf || ''}, Brazil`;
                                                      try {
                                                         const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
                                                         const geoData = await geoRes.json();
                                                         if (geoData && geoData.length > 0) {
                                                            setNewFair(prev => ({
                                                               ...prev,
                                                               latitude: geoData[0].lat,
                                                               longitude: geoData[0].lon
                                                            }));
                                                         } else {
                                                            setNewFair(prev => ({
                                                               ...prev,
                                                               latitude: '-15.793889',
                                                               longitude: '-47.882778'
                                                            }));
                                                         }
                                                      } catch (e) {
                                                         setNewFair(prev => ({
                                                            ...prev,
                                                            latitude: '-15.793889',
                                                            longitude: '-47.882778'
                                                         }));
                                                      }
                                                   }
                                                   setShowMapPicker(true);
                                                }}
                                                className="text-green-700 font-black text-[10px] uppercase tracking-widest hover:underline"
                                             >
                                                Detectar no Mapa
                                             </button>
                                          </label>
                                          <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase block">Latitude</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="Ex: -15.793889" 
                                                   value={newFair.latitude || ''}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, latitude: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-green-600/30"
                                                />
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase block">Longitude</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="Ex: -47.882778" 
                                                   value={newFair.longitude || ''}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, longitude: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-green-600/30"
                                                />
                                             </div>
                                          </div>
                                       </div>

                                       {/* Classificações & Status */}
                                       <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100/50 space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tipo de Feira</label>
                                                <select 
                                                   value={newFair.type || 'Feira Livre'}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, type: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none"
                                                >
                                                   {dbTags.filter(t => t.group_type === 'tipo_feira').map((t, i) => (
                                                      <option key={i} value={t.name}>{t.name}</option>
                                                   ))}
                                                </select>
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Modalidade de Venda</label>
                                                <select 
                                                   value={newFair.modality || 'Varejo'}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, modality: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none"
                                                >
                                                   {dbTags.filter(t => t.group_type === 'modalidade').map((t, i) => (
                                                      <option key={i} value={t.name}>{t.name}</option>
                                                   ))}
                                                </select>
                                             </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Periodicidade</label>
                                                <select 
                                                   value={newFair.periodicity || 'Semanal'}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, periodicity: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none"
                                                >
                                                   {dbTags.filter(t => t.group_type === 'periodicidade').map((t, i) => (
                                                      <option key={i} value={t.name}>{t.name}</option>
                                                   ))}
                                                </select>
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Status da Feira</label>
                                                <select 
                                                   value={newFair.status || 'Ativo'}
                                                   onChange={(e) => setNewFair(prev => ({ ...prev, status: e.target.value }))}
                                                   className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none"
                                                >
                                                   <option value="Ativo">Ativo</option>
                                                   <option value="Inativo">Inativo</option>
                                                </select>
                                             </div>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Coluna 2: Horários e Informações Multilinha */}
                                    <div className="space-y-6">
                                       {/* Horários de Funcionamento */}
                                       <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100/50 space-y-4">
                                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Horários de Funcionamento</label>
                                          
                                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                             {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day) => {
                                                const isOpen = (newFair.days || []).includes(day);
                                                const dayHours = (newFair.hours || {})[day] || { start: '07:00', end: '13:00' };

                                                return (
                                                   <div key={day} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 shadow-sm gap-4">
                                                      <label className="flex items-center gap-3 cursor-pointer shrink-0">
                                                         <input 
                                                            type="checkbox"
                                                            checked={isOpen}
                                                            onChange={(e) => {
                                                               const checked = e.target.checked;
                                                               setNewFair(prev => {
                                                                  const nextDays = checked 
                                                                     ? [...(prev.days || []), day]
                                                                     : (prev.days || []).filter(d => d !== day);
                                                                  
                                                                  const nextHours = { ...(prev.hours || {}) };
                                                                  if (checked) {
                                                                     nextHours[day] = { start: '07:00', end: '13:00' };
                                                                  } else {
                                                                     delete nextHours[day];
                                                                  }

                                                                  return { ...prev, days: nextDays, hours: nextHours };
                                                               });
                                                            }}
                                                            className="w-4 h-4 rounded text-green-700 focus:ring-green-500 border-gray-300"
                                                         />
                                                         <span className="text-xs font-black text-gray-900 w-16">{day}</span>
                                                      </label>

                                                      {isOpen ? (
                                                         <div className="flex items-center gap-2 shrink-0">
                                                            <input 
                                                               type="time" 
                                                               value={dayHours.start}
                                                               onChange={(e) => {
                                                                  const val = e.target.value;
                                                                  setNewFair(prev => ({
                                                                     ...prev,
                                                                     hours: {
                                                                        ...(prev.hours || {}),
                                                                        [day]: { ...dayHours, start: val }
                                                                     }
                                                                  }));
                                                               }}
                                                               className="px-2 py-1.5 border border-gray-100 rounded-lg text-xs font-bold outline-none"
                                                            />
                                                            <span className="text-xs text-gray-400 font-bold">às</span>
                                                            <input 
                                                               type="time" 
                                                               value={dayHours.end}
                                                               onChange={(e) => {
                                                                  const val = e.target.value;
                                                                  setNewFair(prev => ({
                                                                     ...prev,
                                                                     hours: {
                                                                        ...(prev.hours || {}),
                                                                        [day]: { ...dayHours, end: val }
                                                                     }
                                                                  }));
                                                               }}
                                                               className="px-2 py-1.5 border border-gray-100 rounded-lg text-xs font-bold outline-none"
                                                            />
                                                         </div>
                                                      ) : (
                                                         <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest pr-4">Fechado</span>
                                                      )}
                                                   </div>
                                                );
                                             })}
                                          </div>
                                       </div>

                                       {/* Como Chegar */}
                                       <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100/50 space-y-2">
                                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Como Chegar?</label>
                                          <textarea 
                                             rows={3}
                                             placeholder="Instruções de acesso e pontos de referência..." 
                                             value={newFair.howToGetThere || ''}
                                             onChange={(e) => setNewFair(prev => ({ ...prev, howToGetThere: e.target.value }))}
                                             className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-xs outline-none focus:border-green-600/30 resize-none"
                                          />
                                       </div>

                                       {/* História da Feira */}
                                       <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100/50 space-y-2">
                                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">História da Feira</label>
                                          <textarea 
                                             rows={4}
                                             placeholder="Origens, curiosidades e tradições da feira..." 
                                             value={newFair.history || ''}
                                             onChange={(e) => setNewFair(prev => ({ ...prev, history: e.target.value }))}
                                             className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-xs outline-none focus:border-green-600/30 resize-none"
                                          />
                                       </div>
                                    </div>
                                 </div>

                                 <div className="pt-6 border-t border-gray-50 flex justify-end gap-4">
                                    <button 
                                       type="button"
                                       onClick={() => setIsAddingFair(false)}
                                       className="px-8 py-4 text-xs font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-all"
                                    >
                                       Cancelar
                                    </button>
                                    <button 
                                       onClick={() => {
                                          // Editing: keep existing UUID. New fair: use temp numeric id (replaced by DB after syncFair).
                                          const fairData = { ...newFair, id: editingFairIndex !== null ? newFair.id : undefined, partner: 'PROPRIA' };
                                          if (editingFairIndex !== null) {
                                             setLogisticsConfig(prev => ({
                                                ...prev,
                                                fairs: prev.fairs.map((f, i) => i === editingFairIndex ? fairData : f)
                                             }));
                                          } else {
                                             setLogisticsConfig(prev => ({
                                                ...prev,
                                                fairs: [...prev.fairs, fairData]
                                             }));
                                          }
                                          setNewFair({ id: undefined, name: '', cep: '', address: '', neighborhood: '', city: logisticsConfig.city, uf: logisticsConfig.uf, complement: '', latitude: '', longitude: '', type: 'Feira Livre', modality: 'Varejo', periodicity: 'Semanal', status: 'Ativo', imageUrl: '', howToGetThere: '', history: '', days: ['Sábado'], hours: { 'Sábado': { start: '07:00', end: '13:00' } } });
                                          setEditingFairIndex(null);
                                          setIsAddingFair(false);
                                       }}
                                       className="px-12 py-4 bg-green-700 text-white rounded-2xl font-black text-xs shadow-xl shadow-green-900/20 hover:bg-green-800 transition-all active:scale-95"
                                    >
                                       CONFIRMAR E SALVAR FEIRA CENTRAL
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="grid grid-cols-2 gap-4">
                              {logisticsConfig.fairs.map((fair, fairIdx) => (
                                 <div key={fair.id || fairIdx} className="p-5 bg-white border border-gray-100 rounded-3xl flex justify-between items-center group hover:border-green-600/20 transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-all">
                                          <MapPin size={18} />
                                       </div>
                                       <div>
                                          <p className="text-xs font-black text-gray-900">{fair.name}</p>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase">{fair.cep || fair.partner}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <button 
                                          onClick={() => {
                                             setNewFair({
                                                id: fair.id,  // preserva UUID para upsert correto
                                                name: fair.name || '',
                                                cep: fair.cep || '',
                                                address: fair.address || '',
                                                neighborhood: fair.neighborhood || '',
                                                city: fair.city || logisticsConfig.city,
                                                uf: fair.uf || logisticsConfig.uf,
                                                complement: fair.complement || '',
                                                latitude: fair.latitude || '',
                                                longitude: fair.longitude || '',
                                                type: fair.type || 'Feira Livre',
                                                modality: fair.modality || 'Varejo',
                                                periodicity: fair.periodicity || 'Semanal',
                                                status: fair.status || 'Ativo',
                                                imageUrl: fair.imageUrl || '',
                                                howToGetThere: fair.howToGetThere || '',
                                                history: fair.history || '',
                                                days: fair.days || ['Sábado'],
                                                hours: fair.hours || { 'Sábado': { start: '07:00', end: '13:00' } },
                                             });
                                             setEditingFairIndex(fairIdx);
                                             setIsAddingFair(true);
                                          }}
                                          className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                       >
                                          <Pencil size={15} />
                                       </button>
                                       <button
                                          onClick={() => {
                                             if (fair.id && typeof fair.id === 'string' && fair.id.length > 20) {
                                                setDeletedFairIds(prev => [...prev, fair.id]);
                                             }
                                             setLogisticsConfig(prev => ({
                                                ...prev,
                                                fairs: prev.fairs.filter((_, i) => i !== fairIdx)
                                             }));
                                          }}
                                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                       >
                                          <Trash2 size={15} />
                                       </button>
                                       <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:hidden">
                                          <CheckCircle2 size={16} />
                                       </div>
                                    </div>
                                 </div>
                              ))}
                              <button
                                 onClick={async () => {
                                    setNewFair({
                                       name: '',
                                       cep: '',
                                       address: '',
                                       neighborhood: '',
                                       city: logisticsConfig.city || 'Brasília',
                                       uf: logisticsConfig.uf || 'DF',
                                       complement: '',
                                       latitude: '',
                                       longitude: '',
                                       type: 'Feira Livre',
                                       modality: 'Varejo',
                                       periodicity: 'Semanal',
                                       status: 'Ativo',
                                       imageUrl: '',
                                       howToGetThere: '',
                                       history: '',
                                       days: ['Sábado'],
                                       hours: { 'Sábado': { start: '07:00', end: '13:00' } }
                                    });
                                    setEditingFairIndex(null);
                                    setLoadingRegisteredFairs(true);
                                    // Use delivery_zone_id if we know it (fetched when opening the city modal)
                                    const currentZoneId = rotas.find(
                                      r => r.city === logisticsConfig.city && r.estado === logisticsConfig.uf
                                    )?.id?.replace('ROTA-', '') ?? undefined;
                                    const dbFairs = await fetchFairsByCity(
                                      logisticsConfig.city || 'Brasília',
                                      logisticsConfig.uf   || 'DF',
                                    );
                                    setRegisteredFairs(dbFairs);
                                    setLoadingRegisteredFairs(false);
                                    setIsAddingFair(true);
                                 }}
                                 className="p-5 border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-green-700 hover:border-green-600/20 transition-all w-full"
                              >
                                 <Plus size={16} /> ADICIONAR FEIRA
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {configStep === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                     {/* Modalidades de Frete Habilitadas */}
                     <div className="space-y-4 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100/50">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">
                           Modalidades de Frete Habilitadas para {logisticsConfig.city}
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                           {[
                              { value: 'retirada', label: 'Retirada no Local', icon: MapPin, desc: 'Cliente retira na feira', color: 'border-orange-500 bg-orange-50/20 text-orange-700' },
                              { value: 'distancia', label: 'Frete à Distância', icon: Truck, desc: 'Calculado por faixas de KM', color: 'border-blue-500 bg-blue-50/20 text-blue-700' },
                              { value: 'fixo', label: 'Frete Fixo', icon: DollarSign, desc: 'Taxa única para toda cidade', color: 'border-green-600 bg-green-50/20 text-green-700' },
                              { value: 'consulta', label: 'Sob Consulta', icon: HelpCircle, desc: 'Valor definido após o pedido', color: 'border-purple-500 bg-purple-50/20 text-purple-700' }
                           ].map((item) => {
                              const isActive = (logisticsConfig.tiposFrete || []).includes(item.value);
                              const Icon = item.icon;
                              return (
                                 <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => {
                                       setLogisticsConfig(prev => {
                                          const current = prev.tiposFrete || [];
                                          const next = current.includes(item.value)
                                             ? current.filter(x => x !== item.value)
                                             : [...current, item.value];
                                          return { ...prev, tiposFrete: next };
                                       });
                                    }}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                       isActive 
                                          ? `${item.color} shadow-sm` 
                                          : 'border-gray-100 bg-white hover:border-gray-200 text-gray-400 grayscale'
                                    }`}
                                 >
                                    <div className="flex items-center gap-2 mb-1">
                                       <Icon size={16} className={isActive ? '' : 'text-gray-300'} />
                                       <span className={`text-xs font-black ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</span>
                                    </div>
                                    <p className="text-[10px] font-medium opacity-80 leading-tight">{item.desc}</p>
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* Seções de preço condicionais por tipo de frete ativo */}
                     {(logisticsConfig.tiposFrete || []).length === 0 && (
                       <p className="text-center text-xs text-gray-400 font-bold py-8">
                         Selecione ao menos uma modalidade de frete acima para configurar os preços.
                       </p>
                     )}

                     {/* Retirada no Local */}
                     {(logisticsConfig.tiposFrete || []).includes('retirada') && (
                       <div className="flex items-center gap-4 p-5 bg-orange-50/40 border border-orange-100 rounded-[28px]">
                         <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shrink-0"><MapPin size={20} /></div>
                         <div>
                           <p className="text-sm font-black text-gray-900">Retirada no Local — Gratuito</p>
                           <p className="text-[11px] font-medium text-gray-500 mt-0.5">O cliente retira o pedido diretamente na feira. Sem custo de entrega.</p>
                         </div>
                       </div>
                     )}

                     {/* Frete à Distância */}
                     {(logisticsConfig.tiposFrete || []).includes('distancia') && (
                       <div className="bg-gray-50/50 rounded-[40px] border border-gray-50 overflow-hidden">
                         <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
                           <Truck size={16} className="text-blue-500" />
                           <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Frete por Distância — Faixas de KM</span>
                         </div>
                         <table className="w-full text-left border-collapse">
                           <thead>
                             <tr className="bg-gray-100/50">
                               <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">KM</th>
                               <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Frete (R$)</th>
                               <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Taxa (R$)</th>
                               <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                             {logisticsConfig.distanceTiers.map((tier, idx) => (
                               <tr key={idx} className="bg-white hover:bg-blue-50/20 transition-all">
                                 <td className="px-8 py-5">
                                   <div className="flex items-center gap-2 font-black text-xs text-gray-900">
                                     <input type="number" value={tier.min} onChange={(e) => { const t = [...logisticsConfig.distanceTiers]; t[idx].min = Number(e.target.value); setLogisticsConfig(prev => ({ ...prev, distanceTiers: t })); }} className="w-16 px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-center font-bold outline-none focus:border-blue-400/50" />
                                     <span className="text-gray-300">→</span>
                                     <input type="number" value={tier.max} onChange={(e) => { const t = [...logisticsConfig.distanceTiers]; t[idx].max = Number(e.target.value); setLogisticsConfig(prev => ({ ...prev, distanceTiers: t })); }} className="w-16 px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-center font-bold outline-none focus:border-blue-400/50" />
                                     <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-1">KM</span>
                                   </div>
                                 </td>
                                 <td className="px-8 py-5">
                                   <div className="flex items-center gap-1"><span className="text-gray-400 font-medium text-xs">R$</span>
                                     <input type="number" step="0.01" value={tier.value} onChange={(e) => { const t = [...logisticsConfig.distanceTiers]; t[idx].value = Number(e.target.value); setLogisticsConfig(prev => ({ ...prev, distanceTiers: t })); }} className="w-24 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg font-bold outline-none focus:border-blue-400/50 text-xs" />
                                   </div>
                                 </td>
                                 <td className="px-8 py-5">
                                   <div className="flex items-center gap-1"><span className="text-gray-400 font-medium text-xs">R$</span>
                                     <input type="number" step="0.01" value={tier.fee} onChange={(e) => { const t = [...logisticsConfig.distanceTiers]; t[idx].fee = Number(e.target.value); setLogisticsConfig(prev => ({ ...prev, distanceTiers: t })); }} className="w-24 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg font-bold outline-none focus:border-blue-400/50 text-xs" />
                                   </div>
                                 </td>
                                 <td className="px-8 py-5 text-right">
                                   <button type="button" onClick={() => setLogisticsConfig(prev => ({ ...prev, distanceTiers: prev.distanceTiers.filter((_, i) => i !== idx) }))} className="text-gray-300 hover:text-red-500 transition-all"><Plus size={16} className="rotate-45" /></button>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                         <button type="button" onClick={() => { setLogisticsConfig(prev => { const t = prev.distanceTiers || []; const last = t[t.length - 1]; return { ...prev, distanceTiers: [...t, { min: last ? last.max : 0, max: last ? last.max + 5 : 5, value: 15.00, fee: 3.00 }] }; }); }} className="w-full py-5 bg-gray-50/30 hover:bg-blue-50 text-[9px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-all">
                           + Nova Faixa de Distância
                         </button>
                       </div>
                     )}

                     {/* Frete Fixo */}
                     {(logisticsConfig.tiposFrete || []).includes('fixo') && (
                       <div className="space-y-5 p-6 bg-green-50/30 border border-green-100/60 rounded-[32px]">
                         <div className="flex items-center gap-3">
                           <DollarSign size={16} className="text-green-700" />
                           <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Frete Fixo — Taxa única para toda a cidade</span>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valor do Frete (R$)</label>
                             <div className="flex items-center gap-2 bg-white border border-green-100 rounded-2xl px-4 py-3">
                               <span className="text-gray-400 font-medium text-sm">R$</span>
                               <input type="number" step="0.01" value={logisticsConfig.fixedFreightValue} onChange={e => setLogisticsConfig(prev => ({ ...prev, fixedFreightValue: Number(e.target.value) }))} className="flex-1 outline-none font-black text-sm text-gray-900 bg-transparent" />
                             </div>
                           </div>
                           <div>
                             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Frete Grátis acima de (R$)</label>
                             <div className="flex items-center gap-2 bg-white border border-green-100 rounded-2xl px-4 py-3">
                               <span className="text-gray-400 font-medium text-sm">R$</span>
                               <input type="number" step="0.01" value={logisticsConfig.freeAbove} onChange={e => setLogisticsConfig(prev => ({ ...prev, freeAbove: Number(e.target.value) }))} className="flex-1 outline-none font-black text-sm text-gray-900 bg-transparent" />
                             </div>
                             <p className="text-[10px] text-gray-400 mt-1.5 font-medium">0 = desabilitado</p>
                           </div>
                         </div>
                       </div>
                     )}

                     {/* Sob Consulta / Atacado */}
                     {(logisticsConfig.tiposFrete || []).includes('consulta') && (
                       <div className="space-y-5 p-6 bg-purple-50/30 border border-purple-100/60 rounded-[32px]">
                         <div className="flex items-center gap-3">
                           <HelpCircle size={16} className="text-purple-600" />
                           <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Sob Consulta — Atacado / Pedidos Especiais</span>
                         </div>
                         <div className="max-w-xs">
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pedido Mínimo (R$)</label>
                           <div className="flex items-center gap-2 bg-white border border-purple-100 rounded-2xl px-4 py-3">
                             <span className="text-gray-400 font-medium text-sm">R$</span>
                             <input type="number" step="1" value={logisticsConfig.minOrderAtacado} onChange={e => setLogisticsConfig(prev => ({ ...prev, minOrderAtacado: Number(e.target.value) }))} className="flex-1 outline-none font-black text-sm text-gray-900 bg-transparent" />
                           </div>
                         </div>
                         <p className="text-[11px] font-medium text-purple-700/70 leading-relaxed">O valor do frete é calculado após confirmação do pedido. O cliente é notificado antes de confirmar a compra.</p>
                       </div>
                     )}
                  </div>
               )}

               {configStep === 3 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Veículos Habilitados</label>
                        <div className="grid grid-cols-2 gap-4">
                           {logisticsConfig.vehicles.map((v, i) => (
                              <div key={i} className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between ${v.active ? 'border-green-600 bg-green-50/20' : 'border-gray-100 bg-white grayscale'}`}>
                                 <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${v.active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                       {v.type === 'Bicicleta' ? <Zap size={16} /> : v.type === 'Moto' ? <Zap size={16} /> : v.type === 'Carro' ? <Car size={16} /> : <Building2 size={16} />}
                                    </div>
                                    <span className="text-xs font-black text-gray-900">{v.type}</span>
                                 </div>
                                 <button 
                                    className={`w-10 h-6 rounded-full relative transition-all ${v.active ? 'bg-green-600' : 'bg-gray-200'}`}
                                    onClick={() => {
                                       const newVehicles = [...logisticsConfig.vehicles];
                                       newVehicles[i].active = !newVehicles[i].active;
                                       setLogisticsConfig(prev => ({ ...prev, vehicles: newVehicles }));
                                    }}
                                 >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${v.active ? 'right-1' : 'left-1'}`} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logística & API</p>
                        <select className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl font-black text-xs outline-none">
                           <option>PicknGo (Integração Direta)</option>
                           <option>Loggi Express</option>
                           <option>Logística Própria</option>
                        </select>
                     </div>
                  </div>
               )}
            </div>

            <div className="p-10 border-t border-gray-50 flex justify-between items-center bg-gray-50/10 backdrop-blur-md sticky bottom-0 z-20">
               <button onClick={() => setSelectedCity(null)} className="px-8 py-4 text-xs font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-all">
                  Descartar Alterações
               </button>
               <button 
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="px-10 py-5 bg-[#125d30] text-white rounded-3xl font-black text-sm flex items-center gap-3 hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
               >
                  {isSaving ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                     <CheckCircle2 size={20} />
                  )}
                  {isSaving ? 'Sincronizando...' : 'Salvar Configurações da Cidade'}
               </button>
            </div>
          </div>
        </div>
      , document.body)}

      {showZoneModal && (
        <NovaZonaModal
          initialData={editingZone || undefined}
          onClose={() => {
            setShowZoneModal(false);
            setEditingZone(null);
          }}
          onCreated={(updatedZone) => {
            fetchDeliveryZones().then(zones => {
               setRotas(zones.map(zoneToRota));
            });
            setShowZoneModal(false);
            setEditingZone(null);
          }}
        />
      )}

      {showApiKeyModal && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setShowApiKeyModal(false)} 
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] flex flex-col border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <header className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-white">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100/50">
                     <Globe size={28} />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-gray-900 leading-tight tracking-tight">Google Maps API</h2>
                     <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Motor de Geoprocessamento
                     </p>
                  </div>
               </div>
               <button onClick={() => setShowApiKeyModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Plus size={24} className="rotate-45" />
               </button>
            </header>

            <div className="p-10 space-y-8">
              <div className="p-6 bg-blue-50/40 border border-blue-100/50 rounded-3xl flex items-start gap-4">
                <div className="mt-1">
                   <ShieldCheck size={20} className="text-blue-600" />
                </div>
                <p className="text-[13px] font-medium text-blue-900/80 leading-relaxed">
                  Esta chave é vital para o cálculo de fretes por distância e otimização de rotas. <span className="font-bold">Sua chave é armazenada de forma segura.</span>
                </p>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chave de Acesso (API KEY)</label>
                    <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Obter Chave</a>
                 </div>
                 <div className="relative group">
                    <input 
                       type="password" 
                       value={googleApiKey}
                       onChange={(e) => setGoogleApiKey(e.target.value)}
                       placeholder="Insira sua chave AIza..."
                       className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-green-600/20 focus:bg-white rounded-[24px] outline-none font-bold text-gray-900 transition-all shadow-inner" 
                    />
                 </div>
              </div>
            </div>

            <footer className="px-10 py-8 bg-gray-50/50 border-t border-gray-50 flex justify-end gap-4">
               <button 
                  onClick={() => setShowApiKeyModal(false)} 
                  className="px-6 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all"
               >
                  Cancelar
               </button>
               <button 
                  onClick={() => {
                    alert('Chave API salva com sucesso! O sistema usará essa chave para os cálculos de rotas.');
                    setShowApiKeyModal(false);
                  }}
                  className="px-10 py-4 bg-[#125d30] text-white rounded-[20px] font-black text-xs shadow-xl shadow-green-900/20 hover:bg-green-800 transition-all flex items-center gap-3 active:scale-95"
               >
                  <CheckCircle2 size={18} />
                  SALVAR CREDENCIAIS
               </button>
            </footer>
          </div>
        </div>
      , document.body)}

      {showMapPicker && createPortal(
        <div className="fixed inset-0 z-[100002] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 flex flex-col h-[80vh]">
            <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
               <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">Seletor de Localização</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Clique no mapa para identificar as coordenadas</p>
               </div>
               <button onClick={() => setShowMapPicker(false)} className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all">
                  <X size={20} />
               </button>
            </header>

            <div className="flex-1 relative">
                <LeafletMap 
                   selectedCity={newFair.city || 'Brasília'}
                   estado={newFair.uf || 'DF'}
                   isPicker={true}
                   defaultLat={newFair.latitude}
                   defaultLng={newFair.longitude}
                   onSelectCoordinates={(lat, lng) => {
                      setNewFair(prev => ({
                         ...prev,
                         latitude: lat,
                         longitude: lng
                      }));
                   }}
                />
               <div className="absolute bottom-8 left-8 right-8" style={{ zIndex: 1000 }}>
                  <div className="bg-white/90 backdrop-blur-md p-6 rounded-[32px] shadow-2xl border border-white flex flex-col md:flex-row items-center gap-6">
                     <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coordenadas Capturadas</label>
                        <div className="grid grid-cols-2 gap-4">
                           <input 
                              type="text" 
                              placeholder="Latitude"
                              value={newFair.latitude}
                              onChange={(e) => setNewFair(prev => ({ ...prev, latitude: e.target.value }))}
                              className="px-5 py-3 bg-gray-50 border border-transparent focus:border-green-600/20 focus:bg-white rounded-2xl font-bold text-xs"
                           />
                           <input 
                              type="text" 
                              placeholder="Longitude"
                              value={newFair.longitude}
                              onChange={(e) => setNewFair(prev => ({ ...prev, longitude: e.target.value }))}
                              className="px-5 py-3 bg-gray-50 border border-transparent focus:border-green-600/20 focus:bg-white rounded-2xl font-bold text-xs"
                           />
                        </div>
                     </div>
                     <button 
                        onClick={() => setShowMapPicker(false)}
                        className="px-10 py-4 bg-green-700 text-white rounded-[24px] font-black text-xs shadow-xl shadow-green-900/20 hover:bg-green-800 transition-all flex items-center gap-3"
                     >
                        <CheckCircle2 size={18} />
                        CONFIRMAR PONTO NO MAPA
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
