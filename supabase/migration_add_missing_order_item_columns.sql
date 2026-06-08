ALTER TABLE mktplace_feira_order_items
ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2) DEFAULT 0;

-- Recarregar cache da API do Supabase (para reconhecer na hora)
NOTIFY pgrst, 'reload schema';
