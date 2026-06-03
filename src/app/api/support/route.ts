import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, subject, message } = body;

  if (!name || !email || !message) {
    return err('name, email e message são obrigatórios', 400);
  }

  const user = await getAuthUser(request);
  const admin = createSupabaseAdmin();

  const description = `[${subject || 'geral'}] ${name} <${email}>\n\n${message}`;

  const { data, error } = await admin
    .from(TABLE.supportTickets)
    .insert({
      user_id: user?.id || null,
      subject: `[${subject || 'site'}] ${name}`,
      description,
      priority: 'medium',
      status: 'open',
    })
    .select()
    .single();

  if (error) return err(error.message, 500);

  return ok({ ticket_id: data.id }, 201);
}
