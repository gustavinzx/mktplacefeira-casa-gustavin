import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();
  
  try {
    // Buscar faturamento total da regional (mocking by fetching all orders for now)
    const { data: orders, error: ordersErr } = await admin
      .from('mktplace_feira_orders')
      .select('total_amount, status');
      
    if (ordersErr) throw ordersErr;

    const faturamento = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const totalDelivery = orders.length;
    const comissao = faturamento * 0.08; // 8% de comissão pra franquia

    // Buscar produtores
    const { data: producers, error: prodErr } = await admin
      .from('mktplace_feira_producers')
      .select('id, stall_name, created_at, status')
      .order('created_at', { ascending: false });
      
    if (prodErr) throw prodErr;

    const pendingProducers = producers.filter(p => p.status === 'pendente').length;

    const activities = producers.slice(0, 5).map(p => ({
      date: new Date(p.created_at).toLocaleDateString('pt-BR'),
      vendor: p.stall_name,
      initial: p.stall_name.charAt(0).toUpperCase(),
      color: 'bg-green-100 text-green-700',
      action: 'Novo Cadastro',
      status: p.status === 'pendente' ? 'Pendente' : 'Ativo',
      statusColor: p.status === 'pendente' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
    }));

    return ok({
      faturamento,
      totalDelivery,
      pendingProducers,
      comissao,
      activities
    });
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar dados da franquia');
  }
}
