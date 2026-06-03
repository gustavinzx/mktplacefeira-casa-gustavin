import { cookies } from 'next/headers';
import { Locale, defaultLocale, COOKIE_NAME } from './settings';

const dictionaries = {
  'pt-BR': () => import('./dictionaries/pt-BR.json').then((module) => module.default),
  'pt-PT': () => import('./dictionaries/pt-PT.json').then((module) => module.default),
  'en': () => import('./dictionaries/en.json').then((module) => module.default),
  'es': () => import('./dictionaries/es.json').then((module) => module.default),
  'fr': () => import('./dictionaries/fr.json').then((module) => module.default),
};

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(COOKIE_NAME)?.value as Locale;
  return locale || defaultLocale;
}

export async function getDictionary(locale?: Locale) {
  const l = locale || await getCurrentLocale();
  return dictionaries[l]();
}
