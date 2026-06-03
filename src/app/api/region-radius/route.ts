import { NextResponse } from 'next/server';
import { fetchSiteSettings } from '@/lib/database';

// GET — retorna o raio padrão de busca configurado pelo admin
export async function GET() {
  try {
    const settings = await fetchSiteSettings();
    const radius = parseInt(settings['regiao_raio_padrao'] ?? '15', 10);
    return NextResponse.json({ success: true, radius });
  } catch (error: any) {
    return NextResponse.json({ success: false, radius: 15, error: error.message });
  }
}
