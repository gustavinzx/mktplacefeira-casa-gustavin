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
  try {
    const body = await req.json();
    saveTable(DB_KEY, body);
    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
