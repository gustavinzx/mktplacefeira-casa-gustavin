import { getAuthUser, createSupabaseAdmin, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from('mktplace_feira_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return err('Sem permissão', 403);

  const { data, error } = await admin
    .from('mktplace_feira_b2b_fornecedores')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return err(error.message, 500);
  return ok(data ?? []);
}
