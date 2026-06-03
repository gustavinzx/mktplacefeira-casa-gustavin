// src/app/api/subscriptions/[id]/route.ts
// GET /api/subscriptions/:id — Detalhe da assinatura
// DELETE /api/subscriptions/:id — Cancela assinatura

import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLE.subscriptions)
    .select('*, producer:mktplace_feira_producers(stall_name, id)')
    .eq('id', id)
    .single();

  if (error) return err('Assinatura não encontrada', 404);

  // Apenas o dono ou admin pode ver
  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isOwner = data.producer_id === user.id;

  if (!isAdmin && !isOwner) return err('Acesso negado', 403);

  return ok(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data: sub } = await admin
    .from(TABLE.subscriptions)
    .select('producer_id, status, stripe_subscription_id')
    .eq('id', id)
    .single();

  if (!sub) return err('Assinatura não encontrada', 404);

  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isOwner = sub.producer_id === user.id;

  if (!isAdmin && !isOwner) return err('Acesso negado', 403);
  if (sub.status === 'cancelled') return err('Assinatura já está cancelada', 400);

  // Se tiver Stripe, cancela lá também
  if (sub.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // @ts-ignore — stripe é opcional
      const stripe = (await import('stripe' as any)).default;
      const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);
      await stripeClient.subscriptions.cancel(sub.stripe_subscription_id);
    } catch {
      // Ignora erros do Stripe no cancelamento
    }
  }

  const { data, error } = await admin
    .from(TABLE.subscriptions)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return err(error.message, 400);
  return ok({ subscription: data, message: 'Assinatura cancelada com sucesso' });
}
