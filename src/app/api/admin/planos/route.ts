import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

const PLANS_TABLE = 'mktplace_feira_subscription_plans';

async function requireAdmin(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return null;
  const admin = createSupabaseAdmin();
  const { data } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? user : null;
}

export async function GET() {
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(PLANS_TABLE)
    .select('*')
    .order('price', { ascending: true });
  if (error) return err(error.message);
  return ok(data ?? []);
}

export async function POST(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);

  const body = await request.json();
  if (!body.name || body.price == null) return err('name e price são obrigatórios', 400);

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(PLANS_TABLE)
    .insert({
      name: body.name,
      target_profile: body.targetProfile || body.target_profile || 'feirante',
      price: body.price,
      recurrence: body.recurrence || 'mensal',
      grace_period_days: body.gracePeriodDays ?? body.grace_period_days ?? 0,
      features: body.features ?? [],
      is_active: body.isActive ?? body.is_active ?? true,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data, 201);
}

export async function PUT(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);

  const body = await request.json();
  if (!body.id) return err('id é obrigatório', 400);

  const { id, ...fields } = body;
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(PLANS_TABLE)
    .update(fields)
    .eq('id', id)
    .select()
    .single();

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
  const { error } = await admin.from(PLANS_TABLE).delete().eq('id', id);
  if (error) return err(error.message);
  return ok({ deleted: true });
}
