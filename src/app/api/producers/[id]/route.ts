import { createSupabaseAdmin, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = createSupabaseAdmin();
  const { id } = await params;

  try {
    // Busca a banca (producer) e relaciona com o perfil e a feira atual
    const { data: producer, error: producerError } = await admin
      .from(TABLE.producers)
      .select(`
        *,
        profile:mktplace_feira_profiles(full_name, avatar_url),
        fair:mktplace_feira_fairs(name, location, city)
      `)
      .eq('id', id)
      .single();

    if (producerError || !producer) {
      return err('Banca não encontrada', 404);
    }

    // Busca os produtos desta banca
    const { data: products } = await admin
      .from(TABLE.products)
      .select('*')
      .eq('producer_id', id)
      .order('created_at', { ascending: false });

    return ok({ producer, products: products || [] });

  } catch (error: any) {
    return err(error.message || 'Erro interno', 500);
  }
}
