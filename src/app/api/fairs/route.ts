import { createSupabaseAdmin, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  const admin = createSupabaseAdmin();
  let query = admin.from(TABLE.fairs).select('*').order('name');

  if (city) query = query.ilike('city', `%${city}%`);

  const { data, error } = await query;
  if (error) return err(error.message, 500);
  return ok(data ?? []);
}
