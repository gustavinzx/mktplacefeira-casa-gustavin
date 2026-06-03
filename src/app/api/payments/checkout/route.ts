import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

type CartItem = { product_id: string; quantity: number; price?: number; title?: string };

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const body = await request.json();
  const { items, address_id, payment_method, coupon_code } = body as {
    items: CartItem[];
    address_id: string;
    payment_method: string;
    coupon_code?: string;
  };

  if (!items?.length || !address_id || !payment_method) {
    return err('items, address_id e payment_method são obrigatórios', 400);
  }

  const admin = createSupabaseAdmin();

  const { data: address } = await admin
    .from(TABLE.addresses)
    .select('id')
    .eq('id', address_id)
    .eq('user_id', user.id)
    .single();

  if (!address) return err('Endereço inválido', 400);

  const productIds = items.map((i) => i.product_id);
  const { data: dbProducts } = await admin
    .from(TABLE.products)
    .select('id, title, price, stock')
    .in('id', productIds);

  const products = items.map((item) => {
    const dbProduct = dbProducts?.find((p) => p.id === item.product_id);
    return {
      id: item.product_id,
      title: dbProduct?.title || item.title || 'Produto',
      price: Number(dbProduct?.price ?? item.price ?? 0),
      stock: dbProduct?.stock ?? 0,
    };
  });

  // Trava de estoque reativada a pedido do usuário
  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id)!;
    if (product.stock < item.quantity) {
      return err(`Estoque insuficiente para ${product.title}. Disponível: ${product.stock}`, 400);
    }
  }

  let subtotal = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id)!;
    subtotal += product.price * item.quantity;
  }

  let discount = 0;
  if (coupon_code) {
    const { data: coupon } = await admin
      .from(TABLE.coupons)
      .select('*')
      .eq('code', coupon_code.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (coupon && (!coupon.expires_at || new Date(coupon.expires_at) >= new Date())) {
      if (subtotal >= Number(coupon.min_purchase ?? 0)) {
        discount =
          coupon.discount_type === 'percent'
            ? subtotal * (Number(coupon.value) / 100)
            : Number(coupon.value);
      }
    }
  }

  const total = Math.max(0, subtotal - discount);

  const { data: order, error: orderError } = await admin
    .from(TABLE.orders)
    .insert({
      customer_id: user.id,
      address_id,
      total_amount: total,
      status: 'pendente',
      payment_method,
    })
    .select()
    .single();

  if (orderError) return err(`Erro ao criar pedido: ${orderError.message}`, 500);

  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id)!;
    return {
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: product.price,
    };
  });

  await admin.from(TABLE.orderItems).insert(orderItems);

  // decrement_stock_safe reativado e seguro
  for (const item of items) {
    await admin.rpc('decrement_stock_safe', {
      p_product_id: item.product_id,
      p_quantity: item.quantity
    });
  }

  await admin.from(TABLE.orders).update({ status: 'pago' }).eq('id', order.id);

  return ok({
    order_id: order.id,
    subtotal,
    discount,
    total,
    payment: { provider: 'simulated', status: 'pago' },
  }, 201);
}
