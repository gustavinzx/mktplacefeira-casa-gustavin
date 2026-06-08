import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

const CAMP_TABLE = 'mktplace_feira_marketing_campaigns';

async function requireAdmin(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return null;
  const admin = createSupabaseAdmin();
  const { data } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? user : null;
}

export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.from(CAMP_TABLE).select('*').order('created_at', { ascending: false });
  if (error) return err(error.message);
  return ok(data ?? []);
}

export async function POST(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);
  const body = await request.json();
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.from(CAMP_TABLE).insert(body).select().single();
  if (error) return err(error.message);
  return ok(data, 201);
}

export async function PATCH(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);
  const { id, ...fields } = await request.json();
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.from(CAMP_TABLE).update(fields).eq('id', id).select().single();
  if (error) return err(error.message);
  return ok(data);
}

export async function DELETE(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return err('id é obrigatório', 400);
  const admin = createSupabaseAdmin();
  const { error } = await admin.from(CAMP_TABLE).delete().eq('id', id);
  if (error) return err(error.message);
  return ok({ deleted: true });
}
