import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const { id } = await params;

  try {
    const body = await request.json();
    const { street, number, complement, neighborhood, city, state, zip_code, is_default } = body;
    const admin = createSupabaseAdmin();

    if (is_default) {
      await admin.from(TABLE.addresses).update({ is_default: false }).eq('user_id', user.id);
    }

    const { data: updatedAddress, error } = await admin
      .from(TABLE.addresses)
      .update({ street, number, complement, neighborhood, city, state, zip_code, is_default: !!is_default })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return ok(updatedAddress);
  } catch (error: any) {
    return err(error.message || 'Erro ao atualizar endereço');
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const { id } = await params;

  try {
    const admin = createSupabaseAdmin();
    const { error } = await admin
      .from(TABLE.addresses)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return ok({ success: true });
  } catch (error: any) {
    return err(error.message || 'Erro ao remover endereço');
  }
}
