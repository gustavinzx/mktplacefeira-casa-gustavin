import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any }) // Use a valid API version or cast to any for this version
  : null;

interface PaymentRequest {
  amount: number;
  customerId?: string;
  items: Array<{ id: string }>;
}

interface SubscriptionRequest {
  planId: string;
  customerData?: { name: string; email: string };
}

interface WithdrawalRequest {
  grossAmount: number;
  marketplaceFeePercent: number;
  logisticsFeeValue: number;
  pixKey: string;
}

interface CustomerData {
  name: string;
  email: string;
}

export class PaymentGateway {

  static async processPayment(data: PaymentRequest) {
    if (!stripe) {
      // MOCK MODE — sem chave Stripe configurada
      console.warn('[PAYMENT MOCK] Stripe não configurado — usando simulação');
      return {
        success: true,
        transactionId: `mock_${Date.now()}`,
        status: 'paid',
        mock: true
      };
    }

    // REAL MODE — Stripe real
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Stripe usa centavos
        currency: 'brl',
        payment_method_types: ['card', 'pix'],
        metadata: {
          customerId: data.customerId || '',
          items: JSON.stringify(data.items.map(i => i.id))
        }
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro no pagamento';
      return { success: false, message };
    }
  }

  static async createSubscription(data: SubscriptionRequest) {
    if (!stripe) {
      console.warn('[PAYMENT MOCK] Stripe não configurado — usando simulação');
      return {
        success: true,
        subscriptionId: `mock_sub_${Date.now()}`,
        status: 'active' as const,
        mock: true
      };
    }

    try {
      // Criar ou buscar customer no Stripe
      const customers = await stripe.customers.list({ email: data.customerData?.email, limit: 1 });
      let customerId = customers.data[0]?.id;

      if (!customerId && data.customerData) {
        const customer = await stripe.customers.create({
          name: data.customerData.name,
          email: data.customerData.email,
        });
        customerId = customer.id;
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId!,
        items: [{ price: data.planId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status as 'active' | 'pending' | 'failed',
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro na assinatura';
      return { success: false, message };
    }
  }

  static async requestWithdrawalWithSplit(data: WithdrawalRequest) {
    if (!stripe) {
      const taxaPlataforma = data.grossAmount * (data.marketplaceFeePercent / 100);
      const taxaLogistica = data.logisticsFeeValue;
      const valorLiquido = data.grossAmount - taxaPlataforma - taxaLogistica;
      console.warn('[PAYMENT MOCK] Saque simulado');
      return {
        success: true,
        transferId: `mock_trf_${Date.now()}`,
        status: 'processing',
        details: { grossAmount: data.grossAmount, platformFee: taxaPlataforma,
                   logisticsFee: taxaLogistica, netAmountToFeirante: valorLiquido }
      };
    }

    // Stripe Connect Transfer real
    try {
      const taxaPlataforma = data.grossAmount * (data.marketplaceFeePercent / 100);
      const taxaLogistica = data.logisticsFeeValue;
      const valorLiquido = data.grossAmount - taxaPlataforma - taxaLogistica;

      const transfer = await stripe.transfers.create({
        amount: Math.round(valorLiquido * 100),
        currency: 'brl',
        destination: data.pixKey, // Na prática seria o stripe_account_id do feirante
      });

      return {
        success: true,
        transferId: transfer.id,
        status: 'processing',
        details: { grossAmount: data.grossAmount, platformFee: taxaPlataforma,
                   logisticsFee: taxaLogistica, netAmountToFeirante: valorLiquido }
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro no saque';
      return { success: false, message };
    }
  }

  static async syncCustomer(data: CustomerData) {
    if (!stripe) return { success: true, gatewayCustomerId: `mock_cus_${Date.now()}` };
    try {
      const existing = await stripe.customers.list({ email: data.email, limit: 1 });
      if (existing.data[0]) {
        return { success: true, gatewayCustomerId: existing.data[0].id };
      }
      const customer = await stripe.customers.create({ name: data.name, email: data.email });
      return { success: true, gatewayCustomerId: customer.id };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro';
      return { success: false, message };
    }
  }

  static async cancelSubscription(subscriptionId: string) {
    if (!stripe || subscriptionId.startsWith('mock_')) return { success: true };
    try {
      await stripe.subscriptions.cancel(subscriptionId);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro';
      return { success: false, message };
    }
  }
}
