'use client';

import React, { createContext, useContext, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Locale, COOKIE_NAME } from './settings';

type I18nContextType = {
  locale: Locale;
  dictionary: any;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  initialLocale,
  initialDictionary,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialDictionary: any;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (newLocale: Locale) => {
    // Set cookie
    document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Refresh the current route to fetch new dictionary on server
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <I18nContext.Provider value={{ locale: initialLocale, dictionary: initialDictionary, setLocale, isPending }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
