import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();

  // Verifica se é admin
  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return err('Acesso negado', 403);

  try {
    const { email, password, role, name } = await request.json();

    // 1. Cria usuário no Auth via Admin API (para não deslogar o admin atual)
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name }
    });

    if (authErr) return err(authErr.message, 400);
    if (!authData.user) return err('Erro ao criar auth user', 500);

    // 2. Insere no profiles
    const { error: profErr } = await admin.from(TABLE.profiles).insert([{
      id: authData.user.id,
      role: role || 'consumer',
      email: email,
      full_name: name,
      created_at: new Date().toISOString()
    }]);

    if (profErr) {
      // Rollback opcional
      await admin.auth.admin.deleteUser(authData.user.id);
      return err(profErr.message, 400);
    }

    return ok({ message: 'Usuário criado com sucesso' });
  } catch (error: any) {
    return err(error.message || 'Erro interno', 500);
  }
}
