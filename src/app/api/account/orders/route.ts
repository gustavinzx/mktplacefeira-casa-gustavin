import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  const admin = createSupabaseAdmin();

  try {
    let query = admin
      .from(TABLE.orders)
      .select(`
        *,
        items:mktplace_feira_order_items(
          id, quantity, unit_price,
          product:mktplace_feira_products(title, image_url)
        )
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return ok(orders || []);
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar pedidos');
  }
}
