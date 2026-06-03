import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log('[Webhook PickNGo] Notificação recebida:', payload);

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
