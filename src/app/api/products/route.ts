// src/app/api/products/route.ts
// GET /api/products — Lista produtos (público, com filtros)
// POST /api/products — Cria produto (feirante autenticado)

import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const category = searchParams.get('category_id');
  const search = searchParams.get('q') || searchParams.get('search');
  const isOrganic = searchParams.get('organic');
  const isPromotion = searchParams.get('promotion');
  const isWholesale = searchParams.get('wholesale');
  const producerId = searchParams.get('producer_id');

  const admin = createSupabaseAdmin();
  let query = admin
    .from(TABLE.products)
    .select(
      `*, 
      category:mktplace_feira_categories(id, name, slug, icon),
      producer:mktplace_feira_producers(id, stall_name, rating, is_verified)`,
      { count: 'exact' }
    );

  // Só esconde produtos sem estoque se não for o painel do feirante pedindo
  const allStock = searchParams.get('all_stock');
  if (allStock !== 'true') {
    query = query.gt('stock', 0);
  }

  if (category) query = query.eq('category_id', category);
  if (search) query = query.ilike('title', `%${search}%`);
  if (isOrganic === 'true') query = query.eq('is_organic', true);
  if (isPromotion === 'true') query = query.eq('is_promotion', true);
  if (isWholesale === 'true') query = query.eq('is_wholesale', true);
  if (producerId) query = query.eq('producer_id', producerId);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return err(error.message, 500);
  return ok({ products: data, total: count, page, limit });
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const body = await request.json();
  const { title, description, price, unit, category_id, image_url, is_organic, is_promotion, stock, is_wholesale, wholesale_price } = body;

  if (!title || !price || !unit) {
    return err('title, price e unit são obrigatórios', 400);
  }

  const admin = createSupabaseAdmin();

  // Verifica se o usuário é feirante/producer
  const { data: producer } = await admin
    .from(TABLE.producers)
    .select('id')
    .eq('id', user.id)
    .single();

  if (!producer) return err('Apenas feirantes podem cadastrar produtos', 403);

  const { data, error } = await admin
    .from(TABLE.products)
    .insert({
      producer_id: user.id,
      title,
      description,
      price,
      unit,
      category_id: category_id ?? null,
      image_url: image_url ?? null,
      is_organic: is_organic ?? false,
      is_promotion: is_promotion ?? false,
      is_wholesale: is_wholesale ?? false,
      wholesale_price: is_wholesale ? (wholesale_price ?? null) : null,
      stock: stock ?? 0,
    })
    .select()
    .single();

  if (error) return err(error.message, 400);
  return ok(data, 201);
}
