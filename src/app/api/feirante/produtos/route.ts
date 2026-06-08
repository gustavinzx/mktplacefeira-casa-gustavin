import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category_id') || '';

  const admin = createSupabaseAdmin();
  let query = admin
    .from(TABLE.products)
    .select('id, title, price, stock, category_id, images, is_active, unit, is_organic')
    .eq('producer_id', user.id)
    .order('created_at', { ascending: false });

  if (search) query = query.ilike('title', `%${search}%`);
  if (category) query = query.eq('category_id', category);

  const { data, error } = await query;
  if (error) return err(error.message);
  return ok(data ?? []);
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data: producer } = await admin.from(TABLE.producers).select('id').eq('id', user.id).single();
  if (!producer) return err('Apenas feirantes podem criar produtos', 403);

  const body = await request.json();
  if (!body.title || body.price == null) return err('title e price são obrigatórios', 400);

  const { data, error } = await admin.from(TABLE.products).insert({
    ...body,
    producer_id: user.id,
    stock: body.stock ?? 0,
    is_active: body.is_active ?? true,
    unit: body.unit || 'un',
  }).select().single();

  if (error) return err(error.message);
  return ok(data, 201);
}

export async function PATCH(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const { id, ...fields } = await request.json();
  if (!id) return err('id é obrigatório', 400);

  const admin = createSupabaseAdmin();
  const { data: existing } = await admin.from(TABLE.products).select('producer_id').eq('id', id).single();
  if (!existing || existing.producer_id !== user.id) return err('Sem permissão', 403);

  const { data, error } = await admin.from(TABLE.products).update(fields).eq('id', id).select().single();
  if (error) return err(error.message);
  return ok(data);
}

export async function DELETE(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return err('id é obrigatório', 400);

  const admin = createSupabaseAdmin();
  const { data: existing } = await admin.from(TABLE.products).select('producer_id').eq('id', id).single();
  if (!existing || existing.producer_id !== user.id) return err('Sem permissão', 403);

  const { error } = await admin.from(TABLE.products).delete().eq('id', id);
  if (error) return err(error.message);
  return ok({ deleted: true });
}
