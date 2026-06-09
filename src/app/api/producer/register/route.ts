import { getAuthUser, createSupabaseAdmin, err, ok } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return err('Não autorizado', 401);

    const body = await request.json();
    const admin = createSupabaseAdmin();

    // 1. Inserir em mktplace_feira_producers
    const { data: producer, error: producerError } = await admin
      .from('mktplace_feira_producers')
      .insert({
        id: user.id, // O produtor é o próprio usuário
        stall_name: body.stall_name,
        specialty: body.specialty,
        status: 'pending' // ou outro default
      })
      .select()
      .single();

    if (producerError) return err(producerError.message, 500);

    // 2. Adicionar o lead em mktplace_feira_crm_leads (Status = 'Novo')
    const { error: leadError } = await admin
      .from('mktplace_feira_crm_leads')
      .insert({
        name: body.full_name || body.stall_name,
        email: user.email || body.email,
        phone: body.phone,
        status: 'Novo',
        source: 'Cadastro App'
      });

    if (leadError) {
      console.warn('Erro ao criar lead no CRM:', leadError.message);
    }

    return ok(producer, 201);
  } catch (error: any) {
    return err(error.message || 'Erro interno', 500);
  }
}
