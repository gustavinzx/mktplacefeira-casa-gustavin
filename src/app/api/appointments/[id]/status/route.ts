import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  try {
    const { status } = await request.json();
    const validStatuses = ['pendente', 'confirmado', 'concluido', 'cancelado'];
    if (!validStatuses.includes(status)) {
      return err('Status inválido', 400);
    }

    const admin = createSupabaseAdmin();

    // Validar se o usuario é o chef deste agendamento ou se é o cliente cancelando
    const { data: appointment } = await admin
      .from('mktplace_feira_chef_appointments')
      .select('chef_id, customer_id')
      .eq('id', id)
      .single();

    if (!appointment) return err('Agendamento não encontrado', 404);
    
    if (appointment.chef_id !== user.id && appointment.customer_id !== user.id) {
      return err('Sem permissão para atualizar.', 403);
    }
    
    // Se o cliente tentar mudar, só pode mudar para cancelado
    if (appointment.customer_id === user.id && status !== 'cancelado') {
      return err('Cliente só pode cancelar o agendamento.', 403);
    }

    const { data, error } = await admin
      .from('mktplace_feira_chef_appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return ok(data);
  } catch (error: any) {
    return err(error.message || 'Erro ao atualizar agendamento');
  }
}
