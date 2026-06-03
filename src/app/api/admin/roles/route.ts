import { NextResponse } from 'next/server';
import { fetchRoles, syncRole } from '@/lib/database';
import { supabaseAdmin, getTableName } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const roles = await fetchRoles();
    return NextResponse.json({ success: true, data: roles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await syncRole(body);
    if (!result.success) throw new Error(result.error);
    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) throw new Error("ID not provided");

    const { error } = await supabaseAdmin.from(getTableName('roles')).delete().eq('id', id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
