'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
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
  ChefHat
} from 'lucide-react';

const Header = () => {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Verificar se existe um usuário logado no localStorage
    const role = localStorage.getItem('user_role');
    if (role) {
      // Usar setTimeout para evitar avisos de cascading renders no efeito de montagem
      setTimeout(() => {
        setIsLogged(true);
        setUserRole(role);
      }, 0);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLogged(false);
    setUserRole(null);
    router.push('/login');
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin': return { label: 'Painel Admin', icon: LayoutDashboard, path: '/admin' };
      case 'vendor': return { label: 'Minha Banca', icon: Store, path: '/dashboard/vendor' };
      case 'chef': return { label: 'Meu Ateliê', icon: ChefHat, path: '/dashboard/chef' };
      case 'b2b': return { label: 'Painel B2B', icon: ShoppingBag, path: '/dashboard/b2b' };
      default: return { label: 'Meu Perfil', icon: User, path: '/profile' };
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
            <Link href="/cadastro/feirante">Seja um Feirante</Link>
            <Link href="/cadastro/chef">Restaurantes &amp; Chefs</Link>
            <Link href="/cadastro/b2b">Comprador Atacadista</Link>
            <Link href="/login/b2c">Comprador B2C</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Leaf size={28} fill="currentColor" />
          <span>Feira <strong>Casa</strong></span>
        </Link>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search size={20} />
          <input type="text" placeholder="O que você quer colher hoje?" />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.locationBtn}>
            <MapPin size={18} />
            <span>Sua Região</span>
          </button>

          {/* User Profile / Login */}
          <div 
            className={styles.userSection}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            {isLogged ? (
              <div className={styles.userIconActive}>
                <User size={22} />
                <ChevronDown size={14} className={showMenu ? styles.rotate : ''} />
                
                {/* Dropdown Menu */}
                {showMenu && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.welcome}>Olá, Bem-vindo!</p>
                      <p className={styles.roleName}>{dashInfo.label}</p>
                    </div>
                    
                    <div className={styles.dropdownDivider} />
                    
                    <Link href={dashInfo.path} className={styles.dropdownItem}>
                      <dashInfo.icon size={18} />
                      <span>{dashInfo.label}</span>
                    </Link>

                    <Link href="/orders" className={styles.dropdownItem}>
                      <ShoppingBag size={18} />
                      <span>Meus Pedidos</span>
                    </Link>

                    <Link href="/settings" className={styles.dropdownItem}>
                      <Settings size={18} />
                      <span>Configurações</span>
                    </Link>

                    <div className={styles.dropdownDivider} />

                    <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logout}`}>
                      <LogOut size={18} />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login/b2c" className={styles.loginBtn}>
                <User size={22} />
                <ChevronDown size={14} />
              </Link>
            )}
          </div>

          <Link href="/cart" className={styles.cartBtn}>
            <ShoppingBasket size={22} />
            <span className={styles.cartCount}>2</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
