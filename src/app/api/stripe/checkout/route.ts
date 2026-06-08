import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any, // compatibilidade com a versão instalada
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customer_email, order_id } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
       console.warn("Chave do Stripe ausente.");
       return NextResponse.json({ error: 'Serviço de pagamento não configurado no servidor.' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customer_email || undefined,
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.title || item.name || 'Produto',
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: Math.round((item.price || item.price_at_time) * 100), // Convertendo reais para centavos
        },
        quantity: item.quantity || 1,
      })),
      metadata: {
        order_id: order_id || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Erro ao criar sessão do Stripe:', error);
    return NextResponse.json({ error: error.message || 'Erro interno ao processar pagamento' }, { status: 500 });
  }
}
