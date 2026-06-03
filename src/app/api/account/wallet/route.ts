import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  try {
    const { data: transactions, error } = await admin
      .from(TABLE.walletTransactions)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    let balance = 0;
    let totalCredited = 0;
    let totalDebited = 0;

    const formattedTransactions = (transactions || []).map(t => {
      const amount = Number(t.amount);
      if (t.type === 'credit') {
        balance += amount;
        totalCredited += amount;
      } else {
        balance -= amount;
        totalDebited += amount;
      }
      return { ...t, amount };
    });

    return ok({
      balance,
      totalCredited,
      totalDebited,
      transactions: formattedTransactions
    });
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar carteira');
  }
}
