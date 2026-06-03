// src/app/api/returns/[id]/route.ts
// GET /api/returns/:id — Detalhe da devolução
// PATCH /api/returns/:id — Atualiza status da devolução (admin)

import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLE.returns)
    .select(
      `*, 
      order:mktplace_feira_orders(
        id, total_amount, status, payment_method,
        items:mktplace_feira_order_items(
          quantity, price_at_time,
          product:mktplace_feira_products(id, title, image_url)
        )
      )`
    )
    .eq('id', id)
    .single();

  if (error) return err('Devolução não encontrada', 404);

  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isOwner = data.user_id === user.id;

  if (!isAdmin && !isOwner) return err('Acesso negado', 403);
  return ok(data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return err('Apenas admins podem atualizar devoluções', 403);
  }

  const { status, admin_notes } = await request.json();
  const VALID_STATUSES = ['pending', 'approved', 'rejected', 'refunded'];

  if (!status || !VALID_STATUSES.includes(status)) {
    return err(`status deve ser um de: ${VALID_STATUSES.join(', ')}`, 400);
  }

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;

  // Se aprovado, muda o pedido para 'cancelled' (considera devolvido)
  if (status === 'approved' || status === 'refunded') {
    const { data: returnReq } = await admin
      .from(TABLE.returns)
      .select('order_id')
      .eq('id', id)
      .single();

    if (returnReq) {
      await admin
        .from(TABLE.orders)
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', returnReq.order_id);
    }
  }

  const { data, error } = await admin
    .from(TABLE.returns)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return err(error.message, 400);
  return ok(data);
}
