import { createSupabaseAdmin, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = createSupabaseAdmin();
  const resolvedParams = await params;
  const producerId = resolvedParams.id;

  try {
    // Busca produtor
    const { data: producer, error: producerError } = await admin
      .from('mktplace_feira_producers')
      .select('*, profile:mktplace_feira_profiles(*)')
      .eq('id', producerId)
      .single();

    if (producerError || !producer) {
      return err('Produtor não encontrado', 404);
    }

    // Busca produtos
    const { data: products } = await admin
      .from('mktplace_feira_products')
      .select('*')
      .eq('producer_id', producerId);

    return ok({
      producer,
      products: products || []
    });

  } catch (error: any) {
    return err(error.message || 'Erro ao buscar dados da banca');
  }
}
