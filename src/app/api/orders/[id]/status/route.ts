import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const { status } = await request.json();
  if (!status) return err('Status é obrigatório', 400);

  const admin = createSupabaseAdmin();

  // Verifica se o usuário é feirante ou admin
  const { data: profile } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin' && profile?.role !== 'feirante') {
    return err('Sem permissão', 403);
  }

  // Atualiza o status do pedido
  const { data, error } = await admin
    .from(TABLE.orders)
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return err(error.message, 400);

  return ok(data);
}
