import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  try {
    const { data: returns, error } = await admin
      .from('mktplace_feira_return_requests')
      .select(`
        *,
        order:mktplace_feira_orders!inner(
          id, producer_id, total_amount, created_at,
          customer:mktplace_feira_profiles(full_name, email)
        )
      `)
      .eq('order.producer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ok(returns || []);
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar devoluções');
  }
}

export async function PUT(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  try {
    const { return_id, status } = await request.json(); // status: 'approved' | 'rejected'
    const admin = createSupabaseAdmin();

    // Verify ownership
    const { data: ret } = await admin
      .from('mktplace_feira_return_requests')
      .select('order:mktplace_feira_orders!inner(producer_id, total_amount, customer_id)')
      .eq('id', return_id)
      .single();

    const orderData = Array.isArray(ret?.order) ? ret?.order[0] : ret?.order;

    if (!ret || !orderData || orderData.producer_id !== user.id) {
      return err('Não autorizado', 403);
    }

    const { error } = await admin
      .from('mktplace_feira_return_requests')
      .update({ status })
      .eq('id', return_id);

    if (error) throw error;

    // Se aprovado, devolve saldo para a carteira do cliente
    if (status === 'approved' && orderData.customer_id) {
      await admin.from(TABLE.walletTransactions).insert({
        user_id: orderData.customer_id,
        amount: orderData.total_amount,
        type: 'credit',
        description: `Estorno do Pedido #${return_id.split('-')[0].toUpperCase()} aprovado.`
      });
    }

    return ok({ success: true });
  } catch (error: any) {
    return err(error.message || 'Erro ao atualizar devolução');
  }
}
