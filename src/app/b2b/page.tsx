import { useCurrentUser } from '@/hooks/useCurrentUser';
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import { SkeletonCard } from '@/components/Skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import {
  LayoutDashboard,
  Store,
  Receipt,
  Wallet,
  Building2,
  Search,
  ShoppingCart,
  Bell,
  Truck,
  Heart,
  Plus,
  Loader2,
  Check,
  Download,
  ArrowRight,
  User,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

const B2B_DISCOUNT = 0.85;
const MIN_KG = 20;
const MIN_OTHER = 10;

type ApiProduct = {
  id: string;
  title: string;
  price: number;
  unit: string;
  image_url?: string;
  is_organic?: boolean;
  producer?: { id?: string; stall_name?: string };
};

type B2bProduct = {
  id: string;
  name: string;
  producer: string;
  producerId?: string;
  price: number;
  oldPrice: number;
  unit: string;
  minOrder: string;
  boxPrice: number;
  imageUrl: string;
};

function mapProduct(p: ApiProduct): B2bProduct {
  const base = Number(p.price);
  const b2bPrice = Math.round(base * B2B_DISCOUNT * 100) / 100;
  const unit = p.unit?.toLowerCase() || 'un';
  const minQty = unit === 'kg' ? MIN_KG : MIN_OTHER;
  const boxPrice = Math.round(b2bPrice * minQty * 100) / 100;

  return {
    id: p.id,
    name: p.title,
    producer: p.producer?.stall_name || 'Produtor parceiro',
    producerId: p.producer?.id,
    price: b2bPrice,
    oldPrice: base,
    unit: p.unit,
    minOrder: `${minQty} ${p.unit}`,
    boxPrice,
    imageUrl: p.image_url || '/images/tomato.png',
  };
}

import { useCartStore } from '@/store/useCartStore';

function addToCart(product: B2bProduct, minQty: number) {
  useCartStore.getState().addItem({
    id: product.id,
    title: product.name,
    price: product.price,
    unit: product.unit,
    quantity: minQty,
    imageUrl: product.imageUrl,
    producer: product.producer,
    producer_id: product.producerId,
  });
}

function B2bOrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const formattedDate = new Date(order.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const statusColors: Record<string, { bg: string, text: string }> = {
    pendente: { bg: '#fef3c7', text: '#d97706' },
    pago: { bg: '#d1fae5', text: '#059669' },
    preparando: { bg: '#dbeafe', text: '#2563eb' },
    saiu_para_entrega: { bg: '#e0e7ff', text: '#4f46e5' },
    entregue: { bg: '#f3f4f6', text: '#4b5563' },
    cancelado: { bg: '#fee2e2', text: '#dc2626' }
  };
  
  const statusLabel: Record<string, string> = {
    pendente: 'Aguardando Pagamento',
    pago: 'Faturado',
    preparando: 'Preparando Lote',
    saiu_para_entrega: 'Em Entrega',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
  };

  const style = statusColors[order.status] || { bg: '#f3f4f6', text: '#4b5563' };
  const label = statusLabel[order.status] || order.status;

  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24, transition: 'box-shadow 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ minWidth: 100 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Código</span>
          <h4 style={{ margin: 0, fontSize: 15, color: '#111827', fontFamily: 'monospace' }}>#{order.id.slice(0, 8).toUpperCase()}</h4>
        </div>
        <div style={{ minWidth: 100 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Data</span>
          <p style={{ margin: 0, fontSize: 14, color: '#4b5563', fontWeight: 600 }}>{formattedDate}</p>
        </div>
        <div style={{ minWidth: 120 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Total Faturado</span>
          <p style={{ margin: 0, fontSize: 15, color: '#0e6b17', fontWeight: 800 }}>R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</p>
        </div>
        <div style={{ minWidth: 120 }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 800,
            backgroundColor: style.bg,
            color: style.text,
            textTransform: 'uppercase'
          }}>
            {label}
          </span>
        </div>
        <div>
          <button 
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'transparent',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {expanded ? 'Ocultar Itens' : 'Ver Itens'}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Itens do Lote Atacado</h5>
          <div style={{ display: 'grid', gap: 12 }}>
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {item.product?.image_url && (
                    <img src={item.product.image_url} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  )}
                  <div>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{item.product?.title || 'Produto'}</span>
                    <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{item.quantity} {item.product?.unit || 'un'}</span>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: '#374151' }}>R$ {Number(item.price_at_time * item.quantity).toFixed(2).replace('.', ',')}</span>
              </div>
            )) || (
              <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Sem detalhes de itens disponíveis.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function B2BPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalogo' | 'pedidos' | 'faturamento' | 'dados'>('catalogo');
  
  const [products, setProducts] = useState<B2bProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const cartCount = useCartStore(state => state.getItemCount());
  const [addedId, setAddedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userName, setUserName] = useState('');
  const [companyLine, setCompanyLine] = useState('Comprador atacadista');
  const [isLogged, setIsLogged] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // States para Pedidos
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // States para Dados Empresa
  const [companyForm, setCompanyForm] = useState({
    companyName: 'Mercado Seu Antoin',
    cnpj: '82.122.321/0001-99',
    ie: '124.582.129.110',
    email: 'junior@seuantoin.com.br',
    phone: '(61) 98213-7349',
    address: 'SCS Quadra 4, Bloco A, N 100, Asa Sul, Brasília - DF, CEP 70300-000'
  });
  const [savingForm, setSavingForm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Sync tab from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['dashboard', 'catalogo', 'pedidos', 'faturamento', 'dados'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const initB2B = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
      fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            setUserProfile(data.data);
            if (data.data.full_name) {
              setUserName(data.data.full_name);
            }
            // Update form with real profile details
            setCompanyForm(prev => ({
              ...prev,
              companyName: data.data.company_name || prev.companyName,
              cnpj: data.data.cnpj || prev.cnpj,
              phone: data.data.phone || prev.phone,
              email: data.data.email || prev.email,
            }));
            if (data.data.company_name) setCompanyLine(data.data.company_name);
          }
        })
        .catch(() => {});

      supabase.auth.getUser().then(({ data }) => {
        const m = data.user?.user_metadata;
        if (m) {
          if (m.company_name) {
            setCompanyLine(String(m.company_name));
            setCompanyForm(prev => ({ ...prev, companyName: String(m.company_name) }));
          }
          if (m.cnpj) {
            setCompanyForm(prev => ({ ...prev, cnpj: String(m.cnpj) }));
            if (!m.company_name) setCompanyLine(String(m.cnpj));
          }
        }
      });
    }
    
    };
    initB2B();

  }, []);

  // Load products (Wholesale catalog)
  useEffect(() => {
    setLoading(true);
    const q = search.trim() ? `&q=${encodeURIComponent(search.trim())}` : '';
    const t = setTimeout(() => {
      fetch(`/api/products?limit=40${q}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data?.products?.length) {
            setProducts(data.data.products.map(mapProduct));
          } else {
            setProducts([]);
          }
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }, search ? 300 : 0);

    return () => clearTimeout(t);
  }, [search]);

  // Load orders when relevant tabs are active
  useEffect(() => {
    const loadTabOrders = async () => {
      if ((activeTab === 'pedidos' || activeTab === 'dashboard') && isLogged) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;
      setLoadingOrders(true);
      fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            const rawOrders = Array.isArray(data.data) ? data.data : (data.data?.orders || []);
            setOrders(rawOrders);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
      }
    };
    loadTabOrders();
  }, [activeTab, isLogged]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.producer.toLowerCase().includes(q),
    );
  }, [products, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleAdd = (p: B2bProduct) => {
    const unit = p.unit?.toLowerCase() || 'un';
    const minQty = unit === 'kg' ? MIN_KG : MIN_OTHER;
    addToCart(p, minQty);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingForm(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { error } = await supabase.from('profiles').update({
        company_name: companyForm.companyName,
        cnpj: companyForm.cnpj,
        phone: companyForm.phone
      }).eq('id', user.id);
      
      if (!error) {
        setCompanyLine(companyForm.companyName || companyForm.cnpj);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingForm(false);
    }
  };

  const avatarLetter = (userName || 'J').charAt(0).toUpperCase();

  // Dashboard Stats Calculations
  const activeOrdersCount = orders.filter(o => ['pendente', 'pago', 'preparando', 'saiu_para_entrega'].includes(o.status)).length;
  const totalFaturadoEsteMes = useMemo(() => {
    return orders
      .filter(o => o.status === 'pago' || o.status === 'entregue')
      .reduce((acc, curr) => acc + Number(curr.total_amount), 0);
  }, [orders]);

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.profileBox}>
            <div className={styles.avatar} style={{ backgroundColor: '#0e6b17', color: 'white' }}>{avatarLetter}</div>
            <div>
              <p className={styles.portalName} style={{ color: '#0e6b17' }}>
                {userName || 'Portal B2B'}
              </p>
              <p className={styles.cnpj} style={{ fontWeight: 600 }}>{companyLine}</p>
            </div>
          </div>

          <nav className={styles.nav}>
            <button 
              type="button" 
              className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`} 
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'catalogo' ? styles.active : ''}`}
              onClick={() => setActiveTab('catalogo')}
            >
              <Store size={20} /> Catálogo
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'pedidos' ? styles.active : ''}`}
              onClick={() => setActiveTab('pedidos')}
            >
              <Receipt size={20} /> Meus Pedidos
            </button>
            <button 
              type="button" 
              className={`${styles.navItem} ${activeTab === 'faturamento' ? styles.active : ''}`}
              onClick={() => setActiveTab('faturamento')}
            >
              <Wallet size={20} /> Faturamento
            </button>
            <button 
              type="button" 
              className={`${styles.navItem} ${activeTab === 'dados' ? styles.active : ''}`}
              onClick={() => setActiveTab('dados')}
            >
              <Building2 size={20} /> Dados Empresa
            </button>
          </nav>

          {!isLogged && (
            <p className={styles.loginHint}>
              <Link href="/login?next=/b2b">Entrar</Link> ou{' '}
              <Link href="/signup/b2b">cadastrar empresa</Link> para pedidos.
            </p>
          )}

          <div className={styles.creditBox} style={{ background: 'rgba(14, 107, 23, 0.05)', border: '1px solid rgba(14, 107, 23, 0.1)' }}>
            <p className={styles.creditLabel} style={{ color: '#0e6b17' }}>Status do Limite</p>
            <div className={styles.progressBar}>
              <div style={{ width: isLogged ? '60%' : '0%', backgroundColor: '#0e6b17' }} />
            </div>
            <p className={styles.creditInfo} style={{ color: '#4b5563', fontWeight: 600 }}>
              {isLogged
                ? 'R$ 9.000,00 disponíveis de R$ 15.000,00'
                : 'Faça login para ver seu limite'}
            </p>
          </div>
        </aside>

        <main className={styles.content}>
          
          {/* 1. TAB: CATALOGO */}
          {activeTab === 'catalogo' && (
            <>
              <header className={styles.contentHeader}>
                <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
                  <Search size={18} />
                  <input
                    type="search"
                    placeholder="Buscar produtores ou produtos em atacado..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </form>
                <div className={styles.headerActions}>
                  <button
                    type="button"
                    title="Notificações"
                    onClick={() => showToast('Você não tem novas notificações no momento.', 'info')}
                  >
                    <Bell size={20} />
                  </button>
                  <Link href="/cart" className={styles.cartBtn} title="Ver carrinho">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && <span>{cartCount}</span>}
                  </Link>
                </div>
              </header>

              <section className={styles.heroGrid}>
                <div className={styles.heroMain}>
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbNaydZr16CQ8qQ2VV2LJYJ90oKtsiiy9JnKyJndGAcleI-unXg-U-W-mzWHgfLNtLybdS3XefjaPoIbWKrCxUZGPGnhdxUF-RET34EiA3Q75y8vdLKMWPldn_xCIYHuWPB6cLaV5lPlXNfLq3OyHJNpReoT4vpYiNvhUV57ffB7ufB1KSwJg4YOm_G0dXERrn1lcVxWHSeHrJatyRTXKMF4a8p-xLYk8OIT_CvqX4b2fLF5N4HVf1chwSWrxzOFWbZz5Quw3ygAM"
                    alt="Hortifruti"
                  />
                  <div className={styles.heroOverlay}>
                    <span className={styles.badge} style={{ backgroundColor: '#0e6b17' }}>Oferta da Semana</span>
                    <h2>
                      Hortifruti Fresco <br />
                      Direto do Produtor
                    </h2>
                    <p>Condições exclusivas para faturamentos acima de R$ 5.000,00.</p>
                    <button type="button" className={styles.btnPrimary} style={{ backgroundColor: '#0e6b17' }} onClick={() => {
                      document.getElementById('catalogo-b2b')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      Explorar Ofertas
                    </button>
                  </div>
                </div>
                <div className={styles.heroSide} style={{ backgroundColor: '#0b612e' }}>
                  <h3>Pedido Mínimo</h3>
                  <p>Aproveite frete grátis para sua região em pedidos acima de R$ 1.200,00.</p>
                  <div className={styles.shippingInfo}>
                    <div>
                      <span>Próxima Saída</span>
                      <strong>Amanhã, 04:00</strong>
                    </div>
                    <Truck size={32} />
                  </div>
                </div>
              </section>

              <div id="catalogo-b2b" className={styles.catalogHeader}>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Catálogo atacado</h3>
                <p>Preços com ~15% de desconto sobre o varejo · mínimo por caixa/saco</p>
              </div>

              {loading ? (
                <div className={styles.productGrid}>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : filtered.length === 0 ? (
                <p className={styles.statusMsg}>
                  Nenhum produto encontrado.{' '}
                  {search ? 'Tente outra busca.' : 'O catálogo está sendo atualizado pelos produtores.'}
                </p>
              ) : (
                <div className={styles.productGrid}>
                  {filtered.map((p) => (
                    <article key={p.id} className={styles.productCard}>
                      <div className={styles.cardImage}>
                        <Link href={`/product/${p.id}`}>
                          <img src={p.imageUrl} alt={p.name} />
                        </Link>
                        <div className={styles.cardBadges}>
                          <span className={styles.tagGreen} style={{ backgroundColor: '#0e6b17' }}>Colhido hoje</span>
                          <span className={styles.tagOrange} style={{ backgroundColor: '#ea580c' }}>-15% Atacado</span>
                        </div>
                        <button
                          type="button"
                          className={styles.btnFav}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFavorites(prev => {
                              const next = new Set(prev);
                              if (next.has(p.id)) next.delete(p.id);
                              else next.add(p.id);
                              return next;
                            });
                          }}
                        >
                          <Heart size={20} fill={favorites.has(p.id) ? "#ef4444" : "none"} color={favorites.has(p.id) ? "#ef4444" : "#999"} />
                        </button>
                      </div>
                      <div className={styles.cardContent}>
                        <p className={styles.producer}>{p.producer}</p>
                        <h4>
                          <Link href={`/product/${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {p.name}
                          </Link>
                        </h4>
                        <div className={styles.priceRow}>
                          <p className={styles.oldPrice} style={{ textDecoration: 'line-through' }}>Varejo: R$ {Number(p.oldPrice || 0).toFixed(2)}</p>
                          <p className={styles.mainPrice} style={{ color: '#0e6b17' }}>
                            R$ {Number(p.price || 0).toFixed(2)}
                            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 400 }}>/{p.unit}</span>
                          </p>
                        </div>
                        <div className={styles.bulkInfo}>
                          <div className={styles.bulkRow}>
                            <span>Mín. Atacado:</span>
                            <strong>{p.minOrder}</strong>
                          </div>
                          <div className={styles.bulkRow}>
                            <span>Preço lote:</span>
                            <strong className={styles.boxPrice} style={{ color: '#0e6b17' }}>
                              R$ {Number(p.boxPrice || 0).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`${styles.btnAdd} ${addedId === p.id ? styles.btnAddDone : ''}`}
                          style={{ backgroundColor: addedId === p.id ? '#0b612e' : '#0e6b17', border: 'none', cursor: 'pointer' }}
                          onClick={() => handleAdd(p)}
                        >
                          {addedId === p.id ? (
                            <>
                              <Check size={16} /> Adicionado!
                            </>
                          ) : (
                            <>
                              <Plus size={16} /> Adicionar ao Pedido
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {cartCount > 0 && (
                <div className={styles.checkoutBar} style={{ borderLeft: '4px solid #0e6b17' }}>
                  <span>{cartCount} itens no pedido de atacado</span>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    style={{ backgroundColor: '#0e6b17', border: 'none', cursor: 'pointer', borderRadius: '12px', padding: '12px 24px' }}
                    onClick={() => {
                      if (!isLogged) {
                        router.push('/login?next=/cart');
                        return;
                      }
                      router.push('/cart');
                    }}
                  >
                    Revisar Lote e Checkout
                  </button>
                </div>
              )}
            </>
          )}

          {/* 2. TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontSize: 28, color: '#111827', margin: 0 }}>Bem-vindo ao Painel Corporativo</h1>
                  <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Visão geral e relatórios para {companyForm.companyName}.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setActiveTab('catalogo')} style={{ backgroundColor: '#0e6b17', color: 'white', border: 'none', padding: '12px 20px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Store size={18} /> Novo Pedido
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>Crédito Ativo</span>
                    <Wallet size={20} color="#0e6b17" />
                  </div>
                  <h3 style={{ fontSize: 24, margin: 0, color: '#111827', fontWeight: 800 }}>R$ 15.000,00</h3>
                  <div style={{ height: 6, background: '#eee', borderRadius: 3, margin: '16px 0 8px 0', overflow: 'hidden' }}>
                    <div style={{ width: '40%', height: '100%', background: '#0e6b17' }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 600 }}>R$ 9.000,00 disponíveis (60%)</span>
                </div>

                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>Faturamento (Mês)</span>
                    <DollarSign size={20} color="#0e6b17" />
                  </div>
                  <h3 style={{ fontSize: 24, margin: 0, color: '#111827', fontWeight: 800 }}>R$ {totalFaturadoEsteMes.toFixed(2).replace('.', ',')}</h3>
                  <p style={{ fontSize: 12, color: '#059669', margin: '14px 0 0 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>↑ 12%</span> <span style={{ color: '#6b7280', fontWeight: 500 }}>vs mês anterior</span>
                  </p>
                </div>

                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>Pedidos Ativos</span>
                    <Truck size={20} color="#0e6b17" />
                  </div>
                  <h3 style={{ fontSize: 24, margin: 0, color: '#111827', fontWeight: 800 }}>{activeOrdersCount} Lotes</h3>
                  <p style={{ fontSize: 12, color: '#4b5563', margin: '14px 0 0 0', fontWeight: 600 }}>
                    Próxima saída: Amanhã às 04:00
                  </p>
                </div>
              </div>

              {/* Chart & Activity Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr', gap: 24, alignItems: 'start' }}>
                {/* CSS Gráfico de Consumo */}
                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 24px 0', color: '#111827' }}>Histórico de Compras (Atacado)</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 180, borderBottom: '2px solid #f3f4f6', paddingBottom: 8 }}>
                    {[
                      { label: 'Jan', val: 70, money: 'R$ 4.200' },
                      { label: 'Fev', val: 90, money: 'R$ 5.400' },
                      { label: 'Mar', val: 50, money: 'R$ 3.000' },
                      { label: 'Abr', val: 120, money: 'R$ 7.200' },
                      { label: 'Mai', val: 110, money: 'R$ 6.600' }
                    ].map((bar, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                        <div style={{ 
                          width: 32, 
                          height: `${bar.val}px`, 
                          background: 'linear-gradient(180deg, #0e6b17 0%, rgba(14,107,23,0.3) 100%)', 
                          borderRadius: '6px 6px 0 0',
                          position: 'relative',
                          cursor: 'pointer'
                        }} title={bar.money}>
                          <div style={{
                            position: 'absolute',
                            top: -28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#111827',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 10,
                            whiteSpace: 'nowrap',
                            fontWeight: 700
                          }}>{bar.money}</div>
                        </div>
                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Últimas Notificações / Informativos */}
                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: '#111827' }}>Informativos Atacado</h3>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: '#0e6b17', marginTop: 6 }} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: 13, color: '#111827' }}>Novos Feirantes B2B</h4>
                        <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#6b7280' }}>Mais 3 produtores de legumes orgânicos de Brasília aderiram ao catálogo B2B.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: '#ea580c', marginTop: 6 }} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: 13, color: '#111827' }}>Fechamento da Fatura</h4>
                        <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#6b7280' }}>Sua fatura fecha no dia 30 de cada mês com vencimento automático para o dia 05.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Últimos Pedidos Recentes */}
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24, marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#111827' }}>Últimos Pedidos</h3>
                  <button onClick={() => setActiveTab('pedidos')} style={{ background: 'none', border: 'none', color: '#0e6b17', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Ver todos <ArrowRight size={16} />
                  </button>
                </div>

                {loadingOrders ? (
                  <p style={{ color: '#6b7280', fontSize: 13 }}>Carregando...</p>
                ) : orders.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: 13 }}>Nenhum pedido faturado recentemente.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafafa', borderRadius: 12 }}>
                        <div>
                          <strong style={{ fontSize: 14 }}>#{order.id.slice(0, 8).toUpperCase()}</strong>
                          <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 12 }}>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ fontWeight: 700, color: '#0e6b17' }}>R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 800,
                            backgroundColor: order.status === 'pago' ? '#d1fae5' : '#fef3c7',
                            color: order.status === 'pago' ? '#059669' : '#d97706',
                            textTransform: 'uppercase'
                          }}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. TAB: MEUS PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div style={{ padding: '8px 0' }}>
              <h2 style={{ fontSize: 24, marginBottom: 8, color: '#111827', fontWeight: 800 }}>Histórico de Pedidos Atacado</h2>
              <p style={{ color: '#6b7280', marginBottom: 32 }}>Acompanhe os lotes comprados, status de entrega e faturamento de suas mercadorias.</p>

              {loadingOrders ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 32 }}>
                  <Loader2 size={24} className="animate-spin" color="#0e6b17" />
                  <span style={{ color: '#6b7280' }}>Carregando seus pedidos de atacado...</span>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 24, padding: 48, textAlign: 'center' }}>
                  <Receipt size={48} style={{ color: '#ccc', marginBottom: 16 }} />
                  <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 24 }}>Nenhum pedido faturado encontrado para esta conta.</p>
                  <button onClick={() => setActiveTab('catalogo')} style={{ background: '#0e6b17', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Explorar Catálogo Atacado
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {orders.map(order => (
                    <B2bOrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. TAB: FATURAMENTO */}
          {activeTab === 'faturamento' && (
            <div style={{ padding: '8px 0' }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Faturamento e Notas Fiscais</h1>
              <p style={{ color: '#6b7280', marginBottom: 32 }}>Acompanhe o limite corporativo e os boletos de faturamento da sua empresa.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
                 <div style={{ padding: 24, background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Faturas em Aberto</h3>
                    <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0 }}>R$ 0,00</p>
                    <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginTop: 12 }}>Ciclo atual fecha em 4 dias.</span>
                 </div>
                 <div style={{ padding: 24, background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Limite de Crédito Ativo</h3>
                    <p style={{ fontSize: 28, fontWeight: 800, color: '#0e6b17', margin: 0 }}>R$ 15.000,00</p>
                    <span style={{ fontSize: 11, color: '#4b5563', display: 'block', marginTop: 12, fontWeight: 600 }}>R$ 9.000,00 disponíveis para compra.</span>
                 </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: 24 }}>
                 <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#111827' }}>Histórico de Boletos de Fechamento</h3>
                 
                 <div style={{ display: 'grid', gap: 12 }}>
                   {[
                     { id: '202605', date: '05/06/2026', amt: '1.450,00', status: 'A vencer' },
                     { id: '202604', date: '05/05/2026', amt: '2.300,50', status: 'Pago' },
                     { id: '202603', date: '05/04/2026', amt: '1.980,00', status: 'Pago' }
                   ].map((item) => (
                     <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid #f3f4f6', borderRadius: 12 }}>
                       <div>
                         <strong style={{ fontSize: 14, color: '#374151' }}>Fatura #{item.id}</strong>
                         <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 16 }}>Vencimento: {item.date}</span>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                         <span style={{ fontWeight: 700, color: '#374151' }}>R$ {item.amt}</span>
                         <span style={{
                           fontSize: 10,
                           fontWeight: 800,
                           padding: '2px 8px',
                           borderRadius: 6,
                           backgroundColor: item.status === 'Pago' ? '#d1fae5' : '#fef3c7',
                           color: item.status === 'Pago' ? '#059669' : '#d97706',
                           textTransform: 'uppercase'
                         }}>{item.status}</span>
                         
                         <button 
                           onClick={() => showToast(`O download do PDF do boleto #${item.id} foi iniciado com sucesso!`, 'success')}
                           style={{
                             background: 'transparent',
                             border: '1px solid #d1d5db',
                             width: 32,
                             height: 32,
                             borderRadius: 8,
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             cursor: 'pointer',
                             color: '#4b5563'
                           }}
                           title="Baixar Boleto PDF"
                         >
                           <Download size={16} />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {/* 5. TAB: DADOS EMPRESA */}
          {activeTab === 'dados' && (
            <div style={{ padding: '8px 0' }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Dados Cadastrais da Empresa</h1>
              <p style={{ color: '#6b7280', marginBottom: 32 }}>Gerencie as informações corporativas, CNPJ, dados de faturamento e entrega.</p>

              {showSaveSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#d1fae5', color: '#059669', padding: '16px 24px', borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>
                  <Check size={20} />
                  <span>Dados corporativos atualizados e salvos com sucesso!</span>
                </div>
              )}

              <form onSubmit={handleSaveCompany} style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: 32, display: 'grid', gap: 24, maxWidth: 640 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase' }}>Razão Social</label>
                    <input 
                      type="text" 
                      value={companyForm.companyName}
                      onChange={(e) => setCompanyForm({...companyForm, companyName: e.target.value})}
                      required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #d1d5db', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase' }}>CNPJ</label>
                    <input 
                      type="text" 
                      value={companyForm.cnpj}
                      onChange={(e) => setCompanyForm({...companyForm, cnpj: e.target.value})}
                      required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #d1d5db', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase' }}>Inscrição Estadual (IE)</label>
                    <input 
                      type="text" 
                      value={companyForm.ie}
                      onChange={(e) => setCompanyForm({...companyForm, ie: e.target.value})}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #d1d5db', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase' }}>WhatsApp Corporativo</label>
                    <input 
                      type="text" 
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                      required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #d1d5db', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase' }}>E-mail para Faturamento</label>
                  <input 
                    type="email" 
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #d1d5db', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase' }}>Endereço de Entrega Principal</label>
                  <textarea 
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                    required
                    rows={3}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #d1d5db', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #f3f4f6', paddingTop: 24, marginTop: 12 }}>
                  <ShieldCheck size={20} color="#0e6b17" style={{ marginTop: 2 }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', display: 'block' }}>Dados Protegidos por Protocolo Digital</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>As alterações passam por verificação cadastral instantânea no sistema de faturamento feira.casa.</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={savingForm}
                  style={{
                    backgroundColor: '#0e6b17',
                    color: 'white',
                    border: 'none',
                    padding: '16px 24px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: savingForm ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 8
                  }}
                >
                  {savingForm ? <Loader2 size={20} className="animate-spin" /> : 'Salvar Alterações Corporativas'}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
