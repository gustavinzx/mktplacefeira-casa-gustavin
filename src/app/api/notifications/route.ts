import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return err('Apenas admins podem disparar notificações', 403);

  const { titulo, mensagem, publico } = await request.json();
  if (!titulo || !mensagem) return err('titulo e mensagem são obrigatórios', 400);

  let usersQuery = admin.from(TABLE.profiles).select('id');
  if (publico === 'feirantes') usersQuery = usersQuery.eq('role', 'feirante');
  else if (publico === 'chefs') usersQuery = usersQuery.eq('role', 'chef');
  else if (publico === 'clientes') usersQuery = usersQuery.eq('role', 'cliente');

  const { data: users, error: usersError } = await usersQuery;
  if (usersError) return err(usersError.message);
  if (!users || users.length === 0) return err('Nenhum usuário encontrado');

  const notifications = users.map((u: { id: string }) => ({
    user_id: u.id,
    title: titulo,
    message: mensagem,
    type: 'admin',
    read: false,
  }));

  const { error } = await admin.from(TABLE.notifications).insert(notifications);
  if (error) return err(error.message);

  return ok({ count: notifications.length });
}
