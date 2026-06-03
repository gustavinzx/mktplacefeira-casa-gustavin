// src/app/api/auth/logout/route.ts
// POST /api/auth/logout

import { createSupabaseClient, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return err('Token não fornecido', 401);

  const token = auth.split(' ')[1];
  const supabase = createSupabaseClient();

  // Seta o token para fazer logout no contexto certo
  await supabase.auth.setSession({ access_token: token, refresh_token: '' });
  const { error } = await supabase.auth.signOut();

  if (error) return err(error.message, 400);
  return ok({ message: 'Logout realizado com sucesso' });
}
