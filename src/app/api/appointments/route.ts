import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'customer'; // 'customer' ou 'chef'

  const admin = createSupabaseAdmin();
  
  try {
    let query = admin
      .from('mktplace_feira_chef_appointments')
      .select(`
        *,
        chef:mktplace_feira_profiles!chef_id(full_name, avatar_url, phone),
        customer:mktplace_feira_profiles!customer_id(full_name, avatar_url, phone),
        service:mktplace_feira_chef_services(title, price)
      `)
      .order('event_date', { ascending: true });

    if (type === 'chef') {
      query = query.eq('chef_id', user.id);
    } else {
      query = query.eq('customer_id', user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return ok(data || []);
  } catch (error: any) {
    return err(error.message || 'Erro ao buscar agendamentos');
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Para agendar um serviço, você precisa estar logado.', 401);

  try {
    const { chef_id, service_id, event_date, notes } = await request.json();

    if (!chef_id || !service_id || !event_date) {
      return err('Faltam dados obrigatórios para o agendamento.', 400);
    }

    const admin = createSupabaseAdmin();

    const { data, error } = await admin
      .from('mktplace_feira_chef_appointments')
      .insert({
        customer_id: user.id,
        chef_id,
        service_id,
        event_date,
        notes: notes || null,
        status: 'pendente'
      })
      .select()
      .single();

    if (error) throw error;

    return ok({ message: 'Agendamento solicitado com sucesso!', appointment: data }, 201);
  } catch (error: any) {
    console.error('Appointment error:', error);
    return err(error.message || 'Erro ao processar agendamento.', 500);
  }
}
