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
    if (totalLogistics === 0 || isNaN(eficiencia)) eficiencia = 0;

    // 4. Desempenho Semanal (Real data)
    const desempenhoSemanal = [
      { day: 'SEG', h1: 0, h2: 0 },
      { day: 'TER', h1: 0, h2: 0 },
      { day: 'QUA', h1: 0, h2: 0 },
      { day: 'QUI', h1: 0, h2: 0 },
      { day: 'SEX', h1: 0, h2: 0 },
      { day: 'SAB', h1: 0, h2: 0 },
      { day: 'DOM', h1: 0, h2: 0 },
    ];

    orders?.forEach(o => {
      const date = new Date(o.created_at);
      // getDay() is 0 for Sunday, 1 for Monday... We want SEG to DOM
      const dayIndex = date.getDay(); // 0 = DOM, 1 = SEG ... 6 = SAB
      // Map to array index: SEG=0, TER=1, QUA=2, QUI=3, SEX=4, SAB=5, DOM=6
      const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      
      const role = (o.customer as any)?.role || 'cliente';
      const amount = Number(o.total_amount || 0);
      if (role === 'b2b' || role === 'chef') {
        desempenhoSemanal[mappedIndex].h2 += amount;
      } else {
        desempenhoSemanal[mappedIndex].h1 += amount;
      }
    });

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
