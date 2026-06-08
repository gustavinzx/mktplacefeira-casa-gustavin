import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return err('Sem permissão', 403);

  const { email, full_name, role } = await request.json();
  if (!email || !full_name) return err('email e full_name são obrigatórios', 400);

  // Cria usuário via Supabase Admin Auth (envia e-mail de convite)
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role: role || 'cliente' },
  });

  if (error) return err(error.message);
  return ok({ invited: true, user: data.user });
}
