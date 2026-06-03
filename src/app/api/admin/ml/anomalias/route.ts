import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-server';

/**
 * Detecção de Anomalias Antifraude
 * Método: Análise de Desvio Padrão (Z-Score)
 * Objetivo: Identificar pedidos com valores muito acima do padrão ou de clientes suspeitos.
 */
export async function GET() {
  try {
    // Busca os pedidos dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const admin = createSupabaseAdmin();

    const { data: orders, error } = await admin
      .from('mktplace_feira_orders')
      .select('id, total_amount, created_at, customer_id, status')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: true, anomalies: [] });
    }

    // Calcular Média
    const amounts = orders.map(o => o.total_amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Calcular Desvio Padrão
    const squareDiffs = amounts.map(value => {
      const diff = value - mean;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const standardDeviation = Math.sqrt(avgSquareDiff);

    // Identificar anomalias (z-score > 2.5 significa que está muito acima da curva normal)
    const THRESHOLD = 2.5;
    const anomalies = [];

    // Frequência de pedidos por cliente (para detectar rajadas)
    const userOrderCounts: Record<string, number> = {};

    for (const order of orders) {
      // 1. Anomalia de Valor (Ticket Médio muito alto)
      let zScore = 0;
      if (standardDeviation > 0) {
        zScore = (order.total_amount - mean) / standardDeviation;
      }
      
      let reason = '';
      let isAnomaly = false;

      if (zScore > THRESHOLD) {
        isAnomaly = true;
        reason = `Valor muito alto (R$ ${order.total_amount.toFixed(2)}). Z-Score: ${zScore.toFixed(2)}`;
      }

      // 2. Anomalia de Frequência (Rajada de pedidos)
      const uId = order.customer_id;
      userOrderCounts[uId] = (userOrderCounts[uId] || 0) + 1;
      
      // Se o mesmo usuário fez mais de 5 pedidos nos últimos 30 dias (simplificação de "rajada" em poucas horas no mundo real)
      if (userOrderCounts[uId] > 5) {
        isAnomaly = true;
        reason = reason ? `${reason} | Múltiplos pedidos suspeitos` : 'Múltiplos pedidos suspeitos em curto período';
      }

      if (isAnomaly) {
        anomalies.push({
          order_id: order.id,
          customer_id: order.customer_id,
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          reason
        });
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalAnalyzed: orders.length,
        mean: mean.toFixed(2),
        stdDev: standardDeviation.toFixed(2),
      },
      anomalies
    });

  } catch (error: any) {
    console.error('Erro na detecção de anomalias:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
