import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  try {
    const { data: subscription, error } = await admin
      .from('mktplace_feira_subscriptions')
      .select('*')
      .eq('producer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignora row not found

    return ok({
      subscription: subscription || { plan_type: 'basic', status: 'active', amount: 0 }
    });
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar assinatura');
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  try {
    const { plan_type, amount } = await request.json();
    const admin = createSupabaseAdmin();

    const { error } = await admin
      .from('mktplace_feira_subscriptions')
      .insert({
        producer_id: user.id,
        plan_type,
        amount,
        status: 'active'
      });

    if (error) throw error;
    return ok({ success: true });
  } catch (error: any) {
    return err(error.message || 'Erro ao atualizar assinatura');
  }
}
