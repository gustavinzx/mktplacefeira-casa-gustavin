import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';
import { TABLE } from '@/lib/supabase-server';

async function requireAdmin(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return null;
  const admin = createSupabaseAdmin();
  const { data } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? user : null;
}

// GET público — retorna banners ativos (usada pela home e admin)
export async function GET() {
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLE.banners)
    .select('*')
    .order('position', { ascending: true });
  if (error) return err(error.message);
  return ok({ banners: data ?? [] });
}

// POST — cria banner (apenas admin)
export async function POST(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);
  const body = await request.json();
  if (!body.title || !body.image_url) return err('title e image_url são obrigatórios', 400);
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.from(TABLE.banners).insert(body).select().single();
  if (error) return err(error.message);
  return ok(data, 201);
}

// PATCH — edita ou toggle ativo/inativo
export async function PATCH(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);
  const { id, ...fields } = await request.json();
  if (!id) return err('id é obrigatório', 400);
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.from(TABLE.banners).update(fields).eq('id', id).select().single();
  if (error) return err(error.message);
  return ok(data);
}

// DELETE — remove banner
export async function DELETE(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return err('id é obrigatório', 400);
  const admin = createSupabaseAdmin();
  const { error } = await admin.from(TABLE.banners).delete().eq('id', id);
  if (error) return err(error.message);
  return ok({ deleted: true });
}
