/** Normaliza role do perfil (DB usa: cliente, feirante, chef, admin). */
export function normalizeRole(value?: string | null): string {
  const map: Record<string, string> = {
    customer: 'cliente',
    cliente: 'cliente',
    vendor: 'feirante',
    feirante: 'feirante',
    chef: 'chef',
    admin: 'admin',
    b2b: 'b2b',
  };
  if (!value) return 'cliente';
  return map[value] || value;
}

export function isAdminRole(value?: string | null): boolean {
  return normalizeRole(value) === 'admin';
}

/** Rota inicial após login conforme o perfil no Supabase. */
export function getHomePathForRole(role?: string | null): string {
  switch (normalizeRole(role)) {
    case 'admin':
      return '/admin';
    case 'feirante':
      return '/portal/feirante';
    case 'chef':
      return '/portal/chef';
    case 'b2b':
      return '/b2b';
    default:
      return '/account';
  }
}

export function persistAuthSession(
  accessToken: string,
  profile?: { role?: string | null; full_name?: string | null },
) {
  // APENAS cache de UI — auth real é pelo cookie Supabase
  if (profile) {
    localStorage.setItem('user_role', normalizeRole(profile.role));
    localStorage.setItem('user_name', profile.full_name || '');
  }
}

import { supabase } from '@/lib/supabase';

export async function clearAuthSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_name');
  localStorage.removeItem('cart');
  localStorage.removeItem('checkout_items');
  localStorage.removeItem('checkout_subtotal');
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error('Erro ao deslogar do Supabase:', e);
  }
}
