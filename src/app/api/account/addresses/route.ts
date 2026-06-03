import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  try {
    const { data: addresses, error } = await admin
      .from(TABLE.addresses)
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ok(addresses || []);
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar endereços');
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  try {
    const body = await request.json();
    const { street, number, complement, neighborhood, city, state, zip_code, is_default } = body;

    const admin = createSupabaseAdmin();

    if (is_default) {
      // Remover default dos outros endereços deste usuário
      await admin.from(TABLE.addresses).update({ is_default: false }).eq('user_id', user.id);
    }

    const { data: newAddress, error } = await admin
      .from(TABLE.addresses)
      .insert([{
        user_id: user.id,
        street, number, complement, neighborhood, city, state, zip_code,
        is_default: !!is_default
      }])
      .select()
      .single();

    if (error) throw error;
    return ok(newAddress);
  } catch (error: any) {
    return err(error.message || 'Erro ao salvar endereço');
  }
}
