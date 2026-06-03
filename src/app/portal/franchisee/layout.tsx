'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, Truck, Users, Wallet, Settings,
  LogOut, Plus, Headphones
} from 'lucide-react';
import PortalTopbar from '@/components/PortalTopbar';

const navItems = [
  { href: '/portal/franchisee', label: 'Visão Geral', icon: LayoutGrid },
  { href: '/portal/franchisee/logistica', label: 'Logística', icon: Truck },
  { href: '/portal/franchisee/feirantes', label: 'Feirantes', icon: Users },
  { href: '/portal/franchisee/comissionamento', label: 'Comissionamento', icon: Wallet },
  { href: '/portal/franchisee/configuracoes', label: 'Configurações', icon: Settings },
];

export default function FranchiseeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#f5f5f0] font-sans overflow-hidden">

      {/* Sidebar */}
      <aside className="w-[210px] bg-white border-r border-gray-100 flex flex-col z-50 shrink-0">
        <div className="px-6 pt-7 pb-5">
          <h1 className="text-xl font-black text-[#125d30] leading-none">feira.casa</h1>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Gestão Regional</p>
          <p className="text-xs font-bold text-gray-500 mt-0.5">Franquia Sudeste</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${isActive ? 'bg-[#125d30] text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                <span className={`text-sm ${isActive ? 'font-black' : 'font-bold'}`}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-2 border-t border-gray-50">
          <button className="w-full py-3 px-4 bg-[#fc6c29] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-md shadow-orange-900/10">
            <Headphones size={16} />
            Suporte Direto
          </button>
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
            <LogOut size={16} />
            <span className="text-sm font-bold">Sair</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <PortalTopbar 
          setSidebarOpen={() => {}} 
          centerContent={
            <div className="flex items-center gap-1 text-sm font-bold ml-4">
              <Link href="/portal/franchisee" className={`px-4 py-2 rounded-xl transition-all ${pathname === '/portal/franchisee' ? 'text-[#125d30] border-b-2 border-[#125d30]' : 'text-gray-500 hover:text-gray-900'}`}>
                Dashboard
              </Link>
              <Link href="/portal/franchisee/comissionamento" className={`px-4 py-2 rounded-xl transition-all ${pathname === '/portal/franchisee/comissionamento' ? 'text-[#125d30] border-b-2 border-[#125d30]' : 'text-gray-500 hover:text-gray-900'}`}>
                Relatórios
              </Link>
            </div>
          }
          rightActions={
            <Link href="/portal/franchisee/feirantes">
              <button className="px-4 py-2 bg-[#125d30] text-white rounded-xl font-bold text-sm flex items-center gap-1.5 hover:bg-green-800 transition-all shadow-md shadow-green-900/10">
                <Plus size={14} /> Novo Feirante
              </button>
            </Link>
          }
        />

        <main className="flex-1 overflow-y-auto p-7 bg-[#f5f5f0]">
          {children}
        </main>
      </div>
    </div>
  );
}
