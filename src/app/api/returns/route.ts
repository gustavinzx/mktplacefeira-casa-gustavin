import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const { order_id, reason } = await request.json();
  
  if (!order_id || !reason) return err('ID do pedido e motivo são obrigatórios', 400);

  const admin = createSupabaseAdmin();

  // Verifica se o pedido pertence ao usuário (opcional, segurança)
  const { data: order } = await admin
    .from(TABLE.orders)
    .select('customer_id')
    .eq('id', order_id)
    .single();

  if (!order || order.customer_id !== user.id) {
    return err('Pedido não encontrado ou sem permissão', 403);
  }

  // Cria a solicitação de devolução
  const { data, error } = await admin
    .from(TABLE.returns)
    .insert({
      order_id,
      user_id: user.id,
      reason,
      status: 'pendente'
    })
    .select()
    .single();

  if (error) return err(error.message, 400);

  return ok(data, 201);
}

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  
  const { data: profile } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  const role = profile?.role;

  let query = admin.from(TABLE.returns).select(`
    *,
    order:mktplace_feira_orders(
      *,
      items:mktplace_feira_order_items(
        quantity,
        product:mktplace_feira_products(producer_id, title)
      )
    )
  `);

  if (role === 'cliente') {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;
  if (error) return err(error.message, 400);

  let returnsData = data || [];
  if (role === 'feirante') {
    returnsData = returnsData.filter(r => 
      r.order?.items?.some((i: any) => i.product?.producer_id === user.id)
    );
  }

  return ok({ returns: returnsData });
}

export async function PUT(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const { id, status } = await request.json();
  if (!id || !status) return err('ID e Status são obrigatórios', 400);

  const admin = createSupabaseAdmin();

  // Apenas admin ou feirante pode mudar o status da devolução
  const { data: profile } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin' && profile?.role !== 'feirante') return err('Sem permissão', 403);

  // Busca a devolução primeiro
  const { data: existingReturn } = await admin.from(TABLE.returns).select('status, order_id').eq('id', id).single();

  const { data, error } = await admin
    .from(TABLE.returns)
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return err(error.message, 400);

  // Se o status mudou para aprovado ou resolvido, e antes não era, estornar estoque
  if ((status === 'approved' || status === 'resolvido') && existingReturn?.status !== status) {
    const { data: orderData } = await admin.from('mktplace_feira_order_items').select('product_id, quantity').eq('order_id', existingReturn?.order_id);
    if (orderData) {
      for (const item of orderData) {
        // Incrementa o estoque do produto manualmente
        const { data: product } = await admin.from('mktplace_feira_products').select('stock_quantity').eq('id', item.product_id).single();
        if (product) {
          await admin.from('mktplace_feira_products').update({ stock_quantity: product.stock_quantity + item.quantity }).eq('id', item.product_id);
        }
      }
    }
  }

  return ok(data);
}
