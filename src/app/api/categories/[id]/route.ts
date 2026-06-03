// src/app/api/categories/[id]/route.ts
// GET /api/categories/:id — Detalhe com produtos
// PUT /api/categories/:id — Atualiza (admin)
// DELETE /api/categories/:id — Remove (admin)

import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

async function assertAdmin(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return { user: null, error: err('Não autenticado', 401) };

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from(TABLE.profiles)
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { user: null, error: err('Acesso negado', 403) };
  return { user, error: null };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLE.categories)
    .select('*, products:mktplace_feira_products(id, title, price, image_url)')
    .eq('id', id)
    .single();

  if (error) return err('Categoria não encontrada', 404);
  return ok(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await assertAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name) updates.name = body.name;
  if (body.icon !== undefined) updates.icon = body.icon;
  if (body.slug) updates.slug = body.slug;

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLE.categories)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return err(error.message, 400);
  return ok(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await assertAdmin(request);
  if (authError) return authError;

  const admin = createSupabaseAdmin();
  const { error } = await admin.from(TABLE.categories).delete().eq('id', id);
  if (error) return err(error.message, 400);

  return ok({ message: 'Categoria removida com sucesso' });
}
