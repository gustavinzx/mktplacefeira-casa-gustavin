import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  try {
    const { status } = await request.json();
    const admin = createSupabaseAdmin();

    // Validar se o usuario e o produtor desse pedido (RLS tbm protege, mas garantimos aqui)
    const { data: order } = await admin
      .from('mktplace_feira_orders')
      .select('producer_id')
      .eq('id', id)
      .single();

    if (!order) return err('Pedido não encontrado', 404);
    if (order.producer_id !== user.id) return err('Apenas o feirante pode atualizar o status.', 403);

    const { data, error } = await admin
      .from('mktplace_feira_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return ok(data);
  } catch (error: any) {
    return err(error.message || 'Erro ao atualizar pedido');
  }
}
