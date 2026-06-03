import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'customer'; // 'customer', 'producer', or 'admin'

  const admin = createSupabaseAdmin();
  
  try {
    let query = admin
      .from('mktplace_feira_orders')
      .select(`
        *,
        producer:mktplace_feira_producers(stall_name),
        customer:mktplace_feira_profiles(full_name, phone),
        items:mktplace_feira_order_items(
          *,
          product:mktplace_feira_products(title, image_url, unit)
        )
      `)
      .order('created_at', { ascending: false });

    const { data: profile } = await admin
      .from('mktplace_feira_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (type === 'admin') {
      if (profile?.role !== 'admin') {
        return err('Acesso administrativo negado', 403);
      }
      // Retorna todos os pedidos (acesso administrativo autorizado)
    } else if (type === 'delivery') {
      // Retorna pedidos para entrega
      query = query.in('status', ['pendente', 'pago', 'preparando', 'saiu_para_entrega']);
    } else if (type === 'producer') {
      // Retorna os pedidos em que eu sou o feirante
      query = query.eq('producer_id', user.id);
    } else {
      // Retorna as minhas compras
      query = query.eq('customer_id', user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return ok(data || []);
  } catch (error: any) {
    return err(error.message || 'Erro ao buscar pedidos');
  }
}
