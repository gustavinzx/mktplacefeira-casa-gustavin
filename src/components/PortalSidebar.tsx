'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './PortalSidebar.module.css';
import { 
  Leaf, 
  LayoutDashboard, 
  ShoppingBasket, 
  ClipboardList, 
  RefreshCcw, 
  CreditCard, 
  User,
  LogOut
} from 'lucide-react';

interface PortalSidebarProps {
  role: 'feirante' | 'chef' | 'admin' | 'logistica';
}

const PortalSidebar = ({ role }: PortalSidebarProps) => {
  const pathname = usePathname();

  const links = {
    feirante: [
      { href: '/portal/feirante', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/portal/feirante/produtos', label: 'Meus Produtos', icon: ShoppingBasket },
      { href: '/portal/feirante/pos', label: 'Pontos de Venda', icon: ClipboardList },
      { href: '/portal/feirante/returns', label: 'Devoluções', icon: RefreshCcw },
      { href: '/portal/feirante/subscription', label: 'Assinatura', icon: CreditCard },
      { href: '/portal/feirante/perfil', label: 'Meu Perfil', icon: User },
    ],
    chef: [
      { href: '/portal/chef', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/portal/chef/receitas', label: 'Minhas Receitas', icon: ShoppingBasket },
      { href: '/portal/chef/b2b', label: 'Portal B2B', icon: ClipboardList },
      { href: '/portal/chef/servicos', label: 'Serviços', icon: User },
    ],
    admin: [
      { href: '/portal/admin', label: 'Visão Geral', icon: LayoutDashboard },
      { href: '/portal/admin/users', label: 'Usuários', icon: User },
      { href: '/portal/admin/logistica', label: 'Logística', icon: RefreshCcw },
      { href: '/portal/admin/financeiro', label: 'Financeiro', icon: CreditCard },
    ],
    logistica: [
      { href: '/portal/logistica/rotas', label: 'Rotas de Entrega', icon: LayoutDashboard },
      { href: '/portal/logistica/pedidos', label: 'Pedidos Pendentes', icon: ShoppingBasket },
      { href: '/portal/logistica/entregadores', label: 'Entregadores', icon: User },
    ]
  };

  const currentLinks = links[role];

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.logo}>
        <Leaf size={28} strokeWidth={2.5} />
        <h2>feira.casa</h2>
      </Link>

      <nav className={styles.nav}>
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.profile}>
          <div className={styles.avatar}>JS</div>
          <div className={styles.profileInfo}>
            <h4>José da Silva</h4>
            <p>{role.charAt(0).toUpperCase() + role.slice(1)}</p>
          </div>
        </div>
        <Link href="/login" className={styles.navLink} style={{ marginTop: '16px', color: '#ba1a1a' }}>
          <LogOut size={20} />
          Sair
        </Link>
      </div>
    </aside>
  );
};

export default PortalSidebar;
