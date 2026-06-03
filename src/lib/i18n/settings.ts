export const locales = ['pt-BR', 'pt-PT', 'en', 'es', 'fr'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'pt-BR';

export const localeNames: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
};

export const COOKIE_NAME = 'USER_LOCALE';
