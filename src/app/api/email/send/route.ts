import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return err('Apenas admins', 403);

  const { to, subject, html, text } = await request.json();
  if (!to || !subject || !html) return err('to, subject e html são obrigatórios', 400);

  try {
    await sendEmail({ to, subject, html, text });
    return ok({ sent: true });
  } catch (e: any) {
    return err(`Falha no envio: ${e.message}`, 500);
  }
}
