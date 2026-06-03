/**
 * Feira.Casa - Payment Gateway Integrations
 * 
 * Este módulo serve como um adaptador genérico para integrar a plataforma
 * aos gateways de pagamento (ex: Pagar.me, Asaas, Mercado Pago, Stripe).
 * Isso permite usar as mesmas funções para cobrar assinaturas e vendas no marketplace.
 */

export interface CustomerData {
  id?: string;
  name: string;
  email: string;
  document: string; // CPF ou CNPJ
  phone?: string;
}

export interface CardData {
  number: string;
  holderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
}

export interface SubscriptionRequest {
  planId: string;
  customerId: string;
  customerData?: CustomerData; // Pode vir preenchido se o cliente for novo
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  cardData?: CardData; 
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  status?: 'active' | 'pending' | 'failed';
  pixCode?: string; // Payload do PIX copia e cola se o método for PIX
  pixQrCodeUrl?: string;
  message?: string;
}

export interface PaymentRequest {
  amount: number;
  customerId: string;
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unitPrice: number;
  }>;
  cardData?: CardData;
}

export interface WithdrawalRequest {
  feiranteId: string;
  pixKey: string;
  grossAmount: number;
  marketplaceFeePercent: number; // Ex: 15%
  logisticsFeeValue: number; // Ex: 10.50
}

/**
 * Classe principal do Gateway de Pagamento.
 * Aqui implementaremos as chamadas para a API do banco selecionado (Asaas/Pagar.me/etc).
 */
export class PaymentGateway {
  
  /**
   * Cria uma assinatura recorrente.
   */
  static async createSubscription(data: SubscriptionRequest): Promise<SubscriptionResult> {
    // TODO: Implementar chamada à API do Gateway de Pagamento
    console.log('[PaymentGateway] Criando assinatura...', data);
    
    // Mock de resposta
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          subscriptionId: `sub_${Math.random().toString(36).substring(7)}`,
          status: 'active'
        });
      }, 1500);
    });
  }

  /**
   * Processa uma transação única (compra no marketplace).
   */
  static async processPayment(data: PaymentRequest) {
    // TODO: Implementar chamada à API do Gateway de Pagamento
    console.log('[PaymentGateway] Processando pagamento único...', data);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `txn_${Math.random().toString(36).substring(7)}`,
          status: 'paid'
        });
      }, 1500);
    });
  }

  /**
   * Cancela uma assinatura ativa.
   */
  static async cancelSubscription(subscriptionId: string) {
    console.log(`[PaymentGateway] Cancelando assinatura ${subscriptionId}...`);
    return { success: true };
  }

  /**
   * Cria ou atualiza um cliente no gateway de pagamento.
   */
  static async syncCustomer(data: CustomerData) {
    console.log('[PaymentGateway] Sincronizando cliente...', data);
    return {
      success: true,
      gatewayCustomerId: `cus_${Math.random().toString(36).substring(7)}`
    };
  }

  /**
   * Processa o saque do feirante aplicando o Split (Marketplace + Logística).
   */
  static async requestWithdrawalWithSplit(data: WithdrawalRequest) {
    console.log('[PaymentGateway] Solicitando saque com split (PIX)...', data);

    const taxaPlataforma = data.grossAmount * (data.marketplaceFeePercent / 100);
    const taxaLogistica = data.logisticsFeeValue;
    const valorLiquido = data.grossAmount - taxaPlataforma - taxaLogistica;

    // Simulação do comportamento da API de Split
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transferId: `trf_${Math.random().toString(36).substring(7)}`,
          status: 'processing',
          details: {
            grossAmount: data.grossAmount,
            platformFee: taxaPlataforma,
            logisticsFee: taxaLogistica,
            netAmountToFeirante: valorLiquido
          }
        });
      }, 1500);
    });
  }
}
