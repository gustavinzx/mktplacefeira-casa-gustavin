// src/app/api/auth/register/route.ts
// POST /api/auth/register — Cadastro de novo usuário

import { createSupabaseClient, createSupabaseAdmin, TABLE, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name, role = 'cliente', phone } = body;
    const roleMap: Record<string, string> = {
      customer: 'cliente',
      cliente: 'cliente',
      vendor: 'feirante',
      feirante: 'feirante',
      chef: 'chef',
      admin: 'admin',
    };
    const dbRole = roleMap[role] || role;

    if (!email || !password || !full_name) {
      return err('email, password e full_name são obrigatórios', 400);
    }

    const supabase = createSupabaseClient();

    // 1. Cria o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return err(authError.message, 400);
    if (!authData.user) return err('Falha ao criar usuário', 500);

    // 2. Insere o perfil na tabela de profiles usando service role
    const admin = createSupabaseAdmin();
    const { data: profile, error: profileError } = await admin
      .from(TABLE.profiles)
      .insert({
        id: authData.user.id,
        email,
        full_name,
        role: dbRole,
        phone: phone ?? null,
      })
      .select()
      .single();

    if (profileError) {
      // Rollback: remove o usuário do Auth se o perfil falhou
      await admin.auth.admin.deleteUser(authData.user.id);
      return err(`Erro ao criar perfil: ${profileError.message}`, 500);
    }

    return ok(
      {
        user: { id: authData.user.id, email, full_name, role: dbRole },
        session: authData.session,
        profile,
      },
      201
    );
  } catch (e) {
    return err(`Erro interno: ${(e as Error).message}`, 500);
  }
}
