'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBasket, ShoppingBag, User } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on admin routes because Admin has its own sidebar/menu
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Início', path: '/', icon: Home },
    { label: 'Busca', path: '/search', icon: Search },
    { label: 'Carrinho', path: '/cart', icon: ShoppingBasket },
    { label: 'Pedidos', path: '/orders', icon: ShoppingBag },
    { label: 'Perfil', path: '/profile', icon: User },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || (pathname?.startsWith(item.path) && item.path !== '/');
        
        return (
          <Link 
            key={item.path} 
            href={item.path} 
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
