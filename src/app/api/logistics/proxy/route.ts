import { NextRequest, NextResponse } from 'next/server';
import { callIntegrationApi } from '@/lib/logistics';
import { getAuthUser, createSupabaseAdmin, err } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return err('Não autorizado', 401);
    const admin = createSupabaseAdmin();
    const { data: profile } = await admin
      .from('mktplace_feira_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!['admin', 'logistica', 'delivery'].includes(profile?.role || ''))
      return err('Sem permissão', 403);

    const { platformId, requestId, params } = await request.json();

    if (!platformId || !requestId) {
      return NextResponse.json({ success: false, error: 'platformId e requestId são obrigatórios.' }, { status: 400 });
    }

    const result = await callIntegrationApi(platformId, requestId, params ?? {});
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
