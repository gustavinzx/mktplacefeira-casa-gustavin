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

    // Fetch all transactions
    const { data: dbTrans, error: transErr } = await admin
      .from('mktplace_feira_transactions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (transErr) throw transErr;

    const faturamentoTotal = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    // Platform margin (for example 15%)
    const lucroOperacional = faturamentoTotal * 0.15;
    // Payouts pending
    const repassesPendentes = orders.filter(o => o.status === 'entregue').reduce((acc, o) => acc + Number(o.total_amount || 0) * 0.85, 0);

    const transacoesOrders = orders.slice(0, 10).map((o, index) => ({
      id: o.id,
      desc: `Venda Marketplace #${o.id.substring(0,4).toUpperCase()}`,
      valor: `+ R$ ${Number(o.total_amount).toFixed(2).replace('.', ',')}`,
      status: o.status,
      date: new Date(o.created_at).toLocaleDateString('pt-BR'),
      type: 'Venda',
      timestamp: new Date(o.created_at).getTime()
    }));

    const transacoesManuais = (dbTrans || []).map(t => ({
      id: t.id,
      desc: t.description,
      valor: `${t.amount < 0 ? '-' : '+'} R$ ${Math.abs(t.amount).toFixed(2).replace('.', ',')}`,
      status: t.status,
      date: new Date(t.created_at).toLocaleDateString('pt-BR'),
      type: t.type,
      timestamp: new Date(t.created_at).getTime()
    }));

    // Merge and sort
    const transacoes = [...transacoesOrders, ...transacoesManuais]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 15);

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

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();
  
  try {
    const { data: profile } = await admin.from('mktplace_feira_profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return err('Sem permissão', 403);
    }

    const body = await request.json();
    const { description, amount, type } = body;

    if (!description || typeof amount !== 'number' || !type) {
      return err('Campos inválidos', 400);
    }

    const { error } = await admin.from('mktplace_feira_transactions').insert({
      description,
      amount,
      type,
      admin_id: user.id
    });

    if (error) throw error;

    return ok({ message: 'Transação criada com sucesso' });
  } catch (error: any) {
    return err(error.message || 'Erro ao criar transação');
  }
}
