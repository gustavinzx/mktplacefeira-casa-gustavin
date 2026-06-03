import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Busca roles de franquia
    const { data: roles } = await supabaseAdmin
      .from('mktplace_feira_roles')
      .select('id')
      .ilike('name', '%franq%');

    const roleIds = roles?.map((r: any) => r.id) || [];

    if (roleIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Busca admins vinculados a essas roles
    const { data: admins, error } = await supabaseAdmin
      .from('mktplace_feira_admins')
      .select('*, mktplace_feira_roles(name)')
      .in('role_id', roleIds)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const mapped = admins.map((admin: any) => ({
      id: admin.id,
      name: admin.department || `Franquia de ${admin.full_name}`,
      owner: admin.full_name,
      region: admin.job_role || 'Geral',
      units: 1, // Placeholder
      growth: '0%', // Placeholder
      status: admin.access_level === 'active' ? 'Ativo' : 'Pendente',
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.full_name || 'F')}&background=random`
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Get the Franqueado role
    const { data: roles } = await supabaseAdmin
      .from('mktplace_feira_roles')
      .select('id')
      .ilike('name', '%franq%')
      .limit(1)
      .single();

    const role_id = roles?.id;

    // Insert into mktplace_feira_admins
    const { error } = await supabaseAdmin
      .from('mktplace_feira_admins')
      .insert({
        full_name: body.name,
        email: body.email,
        department: body.department || 'Franquias',
        job_role: body.region || 'Regional',
        access_level: 'active',
        role_id: role_id
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
