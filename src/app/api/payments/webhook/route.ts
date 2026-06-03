// src/app/api/payments/webhook/route.ts
// POST /api/payments/webhook — Webhook do Stripe para confirmar pagamentos
//
// Configure no Stripe Dashboard: https://dashboard.stripe.com/webhooks
// Evento necessário: payment_intent.succeeded

import { createSupabaseAdmin, TABLE, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return err('Stripe não configurado', 501);
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) return err('Assinatura Stripe ausente', 400);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // @ts-ignore — stripe é opcional; só executa se STRIPE_SECRET_KEY estiver configurado
    const stripe = (await import('stripe' as any)).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);

    const event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    const admin = createSupabaseAdmin();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as { metadata: { order_id: string } };
        const orderId = intent.metadata?.order_id;

        if (orderId) {
          await admin
            .from(TABLE.orders)
            .update({ status: 'paid', updated_at: new Date().toISOString() })
            .eq('id', orderId);

          // Desconta estoque dos itens do pedido
          const { data: items } = await admin
            .from(TABLE.orderItems)
            .select('product_id, quantity')
            .eq('order_id', orderId);

          if (items) {
            for (const item of items) {
              await admin.rpc('decrement_stock_safe', {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
              });
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as { metadata: { order_id: string } };
        const orderId = intent.metadata?.order_id;
        if (orderId) {
          await admin
            .from(TABLE.orders)
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', orderId);
        }
        break;
      }

      default:
        // Evento não tratado — ignora silenciosamente
        break;
    }

    return ok({ received: true });
  } catch (e) {
    return err(`Webhook error: ${(e as Error).message}`, 400);
  }
}
