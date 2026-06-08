ALTER TABLE mktplace_feira_orders 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES mktplace_feira_coupons(id) ON DELETE SET NULL;

-- Avisar a API do Supabase para recarregar o cache do schema (evita o erro no cache)
NOTIFY pgrst, 'reload schema';
