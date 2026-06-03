// src/app/api/categories/route.ts
// GET /api/categories — Lista todas as categorias (público)
// POST /api/categories — Cria categoria (apenas admin)

import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET() {
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLE.categories)
    .select('*')
    .order('name');

  if (error) return err(error.message, 500);
  return ok(data);
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return err('Apenas admins podem criar categorias', 403);

  const { name, icon, slug } = await request.json();
  if (!name || !slug) return err('name e slug são obrigatórios', 400);

  const { data, error } = await admin
    .from(TABLE.categories)
    .insert({ name, icon, slug })
    .select()
    .single();

  if (error) return err(error.message, 400);
  return ok(data, 201);
}
