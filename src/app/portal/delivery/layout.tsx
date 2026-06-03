'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Package, Clock, User, LogOut } from 'lucide-react';
import PortalTopbar from '@/components/PortalTopbar';

const navItems = [
  { href: '/portal/delivery', label: 'Painel', icon: LayoutDashboard },
  { href: '/portal/delivery/rotas', label: 'Rotas do Dia', icon: Map },
  { href: '/portal/delivery/entregas', label: 'Entregas', icon: Package },
  { href: '/portal/delivery/historico', label: 'Histórico', icon: Clock },
  { href: '/portal/delivery/perfil', label: 'Meu Perfil', icon: User },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#f8f9f8] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col z-50 shrink-0">
        <div className="p-6 border-b border-gray-50">
          <h1 className="text-lg font-black text-[#125d30]">feira.casa</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Delivery</p>
        </div>

        <div className="mx-4 mt-4 p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
          <img src="https://i.pravatar.cc/150?u=delivery" className="w-10 h-10 rounded-xl object-cover border-2 border-green-100" alt="Entregador" />
          <div>
            <p className="font-black text-gray-900 text-sm">Entregador</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <p className="text-[10px] text-green-700 font-black">Online</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${isActive ? 'bg-[#125d30] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                <span className={`text-sm ${isActive ? 'font-black' : 'font-bold'}`}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <Link href="/login/delivery" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
            <LogOut size={18} />
            <span className="text-sm font-bold">Sair</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PortalTopbar 
          setSidebarOpen={() => {}} 
          hideSearch={true}
          centerContent={
            <h2 className="font-black text-gray-900 ml-4">Painel do Entregador</h2>
          }
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
