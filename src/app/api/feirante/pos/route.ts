import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  try {
    const { items, payment_method, total_amount } = await request.json();
    const admin = createSupabaseAdmin();

    // 1. Validate if user is producer
    const { data: producer } = await admin.from(TABLE.producers).select('id').eq('id', user.id).single();
    if (!producer) return err('Apenas feirantes podem usar o PDV');

    // 2. Create Order (customer_id is null for anonymous POS sales)
    const { data: order, error: orderError } = await admin
      .from(TABLE.orders)
      .insert({
        producer_id: user.id,
        total_amount,
        status: 'entregue', // POS is instantly delivered
        payment_method,
        is_pos: true
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Insert Items and Decrement Stock
    const orderItemsToInsert = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price
    }));

    const { error: itemsError } = await admin.from(TABLE.orderItems).insert(orderItemsToInsert);
    if (itemsError) throw itemsError;

    // Decrement stock for each item
    for (const item of items) {
      // Usando rpc seria melhor, mas para garantir:
      const { data: prod } = await admin.from(TABLE.products).select('stock, purchase_count').eq('id', item.product_id).single();
      if (prod) {
        await admin.from(TABLE.products).update({ 
          stock: Math.max(0, (prod.stock || 0) - item.quantity),
          purchase_count: (prod.purchase_count || 0) + item.quantity
        }).eq('id', item.product_id);
      }
    }

    return ok({ success: true, order_id: order.id });
  } catch (error: any) {
    return err(error.message || 'Erro ao processar venda no PDV');
  }
}
