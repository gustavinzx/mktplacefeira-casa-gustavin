import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();

  try {
    // Total Orders
    const { count: totalOrders } = await admin
      .from(TABLE.orders)
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user.id);

    // Active Coupons (just count for now, simplified to see if they have any active)
    const { count: activeCoupons } = await admin
      .from(TABLE.coupons)
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());

    // Saved Addresses
    const { count: savedAddresses } = await admin
      .from(TABLE.addresses)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Wallet Balance (calculate from transactions)
    const { data: transactions } = await admin
      .from(TABLE.walletTransactions)
      .select('amount, type')
      .eq('user_id', user.id);
      
    let walletBalance = 0;
    if (transactions) {
      walletBalance = transactions.reduce((acc, curr) => {
        return curr.type === 'credit' ? acc + Number(curr.amount) : acc - Number(curr.amount);
      }, 0);
    }

    // Recent Orders (last 3)
    const { data: recentOrders } = await admin
      .from(TABLE.orders)
      .select(`
        id, 
        created_at, 
        total_amount, 
        status, 
        items:mktplace_feira_order_items(count)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    return ok({
      totalOrders: totalOrders || 0,
      activeCoupons: activeCoupons || 0,
      savedAddresses: savedAddresses || 0,
      walletBalance,
      recentOrders: recentOrders || []
    });

  } catch (error: any) {
    return err(error.message || 'Erro ao carregar resumo da conta');
  }
}
