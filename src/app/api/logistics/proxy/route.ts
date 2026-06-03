import { NextRequest, NextResponse } from 'next/server';
import { callIntegrationApi } from '@/lib/logistics';

export async function POST(request: NextRequest) {
  try {
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
