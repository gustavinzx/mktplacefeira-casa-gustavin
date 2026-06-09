import { getAuthUser, createSupabaseAdmin, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET() {
  const admin = createSupabaseAdmin();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 6);

    // Buscar pedidos para métricas de vendas e pedidos
    const { data: orders, error: ordersError } = await admin
      .from(TABLE.orders)
      .select('id, created_at, status, total_amount, items:mktplace_feira_order_items(quantity, unit_price)')
      .gte('created_at', lastWeek.toISOString());

    if (ordersError) throw ordersError;

    // Buscar perfis para métricas de novos feirantes
    const { data: profiles, error: profilesError } = await admin
      .from(TABLE.profiles)
      .select('id, full_name, email, role, created_at')
      .in('role', ['feirante', 'vendor']);

    if (profilesError) throw profilesError;

    let vendasTotais = 0;
    let vendasOntem = 0;
    let pedidosHoje = 0;
    let pedidosOntem = 0;
    const weekData = [0, 0, 0, 0, 0, 0, 0];

    orders.forEach((order: any) => {
      const date = new Date(order.created_at);
      const isDelivered = ['delivered', 'entregue', 'finalizado'].includes(order.status);
      
      // Crescimento Semanal (0 = domingo, 6 = sabado)
      if (isDelivered) {
        const dayOfWeek = date.getDay();
        weekData[dayOfWeek] += 1;
      }

      // Calcula o total_amount baseando-se nos items se necessário, ou usa o order.total_amount
      const orderTotal = order.items ? order.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price), 0) : order.total_amount;

      if (date >= today) {
        pedidosHoje++;
        if (isDelivered) vendasTotais += orderTotal || 0;
      } else if (date >= yesterday && date < today) {
        pedidosOntem++;
        if (isDelivered) vendasOntem += orderTotal || 0;
      }
    });

    let novosFeirantes = 0;
    let feirantesOntem = 0;
    let pending: any[] = [];

    profiles.forEach((p: any) => {
      const date = new Date(p.created_at);
      if (date >= today) novosFeirantes++;
      else if (date >= yesterday && date < today) feirantesOntem++;

      if (pending.length < 5) {
        pending.push({
          id: p.id,
          name: p.full_name || 'Sem Nome',
          email: p.email || 'N/A',
          type: 'Novo Feirante',
          location: 'BR',
          date: new Date(p.created_at).toLocaleDateString('pt-BR'),
          initial: (p.full_name || 'F')[0].toUpperCase()
        });
      }
    });

    const maxWeek = Math.max(...weekData, 1);
    const weeklyGrowth = weekData.map(v => Math.round((v / maxWeek) * 100));

    return ok({
      metrics: {
        vendasTotais,
        vendasOntem,
        novosFeirantes,
        feirantesOntem,
        pedidosHoje,
        pedidosOntem
      },
      weeklyGrowth,
      approvals: pending
    });
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar métricas');
  }
}
