import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

const B2B_TABLE = 'mktplace_feira_b2b_quotes';

async function requireAdmin(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return null;
  const admin = createSupabaseAdmin();
  const { data } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? user : null;
}

// GET — lista cotações/contratos B2B
export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // 'pending', 'approved', 'active'

  const admin = createSupabaseAdmin();
  let query = admin
    .from(B2B_TABLE)
    .select(`
      id, status, credit_limit, category, created_at, updated_at,
      restaurant:restaurant_id (id, full_name, email),
      producer:producer_id (id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return err(error.message);
  return ok(data ?? []);
}

// PATCH — aprovar, rejeitar ou atualizar cotação
export async function PATCH(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);

  const { id, status, credit_limit, notes } = await request.json();
  if (!id || !status) return err('id e status são obrigatórios', 400);

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(B2B_TABLE)
    .update({
      status,
      ...(credit_limit != null && { credit_limit }),
      ...(notes && { notes }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}
