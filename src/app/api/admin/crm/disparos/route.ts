import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { getTable, saveTable } from '@/lib/json-db';

const DB_KEY = 'admin_crm_disparos';

export async function GET() {
  try {
    const disparos = getTable(DB_KEY) || [];
    return NextResponse.json({ success: true, data: disparos });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from('mktplace_feira_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return err('Sem permissão', 403);

  try {
    const body = await req.json();
    saveTable(DB_KEY, body);
    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
