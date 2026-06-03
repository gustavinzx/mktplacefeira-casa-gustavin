// src/app/api/users/route.ts
// GET /api/users — Lista todos os usuários (apenas admin)

import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();

  // Verifica se é admin
  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return err('Acesso negado', 403);

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const role = searchParams.get('role');

  let query = admin.from(TABLE.profiles).select('*', { count: 'exact' });
  if (role) query = query.eq('role', role);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return err(error.message, 500);
  return ok({ users: data, total: count, page, limit });
}
