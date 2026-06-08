'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import RegionModal from '@/components/RegionModal';
import { getSavedRegion, saveRegion, regionButtonLabel, type SavedRegion } from '@/lib/region';
import { clearAuthSession } from '@/lib/profile';
import { useCartStore } from '@/store/useCartStore';
import { 
  Search, 
  MapPin, 
  User, 
  ShoppingBasket, 
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Store,
  ChefHat,
  Building2,
  Loader2,
} from 'lucide-react';

async function reverseGeocode(lat: number, lng: number): Promise<{
  neighborhood: string | null;
  city: string;
  state: string;
  label: string;
}> {
  try {
    const res = await fetch('/api/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longitude: lng })
    });

    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    
    if (data.success && data.details) {
      return { 
        neighborhood: data.details.neighborhood, 
        city: data.details.city, 
        state: data.details.state, 
        label: data.address 
      };
    }
    
    throw new Error('No address found');
  } catch {
    return { neighborhood: null, city: 'Sua Localização', state: 'BR', label: 'Sua Localização' };
  }
}

const Header = () => {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = useCartStore(state => state.getItemCount());
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<SavedRegion | null>(null);
  const [showRegionModal, setShowRegionModal] = useState(false);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auth + Geolocalização
  useEffect(() => {
    setMounted(true);

    // Auth do localStorage
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    if (role) {
      setTimeout(() => {
        setIsLogged(true);
        setUserRole(role);
        setUserName(name);
      }, 0);
    }

    // Região salva
    const saved = getSavedRegion();
    setRegion(saved);

    // Auto-detectar localização se ainda não tiver
    if (!saved?.lat) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;

              // Busca bairro/cidade real via Nominatim
              const geo = await reverseGeocode(latitude, longitude);

              const newRegion: SavedRegion = {
                label: geo.label,
                neighborhood: geo.neighborhood || undefined,
                city: geo.city,
                state: geo.state,
                lat: latitude,
                lng: longitude,
                radius: 30,
                timestamp: Date.now(),
              };

              // Salva usando a função centralizada (cuida das duas chaves)
              saveRegion(newRegion);
              setRegion(newRegion);
            } catch (err) {
              console.warn('[Header] Erro ao detectar localização:', err);
            }
          },
          () => {
            // GPS negado — usuário pode definir manualmente pelo modal
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: Infinity, // Permite usar cache do navegador para maior precisão
          }
        );
      }
    }

    // Ouvir mudanças de região feitas pelo modal
    const onRegion = () => setRegion(getSavedRegion());
    window.addEventListener('regionUpdated', onRegion);
    return () => window.removeEventListener('regionUpdated', onRegion);
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
      case 'admin':    return { label: 'Painel Admin',    icon: LayoutDashboard, path: '/admin' };
      case 'feirante': return { label: 'Minha Banca',     icon: Store,           path: '/portal/feirante' };
      case 'chef':     return { label: 'Meu Ateliê',      icon: ChefHat,         path: '/portal/chef' };
      case 'b2b':      return { label: 'Portal Atacado',  icon: Building2,       path: '/b2b' };
      default:         return { label: 'Minha Conta',     icon: User,            path: '/account' };
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      feirante: 'Feirante', b2b: 'Atacadista', chef: 'Chef',
      admin: 'Admin', cliente: 'Consumidor', customer: 'Consumidor', b2c: 'Consumidor',
    };
    return labels[role] || 'Visitante';
  };

  const dashInfo = getDashboardLink();

  return (
    <header className={styles.header}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContainer}>
          <div className={styles.topBarLeft}>
            <Link href="/sobre">Sobre nós</Link>
            <Link href="/contato">Contato</Link>
            <Link href="/fairs">Feiras</Link>
            <Link href="/feirantes">Feirantes</Link>
          </div>
          <div className={styles.topBarRight}>
            {isLogged ? (
              <>
                <Link href={dashInfo.path}>Acessar Meu Painel</Link>
                <Link href="/orders">Meus Pedidos</Link>
              </>
            ) : (
              <>
                <Link href="/signup/vendor">Seja um Feirante</Link>
                <Link href="/signup/chef">Restaurantes &amp; Chefs</Link>
                <Link href="/signup/b2b">Comprador Atacadista</Link>
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
          {/* Botão de Região */}
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
          <div
            className={styles.userMenu}
            ref={dropdownRef}
            onClick={() => setShowMenu(!showMenu)}
          >
            <User size={22} />
            {isLogged && userName && (
              <span className={styles.userName} style={{ display: 'flex', alignItems: 'center' }}>
                {userName.split(' ')[0]}
                {userRole && (
                  <span style={{
                    fontSize: 10,
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: 4,
                    marginLeft: 6,
                    fontWeight: 700,
                  }}>
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
                      <Link href="/profile" className={styles.dropdownItem}>
                        <User size={18} /> Minha Conta
                      </Link>
                      <Link href="/orders" className={styles.dropdownItem}>
                        <ShoppingBag size={18} /> Meus Pedidos
                      </Link>
                      <Link href="/settings" className={styles.dropdownItem}>
                        <LayoutDashboard size={18} /> Configurações
                      </Link>
                    </div>

                    {userRole && userRole !== 'cliente' && userRole !== 'customer' && userRole !== 'b2c' && (
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

                    {(userRole === 'admin' || userRole === 'logistica') && (
                      <>
                        <div className={styles.dropdownDivider} />
                        <div className={styles.dropdownSection}>
                          <span className={styles.dropdownTitle}>Gestão & Logística</span>
                          <Link href={userRole === 'admin' ? '/admin/logistica/rotas' : '/portal/logistica/rotas'} className={styles.dropdownItem}>
                            <MapPin size={18} /> Rotas PickNGo
                          </Link>
                          <Link href={userRole === 'admin' ? '/admin/logistica/fornecedores' : '/portal/logistica/entregadores'} className={styles.dropdownItem}>
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
                      {isLoggingOut
                        ? <Loader2 size={18} className="animate-spin" />
                        : <LogOut size={18} />
                      } Sair
                    </button>
                  </>
                ) : (
                  <Link href="/login" className={styles.dropdownItem}>
                    <User size={18} /> Entrar
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link href="/cart" className={styles.cartBtn}>
            <ShoppingBasket size={24} />
            {mounted && cartCount > 0 && (
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