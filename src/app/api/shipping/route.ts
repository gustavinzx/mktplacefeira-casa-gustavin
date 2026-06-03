import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { cep, items } = await request.json();

    if (!cep || typeof cep !== 'string') {
      return NextResponse.json({ success: false, message: 'CEP não informado.' }, { status: 400 });
    }

    // Limpa o CEP (remove traços e espaços)
    const cleanCEP = cep.replace(/\D/g, '');

    // Valida formato do CEP (exatamente 8 dígitos)
    if (cleanCEP.length !== 8) {
      return NextResponse.json({ success: false, message: 'CEP inválido. Deve conter 8 dígitos.' }, { status: 400 });
    }

    const admin = createSupabaseAdmin();

    // Buscar a configuração de zonas de entrega no banco
    const { data: zones, error } = await admin
      .from('mktplace_feira_logistics_zones')
      .select('*')
      .order('price', { ascending: true });

    let price = 15.00; // Fallback base
    let estimatedDays = 2;
    let available = true;
    let message = 'Frete Padrão';
    let carrier = 'Logística Feira';

    if (!error && zones && zones.length > 0) {
      // Tentar encontrar uma zona onde o CEP se encaixa
      // Supondo que 'zip_start' e 'zip_end' sejam strings com os prefixos de CEP
      const matchingZone = zones.find((z) => {
        const start = parseInt(z.zip_start.padEnd(8, '0'), 10);
        const end = parseInt(z.zip_end.padEnd(8, '9'), 10);
        const target = parseInt(cleanCEP, 10);
        return target >= start && target <= end;
      });

      if (matchingZone) {
        price = matchingZone.price;
        estimatedDays = matchingZone.estimated_days || 2;
        message = matchingZone.name || 'Frete Local';
        
        // Se a zona cobrar por peso, adiciona o cálculo
        if (matchingZone.price_per_kg && items && items.length > 0) {
          const totalWeight = items.reduce((acc: number, item: any) => acc + ((item.weight || 1) * item.quantity), 0);
          price += (totalWeight * matchingZone.price_per_kg);
        }
      } else {
        // CEP fora da área de atuação
        available = false;
        message = 'Região não atendida para entrega no momento.';
      }
    } else {
      // Fallback estático: Se não houver tabela de zonas configurada no DB
      // Vamos assumir que SP Capital (inicia com 01 a 09) é R$12 e Grande SP (09 a 19) é R$20.
      const prefix = parseInt(cleanCEP.substring(0, 2), 10);
      if (prefix >= 1 && prefix <= 5) {
        price = 12.00;
        estimatedDays = 1;
        message = 'Entrega Capital Expressa';
      } else if (prefix > 5 && prefix <= 19) {
        price = 22.00;
        estimatedDays = 2;
        message = 'Entrega Região Metropolitana';
      } else {
        available = false;
        message = 'Infelizmente ainda não entregamos no seu Estado/Interior.';
      }
    }

    if (!available) {
      return NextResponse.json({
        success: true,
        data: { available: false, message }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        price,
        estimatedDays,
        carrier,
        message
      }
    });

  } catch (err: any) {
    console.error('Erro no cálculo de frete:', err);
    return NextResponse.json({ success: false, message: 'Erro interno ao calcular o frete.' }, { status: 500 });
  }
}
