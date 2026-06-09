import { getAuthUser, createSupabaseAdmin, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim().toUpperCase();

  if (!code) return err('code é obrigatório', 400);

  const admin = createSupabaseAdmin();
  const { data: coupon, error } = await admin
    .from(TABLE.coupons)
    .select('*')
    .eq('code', code)
    .eq('active', true)
    .maybeSingle();

  if (error) return err(error.message, 500);
  if (!coupon) return err('Cupom inválido ou expirado', 404);

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return err('Cupom expirado', 404);
  }

  return ok({
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: Number(coupon.value),
    min_purchase: Number(coupon.min_purchase ?? 0),
    description: coupon.description,
  });
}
