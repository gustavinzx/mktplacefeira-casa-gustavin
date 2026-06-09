import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    if (!role) {
      // Return counts
      const { data: counts, error } = await supabaseAdmin
        .from('mktplace_feira_profiles')
        .select('role');
      
      if (error) throw error;

      const stats = {
        total: counts.length,
        cliente: counts.filter((c: any) => c.role === 'cliente').length,
        feirante: counts.filter((c: any) => c.role === 'feirante').length,
        admin: counts.filter((c: any) => c.role === 'admin').length,
      };

      return NextResponse.json({ success: true, stats });
    }

    // Return list for specific role
    let query = supabaseAdmin
      .from('mktplace_feira_profiles')
      .select('id, email, full_name, role, phone, created_at, avatar_url, mktplace_feira_producers(is_verified)')
      .order('created_at', { ascending: false });

    if (role !== 'Todos') {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
