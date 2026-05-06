'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, MapPin, CreditCard, Package, LogOut } from 'lucide-react';

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/account', label: 'Visão Geral', icon: User },
    { href: '/account/orders', label: 'Meus Pedidos', icon: Package },
    { href: '/account/addresses', label: 'Endereços', icon: MapPin },
    { href: '/account/wallet', label: 'Carteira', icon: CreditCard },
  ];

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      <Header />
      <main className="container" style={{ padding: '48px 0', display: 'flex', gap: '48px' }}>
        <aside style={{ width: '280px' }}>
          <h2 style={{ fontFamily: 'var(--font-plus-jakarta)', fontSize: '24px', marginBottom: '24px' }}>Minha Conta</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    color: isActive ? 'white' : 'var(--on-surface-variant)',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    fontWeight: '600'
                  }}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
            <Link href="/login" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: '#ba1a1a',
              fontWeight: '600',
              marginTop: '16px'
            }}>
              <LogOut size={20} /> Sair
            </Link>
          </nav>
        </aside>
        
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountLayout;
