'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/client';
import { locales, localeNames, Locale } from '@/lib/i18n/settings';
import { Globe, ChevronDown } from 'lucide-react';

export function LanguageSwitcher() {
  const { locale, setLocale, isPending } = useI18n();

  return (
    <div className="relative group">
      <button 
        disabled={isPending}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-green-600/30 transition-all ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Globe size={16} className="text-gray-400" />
        <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{locale}</span>
        <ChevronDown size={14} className="text-gray-400 group-hover:rotate-180 transition-transform" />
      </button>

      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
        {locales.map((l) => (
          <button
            key={l}
            onClick={() => setLocale(l as Locale)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              locale === l 
                ? 'bg-green-50 text-green-700' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {localeNames[l as Locale]}
            {locale === l && <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />}
          </button>
        ))}
      </div>
    </div>
  );
}
