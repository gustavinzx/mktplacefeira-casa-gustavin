import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function PUT(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  try {
    const body = await request.json();
    const { full_name, password } = body;
    const admin = createSupabaseAdmin();

    // 1. Update Profile (Name)
    if (full_name) {
      const { error: profileError } = await admin
        .from(TABLE.profiles)
        .update({ full_name })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
    }

    // 2. Update Password (Auth)
    if (password) {
      const { error: authError } = await admin.auth.admin.updateUserById(user.id, { password });
      if (authError) throw authError;
    }

    return ok({ success: true, message: 'Configurações atualizadas com sucesso' });
  } catch (error: any) {
    return err(error.message || 'Erro ao atualizar configurações');
  }
}
