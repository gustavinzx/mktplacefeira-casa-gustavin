import { createSupabaseAdmin, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = createSupabaseAdmin();

  try {
    const { id } = await params;

    // Busca a feira
    const { data: fair, error: fairError } = await admin
      .from(TABLE.fairs)
      .select('*')
      .eq('id', id)
      .single();

    if (fairError || !fair) {
      return err('Feira não encontrada', 404);
    }

    // Busca os produtores (bancas) associados a esta feira, trazendo produtos como preview
    const { data: producers } = await admin
      .from(TABLE.producers)
      .select(`
        *,
        profile:mktplace_feira_profiles(full_name, avatar_url)
      `)
      .eq('fair_id', id);

    // Opcional: Busca até 3 produtos para preview de cada produtor
    let enrichedProducers = [];
    if (producers && producers.length > 0) {
      enrichedProducers = await Promise.all(
        producers.map(async (p) => {
          const { data: products } = await admin
            .from(TABLE.products)
            .select('id, title, price, image_url')
            .eq('producer_id', p.id)
            .limit(3);
          return { ...p, products: products || [] };
        })
      );
    }

    return ok({ fair, producers: enrichedProducers });

  } catch (error: any) {
    return err(error.message || 'Erro interno', 500);
  }
}
