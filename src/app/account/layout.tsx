'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Package, MapPin, Wallet, Settings, LogOut, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './layout.module.css';
import { clearAuthSession } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
        if (!token) {
          router.push('/login');
          return;
        }
        
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
          throw new Error('Não autenticado');
        }

        const { data: profileData, error: profileError } = await supabase
          .from('mktplace_feira_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profileData) {
          throw new Error('Perfil não encontrado');
        }

        // Se for feirante ou admin, avisar mas deixar acessar? Ou redirecionar para o portal respectivo?
        // Vamos permitir que todos acessem "Minha Conta" como compradores.
        setProfile({
          ...profileData,
          email: user.email
        });
      } catch (err) {
        console.error('Erro na autenticação:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await clearAuthSession();
    router.push('/login');
  };

  const navItems = [
    { label: 'Visão Geral', path: '/account', icon: User },
    { label: 'Meus Pedidos', path: '/account/orders', icon: Package },
    { label: 'Meus Endereços', path: '/account/addresses', icon: MapPin },
    { label: 'Carteira e Cupons', path: '/account/wallet', icon: Wallet },
    { label: 'Configurações', path: '/account/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={40} className="animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      <Header />
      
      <main className={styles.accountLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <img 
              src={profile.avatar_url || '/images/placeholder.png'} 
              alt={profile.full_name} 
              className={styles.avatar} 
            />
            <h2 className={styles.profileName}>{profile.full_name}</h2>
            <p className={styles.profileEmail}>{profile.email}</p>
            {profile.role && profile.role !== 'cliente' && (
              <span className={styles.roleBadge}>{profile.role}</span>
            )}
          </div>

          <nav className={styles.nav}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} />
            Sair da conta
          </button>
        </aside>

        {/* Dynamic Content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
