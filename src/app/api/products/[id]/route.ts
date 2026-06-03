// src/app/api/products/[id]/route.ts
// GET /api/products/:id — Detalhe do produto (público)
// PUT /api/products/:id — Atualiza produto (dono ou admin)
// DELETE /api/products/:id — Remove produto (dono ou admin)

import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLE.products)
    .select(
      `*, 
      category:mktplace_feira_categories(*),
      producer:mktplace_feira_producers(*, profile:mktplace_feira_profiles(full_name, avatar_url))`
    )
    .eq('id', id)
    .single();

  if (error) return err('Produto não encontrado', 404);
  return ok(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();

  // Verifica permissão: dono do produto ou admin
  const { data: product } = await admin
    .from(TABLE.products)
    .select('producer_id')
    .eq('id', id)
    .single();

  if (!product) return err('Produto não encontrado', 404);

  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isOwner = product.producer_id === user.id;

  if (!isAdmin && !isOwner) return err('Sem permissão para editar este produto', 403);

  const body = await request.json();
  const allowedFields = ['title', 'description', 'price', 'unit', 'category_id', 'image_url', 'is_organic', 'is_promotion', 'stock', 'is_wholesale', 'wholesale_price'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const { data, error } = await admin
    .from(TABLE.products)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return err(error.message, 400);
  return ok(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();

  const { data: product } = await admin
    .from(TABLE.products)
    .select('producer_id')
    .eq('id', id)
    .single();

  if (!product) return err('Produto não encontrado', 404);

  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isOwner = product.producer_id === user.id;

  if (!isAdmin && !isOwner) return err('Sem permissão para remover este produto', 403);

  const { error } = await admin.from(TABLE.products).delete().eq('id', id);
  if (error) return err(error.message, 400);

  return ok({ message: 'Produto removido com sucesso' });
}
