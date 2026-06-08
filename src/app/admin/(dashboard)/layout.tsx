'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Store, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search,
  HelpCircle
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [userName, setUserName] = React.useState('Ricardo Silva');

  React.useEffect(() => {
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    
    if (role !== 'admin') {
      router.push('/admin/login');
    } else {
      // eslint-disable-next-line
      setIsAuthorized(true);
      if (name) setUserName(name);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    document.cookie = 'feira_role=; path=/; max-age=0';
    router.push('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Banners', icon: ImageIcon, path: '/admin/banners' },
    { name: 'Feirantes', icon: Store, path: '/admin/vendors' },
    { name: 'Gestão ADM', icon: Users, path: '/admin/users' },
    { name: 'Configurações', icon: Settings, path: '/admin/settings' },
  ];

  if (!isAuthorized) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Admin Central</span>
          <p className={styles.brandSub}>feira.casa Management</p>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcxH1v5gOlG1eiUul-OVZB5kIhxPaZrF1dYYFfVdh8J5IudGoIo27Kj3lqzvhSPEZZneXw9ryFb_gOobF_1ZnjkedFs21rmasMwQFDF__FSbiXCF1kWNhocoScX4qfaHubGmwKmcd951NMAgMja33BDKBfQ0XVxKwHEwtT_rc0mIC1cTxbw8Sd5-gnoDw3ZYbPDNUpLx0bm7PZ9M1BV4gVIJj2Bt5EOMRTgPS6qx1VzO6T3gSC-BlwOc0zooFAawQhDNGpLaV3N9c" 
              alt="Admin Profile" 
            />
            <div className={styles.userInfo}>
              <p className={styles.userName}>{userName}</p>
              <p className={styles.userRole}>Master Admin</p>
            </div>
          </div>
          <button className={styles.btnLogout} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.wrapper}>
        <header className={styles.topHeader}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input type="text" placeholder="Buscar pedidos, usuários..." />
          </div>
          <div className={styles.topActions}>
            <button className={styles.actionBtn}>
              <HelpCircle size={20} />
            </button>
            <button className={styles.actionBtn}>
              <div className={styles.notifBadge}></div>
              <Bell size={20} />
            </button>
          </div>
        </header>
        
        <main className={styles.content}>
          {children}
        </main>

        <footer className={styles.footer}>
          <p>© 2024 feira.casa - Cultivando conexões reais.</p>
          <div className={styles.footerLinks}>
            <Link href="/">Suporte</Link>
            <Link href="/">Privacidade</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
