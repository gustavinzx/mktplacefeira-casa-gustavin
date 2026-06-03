import { createSupabaseAdmin } from '../supabase-server';

// Helper: calcula a similaridade do cosseno entre dois vetores simples
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Recomenda produtos baseados no histórico do usuário.
 * Estratégia de Filtragem Colaborativa Simples baseada em itens:
 * "Quem comprou este produto também comprou..."
 */
export async function getRecommendationsForUser(userId: string, limit = 4) {
  const supabase = createSupabaseAdmin();
  // 1. Pegar histórico de pedidos do usuário
  const { data: userOrders } = await supabase
    .from('mktplace_feira_orders')
    .select('id')
    .eq('customer_id', userId);

  if (!userOrders || userOrders.length === 0) {
    // Fallback: Produtos mais vendidos no geral se o usuário for novo
    return getTopSellingProducts(limit);
  }

  const orderIds = userOrders.map((o: any) => o.id);

  // 2. Pegar os itens que ele já comprou
  const { data: userItems } = await supabase
    .from('mktplace_feira_order_items')
    .select('product_id, quantity')
    .in('order_id', orderIds);

  if (!userItems || userItems.length === 0) {
    return getTopSellingProducts(limit);
  }

  const userProductIds = [...new Set(userItems.map((i: any) => i.product_id))];

  // 3. Buscar outros pedidos que contêm esses mesmos produtos
  const { data: similarOrders } = await supabase
    .from('mktplace_feira_order_items')
    .select('order_id')
    .in('product_id', userProductIds);

  const similarOrderIds = [...new Set((similarOrders || []).map((o: any) => o.order_id))];

  // 4. Buscar todos os itens desses outros pedidos
  const { data: allItemsInSimilarOrders } = await supabase
    .from('mktplace_feira_order_items')
    .select('product_id, quantity')
    .in('order_id', similarOrderIds);

  // 5. Contar a frequência de produtos (score simples)
  const productScores: Record<string, number> = {};
  (allItemsInSimilarOrders || []).forEach((item: any) => {
    // Ignorar os que o usuário já comprou (opcional, mas para descobrir novos é melhor)
    if (!userProductIds.includes(item.product_id)) {
      productScores[item.product_id] = (productScores[item.product_id] || 0) + item.quantity;
    }
  });

  const recommendedIds = Object.entries(productScores)
    .sort((a, b) => b[1] - a[1]) // ordena por score
    .slice(0, limit)
    .map(entry => entry[0]);

  if (recommendedIds.length === 0) {
    return getTopSellingProducts(limit);
  }

  const { data: recommendedProducts } = await supabase
    .from('mktplace_feira_products')
    .select('*, producer:mktplace_feira_producers(stall_name)')
    .in('id', recommendedIds);

  if (!recommendedProducts || recommendedProducts.length === 0) {
    return getTopSellingProducts(limit);
  }

  return recommendedProducts;
}

/**
 * Fallback: Busca os mais vendidos
 */
export async function getTopSellingProducts(limit = 4) {
  const supabase = createSupabaseAdmin();
  // Pega os itens de pedido mais frequentes
  const { data: items } = await supabase
    .from('mktplace_feira_order_items')
    .select('product_id, quantity');
    
  if (!items || items.length === 0) {
    // Se não tiver pedidos, pega produtos aleatórios
    const { data: random } = await supabase.from('mktplace_feira_products').select('*, producer:mktplace_feira_producers(stall_name)').limit(limit);
    return random || [];
  }

  const scores: Record<string, number> = {};
  items.forEach((i: any) => {
    scores[i.product_id] = (scores[i.product_id] || 0) + i.quantity;
  });

  const topIds = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(e => e[0]);

  if (topIds.length === 0) {
    const { data: random } = await supabase.from('mktplace_feira_products').select('*, producer:mktplace_feira_producers(stall_name)').limit(limit);
    return random || [];
  }

  const { data: topProducts } = await supabase
    .from('mktplace_feira_products')
    .select('*, producer:mktplace_feira_producers(stall_name)')
    .in('id', topIds);

  if (!topProducts || topProducts.length === 0) {
    const { data: random } = await supabase.from('mktplace_feira_products').select('*, producer:mktplace_feira_producers(stall_name)').limit(limit);
    return random || [];
  }

  return topProducts;
}

/**
 * Recomenda feirantes similares baseado na categoria de produtos
 */
export async function getSimilarVendors(vendorId: string, limit = 3) {
  const supabase = createSupabaseAdmin();
  const { data: currentVendor } = await supabase
    .from('mktplace_feira_profiles')
    .select('category')
    .eq('id', vendorId)
    .single();

  if (!currentVendor) return [];

  const { data: similar } = await supabase
    .from('mktplace_feira_profiles')
    .select('*')
    .eq('role', 'vendor')
    .eq('category', currentVendor.category)
    .neq('id', vendorId)
    .order('rating', { ascending: false })
    .limit(limit);

  return similar || [];
}
