'use client';

import React from 'react';
import Link from 'next/link';
import { 
  User, 
  Store, 
  Utensils, 
  Building2, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export default function SignupSelection() {
  const profiles = [
    {
      id: 'user',
      title: 'Chef da Casa',
      description: 'Dona de casa ou apaixonado por culinária. Compras para o dia a dia.',
      icon: User,
      color: '#0e6b17',
      href: '/signup/user'
    },
    {
      id: 'chef',
      title: 'Chef Gourmet',
      description: 'Restaurantes, bares e cozinhas profissionais. Qualidade e frescor.',
      icon: Utensils,
      color: '#a63b00',
      href: '/signup/chef'
    },
    {
      id: 'b2b',
      title: 'Comprador Atacadista',
      description: 'Mercados, hotéis e grandes volumes com faturamento.',
      icon: Building2,
      color: '#30852f',
      href: '/signup/b2b'
    },
    {
      id: 'vendor',
      title: 'Feirante / Produtor',
      description: 'Venda seus produtos direto do campo para nossos clientes.',
      icon: Store,
      color: '#fc6c29',
      href: '/signup/vendor'
    }
  ];

  return (
    <div className="bg-[#ffffff] text-[#1b1c19] min-h-screen flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Header Padronizado do Signup */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-stone-100 sticky top-0 bg-white z-50">
        <Link href="/login" className="flex items-center gap-1 text-stone-900 font-bold text-xs uppercase tracking-widest hover:text-[#0e6b17] transition-colors">
           <ArrowLeft size={16} /> LOGIN
        </Link>
        <div className="text-xl font-bold text-[#0e6b17]">feira.casa</div>
      </header>

      <main className="flex-grow flex flex-col items-center pt-20 md:pt-32 px-4">
        <div className="w-full max-w-4xl text-center mb-16">
          <h1 className="text-[32px] md:text-[48px] font-black text-[#1b1c19] mb-4 leading-tight">Como você quer <br/><span className="text-[#0e6b17]">começar hoje?</span></h1>
          <p className="text-base text-[#40493c] max-w-2xl mx-auto opacity-80">Selecione o perfil que melhor descreve você para personalizarmos sua experiência na plataforma.</p>
        </div>

        <div className="w-full max-w-4xl border-t border-stone-200">
          {profiles.map(profile => {
            const Icon = profile.icon;
            return (
              <Link key={profile.id} href={profile.href} className="flex items-center gap-4 py-6 px-4 border-b border-stone-200 hover:bg-[#faf9f4] transition-all group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ color: profile.color }}>
                  <Icon size={28} />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-[#1b1c19] group-hover:text-[#0e6b17] transition-colors">{profile.title}</h3>
                  <p className="text-sm text-[#40493c] opacity-70 leading-snug">{profile.description}</p>
                </div>
                <div className="text-stone-300 group-hover:text-stone-900 transition-all group-hover:translate-x-1">
                  <ChevronRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="py-12 text-center text-stone-400 text-[11px] font-medium uppercase tracking-widest">
        <p>© 2024 Feira Viva - O frescor do campo na sua porta.</p>
      </footer>
    </div>
  );
}
