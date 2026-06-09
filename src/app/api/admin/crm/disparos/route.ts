import { getAuthUser, createSupabaseAdmin, ok, err } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from('mktplace_feira_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return err('Sem permissão', 403);

  const { data, error } = await admin
    .from('mktplace_feira_crm_campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return err(error.message, 500);
  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return err('Não autorizado', 401);
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from('mktplace_feira_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return err('Sem permissão', 403);

  const body = await req.json();
  const { data, error } = await admin
    .from('mktplace_feira_crm_campaigns')
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
