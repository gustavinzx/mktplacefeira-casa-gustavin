// src/app/api/sales/route.ts
// GET /api/sales — Lista vendas (itens de pedido) de um feirante

import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();

  // Verifica se o usuário é feirante
  const { data: producer } = await admin
    .from(TABLE.producers)
    .select('id')
    .eq('id', user.id)
    .single();

  if (!producer) return err('Apenas feirantes têm acesso a vendas', 403);

  // Busca todos os order_items onde o produto pertence a este feirante
  const { data, error } = await admin
    .from(TABLE.orderItems)
    .select(`
      id, quantity, price_at_time,
      order:mktplace_feira_orders(id, created_at, status, customer_id, payment_method),
      product:mktplace_feira_products!inner(id, title, producer_id, image_url)
    `)
    .eq('product.producer_id', user.id);

  if (error) return err(error.message, 500);

  // Group by order to make it look like a list of orders (sales)
  const salesMap = new Map();
  
  data.forEach((item: any) => {
    if (!item.order) return;
    
    const orderId = item.order.id;
    if (!salesMap.has(orderId)) {
      salesMap.set(orderId, {
        id: orderId,
        created_at: item.order.created_at,
        status: item.order.status,
        customer_id: item.order.customer_id,
        payment_method: item.order.payment_method,
        total_amount: 0,
        items: []
      });
    }
    
    const sale = salesMap.get(orderId);
    // Revenue for this specific producer from this order
    const itemRevenue = Number(item.price_at_time) * Number(item.quantity);
    sale.total_amount += itemRevenue;
    
    sale.items.push({
      product_id: item.product.id,
      title: item.product.title,
      quantity: item.quantity,
      price: item.price_at_time,
      image_url: item.product.image_url
    });
  });

  // Convert map to array and sort by date descending
  const salesArray = Array.from(salesMap.values()).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return ok({ sales: salesArray });
}
