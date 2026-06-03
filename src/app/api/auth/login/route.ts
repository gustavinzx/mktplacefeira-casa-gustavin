// src/app/api/auth/login/route.ts
// POST /api/auth/login — Autenticação com email/senha

import { createSupabaseClient, TABLE, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return err('email e password são obrigatórios', 400);
    }

    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return err(error.message, 401);

    // Busca o perfil completo
    const { data: profile } = await supabase
      .from(TABLE.profiles)
      .select('*')
      .eq('id', data.user.id)
      .single();

    return ok({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: profile,
    });
  } catch (e) {
    return err(`Erro interno: ${(e as Error).message}`, 500);
  }
}
