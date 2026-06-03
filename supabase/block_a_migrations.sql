-- ============================================================
-- SCRIPT DE MIGRATION - BLOCK A & ML TABLES
-- ============================================================

-- 1. Criação das novas tabelas

CREATE TABLE IF NOT EXISTS public.mktplace_feira_wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.mktplace_feira_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
    description TEXT NOT NULL,
    reference_id UUID, -- Pode ser um ID de pedido ou estorno
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mktplace_feira_user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.mktplace_feira_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.mktplace_feira_products(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- view, cart, purchase, wishlist
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mktplace_feira_search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES public.mktplace_feira_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mktplace_feira_anomaly_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.mktplace_feira_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- low, medium, high
    details JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mktplace_feira_product_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.mktplace_feira_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.mktplace_feira_profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mktplace_feira_order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.mktplace_feira_orders(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES public.mktplace_feira_profiles(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Adição de novas colunas em tabelas existentes

ALTER TABLE public.mktplace_feira_products 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;

ALTER TABLE public.mktplace_feira_fairs 
ADD COLUMN IF NOT EXISTS vendor_count INTEGER DEFAULT 0;

ALTER TABLE public.mktplace_feira_profiles
ADD COLUMN IF NOT EXISTS last_latitude DECIMAL,
ADD COLUMN IF NOT EXISTS last_longitude DECIMAL,
ADD COLUMN IF NOT EXISTS last_location_city TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- 3. Configuração de extensão pg_trgm para buscas inteligentes (ML FEATURE 2)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Cria índice GIN para full-text search no título e descrição dos produtos
CREATE INDEX IF NOT EXISTS idx_products_search 
ON public.mktplace_feira_products 
USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(description, '')));
