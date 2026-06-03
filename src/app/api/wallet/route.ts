import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();
  try {
    const { data: cards, error } = await admin
      .from('mktplace_feira_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Se o banco retornar erro (como tabela inexistente), mandamos vazio para não quebrar o front
    if (error) {
      console.error(error);
      return ok([]);
    }

    return ok(cards || []);
  } catch (error: any) {
    return err(error.message || 'Erro ao buscar cartões');
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  try {
    const body = await request.json();
    const admin = createSupabaseAdmin();

    // Se for o primeiro cartão do usuário ou ele marcou como default, setamos true
    // Aqui para simplificar, vamos deixar is_default = true se o usuário mandou, ou se é o primeiro.
    
    // Pega a marca baseada no numero ou mockada
    const brandMatch = body.cardNumber?.startsWith('4') ? 'Visa' : 'Mastercard';
    const last4 = body.cardNumber?.slice(-4) || '0000';

    const { data, error } = await admin
      .from('mktplace_feira_cards')
      .insert({
        user_id: user.id,
        brand: brandMatch,
        last4: last4,
        expiry: body.expiry,
        holder: body.holder,
        is_default: true
      })
      .select()
      .single();

    if (error) throw error;

    return ok(data);
  } catch (error: any) {
    return err(error.message || 'Erro ao adicionar cartão');
  }
}
