'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, HelpCircle, Home, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface PortalTopbarProps {
  setSidebarOpen: (open: boolean) => void;
  centerContent?: React.ReactNode;
  rightActions?: React.ReactNode;
  hideSearch?: boolean;
}

export default function PortalTopbar({ setSidebarOpen, centerContent, rightActions, hideSearch }: PortalTopbarProps) {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = localStorage.getItem('user_name') || '';
    const id = localStorage.getItem('user_id') || '';
    setUserName(name);
    setUserId(id);
  }, []);

  const initials = userName
    ? userName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const handleLogout = async () => {
    const actualRole = localStorage.getItem('user_role');
    await supabase.auth.signOut();
    localStorage.clear();
    document.cookie = 'feira_role=; path=/; max-age=0';
    sessionStorage.setItem('has_logged_out', 'true');
    
    let redirectUrl = '/login';
    switch (actualRole) {
      case 'admin': redirectUrl = '/admin/login'; break;
      case 'feirante': redirectUrl = '/login'; break;
      case 'chef': redirectUrl = '/login'; break;
      case 'logistica': redirectUrl = '/login'; break;
    }
    window.location.href = redirectUrl;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (faqRef.current && !faqRef.current.contains(event.target as Node)) {
        setShowFAQ(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 md:h-20 bg-white border-b border-[#efeee9] flex items-center justify-between px-4 md:px-10 sticky top-0 z-10 transition-all">
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors mr-3 shrink-0"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      {!hideSearch && (
        <div className="flex items-center ml-4 md:ml-8" ref={searchRef}>
          <div className="relative w-[250px] transition-all duration-300">
            <Search
              size={18}
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchExpanded ? 'text-[#fc6c29]' : 'text-[#707a6f]'}`}
            />
            <input
              type="text"
              placeholder="Buscar no portal..."
              className="w-full py-2.5 pl-11 pr-4 bg-[#fbfaf5] border border-[#efeee9] rounded-[20px] outline-none font-bold text-[13px] shadow-sm focus:border-[#fc6c29] focus:bg-white focus:ring-2 focus:ring-[#fc6c29]/10 transition-all text-[#1b1c19] placeholder:text-[#a0a8a0]"
              onFocus={() => setIsSearchExpanded(true)}
              onBlur={() => setIsSearchExpanded(false)}
            />
          </div>
        </div>
      )}

      {centerContent}

      {/* Right side */}
      <div className="flex items-center gap-5 ml-auto">
        <Link href="/" title="Voltar para a Home" className="text-[#707a6f] hover:text-[#fc6c29] transition-colors hidden sm:block">
          <Home size={20} />
        </Link>
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowFAQ(false); }}
            className={`transition-colors relative p-2 rounded-full ${showNotifications ? 'bg-orange-50 text-[#fc6c29]' : 'text-[#707a6f] hover:text-[#fc6c29] hover:bg-orange-50/50'}`}
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#fc6c29] rounded-full border border-white" />
          </button>
          
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#fbfaf5]">
                <h4 className="font-bold text-[#1b1c19]">Notificações</h4>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-[#1b1c19]">Novo pedido recebido!</p>
                  <p className="text-xs text-gray-500 mt-1">Há 5 minutos</p>
                </div>
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-[#1b1c19]">Bem-vindo(a) ao seu painel.</p>
                  <p className="text-xs text-gray-500 mt-1">Hoje</p>
                </div>
              </div>
              <div className="p-3 text-center border-t border-gray-100">
                <button className="text-xs font-bold text-[#fc6c29] hover:underline">Ver todas</button>
              </div>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="relative" ref={faqRef}>
          <button 
            onClick={() => { setShowFAQ(!showFAQ); setShowNotifications(false); }}
            className={`transition-colors p-2 rounded-full ${showFAQ ? 'bg-blue-50 text-blue-600' : 'text-[#707a6f] hover:text-blue-600 hover:bg-blue-50/50'}`}
          >
            <HelpCircle size={20} />
          </button>
          
          {showFAQ && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100 bg-blue-50 flex justify-between items-center">
                <h4 className="font-bold text-blue-900">Ajuda Rápida</h4>
                <button onClick={() => setShowFAQ(false)} className="text-blue-400 hover:text-blue-600"><X size={16} /></button>
              </div>
              <div className="p-2">
                <a href="/" className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-colors">Como gerenciar produtos?</a>
                <a href="/" className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-colors">Como confirmar um pedido?</a>
                <a href="/" className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-colors">Dúvidas sobre pagamentos</a>
              </div>
              <div className="p-3 text-center border-t border-gray-100">
                <button className="text-xs font-bold text-blue-600 hover:underline">Acessar Central de Ajuda</button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-[#efeee9] hidden sm:block" />

        {rightActions}

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-black text-[#1b1c19] leading-none">
              {userName || 'Usuário'}
            </p>
            <p className="text-[10px] font-black text-[#0e6b17] uppercase tracking-wide mt-0.5">
              Logado Agora
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl border border-[#0e6b17] bg-[#125d30] flex items-center justify-center text-white font-black text-sm shrink-0">
            {initials}
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sair"
          className="text-[#ba1a1a] hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-colors ml-1 shrink-0"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
