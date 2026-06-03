import { supabase } from '../supabase';

/**
 * Calcula o "Quality Score" (0 a 100) de um feirante.
 * É baseado em:
 * - Avaliações (Rating médio): 40% do peso
 * - Volume de Vendas (Recência): 30% do peso
 * - Tempo na plataforma / Confiança: 10%
 * - Taxa de Conclusão de pedidos (sem cancelamentos): 20%
 */
export async function calculateVendorScore(vendorId: string): Promise<number> {
  const { data: vendor } = await supabase
    .from('profiles')
    .select('rating, created_at')
    .eq('id', vendorId)
    .single();

  if (!vendor) return 50; // Score mediano default

  // 1. Rating Score (max 40)
  const currentRating = vendor.rating || 4.5;
  const ratingScore = (currentRating / 5) * 40;

  // 2. Sales Volume (max 30) - Pedidos nos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, status')
    .eq('vendor_id', vendorId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  const totalOrders = recentOrders?.length || 0;
  // Consideramos 50 pedidos no mês como "excelente" (30 pontos)
  const volumeScore = Math.min((totalOrders / 50) * 30, 30);

  // 3. Taxa de Conclusão (max 20)
  let completionScore = 20; // Assume 100% inicialmente
  if (totalOrders > 0) {
    const cancelled = recentOrders!.filter(o => o.status === 'cancelled').length;
    const cancelRate = cancelled / totalOrders;
    // Se cancelou 0%, ganha 20. Se cancelou 20% ou mais, ganha 0.
    completionScore = Math.max(0, 20 - (cancelRate * 100));
  }

  // 4. Confiança / Tempo na plataforma (max 10)
  const createdAt = new Date(vendor.created_at);
  const now = new Date();
  const monthsActive = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
  // Mais de 6 meses ganha pontuação máxima
  const ageScore = Math.min((monthsActive / 6) * 10, 10);

  // Score Final
  const finalScore = ratingScore + volumeScore + completionScore + ageScore;
  
  return Math.round(finalScore);
}

/**
 * Atualiza o Score de todos os vendedores e retorna o Top 10
 */
export async function rankVendors() {
  const { data: vendors } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'vendor');
    
  if (!vendors) return [];

  const scores = await Promise.all(
    vendors.map(async (v) => {
      const score = await calculateVendorScore(v.id);
      return { id: v.id, score };
    })
  );

  // Ordenar do maior para o menor
  return scores.sort((a, b) => b.score - a.score);
}
