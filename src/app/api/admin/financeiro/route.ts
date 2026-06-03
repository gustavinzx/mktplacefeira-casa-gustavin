import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();
  
  try {
    // Check if user is admin
    const { data: profile } = await admin.from('mktplace_feira_profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return err('Sem permissão', 403);
    }

    // Fetch all orders
    const { data: orders, error: ordersErr } = await admin
      .from('mktplace_feira_orders')
      .select('id, total_amount, status, created_at')
      .order('created_at', { ascending: false });
      
    if (ordersErr) throw ordersErr;

    const faturamentoTotal = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    // Platform margin (for example 15%)
    const lucroOperacional = faturamentoTotal * 0.15;
    // Payouts pending
    const repassesPendentes = orders.filter(o => o.status === 'entregue').reduce((acc, o) => acc + Number(o.total_amount || 0) * 0.85, 0);

    const transacoes = orders.slice(0, 10).map((o, index) => ({
      id: o.id,
      desc: `Venda Marketplace #${o.id.substring(0,4).toUpperCase()}`,
      valor: `+ R$ ${Number(o.total_amount).toFixed(2).replace('.', ',')}`,
      status: o.status,
      date: new Date(o.created_at).toLocaleDateString('pt-BR'),
      type: 'Venda'
    }));

    return ok({
      faturamentoTotal,
      lucroOperacional,
      repassesPendentes,
      transacoes
    });
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar dados financeiros');
  }
}
