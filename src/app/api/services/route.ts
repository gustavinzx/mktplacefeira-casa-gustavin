import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();
  try {
    const { data: services, error } = await admin
      .from('mktplace_feira_chef_services')
      .select('*')
      .eq('chef_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        // Tabela ainda não existe
        return ok([]);
      }
      throw error;
    }

    return ok(services || []);
  } catch (error: any) {
    return err(error.message || 'Erro ao buscar serviços');
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  try {
    const body = await request.json();
    const admin = createSupabaseAdmin();

    const { data, error } = await admin
      .from('mktplace_feira_chef_services')
      .insert({
        title: body.title,
        price: body.price,
        status: body.status || 'Ativo',
        chef_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return ok(data);
  } catch (error: any) {
    return err(error.message || 'Erro ao criar serviço');
  }
}
