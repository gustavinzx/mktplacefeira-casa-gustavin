'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import RegionModal from '@/components/RegionModal';
import { getSavedRegion, regionButtonLabel, type SavedRegion } from '@/lib/region';
import { clearAuthSession } from '@/lib/profile';
import { useCartStore } from '@/store/useCartStore';
import { 
  Search, 
  MapPin, 
  User, 
  ShoppingBasket, 
  Leaf,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Settings,
  Store,
  ChefHat,
  Building2,
  Loader2,
} from 'lucide-react';

const Header = () => {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const cartCount = useCartStore(state => state.getItemCount());
  // The global store updates instantly, we don't need manual localStorage sync here anymore.
  const [mounted, setMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<SavedRegion | null>(null);
  const [showRegionModal, setShowRegionModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    if (role) {
      setTimeout(() => {
        setIsLogged(true);
        setUserRole(role);
        setUserName(name);
      }, 0);
    }


    const saved = getSavedRegion();
    setRegion(saved);

    // Auto-detect location on first load if not set
    if (!saved?.lat) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // Utiliza a nova rota de Backend construída especificamente para nós
              const res = await fetch('/api/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude, longitude })
              });
              const data = await res.json();
              
              if (data.success && data.details) {
                const city = data.details.city || data.details.town || 'Sua Localização';
                const state = data.details.state === 'Distrito Federal' ? 'DF' : (data.details.state || 'BR');
                
                const newRegion = {
                  label: `${city}, ${state}`,
                  city: city,
                  state: state,
                  lat: latitude,
                  lng: longitude,
                  radius: 30
                };
                localStorage.setItem('feira_region', JSON.stringify(newRegion));
                setRegion(newRegion);
                window.dispatchEvent(new Event('regionUpdated'));
              }
            } catch (err) {
              console.warn('Erro ao bater na API local de localização:', err);
            }
          },
          (error) => {
            console.warn('GPS denied or failed. Sem localização IP fallback.');
            // Omitimos intencionalmente o IP-API para evitar o erro do "Cruzeiro Novo"
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }

    const onRegion = () => setRegion(getSavedRegion());
    window.addEventListener('regionUpdated', onRegion);

    return () => {
      window.removeEventListener('regionUpdated', onRegion);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await clearAuthSession();
      setIsLogged(false);
      setUserRole(null);
      useCartStore.getState().clearCart();
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin': return { label: 'Painel Admin', icon: LayoutDashboard, path: '/admin' };
      case 'feirante': return { label: 'Minha Banca', icon: Store, path: '/portal/feirante' };
      case 'chef': return { label: 'Meu Ateliê', icon: ChefHat, path: '/portal/chef' };
      case 'b2b': return { label: 'Portal Atacado', icon: Building2, path: '/b2b' };
      default: return { label: 'Minha Conta', icon: User, path: '/account' };
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'feirante': return 'Feirante';
      case 'b2b': return 'Atacadista';
      case 'chef': return 'Chef';
      case 'admin': return 'Admin';
      case 'cliente': return 'Consumidor';
      default: return 'Visitante';
    }
  };

  const dashInfo = getDashboardLink();

  return (
    <header className={styles.header}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContainer}>
          <div className={styles.topBarLeft}>
            <Link href="/sobre">Quem somos</Link>
            <Link href="/contato">Contato</Link>
          </div>
          <div className={styles.topBarRight}>
            {isLogged ? (
              <>
                <Link href={dashInfo.path}>Acessar Meu Painel</Link>
                <Link href="/account/orders">Meus Pedidos</Link>
              </>
            ) : (
              <>
                <Link href="/signup/vendor">Seja um Feirante</Link>
                <Link href="/signup/chef">Restaurantes &amp; Chefs</Link>
                <Link href="/signup/b2b">Comprador Atacadista</Link>
                <Link href="/login">Comprador B2C</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <img src="/Logo-feira.png" alt="feira.casa" style={{ height: '36px', width: 'auto' }} />
        </Link>

        {/* Search */}
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="O que você quer colher hoje?"
            className={styles.searchInput}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.regionBtn}
            onClick={() => setShowRegionModal(true)}
            title={region?.label || 'Definir região'}
          >
            <MapPin size={18} />
            <span>{regionButtonLabel(region)}</span>
          </button>

          {/* User Menu */}
          <div className={styles.userMenu} ref={dropdownRef} onClick={() => setShowMenu(!showMenu)}>
            <User size={22} />
            {isLogged && userName && (
              <span className={styles.userName} style={{ display: 'flex', alignItems: 'center' }}>
                {userName.split(' ')[0]}
                {userRole && (
                  <span style={{ fontSize: 10, backgroundColor: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: 4, marginLeft: 6, fontWeight: 700 }}>
                    {getRoleLabel(userRole)}
                  </span>
                )}
              </span>
            )}
            <ChevronDown size={16} />

            {showMenu && (
              <div className={styles.dropdown}>
                {isLogged ? (
                  <>
                    <div className={styles.dropdownSection}>
                      <span className={styles.dropdownTitle}>Área do Comprador</span>
                      <Link href="/account" className={styles.dropdownItem}>
                        <User size={18} /> Minha Conta
                      </Link>
                      <Link href="/account/orders" className={styles.dropdownItem}>
                        <ShoppingBag size={18} /> Meus Pedidos
                      </Link>
                    </div>

                    {userRole && userRole !== 'cliente' && (
                      <>
                        <div className={styles.dropdownDivider} />
                        <div className={styles.dropdownSection}>
                          <span className={styles.dropdownTitle}>Área do Vendedor / Gestão</span>
                          <Link href={dashInfo.path} className={styles.dropdownItem}>
                            <dashInfo.icon size={18} /> {dashInfo.label}
                          </Link>
                        </div>
                      </>
                    )}

                    {/* Links Novas Funções do Professor */}
                    {(userRole === 'admin' || userRole === 'logistica') && (
                      <>
                        <div className={styles.dropdownDivider} />
                        <div className={styles.dropdownSection}>
                          <span className={styles.dropdownTitle}>Gestão & Logística</span>
                          <Link href={userRole === 'admin' ? "/admin/logistica/rotas" : "/portal/logistica/rotas"} className={styles.dropdownItem}>
                            <MapPin size={18} /> Rotas PickNGo
                          </Link>
                          <Link href={userRole === 'admin' ? "/admin/logistica/fornecedores" : "/portal/logistica/entregadores"} className={styles.dropdownItem}>
                            <User size={18} /> Gestão de Frota
                          </Link>
                          {userRole === 'admin' && (
                            <Link href="/admin" className={styles.dropdownItem}>
                              <LayoutDashboard size={18} /> Painel Administrativo
                            </Link>
                          )}
                        </div>
                      </>
                    )}

                    <div className={styles.dropdownDivider} />
                    <button
                      className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      aria-label="Sair da conta"
                    >
                      {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />} Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={styles.dropdownItem}>
                      <User size={18} /> Entrar
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link href="/cart" className={styles.cartBtn}>
            <ShoppingBasket size={24} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>
        </div>
      </div>

      <RegionModal
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onSelect={setRegion}
      />
    </header>
  );
};

export default Header;
