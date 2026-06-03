import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  try {
    // Pegar todas as feiras que ele participa
    const { data: myFairsData } = await admin
      .from(TABLE.producerFairs)
      .select('id, status, joined_at, fair:mktplace_feira_fairs(*)')
      .eq('producer_id', user.id);

    // Pegar todas as feiras disponíveis globalmente (ativas)
    const { data: allFairs } = await admin
      .from(TABLE.fairs)
      .select('*')
      .order('name');

    const myFairs = myFairsData || [];
    const myFairIds = myFairs.map((mf: any) => {
      const fairData = Array.isArray(mf.fair) ? mf.fair[0] : mf.fair;
      return fairData?.id;
    }).filter(Boolean);
    
    // Feiras disponíveis para entrar (excluindo as que ele já está)
    const availableFairs = (allFairs || []).filter(f => !myFairIds.includes(f.id));

    return ok({ myFairs, availableFairs });
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar feiras');
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  try {
    const { fair_id } = await request.json();
    const admin = createSupabaseAdmin();

    const { error } = await admin
      .from(TABLE.producerFairs)
      .insert({ producer_id: user.id, fair_id, status: 'approved' }); // Auto approve for demo

    if (error) throw error;
    return ok({ success: true });
  } catch (error: any) {
    return err(error.message || 'Erro ao participar da feira');
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  try {
    const { searchParams } = new URL(request.url);
    const fair_id = searchParams.get('fair_id');
    const admin = createSupabaseAdmin();

    const { error } = await admin
      .from(TABLE.producerFairs)
      .delete()
      .eq('producer_id', user.id)
      .eq('fair_id', fair_id);

    if (error) throw error;
    return ok({ success: true });
  } catch (error: any) {
    return err(error.message || 'Erro ao sair da feira');
  }
}
