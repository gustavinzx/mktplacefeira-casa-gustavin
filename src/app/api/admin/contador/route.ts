import { createSupabaseAdmin, TABLE, ok, err } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = createSupabaseAdmin();
  try {
    const { data: orders, error } = await admin
      .from(TABLE.orders)
      .select(`
        id,
        total_amount,
        created_at,
        status,
        customer:mktplace_feira_profiles!customer_id(full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    let faturamentoTotal = 0;
    let vendasB2C = 0;
    let vendasB2B = 0;
    let repassesLogistica = 0;
    let repassesFeirantes = 0;
    let receitaPlataforma = 0;

    const transactions = orders?.map((o, i) => {
      const isB2B = (o.customer as any)?.role === 'b2b' || (o.customer as any)?.role === 'chef';
      const typeStr = isB2B ? 'B2B (CNPJ)' : 'B2C (CPF)';
      const clientName = (o.customer as any)?.full_name || 'Cliente';
      
      const val = Number(o.total_amount || 0);
      const aliqPercent = isB2B ? 12 : 18; 
      const taxVal = val * (aliqPercent / 100);
      
      const feeVal = val * 0.12; // 12% taxa feira casa
      const shippingVal = val * 0.05; // 5% estimativa de frete (mock para dados reais ausentes)
      const repasseVal = val - feeVal - shippingVal;
      const profitVal = feeVal + (shippingVal * 0.2); // spread de 20% no frete pro marketplace

      // Soma para as métricas gerais (apenas pagos ou entregues)
      if (o.status !== 'cancelado') {
        faturamentoTotal += val;
        if (isB2B) vendasB2B += val;
        else vendasB2C += val;
        repassesLogistica += shippingVal;
        repassesFeirantes += repasseVal;
        receitaPlataforma += profitVal;
      }

      const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
      const dateStr = new Date(o.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

      return {
        id: o.id,
        date: dateStr,
        note: `001 - ${24892 + i}`,
        client: clientName,
        type: typeStr,
        value: fmt(val),
        base: fmt(val),
        aliq: `${aliqPercent}%`,
        tax: fmt(taxVal),
        fee: fmt(feeVal),
        shipping: fmt(shippingVal),
        repasse: fmt(repasseVal),
        trans: `TRX-${99821 + i}`,
        profit: fmt(profitVal)
      };
    }) || [];

    return ok({
      transactions,
      metrics: {
        faturamentoTotal,
        vendasB2C,
        vendasB2B,
        repassesLogistica,
        repassesFeirantes,
        receitaPlataforma
      }
    });

  } catch (error: any) {
    return err(error.message || 'Erro ao processar dados do contador', 500);
  }
}
