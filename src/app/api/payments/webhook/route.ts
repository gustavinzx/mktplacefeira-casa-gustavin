import Stripe from 'stripe';
import { createSupabaseAdmin, TABLE } from '@/lib/supabase-server';

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    // Mock mode: aceita qualquer webhook e processa (apenas para teste local sem chave)
    return Response.json({ received: true, mock: true });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any });
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return Response.json({ error: 'Webhook inválido' }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      // Atualizar pedido para 'pago'
      await admin
        .from(TABLE.orders)
        .update({ status: 'pago', payment_status: 'paid', paid_at: new Date().toISOString() })
        .eq('payment_intent_id', pi.id);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      await admin
        .from(TABLE.orders)
        .update({ status: 'pagamento_falhou', payment_status: 'failed' })
        .eq('payment_intent_id', pi.id);
    }

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Erro ao processar webhook do Stripe:', error.message);
    return Response.json({ error: 'Erro interno ao processar webhook' }, { status: 500 });
  }
}
