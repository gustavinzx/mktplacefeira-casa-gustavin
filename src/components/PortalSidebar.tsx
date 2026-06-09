'use client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './PortalSidebar.module.css';
import {
  LayoutDashboard,
  ShoppingBasket,
  ClipboardList,
  RefreshCcw,
  CreditCard,
  User,
  LogOut,
  BarChart3,
  Store,
  Package,
  Utensils,
  MapPin,
  Heart,
  ShoppingBag,
  Megaphone,
  X,
  ChevronDown,
} from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  sublinks?: { href: string; label: string }[];
}

interface PortalSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  feirante: 'Feirante',
  chef: 'Chef',
  admin: 'Admin',
  logistica: 'Logística',
  usuario: 'Comprador',
};

const PortalSidebar = ({ isOpen, onClose }: PortalSidebarProps) => {
  const pathname = usePathname();
  const { name: userName, role } = useCurrentUser();
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    setIsImpersonating(localStorage.getItem('is_impersonating') === 'true');
  }, []);

  const initials = userName
    ? userName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  const handleLogout = async () => {
    localStorage.clear();
    document.cookie = 'feira_role=; path=/; max-age=0';
    sessionStorage.setItem('has_logged_out', 'true');
    await supabase.auth.signOut();
    
    let redirectUrl = '/login';
    const actualRole = role;
    switch (actualRole) {
      case 'admin': redirectUrl = '/admin/login'; break;
      case 'feirante': redirectUrl = '/login'; break;
      case 'chef': redirectUrl = '/login'; break;
      case 'logistica': redirectUrl = '/login'; break;
    }
    window.location.href = redirectUrl;
  };

  const exitImpersonation = () => {
    localStorage.setItem('user_id', localStorage.getItem('admin_real_id') || '');
    localStorage.setItem('user_name', localStorage.getItem('admin_real_name') || '');
    localStorage.setItem('user_role', localStorage.getItem('admin_real_role') || 'admin');
    localStorage.removeItem('is_impersonating');
    localStorage.removeItem('admin_real_id');
    localStorage.removeItem('admin_real_name');
    localStorage.removeItem('admin_real_role');
    document.cookie = `feira_role=admin; path=/; max-age=86400`;
    window.location.href = '/admin/usuarios';
  };

  const links: Record<string, NavLink[]> = {
    feirante: [
      { href: '/portal/feirante',              label: 'Dashboard',          icon: LayoutDashboard },
      { href: '/portal/feirante/produtos',      label: 'Meus Produtos',      icon: Package         },
      { href: '/portal/feirante/pedidos',       label: 'Meus Pedidos',       icon: ClipboardList   },
      { href: '/portal/feirante/feiras',        label: 'Minhas Feiras',      icon: MapPin          },
      { href: '/portal/feirante/relatorio',     label: 'Relatório de Ganhos',icon: BarChart3       },
      { href: '/portal/feirante/pos',           label: 'Pontos de Venda',    icon: Store           },
      { href: '/portal/feirante/returns',       label: 'Devoluções',         icon: RefreshCcw      },
      { 
        href: '/portal/feirante/divulgar',       
        label: 'Divulgar Loja',      
        icon: Megaphone,
        sublinks: [
          { href: '/portal/feirante/divulgar/meus', label: 'Meus Anúncios' },
          { href: '/portal/feirante/divulgar/criar', label: 'Criar Anúncio' },
          { href: '/portal/feirante/divulgar/pacotes', label: 'Pacotes e Preços' },
        ]
      },
      { href: '/portal/feirante/subscription',  label: 'Assinatura',         icon: CreditCard      },
      { href: '/portal/feirante/perfil',        label: 'Meu Perfil',         icon: User            },
    ],
    usuario: [
      { href: '/portal/usuario',         label: 'Início',            icon: LayoutDashboard },
      { href: '/portal/usuario/pedidos', label: 'Meus Pedidos',      icon: ShoppingBag     },
      { href: '/portal/usuario/favoritos',label: 'Lista de Desejos', icon: Heart           },
      { href: '/portal/usuario/perfil',  label: 'Meu Perfil',        icon: User            },
    ],
    chef: [
      { href: '/portal/chef',            label: 'Dashboard',    icon: LayoutDashboard },
      { href: '/portal/chef/receitas',   label: 'Receitas',     icon: Utensils        },
      { href: '/portal/chef/servicos',   label: 'Minha Loja',   icon: Store           },
      { href: '/portal/chef/b2b',        label: 'Pedidos B2B',  icon: ClipboardList   },
      { href: '/portal/chef/insumos',    label: 'Insumos',      icon: Package         },
    ],
    admin: [
      { href: '/portal/admin',           label: 'Visão Geral',  icon: LayoutDashboard },
      { href: '/portal/admin/users',     label: 'Usuários',     icon: User            },
      { href: '/portal/admin/categorias',label: 'Categorias',   icon: Package         },
      { href: '/portal/admin/logistica', label: 'Logística',    icon: RefreshCcw      },
      { 
        href: '/portal/admin/financeiro',
        label: 'Financeiro & ERP',   
        icon: CreditCard,
        sublinks: [
          { href: '/portal/admin/planos', label: 'Planos & Assinaturas' },
        ]
      },
      { href: '/portal/admin/marketing', label: 'Marketing & Banners', icon: Megaphone },
    ],
    logistica: [
      { href: '/portal/logistica/rotas',       label: 'Rotas de Entrega',  icon: LayoutDashboard },
      { href: '/portal/logistica/pedidos',     label: 'Pedidos Pendentes', icon: ShoppingBasket  },
      { href: '/portal/logistica/entregadores',label: 'Entregadores',      icon: User            },
    ],
  };

  const currentLinks = links[role] || [];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/40 z-[99] md:hidden"
          onClick={onClose}
        />
      )}
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      {/* Mobile close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:hidden p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Fechar menu"
        >
          <X size={18} />
        </button>
      )}
      <Link href="/" className={styles.logo}>
        <img src="/Logo-feira.png" alt="feira.casa" style={{ height: '32px', width: 'auto' }} />
      </Link>

      {isImpersonating && (
        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
          <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Modo Implantação</p>
          <p className="text-[10px] text-red-500 font-medium mb-3">Você está operando como<br/><strong>{userName}</strong></p>
          <button 
            onClick={exitImpersonation}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Sair da Implantação
          </button>
        </div>
      )}

      <nav className={styles.nav}>
        {currentLinks.map((link) => {
          const Icon = link.icon;
          // Considera ativo se a rota atual for igual ao href pai ou a qualquer sublink
          const isActive = pathname === link.href || link.sublinks?.some(sub => pathname === sub.href);
          
          return (
            <div key={link.href} className="flex flex-col mb-1">
              <Link
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <Icon size={20} />
                {link.label}
              </Link>
              
              {link.sublinks && (
                <div className="flex flex-col gap-1 mt-1 pl-10 pr-2">
                  {link.sublinks.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`text-sm py-2 px-3 rounded-xl transition-colors font-medium ${
                        pathname === sub.href 
                          ? 'bg-[#e8f0e9] text-[#0e6b17]' 
                          : 'text-[#707a6f] hover:text-[#0e6b17] hover:bg-[#f6f8f5]'
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.profile}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.profileInfo}>
            <h4>{userName || 'Usuário'}</h4>
            <p>{ROLE_LABEL[role] || role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className={styles.navLink} 
          style={{ marginTop: '16px', color: '#ba1a1a', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
    </>
  );
};

export default PortalSidebar;
