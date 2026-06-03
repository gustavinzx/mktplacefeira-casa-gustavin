import { createSupabaseAdmin, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chefId = searchParams.get('chef_id');

  if (!chefId) return err('chef_id não informado', 400);

  const admin = createSupabaseAdmin();
  try {
    const { data: services, error } = await admin
      .from('mktplace_feira_chef_services')
      .select('*')
      .eq('chef_id', chefId)
      .eq('status', 'Ativo')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        // Tabela ainda não existe
        return ok({ data: [] });
      }
      throw error;
    }

    return ok({ data: services || [] });
  } catch (error: any) {
    return err(error.message || 'Erro ao buscar serviços');
  }
}
