// src/app/api/users/me/route.ts
// GET /api/users/me — Retorna o perfil do usuário autenticado
// PUT /api/users/me — Atualiza nome, telefone, avatar

import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLE.profiles)
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return err(error.message, 404);
  return ok(data);
}

export async function PUT(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const body = await request.json();
  const { full_name, phone, avatar_url } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (full_name !== undefined) updates.full_name = full_name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLE.profiles)
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return err(error.message, 400);
  return ok(data);
}
