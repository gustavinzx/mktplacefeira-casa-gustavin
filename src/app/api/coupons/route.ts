import { NextResponse } from 'next/server';
import { createSupabaseAdmin, getAuthUser } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, message: 'Código do cupom não informado.' }, { status: 400 });
    }

    const admin = createSupabaseAdmin();
    const user = await getAuthUser(request);

    // Buscar cupom no banco (case insensitive)
    const { data: coupon, error } = await admin
      .from('mktplace_feira_coupons')
      .select('*')
      .ilike('code', code.trim())
      .single();

    if (error || !coupon) {
      return NextResponse.json({ success: false, message: 'Cupom inválido ou não encontrado.' }, { status: 404 });
    }

    // Verificar se está ativo
    if (!coupon.is_active) {
      return NextResponse.json({ success: false, message: 'Este cupom não está mais ativo.' }, { status: 400 });
    }

    // Verificar expiração
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ success: false, message: 'Este cupom já expirou.' }, { status: 400 });
    }

    // Verificar limite de uso global
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ success: false, message: 'Este cupom já atingiu o limite de utilizações.' }, { status: 400 });
    }

    // Verificar valor mínimo de compra
    const orderSubtotal = parseFloat(subtotal || '0');
    if (coupon.min_order_value && orderSubtotal < coupon.min_order_value) {
      return NextResponse.json({ success: false, message: `O valor mínimo para usar este cupom é de R$ ${coupon.min_order_value.toFixed(2).replace('.', ',')}.` }, { status: 400 });
    }

    // (Opcional) Verificar se o usuário já usou este cupom (Requer tabela de relacionamento user_coupons)
    if (user && coupon.id) {
      const { data: pastOrders } = await admin
        .from('mktplace_feira_orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('coupon_id', coupon.id)
        .limit(1);
      
      if (pastOrders && pastOrders.length > 0) {
        return NextResponse.json({ success: false, message: 'Você já utilizou este cupom em uma compra anterior.' }, { status: 400 });
      }
    }

    // Calcular o valor real do desconto para preview
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = orderSubtotal * (coupon.discount_value / 100);
    } else {
      discount = coupon.discount_value;
    }

    // Não pode dar desconto maior que o subtotal
    if (discount > orderSubtotal) {
      discount = orderSubtotal;
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        calculatedDiscount: discount,
        message: 'Cupom aplicado com sucesso!'
      }
    });

  } catch (err: any) {
    console.error('Erro na validação do cupom:', err);
    return NextResponse.json({ success: false, message: 'Erro interno ao validar o cupom.' }, { status: 500 });
  }
}
