-- ============================================================
-- SCRIPT DE MIGRATION - BLOCK C (Vendor Portal)
-- ============================================================

-- 1. Tabela pivot para mapear Múltiplas Feiras por Produtor
CREATE TABLE IF NOT EXISTS public.mktplace_feira_producer_fairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.mktplace_feira_producers(id) ON DELETE CASCADE,
    fair_id UUID REFERENCES public.mktplace_feira_fairs(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(producer_id, fair_id)
);

-- 2. Tabela para Campanhas de Marketing do Produtor
CREATE TABLE IF NOT EXISTS public.mktplace_feira_marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.mktplace_feira_producers(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'discount', 'featured', 'banner', 'social'
    product_id UUID REFERENCES public.mktplace_feira_products(id) ON DELETE CASCADE,
    discount_value NUMERIC(10,2),
    budget NUMERIC(10,2),
    status VARCHAR(20) DEFAULT 'active', -- 'draft', 'active', 'paused', 'completed'
    reach INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela para Pacotes de Divulgação (Catálogo do Admin)
CREATE TABLE IF NOT EXISTS public.mktplace_feira_ad_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    reach_estimate VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir alguns pacotes padrão
INSERT INTO public.mktplace_feira_ad_packages (name, price, duration_days, features, reach_estimate)
VALUES 
('Destaque na Busca', 29.90, 7, '["Aparecer no topo das buscas", "Selo de destaque"]', '~500 pessoas'),
('Banner na Home', 99.90, 15, '["Banner carrossel principal", "Visibilidade máxima na cidade"]', '~5000 pessoas'),
('Push Notification', 49.90, 1, '["Notificação enviada para todos os usuários", "Gatilho de urgência"]', '~2000 pessoas')
ON CONFLICT DO NOTHING;

-- 4. Registro de Vendas Offline (PDV)
-- Adiciona flag na order para identificar que foi uma venda de PDV físico
ALTER TABLE public.mktplace_feira_orders 
ADD COLUMN IF NOT EXISTS is_pos BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pos_receipt_url TEXT;

-- 5. Atualizar RLS
ALTER TABLE public.mktplace_feira_producer_fairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feirantes gerenciam suas participações" ON public.mktplace_feira_producer_fairs FOR ALL USING (producer_id = auth.uid());

ALTER TABLE public.mktplace_feira_marketing_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feirantes gerenciam suas campanhas" ON public.mktplace_feira_marketing_campaigns FOR ALL USING (producer_id = auth.uid());

ALTER TABLE public.mktplace_feira_ad_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pacotes são públicos" ON public.mktplace_feira_ad_packages FOR SELECT USING (true);
