import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();

  // Validar se o usuário é realmente administrador
  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return err('Acesso negado. Apenas administradores podem acessar o overview.', 403);
  }

  try {
    // 1. Fetch orders with customer profile to separate B2B vs B2C
    const { data: orders, error: ordersError } = await admin
      .from(TABLE.orders)
      .select(`
        id,
        total_amount,
        status,
        created_at,
        customer:mktplace_feira_profiles!customer_id(role, full_name)
      `);

    if (ordersError) throw ordersError;

    let vendasB2C = 0;
    let vendasB2B = 0;

    orders?.forEach(o => {
      const role = (o.customer as any)?.role || 'cliente';
      if (role === 'b2b' || role === 'chef') {
        vendasB2B += Number(o.total_amount || 0);
      } else {
        vendasB2C += Number(o.total_amount || 0);
      }
    });

    // 2. Fetch new producers count
    const { count: novosLojistas, error: producersError } = await admin
      .from(TABLE.producers)
      .select('*', { count: 'exact', head: true });

    if (producersError) throw producersError;

    // 3. Eficiência Logística (Mock for now, or calculated)
    const deliveredCount = orders?.filter(o => o.status === 'entregue').length || 0;
    const totalLogistics = orders?.filter(o => o.status !== 'pendente' && o.status !== 'cancelado').length || 1;
    let eficiencia = (deliveredCount / totalLogistics) * 100;
    if (totalLogistics === 0 || isNaN(eficiencia)) eficiencia = 94.8; // default mock

    // 4. Desempenho Semanal (Mock data)
    const desempenhoSemanal = [
      { day: 'SEG', h1: 40, h2: 25 },
      { day: 'TER', h1: 55, h2: 30 },
      { day: 'QUA', h1: 85, h2: 45 },
      { day: 'QUI', h1: 50, h2: 25 },
      { day: 'SEX', h1: 65, h2: 40 },
      { day: 'SAB', h1: Math.floor(Math.random() * 50) + 50, h2: 60 },
      { day: 'DOM', h1: 35, h2: 20 },
    ];

    // 5. Fila de Aprovações Pendentes
    const { data: pendingProducers } = await admin
      .from(TABLE.producers)
      .select(`
        id,
        stall_name,
        created_at,
        is_verified,
        profile:mktplace_feira_profiles!id(full_name)
      `)
      .eq('is_verified', false)
      .limit(5);

    const filaAprovacoes = pendingProducers?.map(p => ({
      id: p.id,
      name: p.stall_name,
      sub: (p.profile as any)?.full_name || 'Sem nome',
      type: 'Feirante',
      region: 'N/A', // We don't have region in producer easily available without fair_id join
      date: new Date(p.created_at).toLocaleDateString('pt-BR'),
      status: 'Pendente',
      color: 'orange'
    })) || [];

    return ok({
      vendasB2C,
      vendasB2B,
      novosLojistas: novosLojistas || 0,
      eficienciaLogistica: eficiencia.toFixed(1),
      desempenhoSemanal,
      filaAprovacoes
    });

  } catch (error: any) {
    return err(error.message || 'Erro ao buscar dados do overview');
  }
}
