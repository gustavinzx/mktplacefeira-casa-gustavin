import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// ─── Utilitário: Regressão Linear Simples ────────────────────────────────────
function linearRegression(points: number[]): { slope: number; intercept: number } {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  const sumX = points.reduce((acc, _, i) => acc + i, 0);
  const sumY = points.reduce((acc, v) => acc + v, 0);
  const sumXY = points.reduce((acc, v, i) => acc + i * v, 0);
  const sumX2 = points.reduce((acc, _, i) => acc + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// ─── Utilitário: Desvio Padrão ─────────────────────────────────────────────
function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();

  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return err('Acesso negado', 403);
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const fifteenDaysAgo = new Date(now);
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // ── 1. Buscar todos os pedidos e itens dos últimos 30 dias ─────────────
    const { data: orders } = await admin
      .from(TABLE.orders)
      .select('id, total_amount, status, created_at, customer_id')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { data: orderItems } = await admin
      .from(TABLE.orderItems)
      .select('product_id, quantity, price');

    const { data: products } = await admin
      .from(TABLE.products)
      .select('id, name, price, vendor_id');

    const { data: producers } = await admin
      .from(TABLE.producers)
      .select('id, stall_name, profile_id, created_at');

    // ── 2. Produtos em Alta (top 5 mais vendidos nos últimos 30 dias) ──────
    const productCount: Record<string, { count: number; name: string; revenue: number }> = {};
    if (orderItems && products) {
      const productMap = new Map(products.map(p => [p.id, p]));
      orderItems.forEach(item => {
        const product = productMap.get(item.product_id);
        if (!product) return;
        if (!productCount[item.product_id]) {
          productCount[item.product_id] = { count: 0, name: product.name, revenue: 0 };
        }
        productCount[item.product_id].count += item.quantity || 1;
        productCount[item.product_id].revenue += (item.price || 0) * (item.quantity || 1);
      });
    }
    const produtosEmAlta = Object.entries(productCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));

    // ── 3. Feirantes em Risco de Churn (sem vendas nos últimos 15 dias) ───
    const recentVendorIds = new Set<string>();
    if (orders && products) {
      const recentOrders = orders.filter(o => new Date(o.created_at) >= fifteenDaysAgo);
      // pega vendors via order items
      if (orderItems && products) {
        const productMap = new Map(products.map(p => [p.id, p.vendor_id]));
        orderItems.forEach(item => {
          const vendorId = productMap.get(item.product_id);
          if (vendorId) recentVendorIds.add(vendorId);
        });
      }
    }
    const feirantesEmRisco = (producers || [])
      .filter(p => !recentVendorIds.has(p.profile_id || p.id))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        nome: p.stall_name || 'Feirante',
        diasSemVenda: 15
      }));

    // ── 4. Melhor Horário para Promoções ──────────────────────────────────
    const hourCount: Record<number, number> = {};
    (orders || []).forEach(o => {
      const hour = new Date(o.created_at).getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });
    let bestHour = 12;
    let bestCount = 0;
    Object.entries(hourCount).forEach(([h, count]) => {
      if (count > bestCount) {
        bestCount = count;
        bestHour = parseInt(h);
      }
    });
    const melhorHorario = {
      hora: `${bestHour}:00 – ${bestHour + 1}:00`,
      pedidos: bestCount,
      recomendacao: `Dispare promoções entre ${bestHour}h e ${bestHour + 2}h para atingir o pico de usuários ativos.`
    };

    // ── 5. Previsão de Demanda (próximos 7 dias via regressão linear) ──────
    // Agrupar pedidos por dia nos últimos 7 dias
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const dailyCounts = last7Days.map(day => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      return (orders || []).filter(o => {
        const d = new Date(o.created_at);
        return d >= day && d < nextDay;
      }).length;
    });
    const { slope, intercept } = linearRegression(dailyCounts);
    const previsaoProximos7 = Array.from({ length: 7 }, (_, i) => {
      const predicted = Math.max(0, Math.round(intercept + slope * (7 + i)));
      const d = new Date(now);
      d.setDate(d.getDate() + i + 1);
      return {
        dia: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        pedidosPrevistoss: predicted
      };
    });
    const alertaPico = previsaoProximos7.some(d => d.pedidosPrevistoss > (dailyCounts.reduce((a, b) => a + b, 0) / 7) * 1.3)
      ? 'Esperamos um pico de demanda nos próximos dias. Reforce a equipe logística!'
      : null;

    // ── 6. Detecção de Anomalias (Antifraude) ────────────────────────────
    const amounts = (orders || []).map(o => Number(o.total_amount || 0));
    const meanAmt = amounts.reduce((a, b) => a + b, 0) / (amounts.length || 1);
    const std = stdDev(amounts);
    const pedidosSuspeitos = (orders || [])
      .filter(o => Number(o.total_amount) > meanAmt + 2.5 * std && std > 0)
      .slice(0, 5)
      .map(o => ({
        id: o.id.substring(0, 8).toUpperCase(),
        valor: Number(o.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        data: new Date(o.created_at).toLocaleDateString('pt-BR'),
        motivo: `Valor ${((Number(o.total_amount) - meanAmt) / std).toFixed(1)}σ acima da média`
      }));

    return ok({
      produtosEmAlta,
      feirantesEmRisco,
      melhorHorario,
      previsaoProximos7,
      alertaPico,
      pedidosSuspeitos,
      totalOrdersAnalisados: orders?.length || 0,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    return err(error.message || 'Erro ao calcular insights de ML');
  }
}
