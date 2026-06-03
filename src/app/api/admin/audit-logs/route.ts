import { NextResponse } from 'next/server';
import { fetchAuditLogs } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await fetchAuditLogs();
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
