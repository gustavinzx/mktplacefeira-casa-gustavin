import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const secret = request.headers.get('x-pickngo-secret') || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedSecret = process.env.PICKNGO_WEBHOOK_SECRET;
  
  if (expectedSecret && secret !== expectedSecret) {
    return Response.json({ error: 'Webhook não autorizado' }, { status: 401 });
  }
  // Se não há secret configurado, aceitar (modo dev)
  if (!expectedSecret) {
    console.warn('[PickNGo Webhook] PICKNGO_WEBHOOK_SECRET não configurado — aceitando sem verificação');
  }

  try {
    const payload = await request.json();
    // console.log('[Webhook PickNGo] Notificação recebida:', payload);

    // Aqui você pode processar o status do pedido, por exemplo:
    // if (payload.status === 'Entregue') { ... }

    // Salvar o log do webhook no banco de dados (opcional, para auditoria)
    // await supabase.from('webhook_logs').insert({ platform: 'pickngo', payload });

    return NextResponse.json({ message: 'Webhook recebido com sucesso', status: 'OK' }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook PickNGo] Erro ao processar:', error.message);
    return NextResponse.json({ error: 'Erro interno ao processar webhook' }, { status: 500 });
  }
}
