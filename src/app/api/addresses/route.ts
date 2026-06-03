import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLE.addresses)
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  if (error) return err(error.message, 500);
  return ok(data ?? []);
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const body = await request.json();
  const { street, number, complement, neighborhood, city, state, zip_code, is_default } = body;

  if (!street || !number || !city || !state || !zip_code) {
    return err('street, number, city, state e zip_code são obrigatórios', 400);
  }

  const admin = createSupabaseAdmin();

  if (is_default) {
    await admin.from(TABLE.addresses).update({ is_default: false }).eq('user_id', user.id);
  }

  const { data, error } = await admin
    .from(TABLE.addresses)
    .insert({
      user_id: user.id,
      street,
      number,
      complement: complement ?? null,
      neighborhood: neighborhood ?? null,
      city,
      state,
      zip_code,
      is_default: is_default ?? true,
    })
    .select()
    .single();

  if (error) return err(error.message, 400);
  return ok(data, 201);
}
