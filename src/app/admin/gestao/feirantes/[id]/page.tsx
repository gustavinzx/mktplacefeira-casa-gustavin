'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCep, formatCep } from '@/lib/cep';
import {
  ChevronRight, Store, Users, ShoppingBag, MapPin, Zap,
  ArrowUpRight, Plus, DollarSign, X, Check, Phone, Mail,
  Calendar, Clock, LayoutDashboard, Box, Truck, TrendingUp,
  Star, CheckCircle2, MoreVertical, Heart, Share2, Loader2,
  ShieldCheck, UserCheck, Lock, Settings, ExternalLink,
  Navigation, Trash2, Edit, Save, AlertCircle, Package,
  Info, Receipt, BarChart3, Camera, Send
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase, getTableName } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { fetchRoles } from '@/lib/database';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vendor {
  id: string; name: string; type: string; category: string;
  email: string; phone: string; location: string; image: string;
  rating: number; sales: string; status: string; followers: number;
  joinDate: string; role_id?: string; is_verified?: boolean;
}
interface Product {
  id: string; name: string; category: string; price: string;
  img: string; unit?: string; pos_linked: boolean;
}
interface FairEntry {
  id: string; name: string; days: string; hours: string;
  location: string; operating_hours?: any;
}
interface DeliveryEntry {
  id: string; fair: string; cutoff: string; window: string;
  method: string; fair_id?: string;
}

type TabType = 'overview' | 'products' | 'fairs' | 'deliveries' | 'financial' | 'contact' | 'permissions' | 'settings';

const DAY_ABBR: Record<string, string> = {
  Segunda: 'Seg', Terça: 'Ter', Quarta: 'Qua', Quinta: 'Qui',
  Sexta: 'Sex', Sábado: 'Sáb', Domingo: 'Dom',
};

function parseHoursLabel(raw: any): { days: string; hours: string } {
  if (!raw) return { days: '—', hours: '—' };
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(arr) && arr.length > 0) {
      const days = arr.map((h: any) => DAY_ABBR[h.day] ?? h.day).join(', ');
      const first = arr[0];
      const hours = `${first.start} - ${first.end}`;
      return { days, hours };
    }
    if (typeof arr === 'object') {
      const keys = Object.keys(arr);
      const days = keys.map(k => DAY_ABBR[k] ?? k).join(', ');
      const first = arr[keys[0]];
      const hours = first?.start ? `${first.start} - ${first.end}` : '—';
      return { days, hours };
    }
  } catch {}
  if (typeof raw === 'string' && raw.trim()) return { days: raw, hours: '—' };
  return { days: '—', hours: '—' };
}

// ─── Modal wrapper — 80% viewport ─────────────────────────────────────────────
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-[5vw]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-100"
        style={{ width: '80vw', height: '80vh' }}
      >
        {children}
      </div>
    </div>
  );
}
function ModalHead({ title, subtitle, onClose, accent = 'gray' }: { title: string; subtitle?: string; onClose: () => void; accent?: string }) {
  const bg: Record<string, string> = { gray: 'bg-gray-50/50', green: 'bg-green-50/60', blue: 'bg-blue-50/60', red: 'bg-red-50/60' };
  return (
    <header className={`px-8 py-6 border-b border-gray-100 flex justify-between items-start ${bg[accent] ?? bg.gray} flex-shrink-0`}>
      <div>
        <h2 className="text-xl font-black text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm font-medium text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 mt-0.5 flex-shrink-0">
        <X size={20} />
      </button>
    </header>
  );
}
function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto p-8 space-y-6">{children}</div>;
}
function ModalFoot({ children }: { children: React.ReactNode }) {
  return <footer className="px-8 py-5 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50 flex-shrink-0">{children}</footer>;
}

const FIELD = 'w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20';
const LABEL = 'text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block';

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminFeirantePerfilPage() {
  const params = useParams();
  const vendorId = params.id as string;
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [logisticsConfig, setLogisticsConfig] = useState<any>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [fairs, setFairs] = useState<FairEntry[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryEntry[]>([]);

  // Edit profile modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileTab, setEditProfileTab] = useState('visao');
  const [editProfileForm, setEditProfileForm] = useState({
    full_name: '', business_name: '', email: '', phone: '',
    cpf_cnpj: '', specialty: '', user_type: 'varejista', status: 'pending',
    avatar_url: '', banner_url: '',
    country: 'Brasil', city: '', state: '', address: '', zip: '',
    vat_tax_id: '', bank_name: '', account_iban: '', pix_key: '', payment_method: 'PIX',
    instagram: '', facebook: '', twitter: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productActionModal, setProductActionModal] = useState<Product | null>(null);
  const [isLinkFairOpen, setIsLinkFairOpen] = useState(false);
  const [editFairModal, setEditFairModal] = useState<FairEntry | null>(null);
  const [isAddDeliveryOpen, setIsAddDeliveryOpen] = useState(false);
  const [editDeliveryModal, setEditDeliveryModal] = useState<DeliveryEntry | null>(null);

  // ── Produto form (POS-style) ──────────────────────────────────────────────
  const [npName, setNpName] = useState('');
  const [npImageUrl, setNpImageUrl] = useState('');
  const [npPrice, setNpPrice] = useState('');
  const [npUnit, setNpUnit] = useState('');
  const [npOrganic, setNpOrganic] = useState(false);
  const [npFresh, setNpFresh] = useState(false);
  const [npStock, setNpStock] = useState('');
  const [npThreshold, setNpThreshold] = useState('');
  const [npIsVariable, setNpIsVariable] = useState(false);
  const [npVariations, setNpVariations] = useState<{ id: string; amount: string; price: string }[]>([]);
  const [npVarAmount, setNpVarAmount] = useState('');
  const [npVarPrice, setNpVarPrice] = useState('');
  const [npSuggestions, setNpSuggestions] = useState<any[]>([]);
  const [npSearching, setNpSearching] = useState(false);
  const [globalUnits, setGlobalUnits] = useState<any[]>([]);
  const [isSavingNewProduct, setIsSavingNewProduct] = useState(false);

  // Form states
  const [newDelivery, setNewDelivery] = useState({ fair: '', cutoffDay: 'Sexta', cutoffTime: '18:00', windowDay: 'Sábado', windowStart: '07:00', windowEnd: '10:00', method: 'Retirada na Barraca' });

  const modules = [
    { key: 'dashboard', name: 'Dashboard & Overview' },
    { key: 'usuarios', name: 'Usuários & Perfis' },
    { key: 'feirantes', name: 'Gestão de Feirantes' },
    { key: 'logistica', name: 'Logística & Hub' },
    { key: 'financeiro', name: 'Financeiro & ERP' },
    { key: 'marketing', name: 'Marketing & CRM' },
    { key: 'configuracoes', name: 'Configurações do Sistema' },
  ];
  const actions = [
    { key: 'view', name: 'Ver' }, { key: 'create', name: 'Criar' },
    { key: 'edit', name: 'Editar' }, { key: 'delete', name: 'Excluir' },
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Try mktplace_feira_partners first (primary table used by the directory)
      const [fetchedRoles, { data: partnerRow, error: partnerErr }] = await Promise.all([
        fetchRoles(),
        supabase
          .from('mktplace_feira_partners')
          .select('id, email, full_name, phone, cpf_cnpj, business_name, specialty, user_type, status, avatar_url, created_at')
          .eq('id', vendorId)
          .maybeSingle(),
      ]);

      setRoles(fetchedRoles || []);

      // Fallback: try mktplace_feira_producers if not found in partners
      let partner: any = partnerRow;
      let fromProducers = false;
      if (!partner) {
        const { data: prod } = await supabase
          .from('mktplace_feira_producers')
          .select(`id, stall_name, is_verified, status, created_at, rating,
            mktplace_feira_profiles ( email, full_name, avatar_url, user_type ),
            mktplace_feira_fairs ( id, name, city, region, operating_hours )`)
          .eq('id', vendorId)
          .maybeSingle();
        partner = prod;
        fromProducers = !!prod;
      }

      if (!partner) { setLoading(false); return; }

      const joinDate = new Date(partner.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      if (fromProducers) {
        const profile = partner.mktplace_feira_profiles;
        const fair = partner.mktplace_feira_fairs;
        setVendor({
          id: partner.id, name: partner.stall_name || profile?.full_name || 'Banca sem nome',
          type: profile?.user_type === 'chef' ? 'Chef' : 'Varejista',
          category: '—', email: profile?.email || '—', phone: '—',
          location: fair ? `${fair.city} - ${fair.region || 'Centro'}` : '—',
          image: profile?.avatar_url || `https://i.pravatar.cc/150?u=${partner.id}`,
          rating: partner.rating || 0, sales: '—',
          status: partner.status === 'approved' ? 'Ativo' : partner.status === 'pending' ? 'Pendente' : 'Suspenso',
          followers: 0, joinDate, is_verified: partner.is_verified,
          role_id: partner.role_id || fetchedRoles[0]?.id,
        });
      } else {
        const p = partner;
        const typeLabel = p.user_type === 'chef' ? 'Chef' : p.user_type === 'atacadista' ? 'Atacadista' : 'Varejista';
        setVendor({
          id: p.id, name: p.business_name || p.full_name || 'Feirante sem nome',
          type: typeLabel, category: p.specialty || '—',
          email: p.email || '—', phone: p.phone || '—', location: '—',
          image: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.business_name || p.full_name || 'F')}&background=random`,
          rating: 0, sales: '—',
          status: p.status === 'approved' ? 'Ativo' : p.status === 'pending' ? 'Pendente' : 'Suspenso',
          followers: 0, joinDate, is_verified: false,
          role_id: fetchedRoles[0]?.id,
        });
        const baseForm = {
          full_name: p.full_name || '', business_name: p.business_name || '',
          email: p.email || '', phone: p.phone || '',
          cpf_cnpj: p.cpf_cnpj || '', specialty: p.specialty || '',
          user_type: p.user_type || 'varejista', status: p.status || 'pending',
          avatar_url: p.avatar_url || '', banner_url: '',
          country: 'Brasil', city: '', state: '', address: '', zip: '',
          vat_tax_id: '', bank_name: '', account_iban: '', pix_key: '', payment_method: 'PIX',
          instagram: '', facebook: '', twitter: '',
        };
        // Load extra fields stored in site_settings
        const { data: extras } = await supabase
          .from(getTableName('site_settings'))
          .select('key, value')
          .like('key', `partner_${vendorId}_%`);
        if (extras?.length) {
          extras.forEach((row: any) => {
            const shortKey = row.key.replace(`partner_${vendorId}_`, '');
            if (shortKey in baseForm) (baseForm as any)[shortKey] = row.value || '';
          });
        }
        setEditProfileForm(baseForm);
      }

      // Load products linked to this vendor
      const { data: prods } = await supabase
        .from(getTableName('products'))
        .select('id, title, image_url, price, unit, category, pos_id')
        .eq('producer_id', vendorId);

      if (prods?.length) {
        setProducts(prods.map((pp: any) => ({
          id: pp.id, name: pp.title, category: pp.category || '—',
          price: pp.price ? Number(pp.price).toFixed(2) : '0,00',
          img: pp.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
          unit: pp.unit || 'un', pos_linked: !!pp.pos_id,
        })));
      } else {
        setProducts([]);
      }

      // Load fairs linked to this vendor (pos_fairs or single fair)
      const { data: posFairs } = await supabase
        .from(getTableName('pos_fairs'))
        .select(`*, ${getTableName('fairs')} ( id, name, city, region, operating_hours )`)
        .eq('producer_id', vendorId);

      const producerFair = fromProducers ? (partner as any).mktplace_feira_fairs : null;

      if (posFairs?.length) {
        setFairs(posFairs.map((pf: any) => {
          const f = pf[getTableName('fairs')] ?? pf.mktplace_feira_fairs ?? {};
          const parsed = parseHoursLabel(f.operating_hours);
          return { id: pf.id, name: f.name || '—', days: parsed.days, hours: parsed.hours, location: f.city || '—', operating_hours: f.operating_hours };
        }));
      } else if (producerFair) {
        const parsed = parseHoursLabel(producerFair.operating_hours);
        setFairs([{ id: producerFair.id, name: producerFair.name, days: parsed.days, hours: parsed.hours, location: producerFair.city, operating_hours: producerFair.operating_hours }]);
      } else {
        setFairs([]);
      }

      // Load deliveries / logistics config
      const { data: logConf } = await supabase
        .from(getTableName('logistics_configs'))
        .select('*')
        .limit(1)
        .maybeSingle();

      if (logConf) setLogisticsConfig(logConf);

      // Load real delivery schedules from site_settings or separate table
      const { data: deliveryData } = await supabase
        .from(getTableName('site_settings'))
        .select('value')
        .eq('key', `partner_${vendorId}_deliveries`)
        .maybeSingle();
        
      if (deliveryData && deliveryData.value) {
        try {
          const parsedDeliveries = JSON.parse(deliveryData.value);
          setDeliveries(Array.isArray(parsedDeliveries) ? parsedDeliveries : []);
        } catch(e) { setDeliveries([]); }
      } else {
        setDeliveries([]);
      }

    } catch (err) {
      console.error('Error loading vendor profile:', err);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Load units when add-product modal opens
  useEffect(() => {
    if (!isAddProductOpen) return;
    supabase.from('mktplace_feira_measurement_units').select('*').order('name').then(({ data }) => {
      if (data?.length) {
        setGlobalUnits(data);
        setNpUnit(prev => prev || data[0].abbreviation);
      }
    });
  }, [isAddProductOpen]);

  // Autocomplete search as user types
  useEffect(() => {
    if (npName.trim().length < 2) { setNpSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setNpSearching(true);
      try {
        const { data } = await supabase
          .from('mktplace_feira_products')
          .select('title, image_url, unit')
          .ilike('title', `%${npName.trim()}%`)
          .is('pos_id', null)
          .limit(8);
        const seen = new Set<string>();
        setNpSuggestions((data ?? []).filter((r: any) => {
          const k = r.title.toLowerCase();
          if (seen.has(k)) return false;
          seen.add(k); return true;
        }));
      } catch { /* ignore */ } finally { setNpSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [npName]);

  function resetNpForm() {
    setNpName(''); setNpImageUrl(''); setNpPrice(''); setNpUnit(globalUnits[0]?.abbreviation ?? '');
    setNpOrganic(false); setNpFresh(false); setNpStock(''); setNpThreshold('');
    setNpIsVariable(false); setNpVariations([]); setNpVarAmount(''); setNpVarPrice('');
    setNpSuggestions([]);
  }

  async function saveNewProduct() {
    if (!npName.trim()) return;
    setIsSavingNewProduct(true);
    try {
      const rows = npIsVariable && npVariations.length > 0
        ? npVariations.map(v => ({
            producer_id: vendorId, title: `${npName} - ${v.amount} ${npUnit}`,
            price: parseFloat(v.price) || 0, unit: npUnit,
            is_organic: npOrganic, tags: npFresh ? ['Frescor Diário'] : [],
            stock: parseInt(npStock) || 0, low_stock_threshold: parseInt(npThreshold) || 0,
            image_url: npImageUrl || null,
          }))
        : [{
            producer_id: vendorId, title: npName,
            price: parseFloat(npPrice) || 0, unit: npUnit,
            is_organic: npOrganic, tags: npFresh ? ['Frescor Diário'] : [],
            stock: parseInt(npStock) || 0, low_stock_threshold: parseInt(npThreshold) || 0,
            image_url: npImageUrl || null,
          }];
      const { error } = await supabase.from(getTableName('products')).insert(rows);
      if (error) throw error;
      // Refresh product list
      const { data: prods } = await supabase
        .from(getTableName('products'))
        .select('id, title, image_url, price, unit, category, pos_id')
        .eq('producer_id', vendorId);
      if (prods) {
        setProducts(prods.map((pp: any) => ({
          id: pp.id, name: pp.title, category: pp.category || '—',
          price: pp.price ? Number(pp.price).toFixed(2) : '0,00',
          img: pp.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
          unit: pp.unit || 'un', pos_linked: !!pp.pos_id,
        })));
      }
      resetNpForm();
    } catch (err: any) {
      showToast('Erro ao salvar: ' + (err.message ?? err), 'error');
    } finally { setIsSavingNewProduct(false); }
  }

  async function approveFeirante() {
    if (!vendor) return;
    const { error } = await supabase.from('mktplace_feira_partners').update({ status: 'approved' }).eq('id', vendor.id);
    if (!error) setVendor(prev => prev ? { ...prev, status: 'Ativo', is_verified: true } : null);
    else showToast('Erro ao aprovar feirante', 'error');
  }

  async function handleProfileZip(raw: string) {
    const formatted = formatCep(raw);
    setEditProfileForm(f => ({ ...f, zip: formatted }));
    const data = await fetchCep(formatted);
    if (data) {
      setEditProfileForm(f => ({
        ...f,
        address: data.logradouro || f.address,
        city: data.localidade,
        state: data.uf,
      }));
    }
  }

  async function uploadVendorImage(file: File, type: 'avatar' | 'banner'): Promise<string | null> {
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `vendor-assets/${vendorId}/${type}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
      return publicUrl;
    } catch { return null; }
  }

  async function saveEditProfile() {
    if (!vendor) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('mktplace_feira_partners')
        .update({
          full_name: editProfileForm.full_name || null,
          business_name: editProfileForm.business_name || null,
          email: editProfileForm.email,
          phone: editProfileForm.phone || null,
          cpf_cnpj: editProfileForm.cpf_cnpj || null,
          specialty: editProfileForm.specialty || null,
          user_type: editProfileForm.user_type,
          status: editProfileForm.status,
          avatar_url: editProfileForm.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendor.id);
      if (error) throw error;

      // Save extra fields to site_settings
      const extraKeys = ['banner_url', 'country', 'city', 'state', 'address', 'zip',
        'vat_tax_id', 'bank_name', 'account_iban', 'pix_key', 'payment_method',
        'instagram', 'facebook', 'twitter'];
      try {
        await supabase.from(getTableName('site_settings')).upsert(
          extraKeys.map(k => ({ key: `partner_${vendor.id}_${k}`, value: (editProfileForm as any)[k] || '' })),
          { onConflict: 'key' }
        );
      } catch { /* table may not have unique constraint on key — ignore */ }

      const typeLabel = editProfileForm.user_type === 'chef' ? 'Chef' : editProfileForm.user_type === 'atacadista' ? 'Atacadista' : 'Varejista';
      setVendor(prev => prev ? {
        ...prev,
        name: editProfileForm.business_name || editProfileForm.full_name || prev.name,
        type: typeLabel, category: editProfileForm.specialty || prev.category,
        email: editProfileForm.email, phone: editProfileForm.phone || '—',
        status: editProfileForm.status === 'approved' ? 'Ativo' : editProfileForm.status === 'pending' ? 'Pendente' : 'Suspenso',
        image: editProfileForm.avatar_url || prev.image,
      } : null);
      setIsEditProfileOpen(false);
    } catch (err: any) {
      showToast('Erro ao salvar: ' + (err.message ?? err), 'error');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function saveRoleId(roleId: string) {
    setIsSavingRole(true);
    setVendor(prev => prev ? { ...prev, role_id: roleId } : null);
    setIsSavingRole(false);
  }

  function addDeliveryFromForm() {
    const d = newDelivery;
    const entry: DeliveryEntry = {
      id: Date.now().toString(),
      fair: d.fair || (fairs[0]?.name ?? '—'),
      cutoff: `${d.cutoffDay} ${d.cutoffTime}`,
      window: `${d.windowDay} ${d.windowStart} - ${d.windowEnd}`,
      method: d.method,
    };
    setDeliveries(prev => [...prev, entry]);
    setIsAddDeliveryOpen(false);
    setNewDelivery({ fair: '', cutoffDay: 'Sexta', cutoffTime: '18:00', windowDay: 'Sábado', windowStart: '07:00', windowEnd: '10:00', method: 'Retirada na Barraca' });
  }

  function saveEditDelivery() {
    if (!editDeliveryModal) return;
    setDeliveries(prev => prev.map(d => d.id === editDeliveryModal.id ? editDeliveryModal : d));
    setEditDeliveryModal(null);
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-green-700" size={48} />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Carregando Perfil do Feirante...</p>
      </div>
    );
  }
  if (!vendor) return <div className="p-10 text-gray-500 font-bold">Feirante não encontrado.</div>;

  const TABS = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Catálogo', icon: Box },
    { id: 'fairs', label: 'Feiras', icon: MapPin },
    { id: 'deliveries', label: 'Horários / Entregas', icon: Truck },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'contact', label: 'Contatos', icon: Phone },
    { id: 'permissions', label: 'Acessos', icon: ShieldCheck },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/gestao/feirantes" className="hover:text-green-700 transition-colors">Gestão de Feirantes</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Perfil: {vendor.name}</span>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden p-10">
        <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-green-50 shadow-xl">
              <img src={vendor.image} className="w-full h-full object-cover" alt={vendor.name} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2 rounded-xl shadow-lg">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{vendor.name}</h1>
              <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit bg-blue-50 text-blue-600">{vendor.type}</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-500">
              <div className="flex items-center gap-2"><MapPin size={16} className="text-green-700" />{vendor.location}</div>
              <div className="flex items-center gap-2"><Users size={16} className="text-green-700" />{vendor.followers} Seguidores</div>
              <div className="flex items-center gap-2"><Calendar size={16} className="text-green-700" />No portal desde {vendor.joinDate}</div>
            </div>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-red-500 hover:bg-red-50 transition-all"><Heart size={20} /></button>
            <button className="flex-1 lg:flex-none px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-green-700 hover:bg-green-50 transition-all"><Share2 size={20} /></button>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex-1 lg:flex-none px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl hover:text-green-700 hover:bg-green-50 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Edit size={16} /> Editar
            </button>
            {vendor.status === 'Pendente' && (
              <button onClick={approveFeirante} className="flex-[2] lg:flex-none px-8 py-4 bg-green-700 text-white rounded-[24px] font-bold shadow-lg hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Aprovar
              </button>
            )}
            <Link href="/portal/feirante" className="flex-[2] lg:flex-none px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg hover:bg-green-800 transition-all active:scale-95 flex items-center justify-center gap-2" target="_blank">
              <ExternalLink size={18} /> Acessar Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-2 bg-white border border-gray-100 rounded-[32px] shadow-sm">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)}
            className={`w-full px-6 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-green-700 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
            <tab.icon size={16} />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Vendas Totais', value: vendor.sales, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Avaliação Média', value: vendor.rating.toString(), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                { label: 'Faturamento (Mês)', value: 'R$ 12.4k', icon: DollarSign, color: 'text-green-700', bg: 'bg-green-50' },
                { label: 'Acompanhamento', value: 'Em Dia', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}><stat.icon size={24} /></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-gray-900">Atividades Recentes</h3>
                  <button className="text-[10px] font-black text-green-700 uppercase tracking-widest hover:underline">Ver Todas</button>
                </div>
                <div className="space-y-6">
                  {[
                    { action: 'Produto atualizado', item: 'Laranja Lima kg', time: 'Há 2 horas', icon: Box, bg: 'bg-blue-50', color: 'text-blue-600' },
                    { action: 'Nova venda confirmada', item: 'Pedido #8542', time: 'Há 4 horas', icon: ShoppingBag, bg: 'bg-green-50', color: 'text-green-700' },
                    { action: 'Presença confirmada', item: 'Feira de Pinheiros', time: 'Hoje, 07:00', icon: MapPin, bg: 'bg-purple-50', color: 'text-purple-600' },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${act.bg} ${act.color} rounded-xl flex items-center justify-center`}><act.icon size={18} /></div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900">{act.action}</p>
                        <p className="text-xs text-gray-400 font-bold">{act.item}</p>
                      </div>
                      <span className="text-[10px] text-gray-300 font-black uppercase">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#125d30] p-10 rounded-[48px] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/10 rounded-2xl"><Users size={24} /></div>
                    <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest">Growth +24%</span>
                  </div>
                  <div className="mt-8">
                    <p className="text-sm opacity-60 font-medium">Comunidade e Seguidores</p>
                    <h3 className="text-5xl font-black mt-2">852</h3>
                    <p className="text-xs opacity-40 mt-4 leading-relaxed max-w-[250px]">Pessoas que acompanham seus produtos e são notificadas em cada nova oferta.</p>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 blur-3xl rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* ── CATÁLOGO ── */}
        {activeTab === 'products' && (
          <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">Catálogo de Produtos</h3>
                <p className="text-gray-400 font-medium text-sm">
                  Todos os produtos de {vendor.name}. Ao criar um ponto de venda, os produtos são vinculados automaticamente.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsAddProductOpen(true)} className="px-8 py-4 bg-gray-900 text-white rounded-[24px] font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2">
                  <Plus size={20} /> Adicionar Produto
                </button>
                <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2 shadow-md">
                  <Store size={18} /> Acessar Loja
                </button>
              </div>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
              <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-blue-700">
                Produtos marcados com <span className="font-black">PDV</span> já estão vinculados a um ponto de venda ativo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(prod => (
                <div key={prod.id} className="p-6 bg-gray-50 rounded-[32px] border border-transparent hover:border-green-600/20 transition-all group relative">
                  <div className="w-full h-40 bg-white rounded-2xl mb-6 overflow-hidden">
                    <img src={prod.img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={prod.name} />
                  </div>
                  {prod.pos_linked && (
                    <span className="absolute top-8 left-8 bg-green-700 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">PDV</span>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{prod.category}</p>
                      <h4 className="text-lg font-black text-gray-900 leading-tight">{prod.name}</h4>
                    </div>
                    <button onClick={() => setProductActionModal(prod)} className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PREÇO</p>
                      <p className="text-xl font-black text-gray-900">R$ {prod.price}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[9px] font-black uppercase tracking-widest">Em Estoque</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FEIRAS ── */}
        {activeTab === 'fairs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-900 leading-tight">Presença em Feiras</h3>
                <button onClick={() => setIsLinkFairOpen(true)} className="px-6 py-3 bg-blue-50 text-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2">
                  <MapPin size={14} /> Vincular Nova Feira
                </button>
              </div>
              <div className="space-y-4">
                {fairs.map(fair => (
                  <div key={fair.id} className="p-8 bg-gray-50 rounded-[32px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-700 shadow-sm border border-gray-100">
                        <Store size={32} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-gray-900">{fair.name}</h4>
                        <p className="text-sm font-bold text-gray-400">{fair.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto items-center">
                      <div className="flex-1 md:flex-none p-4 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-[130px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={11} /> DIAS</p>
                        <p className="text-xs font-black text-gray-900">{fair.days}</p>
                      </div>
                      <div className="flex-1 md:flex-none p-4 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-[130px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={11} /> HORÁRIO</p>
                        <p className="text-xs font-black text-gray-900">{fair.hours}</p>
                      </div>
                      <button onClick={() => setEditFairModal(fair)} className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-green-700 hover:border-green-300 transition-all flex-shrink-0">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raio / Freight */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gray-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-5">
                  <div className="p-3 bg-white/10 rounded-2xl w-fit"><Truck size={28} className="text-blue-400" /></div>
                  <h4 className="text-xl font-black">Raio de Operação</h4>
                  <p className="text-sm opacity-60 font-medium leading-relaxed">Distância máxima para entregas próprias ou via 3PL.</p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-50">
                      <span>Raio Atual</span>
                      <span>{logisticsConfig?.raio_km ?? 24} KM</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                        style={{ width: `${Math.min(100, ((logisticsConfig?.raio_km ?? 24) / 100) * 100)}%` }} />
                    </div>
                  </div>
                  {logisticsConfig?.tipos_frete?.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">Modalidades de Frete</p>
                      <div className="flex flex-wrap gap-2">
                        {logisticsConfig.tipos_frete.map((t: string) => (
                          <span key={t} className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full" />
              </div>
              <Link href="/admin/logistica/rotas" className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[28px] shadow-sm hover:border-green-300 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center"><Navigation size={18} /></div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Gestão de Rotas</p>
                    <p className="text-xs text-gray-400 font-medium">Ver tabela completa de frete</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-gray-300 group-hover:text-green-700 transition-colors" />
              </Link>
            </div>
          </div>
        )}

        {/* ── HORÁRIOS / ENTREGAS ── */}
        {activeTab === 'deliveries' && (
          <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">Horários e Entregas</h3>
                <p className="text-gray-400 font-medium text-sm">Janelas de retirada e entrega vinculadas às feiras cadastradas.</p>
              </div>
              <button onClick={() => setIsAddDeliveryOpen(true)} className="px-8 py-4 bg-gray-900 text-white rounded-[24px] font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2">
                <Plus size={20} /> Novo Horário
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deliveries.map(del => (
                <div key={del.id} className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 hover:border-green-600/20 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center"><Truck size={24} /></div>
                      <div>
                        <h4 className="font-black text-gray-900">{del.fair}</h4>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">{del.method}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditDeliveryModal({ ...del })} className="p-2 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setDeliveries(prev => prev.filter(d => d.id !== del.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={10} /> Corte de Pedidos</p>
                      <p className="text-sm font-black text-gray-900">{del.cutoff}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={10} /> Janela de Entrega</p>
                      <p className="text-sm font-black text-gray-900">{del.window}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FINANCEIRO ── */}
        {activeTab === 'financial' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Saldo Disponível', value: 'R$ 4.250,00', icon: DollarSign, color: 'text-green-700', bg: 'bg-green-50', dark: false },
                { label: 'Lançamentos Futuros', value: 'R$ 1.120,50', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', dark: false },
                { label: 'Total Repassado (Mês)', value: 'R$ 18.940,00', icon: TrendingUp, color: 'text-white', bg: 'bg-white/10', dark: true },
              ].map((s, i) => (
                <div key={i} className={`p-8 rounded-[40px] flex flex-col justify-between relative overflow-hidden ${s.dark ? 'bg-gray-900 text-white shadow-xl' : 'bg-white border border-gray-100 shadow-sm'}`}>
                  <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6`}><s.icon size={24} /></div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${s.dark ? 'text-white/50' : 'text-gray-400'}`}>{s.label}</p>
                    <h3 className={`text-3xl font-black ${s.dark ? 'text-white' : 'text-gray-900'}`}>{s.value}</h3>
                  </div>
                  {s.dark && <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 blur-2xl rounded-full" />}
                </div>
              ))}
            </div>

            {/* Commission breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Comissão Feira.Casa (12%)', value: 'R$ 2.272,80', icon: Receipt, color: 'text-purple-600' },
                { label: 'Taxa de Plataforma (3%)', value: 'R$ 568,20', icon: BarChart3, color: 'text-orange-500' },
                { label: 'Bruto do Período', value: 'R$ 18.940,00', icon: Package, color: 'text-blue-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm flex items-center gap-5">
                  <div className={`w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center ${s.color}`}><s.icon size={22} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <h4 className="text-xl font-black text-gray-900">{s.value}</h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-6">Últimos Repasses</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      {['Data', 'Transação', 'Pedidos', 'Bruto', 'Comissão', 'Líquido', 'Status'].map(h => (
                        <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { date: '24/05/2026', id: 'REP-003', orders: 28, gross: 'R$ 6.320,00', fee: 'R$ 948,00', net: 'R$ 5.372,00', status: 'Pendente' },
                      { date: '17/05/2026', id: 'REP-002', orders: 35, gross: 'R$ 7.840,00', fee: 'R$ 1.176,00', net: 'R$ 6.664,00', status: 'Concluído' },
                      { date: '10/05/2026', id: 'REP-001', orders: 31, gross: 'R$ 7.210,00', fee: 'R$ 1.081,50', net: 'R$ 6.128,50', status: 'Concluído' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4 text-sm font-bold text-gray-500">{row.date}</td>
                        <td className="px-5 py-4 text-sm font-black text-gray-900">{row.id}</td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-600">{row.orders}</td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-700">{row.gross}</td>
                        <td className="px-5 py-4 text-sm font-bold text-red-500">-{row.fee}</td>
                        <td className="px-5 py-4 text-sm font-black text-green-700">{row.net}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${row.status === 'Concluído' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTATOS ── */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            {/* Internal badge */}
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
              <Lock size={16} className="text-amber-600 shrink-0" />
              <p className="text-sm font-bold text-amber-700">
                <strong>Uso Interno:</strong> Estes dados de contato são visíveis apenas para a equipe da Feira.Casa e nunca são exibidos ao usuário final.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-700 rounded-2xl"><Phone size={24} /></div>
                  <h3 className="text-2xl font-black text-gray-900">Canais de Contato</h3>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-3xl flex items-center gap-6 group hover:bg-green-50 transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-green-700 shadow-sm"><Phone size={20} /></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp / Telefone</p>
                      <p className="text-lg font-black text-gray-900">{vendor.phone}</p>
                    </div>
                    <ArrowUpRight size={20} className="text-gray-300 group-hover:text-green-700" />
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl flex items-center gap-6 group hover:bg-blue-50 transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 shadow-sm"><Mail size={20} /></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail Corporativo</p>
                      <p className="text-lg font-black text-gray-900">{vendor.email}</p>
                    </div>
                    <ArrowUpRight size={20} className="text-gray-300 group-hover:text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><MapPin size={24} /></div>
                  <h3 className="text-2xl font-black text-gray-900">Endereço da Sede</h3>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                  <p className="text-sm font-bold text-gray-600 leading-relaxed">
                    {vendor.location || 'Endereço não cadastrado'}
                  </p>
                  <div className="pt-4 border-t border-gray-200">
                    <button className="text-[11px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                      <Navigation size={14} /> Abrir no Google Maps
                    </button>
                  </div>
                </div>
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-amber-700">Este endereço não é exibido ao cliente. É para uso interno e logística da plataforma.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACESSOS ── */}
        {activeTab === 'permissions' && (
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-700 rounded-2xl"><UserCheck size={24} /></div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">Perfil de Acesso</h3>
                    <p className="text-gray-400 font-medium text-sm">Vincule este feirante a um perfil de permissões.</p>
                  </div>
                </div>
                <Link href="/admin/usuarios/permissoes" className="px-6 py-3 bg-blue-50 text-blue-700 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2">
                  <Settings size={14} /> Gerenciar Perfis
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map(role => (
                  <button key={role.id} onClick={() => saveRoleId(role.id)} disabled={isSavingRole}
                    className={`p-6 rounded-[32px] border-2 text-left transition-all disabled:opacity-60 ${vendor.role_id === role.id ? 'border-green-600 bg-green-50/20 shadow-md' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: role.color || '#15803d' }}><ShieldCheck size={20} /></div>
                      {vendor.role_id === role.id && <CheckCircle2 size={20} className="text-green-600" />}
                    </div>
                    <h4 className="font-black text-gray-900 mb-1">{role.name}</h4>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{role.description || 'Sem descrição.'}</p>
                  </button>
                ))}
              </div>
            </div>
            {vendor.role_id && (() => {
              const selectedRole = roles.find(r => r.id === vendor.role_id);
              if (!selectedRole) return null;
              const isAll = selectedRole.permissions?.all;
              return (
                <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/30">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl"><Lock size={24} /></div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900">Permissões Herdadas</h3>
                        <p className="text-sm text-gray-400 font-medium">Matriz do perfil <span className="font-black text-gray-700">"{selectedRole.name}"</span> — somente leitura.</p>
                      </div>
                    </div>
                    <Link href="/admin/usuarios/permissoes" className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all">
                      <ExternalLink size={14} /> Editar Permissões do Perfil
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Módulo</th>
                          {actions.map(a => <th key={a.key} className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{a.name}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {modules.map(module => {
                          const mp = selectedRole.permissions?.[module.key] || {};
                          return (
                            <tr key={module.key} className="hover:bg-gray-50/30 transition-all">
                              <td className="px-10 py-5"><p className="text-sm font-black text-gray-900">{module.name}</p></td>
                              {actions.map(action => {
                                const active = isAll || (typeof mp === 'boolean' ? mp : mp[action.key]);
                                return (
                                  <td key={action.key} className="px-6 py-5 text-center">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto ${active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>
                                      {active ? <Check size={16} strokeWidth={4} /> : <X size={16} strokeWidth={4} />}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {isAll && (
                    <div className="px-10 py-6 bg-green-50/50 border-t border-green-100 flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-green-600" />
                      <p className="text-xs font-black text-green-700 uppercase tracking-widest">Este perfil tem Acesso Total a todos os módulos.</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── CONFIGURAÇÕES ── */}
        {activeTab === 'settings' && (
          <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="p-3 bg-gray-50 text-gray-600 rounded-2xl"><Settings size={24} /></div>
              <h3 className="text-2xl font-black text-gray-900">Configurações da Loja</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                <div>
                  <h4 className="font-black text-gray-900">Pausar Loja Temporariamente</h4>
                  <p className="text-xs text-gray-500 font-medium">Oculta os produtos do catálogo para clientes.</p>
                </div>
                <div className="w-14 h-8 bg-gray-300 rounded-full relative cursor-pointer">
                  <div className="w-6 h-6 bg-white rounded-full absolute left-1 top-1 shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-6 bg-red-50 rounded-3xl border border-red-100">
                <div>
                  <h4 className="font-black text-red-900">Banir/Suspender Feirante</h4>
                  <p className="text-xs text-red-700 font-medium">Bloqueia o acesso e remove todos os produtos do ar.</p>
                </div>
                <button className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all">
                  Suspender Conta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: Editar Perfil — layout Dokan ── */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-[5vw]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditProfileOpen(false)} />
          <div className="relative bg-gray-100 rounded-[32px] shadow-2xl overflow-hidden flex flex-col" style={{ width: '80vw', height: '80vh' }}>

            {/* ── Banner ── */}
            <div
              className="relative h-44 flex-shrink-0 bg-gray-900 overflow-hidden cursor-pointer group"
              onClick={() => bannerInputRef.current?.click()}
            >
              {editProfileForm.banner_url
                ? <img src={editProfileForm.banner_url} className="w-full h-full object-cover" alt="banner" />
                : <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-950 flex items-center justify-center">
                    <p className="text-sm font-bold text-gray-500">Clique para adicionar banner</p>
                  </div>
              }
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/90 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-black text-gray-800">
                  <Camera size={14} /> Alterar Banner
                </div>
              </div>
              {/* Close */}
              <button onClick={e => { e.stopPropagation(); setIsEditProfileOpen(false); }}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10">
                <X size={16} />
              </button>
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                const file = e.target.files?.[0]; if (!file) return;
                setEditProfileForm(f => ({ ...f, banner_url: URL.createObjectURL(file) }));
                const url = await uploadVendorImage(file, 'banner');
                if (url) setEditProfileForm(f => ({ ...f, banner_url: url }));
              }} />
            </div>

            {/* ── Profile header ── */}
            <div className="bg-white flex-shrink-0 px-8 pb-3 border-b border-gray-100">
              <div className="flex items-end justify-between">
                <div className="flex items-end gap-5">
                  {/* Avatar */}
                  <div className="relative -mt-14">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200 cursor-pointer"
                      onClick={() => avatarInputRef.current?.click()}>
                      <img
                        src={editProfileForm.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(editProfileForm.business_name || editProfileForm.full_name || 'F')}&background=random`}
                        className="w-full h-full object-cover" alt="avatar" />
                    </div>
                    <button onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-gray-800 text-white rounded-full p-1.5 shadow-lg">
                      <Camera size={11} />
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      setEditProfileForm(f => ({ ...f, avatar_url: URL.createObjectURL(file) }));
                      const url = await uploadVendorImage(file, 'avatar');
                      if (url) setEditProfileForm(f => ({ ...f, avatar_url: url }));
                    }} />
                  </div>
                  <div className="pb-2">
                    <h2 className="text-base font-black text-gray-900 leading-tight">
                      {editProfileForm.business_name || editProfileForm.full_name || vendor.name}
                    </h2>
                    <div className="flex items-center gap-1 text-yellow-400 my-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="currentColor" />)}
                      <span className="text-gray-400 text-[10px] ml-1">0.0 (0)</span>
                    </div>
                    <p className="text-xs text-gray-400">{editProfileForm.specialty || 'Uncategorized'}</p>
                  </div>
                </div>
                <span className={`mb-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  editProfileForm.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {editProfileForm.status === 'approved' ? 'Habilitado' : 'Pendente'}
                </span>
              </div>
            </div>

            {/* ── Body: sidebar + tabs ── */}
            <div className="flex flex-1 overflow-hidden">

              {/* Left sidebar */}
              <div className="w-52 bg-white border-r border-gray-100 flex-shrink-0 overflow-y-auto p-5 space-y-5">
                <div>
                  <p className={LABEL}>Registrado Desde:</p>
                  <p className="text-xs font-bold text-gray-700">{vendor.joinDate}</p>
                </div>
                <div>
                  <p className={LABEL}>Contato:</p>
                  <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1"><Phone size={10} className="text-gray-400" /> {editProfileForm.phone || '—'}</p>
                  <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Mail size={10} className="text-gray-400" /> <span className="truncate">{editProfileForm.email || '—'}</span></p>
                </div>
                <div>
                  <p className={LABEL}>Tipo De Comissão:</p>
                  <p className="text-xs font-bold text-green-700">Baseado Em Categoria</p>
                </div>
                <div>
                  <p className={LABEL}>Publicação De Produtos:</p>
                  <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5"><Clock size={10} className="text-gray-400" /> Requer Revisão</p>
                </div>
                <div>
                  <p className={LABEL}>Subscription:</p>
                  <p className="text-xs text-gray-400">No Subscription Added</p>
                </div>
                <div>
                  <p className={LABEL}>Forma De Pagamento:</p>
                  <p className="text-xs font-bold text-green-700">{editProfileForm.payment_method || 'PIX'}</p>
                </div>
                <div>
                  <p className={LABEL}>Links Sociais:</p>
                  {editProfileForm.instagram || editProfileForm.facebook || editProfileForm.twitter
                    ? <div className="space-y-0.5">
                        {editProfileForm.instagram && <p className="text-xs text-green-700 truncate">Instagram</p>}
                        {editProfileForm.facebook && <p className="text-xs text-green-700 truncate">Facebook</p>}
                        {editProfileForm.twitter && <p className="text-xs text-green-700 truncate">Twitter</p>}
                      </div>
                    : <p className="text-xs text-gray-400">Nenhum Link Social Adicionado</p>
                  }
                </div>
                <button className="w-full py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all uppercase tracking-widest">
                  <Send size={11} /> Send Email
                </button>
              </div>

              {/* Right: tabs */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex border-b border-gray-200 bg-white px-4 flex-shrink-0 overflow-x-auto">
                  {[
                    { id: 'visao', label: 'Visão geral' },
                    { id: 'geral', label: 'Geral' },
                    { id: 'verification', label: 'Verification' },
                    { id: 'subscription', label: 'Subscription' },
                    { id: 'retirar', label: 'Retirar' },
                    { id: 'badges', label: 'Badges' },
                    { id: 'produtos', label: 'Produtos' },
                    { id: 'horarios', label: 'Horários' },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setEditProfileTab(tab.id)}
                      className={`px-4 py-3.5 text-[11px] font-black whitespace-nowrap border-b-2 transition-all ${
                        editProfileTab === tab.id ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">

                  {/* Visão geral */}
                  {editProfileTab === 'visao' && (
                    <div className="space-y-5">
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Store</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Total Products', value: products.length.toString() },
                          { label: 'Item Sold', value: '0' },
                          { label: 'Order Processed', value: '0' },
                          { label: 'Store Visitors', value: '0' },
                        ].map((s, i) => (
                          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <p className="text-[9px] font-medium text-gray-400 mb-2">{s.label}</p>
                            <p className="text-2xl font-black text-gray-900">{s.value}</p>
                          </div>
                        ))}
                      </div>
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sales</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Current Balance', value: 'R$ 0,00' },
                          { label: 'Total Earning', value: 'R$ 0,00' },
                          { label: 'Gross Sales', value: 'R$ 0,00' },
                          { label: 'Refund amount', value: 'R$ 0,00' },
                        ].map((s, i) => (
                          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <p className="text-[9px] font-medium text-gray-400 mb-2">{s.label}</p>
                            <p className="text-lg font-black text-gray-900">{s.value}</p>
                          </div>
                        ))}
                      </div>
                      {products.length > 0 && (
                        <>
                          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Produto Mais Vendido</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {products.slice(0, 4).map(p => (
                              <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 shadow-sm">
                                <img src={p.img} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" alt={p.name} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-xs text-gray-900 truncate">{p.name}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{p.category}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="font-black text-sm text-gray-900">0</p>
                                  <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-bold">Vendido</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Geral */}
                  {editProfileTab === 'geral' && (
                    <div className="space-y-5">
                      {/* Perfil & Endereço */}
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Users size={12} /> Perfil & Endereço
                        </h4>
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                          <div className="grid grid-cols-3 divide-x divide-gray-100">
                            {[
                              { label: 'Nome', field: 'full_name', ph: 'Nome completo' },
                              { label: 'País', field: 'country', ph: 'Brasil' },
                              { label: 'Cidade', field: 'city', ph: 'Ex: São Paulo' },
                            ].map(({ label, field, ph }) => (
                              <div key={field} className="p-4">
                                <label className={LABEL}>{label}</label>
                                <input className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-green-500 pb-1 transition-colors"
                                  value={(editProfileForm as any)[field]} placeholder={ph}
                                  onChange={e => setEditProfileForm(f => ({ ...f, [field]: e.target.value }))} />
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                            <div className="p-4">
                              <label className={LABEL}>Estado</label>
                              <input className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-green-500 pb-1 transition-colors"
                                value={editProfileForm.state} placeholder="Ex: SP"
                                onChange={e => setEditProfileForm(f => ({ ...f, state: e.target.value }))} />
                            </div>
                            <div className="p-4">
                              <label className={LABEL}>Endereço</label>
                              <input className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-green-500 pb-1 transition-colors"
                                value={editProfileForm.address} placeholder="Rua, número, bairro"
                                onChange={e => setEditProfileForm(f => ({ ...f, address: e.target.value }))} />
                            </div>
                            <div className="p-4">
                              <label className={LABEL}>CEP</label>
                              <input className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-green-500 pb-1 transition-colors"
                                value={editProfileForm.zip} placeholder="00000-000" maxLength={9}
                                onChange={e => handleProfileZip(e.target.value)} />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Bank Info */}
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Receipt size={12} /> Bank Info
                        </h4>
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                          <div className="grid grid-cols-3 divide-x divide-gray-100">
                            {[
                              { label: 'Nome Da Empresa', field: 'business_name', ph: 'Razão social' },
                              { label: 'CNPJ / CPF', field: 'cpf_cnpj', ph: '000.000.000-00' },
                              { label: 'VAT / TAX ID', field: 'vat_tax_id', ph: '—' },
                            ].map(({ label, field, ph }) => (
                              <div key={field} className="p-4">
                                <label className={LABEL}>{label}</label>
                                <input className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-green-500 pb-1 transition-colors"
                                  value={(editProfileForm as any)[field]} placeholder={ph}
                                  onChange={e => setEditProfileForm(f => ({ ...f, [field]: e.target.value }))} />
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
                            {[
                              { label: 'Nome do banco', field: 'bank_name', ph: 'Ex: Itaú, Nubank' },
                              { label: 'Conta / IBAN', field: 'account_iban', ph: 'Número da conta' },
                            ].map(({ label, field, ph }) => (
                              <div key={field} className="p-4">
                                <label className={LABEL}>{label}</label>
                                <input className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-green-500 pb-1 transition-colors"
                                  value={(editProfileForm as any)[field]} placeholder={ph}
                                  onChange={e => setEditProfileForm(f => ({ ...f, [field]: e.target.value }))} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Dados Básicos + Links Sociais */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Dados Básicos</h4>
                          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
                            {[
                              { label: 'Nome da Banca', field: 'business_name', ph: 'Ex: Sítio Verde' },
                              { label: 'E-mail', field: 'email', ph: 'email@exemplo.com' },
                              { label: 'Telefone / WhatsApp', field: 'phone', ph: '(11) 99999-9999' },
                              { label: 'Especialidade', field: 'specialty', ph: 'Ex: Frutas Tropicais' },
                            ].map(({ label, field, ph }) => (
                              <div key={field} className="p-3">
                                <label className={LABEL}>{label}</label>
                                <input className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-green-500 pb-0.5 transition-colors"
                                  value={(editProfileForm as any)[field]} placeholder={ph}
                                  onChange={e => setEditProfileForm(f => ({ ...f, [field]: e.target.value }))} />
                              </div>
                            ))}
                            <div className="p-3">
                              <label className={LABEL}>Tipo de Parceiro</label>
                              <select className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none"
                                value={editProfileForm.user_type} onChange={e => setEditProfileForm(f => ({ ...f, user_type: e.target.value }))}>
                                <option value="varejista">Varejista</option>
                                <option value="atacadista">Atacadista</option>
                                <option value="chef">Chef</option>
                              </select>
                            </div>
                            <div className="p-3">
                              <label className={LABEL}>Status</label>
                              <select className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none"
                                value={editProfileForm.status} onChange={e => setEditProfileForm(f => ({ ...f, status: e.target.value }))}>
                                <option value="pending">Pendente</option>
                                <option value="approved">Ativo</option>
                                <option value="suspended">Suspenso</option>
                                <option value="rejected">Rejeitado</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Links Sociais</h4>
                          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
                            {[
                              { label: 'Instagram', field: 'instagram', ph: 'https://instagram.com/...' },
                              { label: 'Facebook', field: 'facebook', ph: 'https://facebook.com/...' },
                              { label: 'Twitter / X', field: 'twitter', ph: 'https://x.com/...' },
                            ].map(({ label, field, ph }) => (
                              <div key={field} className="p-3">
                                <label className={LABEL}>{label}</label>
                                <input className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-green-500 pb-0.5 transition-colors"
                                  value={(editProfileForm as any)[field]} placeholder={ph}
                                  onChange={e => setEditProfileForm(f => ({ ...f, [field]: e.target.value }))} />
                              </div>
                            ))}
                          </div>
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-4 mb-3">Imagens (URL)</h4>
                          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
                            <div className="p-3">
                              <label className={LABEL}>URL do Avatar</label>
                              <input className="w-full text-xs font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-green-500 pb-0.5 transition-colors"
                                value={editProfileForm.avatar_url} placeholder="https://..."
                                onChange={e => setEditProfileForm(f => ({ ...f, avatar_url: e.target.value }))} />
                            </div>
                            <div className="p-3">
                              <label className={LABEL}>URL do Banner</label>
                              <input className="w-full text-xs font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-green-500 pb-0.5 transition-colors"
                                value={editProfileForm.banner_url} placeholder="https://..."
                                onChange={e => setEditProfileForm(f => ({ ...f, banner_url: e.target.value }))} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verification */}
                  {editProfileTab === 'verification' && (
                    <div className="flex flex-col items-center justify-center h-56 text-center">
                      <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={24} className="text-purple-300" />
                      </div>
                      <p className="font-black text-gray-600">Nenhuma Informação Disponível</p>
                      <p className="text-sm text-gray-400 mt-1">As informações precisam ser atualizadas</p>
                    </div>
                  )}

                  {/* Subscription */}
                  {editProfileTab === 'subscription' && (
                    <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <LayoutDashboard size={22} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="font-black text-gray-700">No Subscription Purchased</p>
                        <p className="text-sm text-gray-400 mt-0.5">Once subscription purchased, it will appear</p>
                      </div>
                    </div>
                  )}

                  {/* Retirar */}
                  {editProfileTab === 'retirar' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Conectado</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700 font-medium flex items-center gap-2">
                          <Info size={15} /> Não foram encontrados métodos de pagamento conectados
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Não Conectado</p>
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                          <div className="flex-1">
                            <p className="font-black text-gray-800">PIX</p>
                            <p className="text-xs text-gray-400">Método de pagamento personalizado</p>
                          </div>
                          <span className="text-[9px] font-black px-3 py-1.5 bg-purple-100 text-purple-600 rounded-full uppercase tracking-widest">CUSTOM</span>
                          <input type="text" className={FIELD + ' max-w-[200px] py-2 text-sm'}
                            placeholder="Chave PIX" value={editProfileForm.pix_key}
                            onChange={e => setEditProfileForm(f => ({ ...f, pix_key: e.target.value }))} />
                          <button className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
                            + Adicionar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  {editProfileTab === 'badges' && (
                    <div className="flex flex-col items-center justify-center h-56 text-center">
                      <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={24} className="text-purple-300" />
                      </div>
                      <p className="font-black text-gray-600">No Badge Acquired</p>
                      <p className="text-sm text-gray-400 mt-1">Badges will appear once acquired</p>
                    </div>
                  )}

                  {/* Produtos */}
                  {editProfileTab === 'produtos' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Catálogo de Produtos</h3>
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-black">{products.length} produtos</span>
                      </div>
                      {products.length === 0
                        ? <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                            <Package size={28} className="text-gray-300 mx-auto mb-3" />
                            <p className="font-black text-gray-400 text-sm">Nenhum produto cadastrado</p>
                          </div>
                        : <div className="grid grid-cols-2 gap-3">
                            {products.map(p => (
                              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 flex items-center gap-3 p-4 shadow-sm">
                                <img src={p.img} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt={p.name} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-sm text-gray-900 truncate">{p.name}</p>
                                  <p className="text-[10px] text-gray-400">{p.category}</p>
                                  <p className="text-sm font-black text-green-700">R$ {p.price}</p>
                                </div>
                                {p.pos_linked && <span className="text-[9px] font-black px-2 py-1 bg-green-100 text-green-700 rounded-full">PDV</span>}
                              </div>
                            ))}
                          </div>
                      }
                    </div>
                  )}

                  {/* Horários */}
                  {editProfileTab === 'horarios' && (
                    <div className="space-y-5">
                      {fairs.length === 0
                        ? <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                            <Calendar size={28} className="text-gray-300 mx-auto mb-3" />
                            <p className="font-black text-gray-400 text-sm">Nenhuma feira vinculada</p>
                          </div>
                        : fairs.map(fair => {
                            const fairDeliveries = deliveries.filter(d => d.fair === fair.name || d.fair_id === fair.id);
                            return (
                              <div key={fair.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                <div className="px-5 py-4 bg-green-50 border-b border-green-100 flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Store size={13} className="text-white" />
                                  </div>
                                  <div>
                                    <p className="font-black text-gray-900 text-sm">{fair.name}</p>
                                    <p className="text-[10px] text-gray-500">{fair.location} · {fair.days} · {fair.hours}</p>
                                  </div>
                                </div>
                                {fairDeliveries.length === 0
                                  ? <p className="p-5 text-xs text-gray-400 text-center">Nenhum horário de entrega cadastrado para esta feira</p>
                                  : <div className="divide-y divide-gray-50">
                                      {fairDeliveries.map(d => (
                                        <div key={d.id} className="px-5 py-4 flex items-center justify-between">
                                          <div>
                                            <p className="text-sm font-black text-gray-900">{d.method}</p>
                                            <p className="text-[10px] text-gray-500">Corte: {d.cutoff} · Janela: {d.window}</p>
                                          </div>
                                          <span className="text-[9px] font-black px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full uppercase tracking-widest">{d.method}</span>
                                        </div>
                                      ))}
                                    </div>
                                }
                              </div>
                            );
                          })
                      }
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* ── Footer actions ── */}
            <div className="flex-shrink-0 bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">Última atualização: {vendor.joinDate}</p>
              <div className="flex gap-3">
                <button onClick={() => setIsEditProfileOpen(false)} className="px-6 py-2.5 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all">
                  Cancelar
                </button>
                <button onClick={saveEditProfile} disabled={isSavingProfile}
                  className="px-8 py-2.5 bg-green-700 text-white rounded-2xl font-black text-sm hover:bg-green-600 transition-all disabled:opacity-50 flex items-center gap-2">
                  {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Adicionar Produto (POS-style) ── */}
      {isAddProductOpen && (
        <Modal onClose={() => { setIsAddProductOpen(false); resetNpForm(); }}>
          <ModalHead title="Adicionar Produto" subtitle={`Catálogo de ${vendor.name}`} onClose={() => { setIsAddProductOpen(false); resetNpForm(); }} accent="gray" />
          <div className="flex flex-1 overflow-hidden">

            {/* ── Formulário ── */}
            <div className="flex-1 overflow-y-auto p-8 space-y-5 border-r border-gray-100">

              {/* Foto + Nome + Unidade + Preço */}
              <div className="flex items-end gap-4 relative">
                {/* Foto */}
                <div className="flex-shrink-0">
                  <label className={LABEL}>Foto</label>
                  <div className="w-[48px] h-[48px] bg-gray-50 border border-gray-200 rounded-[16px] flex items-center justify-center overflow-hidden">
                    {npImageUrl
                      ? <img src={npImageUrl} className="w-full h-full object-cover" alt="preview" />
                      : <Package size={18} className="text-gray-300" />}
                  </div>
                </div>

                {/* Nome + autocomplete */}
                <div className="flex-1 relative">
                  <label className={LABEL}>Nome do Produto</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: Tomate Carmem"
                      className={FIELD}
                      value={npName}
                      onChange={e => setNpName(e.target.value)}
                      autoComplete="off"
                    />
                    {npSearching && <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
                  </div>
                  {npSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-52 overflow-y-auto z-[60]">
                      {npSuggestions.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0"
                          onClick={() => { setNpName(s.title); setNpImageUrl(s.image_url || ''); setNpSuggestions([]); }}>
                          {s.image_url
                            ? <img src={s.image_url} className="w-9 h-9 rounded-xl object-cover border border-gray-100" alt={s.title} />
                            : <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"><Package size={14} className="text-gray-400" /></div>}
                          <div>
                            <p className="font-bold text-sm text-gray-900">{s.title}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.unit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unidade */}
                <div className="w-40">
                  <label className={LABEL}>Unidade Base</label>
                  <select className={FIELD} value={npUnit} onChange={e => setNpUnit(e.target.value)}>
                    {globalUnits.map(u => (
                      <option key={u.id} value={u.abbreviation}>{u.name} ({u.abbreviation})</option>
                    ))}
                    {!globalUnits.length && <option value="kg">kg</option>}
                  </select>
                </div>

                {/* Preço (só se não variável) */}
                {!npIsVariable && (
                  <div className="w-32">
                    <label className={LABEL}>Preço</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                      <input type="number" placeholder="0.00" className={`${FIELD} pl-10`}
                        value={npPrice} onChange={e => setNpPrice(e.target.value)} />
                    </div>
                  </div>
                )}

                {/* Variável toggle */}
                <div className="flex-shrink-0">
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-4 rounded-[16px] border transition-colors ${npIsVariable ? 'bg-orange-100 border-orange-300' : 'bg-orange-50 border-orange-100 hover:bg-orange-100'}`}>
                    <input type="checkbox" checked={npIsVariable} className="w-4 h-4 accent-orange-500"
                      onChange={e => { setNpIsVariable(e.target.checked); if (e.target.checked) setNpPrice(''); }} />
                    <span className="text-xs font-bold text-orange-800 whitespace-nowrap">Produto Variável?</span>
                  </label>
                </div>

                {/* Botão adicionar (só se não variável) */}
                {!npIsVariable && (
                  <button onClick={saveNewProduct} disabled={!npName.trim() || isSavingNewProduct}
                    className="w-[48px] h-[48px] bg-green-700 text-white rounded-[16px] flex items-center justify-center hover:bg-green-600 transition-all disabled:opacity-50 flex-shrink-0">
                    {isSavingNewProduct ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                  </button>
                )}
              </div>

              {/* URL da Imagem */}
              <div>
                <label className={LABEL}>URL da Imagem</label>
                <input type="text" placeholder="https://..." className={FIELD}
                  value={npImageUrl} onChange={e => setNpImageUrl(e.target.value)} />
              </div>

              {/* Estoque + Alerta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Estoque Inicial (opcional)</label>
                  <input type="number" placeholder="Ex: 10" className={FIELD}
                    value={npStock} onChange={e => setNpStock(e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>Alerta Baixo Estoque (&lt;=)</label>
                  <input type="number" placeholder="Ex: 2" className={FIELD}
                    value={npThreshold} onChange={e => setNpThreshold(e.target.value)} />
                </div>
              </div>

              {/* Badges Orgânico / Frescor */}
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${npOrganic ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}>
                  <input type="checkbox" className="hidden" checked={npOrganic} onChange={e => setNpOrganic(e.target.checked)} />
                  <div className={`p-2 rounded-xl ${npOrganic ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}><CheckCircle2 size={16} /></div>
                  <div>
                    <p className={`text-sm font-black ${npOrganic ? 'text-green-800' : 'text-gray-700'}`}>Orgânico</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Certificado</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${npFresh ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}>
                  <input type="checkbox" className="hidden" checked={npFresh} onChange={e => setNpFresh(e.target.checked)} />
                  <div className={`p-2 rounded-xl ${npFresh ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}><Clock size={16} /></div>
                  <div>
                    <p className={`text-sm font-black ${npFresh ? 'text-orange-700' : 'text-gray-700'}`}>Frescor Diário</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Colheita Dia</p>
                  </div>
                </label>
              </div>

              {/* Variações (se variável) */}
              {npIsVariable && (
                <div className="space-y-3">
                  <label className={LABEL}>Variações (Peso / Tamanho)</label>
                  <div className="flex gap-3">
                    <input type="text" placeholder="Ex: 500g" className={`${FIELD} flex-1`}
                      value={npVarAmount} onChange={e => setNpVarAmount(e.target.value)} />
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                      <input type="number" placeholder="0.00" className={`${FIELD} pl-10`}
                        value={npVarPrice} onChange={e => setNpVarPrice(e.target.value)} />
                    </div>
                    <button onClick={() => {
                      if (!npVarAmount || !npVarPrice) return;
                      setNpVariations(p => [...p, { id: Date.now().toString(), amount: npVarAmount, price: npVarPrice }]);
                      setNpVarAmount(''); setNpVarPrice('');
                    }} className="w-[48px] h-[48px] bg-orange-500 text-white rounded-[16px] flex items-center justify-center hover:bg-orange-600 flex-shrink-0">
                      <Plus size={18} />
                    </button>
                  </div>
                  {npVariations.map(v => (
                    <div key={v.id} className="flex items-center justify-between px-4 py-2 bg-orange-50 rounded-xl border border-orange-100">
                      <span className="text-sm font-bold text-gray-800">{v.amount} {npUnit} — R$ {parseFloat(v.price).toFixed(2)}</span>
                      <button onClick={() => setNpVariations(p => p.filter(x => x.id !== v.id))} className="text-gray-400 hover:text-red-500 p-1"><X size={14} /></button>
                    </div>
                  ))}
                  {npVariations.length > 0 && (
                    <button onClick={saveNewProduct} disabled={isSavingNewProduct}
                      className="w-full py-3 bg-green-700 text-white rounded-2xl font-black text-sm hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSavingNewProduct ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Salvar Produto Variável
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Lista de produtos já cadastrados ── */}
            <div className="w-80 flex-shrink-0 flex flex-col bg-gray-50">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <h4 className="font-black text-gray-700 text-sm flex items-center gap-2"><Package size={15} /> Produtos na Barraca</h4>
                <span className="text-[10px] font-black bg-green-600 text-white px-2.5 py-1 rounded-full">{products.length} itens</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {products.length === 0
                  ? <div className="flex flex-col items-center justify-center h-40 text-center text-gray-400">
                      <Package size={32} className="mb-2 text-gray-200" />
                      <p className="text-sm font-bold">Nenhum produto ainda</p>
                    </div>
                  : products.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <img src={p.img} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt={p.name} />
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs text-gray-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-500">R$ {p.price} / {p.unit}</p>
                        </div>
                        {p.pos_linked && <span className="text-[9px] font-black px-2 py-0.5 bg-green-100 text-green-700 rounded-full">PDV</span>}
                      </div>
                    ))
                }
              </div>
            </div>
          </div>
          <ModalFoot>
            <button onClick={() => { setIsAddProductOpen(false); resetNpForm(); }} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl text-sm">Fechar</button>
          </ModalFoot>
        </Modal>
      )}

      {/* ── MODAL: Ações do Produto ── */}
      {productActionModal && (
        <Modal onClose={() => setProductActionModal(null)}>
          <ModalHead title={productActionModal.name} subtitle={`Categoria: ${productActionModal.category}`} onClose={() => setProductActionModal(null)} />
          <ModalBody>
            <div className="flex flex-col items-center gap-6 py-8">
              <img src={productActionModal.img} className="w-48 h-48 rounded-3xl object-cover shadow-xl" alt="" />
              <div className="grid grid-cols-1 w-full max-w-sm gap-4">
                <button onClick={() => setProductActionModal(null)} className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl flex items-center gap-4 text-gray-700 font-bold hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm text-left">
                  <Edit size={20} /> Editar Informações
                </button>
                <button onClick={() => { setProducts(products.filter(p => p.id !== productActionModal.id)); setProductActionModal(null); }}
                  className="w-full p-5 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-4 text-red-600 font-bold hover:bg-red-100 transition-all shadow-sm text-left">
                  <Trash2 size={20} /> Excluir Produto
                </button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}

      {/* ── MODAL: Vincular Feira ── */}
      {isLinkFairOpen && (
        <Modal onClose={() => setIsLinkFairOpen(false)}>
          <ModalHead title="Vincular Nova Feira" subtitle={`Adicionar presença de ${vendor.name} em uma feira`} onClose={() => setIsLinkFairOpen(false)} accent="blue" />
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={LABEL}>Selecionar Feira</label>
                <select className={FIELD}>
                  <option>Feira Orgânica do Ibirapuera</option>
                  <option>Feira de Santana</option>
                  <option>Feira Livre de Goiânia</option>
                  <option>Mercado do Agricultor</option>
                </select>
              </div>
              <div>
                <label className={LABEL}>Dia(s) de Operação</label>
                <select className={FIELD}>
                  {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Horário de Abertura</label>
                <input type="time" className={FIELD} defaultValue="07:00" />
              </div>
              <div>
                <label className={LABEL}>Horário de Encerramento</label>
                <input type="time" className={FIELD} defaultValue="14:00" />
              </div>
              <div>
                <label className={LABEL}>Número da Banca</label>
                <input type="text" placeholder="Ex: Banca 42-A" className={FIELD} />
              </div>
            </div>
          </ModalBody>
          <ModalFoot>
            <button onClick={() => setIsLinkFairOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl">Cancelar</button>
            <button onClick={() => setIsLinkFairOpen(false)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg flex items-center gap-2">
              <MapPin size={18} /> Vincular
            </button>
          </ModalFoot>
        </Modal>
      )}

      {/* ── MODAL: Editar Feira ── */}
      {editFairModal && (
        <Modal onClose={() => setEditFairModal(null)}>
          <ModalHead title={`Editar: ${editFairModal.name}`} subtitle="Horários e informações da banca" onClose={() => setEditFairModal(null)} accent="green" />
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={LABEL}>Nome da Feira</label>
                <input type="text" className={FIELD} value={editFairModal.name} onChange={e => setEditFairModal(f => f ? { ...f, name: e.target.value } : null)} />
              </div>
              <div>
                <label className={LABEL}>Dia(s) de Operação</label>
                <input type="text" className={FIELD} value={editFairModal.days} onChange={e => setEditFairModal(f => f ? { ...f, days: e.target.value } : null)} placeholder="Ex: Sáb, Dom" />
              </div>
              <div>
                <label className={LABEL}>Horário</label>
                <input type="text" className={FIELD} value={editFairModal.hours} onChange={e => setEditFairModal(f => f ? { ...f, hours: e.target.value } : null)} placeholder="Ex: 07:00 - 14:00" />
              </div>
              <div className="md:col-span-2">
                <label className={LABEL}>Localização / Endereço</label>
                <input type="text" className={FIELD} value={editFairModal.location} onChange={e => setEditFairModal(f => f ? { ...f, location: e.target.value } : null)} />
              </div>
            </div>
          </ModalBody>
          <ModalFoot>
            <button onClick={() => setEditFairModal(null)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl">Cancelar</button>
            <button onClick={() => { setFairs(prev => prev.map(f => f.id === editFairModal!.id ? editFairModal! : f)); setEditFairModal(null); }}
              className="px-8 py-3 bg-green-700 text-white font-bold rounded-2xl hover:bg-green-800 shadow-lg flex items-center gap-2">
              <Save size={18} /> Salvar Alterações
            </button>
          </ModalFoot>
        </Modal>
      )}

      {/* ── MODAL: Novo Horário de Entrega ── */}
      {isAddDeliveryOpen && (
        <Modal onClose={() => setIsAddDeliveryOpen(false)}>
          <ModalHead title="Novo Horário de Entrega" subtitle="Defina corte de pedidos e janela de retirada/entrega" onClose={() => setIsAddDeliveryOpen(false)} accent="green" />
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={LABEL}>Feira / Ponto de Venda</label>
                <select className={FIELD} value={newDelivery.fair} onChange={e => setNewDelivery(d => ({ ...d, fair: e.target.value }))}>
                  <option value="">Selecione uma feira...</option>
                  {fairs.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Dia de Corte (Cut-off)</label>
                <select className={FIELD} value={newDelivery.cutoffDay} onChange={e => setNewDelivery(d => ({ ...d, cutoffDay: e.target.value }))}>
                  {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Horário do Corte</label>
                <input type="time" className={FIELD} value={newDelivery.cutoffTime} onChange={e => setNewDelivery(d => ({ ...d, cutoffTime: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Dia da Janela de Entrega</label>
                <select className={FIELD} value={newDelivery.windowDay} onChange={e => setNewDelivery(d => ({ ...d, windowDay: e.target.value }))}>
                  {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Início da Janela</label>
                <input type="time" className={FIELD} value={newDelivery.windowStart} onChange={e => setNewDelivery(d => ({ ...d, windowStart: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Fim da Janela</label>
                <input type="time" className={FIELD} value={newDelivery.windowEnd} onChange={e => setNewDelivery(d => ({ ...d, windowEnd: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className={LABEL}>Método de Entrega</label>
                <select className={FIELD} value={newDelivery.method} onChange={e => setNewDelivery(d => ({ ...d, method: e.target.value }))}>
                  {['Retirada na Barraca', 'Frota Própria', 'PicknGo', 'Loggi Express', 'Uber Direct', 'Motoboy Parceiro'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </ModalBody>
          <ModalFoot>
            <button onClick={() => setIsAddDeliveryOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl">Cancelar</button>
            <button onClick={addDeliveryFromForm} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black shadow-lg flex items-center gap-2">
              <Save size={18} /> Salvar Horário
            </button>
          </ModalFoot>
        </Modal>
      )}

      {/* ── MODAL: Editar Horário de Entrega ── */}
      {editDeliveryModal && (
        <Modal onClose={() => setEditDeliveryModal(null)}>
          <ModalHead title="Editar Horário de Entrega" subtitle={editDeliveryModal.fair} onClose={() => setEditDeliveryModal(null)} accent="green" />
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={LABEL}>Feira / Ponto de Venda</label>
                <input type="text" className={FIELD} value={editDeliveryModal.fair} onChange={e => setEditDeliveryModal(d => d ? { ...d, fair: e.target.value } : null)} />
              </div>
              <div>
                <label className={LABEL}>Corte de Pedidos</label>
                <input type="text" className={FIELD} value={editDeliveryModal.cutoff} onChange={e => setEditDeliveryModal(d => d ? { ...d, cutoff: e.target.value } : null)} placeholder="Ex: Sexta 18:00" />
              </div>
              <div>
                <label className={LABEL}>Janela de Entrega</label>
                <input type="text" className={FIELD} value={editDeliveryModal.window} onChange={e => setEditDeliveryModal(d => d ? { ...d, window: e.target.value } : null)} placeholder="Ex: Sáb 07:00 - 10:00" />
              </div>
              <div className="md:col-span-2">
                <label className={LABEL}>Método de Entrega</label>
                <select className={FIELD} value={editDeliveryModal.method} onChange={e => setEditDeliveryModal(d => d ? { ...d, method: e.target.value } : null)}>
                  {['Retirada na Barraca', 'Frota Própria', 'PicknGo', 'Loggi Express', 'Uber Direct', 'Motoboy Parceiro'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </ModalBody>
          <ModalFoot>
            <button onClick={() => setEditDeliveryModal(null)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl">Cancelar</button>
            <button onClick={saveEditDelivery} className="px-8 py-3 bg-green-700 text-white font-bold rounded-2xl hover:bg-green-800 shadow-lg flex items-center gap-2">
              <Save size={18} /> Salvar Alterações
            </button>
          </ModalFoot>
        </Modal>
      )}

    </div>
  );
}
