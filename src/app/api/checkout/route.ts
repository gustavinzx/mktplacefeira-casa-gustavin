import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Para finalizar a compra, você precisa estar logado.', 401);

  try {
    const { items, address_id, payment_method, delivery_fee = 0, coupon_code } = await request.json();

    if (!items || items.length === 0) {
      return err('Seu carrinho está vazio.', 400);
    }

    const admin = createSupabaseAdmin();

    // 1. Agrupar os itens do carrinho por produtor (Feirante)
    const itemsByProducer: Record<string, any[]> = {};
    
    // Busca um feirante padrão para usar como fallback caso algum produto venha sem dono
    const { data: defaultFeirante } = await admin.from('mktplace_feira_profiles').select('id').eq('role', 'feirante').limit(1).single();
    const fallbackProducerId = defaultFeirante?.id || user.id;

    // Buscar preços REAIS do banco para evitar fraudes (manipulação do preço no frontend)
    // Verifica se há IDs inválidos (ex: mock antigo que não é UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const productIds = items.map((i: any) => i.id);
    const hasInvalidIds = productIds.some((id: string) => !uuidRegex.test(id));
    
    if (hasInvalidIds) {
      return err('Seu carrinho contém produtos da versão antiga do site. Por favor, limpe o carrinho e adicione novamente.', 400);
    }

    const { data: realProducts, error: realProductsError } = await admin
      .from('mktplace_feira_products')
      .select('id, price, producer_id, stock')
      .in('id', productIds);

    if (realProductsError || !realProducts) {
      console.error('realProductsError:', realProductsError, 'productIds:', productIds);
      return err(`Erro ao validar produtos. DB Error: ${realProductsError?.message || 'Nenhum produto'}`, 500);
    }

    let globalSubtotal = 0;

    for (const item of items) {
      const realProduct = realProducts.find((p) => p.id === item.id);
      if (!realProduct) {
        return err(`Produto não encontrado (ID: ${item.id})`, 404);
      }
      if (realProduct.stock < item.quantity) {
        return err(`Estoque insuficiente para o produto ID: ${item.id}`, 400);
      }

      // Usa o preço real e o dono real do banco
      const truePrice = realProduct.price;
      const producerId = realProduct.producer_id || fallbackProducerId;
      
      const validatedItem = { ...item, price: truePrice, producer_id: producerId };

      if (!itemsByProducer[producerId]) {
        itemsByProducer[producerId] = [];
      }
      itemsByProducer[producerId].push(validatedItem);
      globalSubtotal += (truePrice * validatedItem.quantity);
    }

    // 2. Validação SERVER-SIDE do Cupom
    let finalDiscount = 0;
    let validCouponId = null;

    if (coupon_code) {
      const { data: coupon } = await admin
        .from('mktplace_feira_coupons')
        .select('*')
        .ilike('code', coupon_code)
        .eq('active', true)
        .single();

      if (!coupon) {
        return err('Cupom inválido ou inativo.', 400);
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return err('Este cupom já expirou.', 400);
      }
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return err('Este cupom esgotou o limite de usos.', 400);
      }
      if (globalSubtotal < (coupon.min_order_value || 0)) {
        return err(`Este cupom exige uma compra mínima de R$ ${coupon.min_order_value}`, 400);
      }

      if (coupon.discount_type === 'percentage') {
        finalDiscount = globalSubtotal * (coupon.discount_value / 100);
      } else {
        finalDiscount = coupon.discount_value;
      }
      
      // Impede desconto maior que o subtotal
      if (finalDiscount > globalSubtotal) {
        finalDiscount = globalSubtotal;
      }

      validCouponId = coupon.id;
    }

    const createdOrders = [];

    // 3. Criar um pedido para cada produtor
    for (const [producerId, producerItems] of Object.entries(itemsByProducer)) {
      const subtotalAmount = producerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      // Proporção deste pedido em relação ao total do carrinho
      const ratio = globalSubtotal > 0 ? subtotalAmount / globalSubtotal : 1;
      
      // Rateio do frete e desconto validado
      const orderDeliveryFee = delivery_fee * ratio;
      const orderDiscount = finalDiscount * ratio;
      
      const totalAmount = subtotalAmount + orderDeliveryFee - orderDiscount;

      // Inserir na tabela de Pedidos
      const { data: order, error: orderError } = await admin
        .from('mktplace_feira_orders')
        .insert({
          user_id: user.id, // User who bought
          customer_id: user.id, // legacy
          producer_id: producerId,
          address_id: address_id || null,
          coupon_id: validCouponId, // Link o cupom ao pedido
          subtotal: subtotalAmount,
          discount: orderDiscount,
          shipping_cost: orderDeliveryFee,
          total_amount: Math.max(0, totalAmount),
          total: Math.max(0, totalAmount),
          status: 'pendente',
          payment_method: payment_method || 'Pix'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Inserir os itens do pedido
      const orderItemsToInsert = producerItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await admin
        .from('mktplace_feira_order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // Abater do estoque na tabela de produtos
      for (const item of producerItems) {
        const { error: stockError } = await admin.rpc('decrement_product_stock', { p_id: item.id, qty: item.quantity });
        if (stockError) {
          // Fallback if RPC doesn't exist
          const { data: prod } = await admin.from('mktplace_feira_products').select('stock').eq('id', item.id).single();
          if (prod) {
            await admin.from('mktplace_feira_products').update({ stock: Math.max(0, prod.stock - item.quantity) }).eq('id', item.id);
          }
        }
      }

      createdOrders.push(order);
    }

    // 4. Incrementar uso do cupom se foi utilizado
    if (validCouponId) {
      const { data: currentCoupon } = await admin.from('mktplace_feira_coupons').select('used_count').eq('id', validCouponId).single();
      if (currentCoupon) {
         await admin.from('mktplace_feira_coupons').update({ used_count: currentCoupon.used_count + 1 }).eq('id', validCouponId);
      }
    }

    return ok({ message: 'Pedido finalizado com sucesso!', orders: createdOrders });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return err(error.message || 'Erro ao processar checkout.', 500);
  }
}
