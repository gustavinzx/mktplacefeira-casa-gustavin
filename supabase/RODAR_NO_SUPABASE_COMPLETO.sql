-- ============================================================
-- FEIRA.CASA — SCRIPT ÚNICO PARA O SUPABASE
-- Cole no SQL Editor e execute (Run).
--
-- CENÁRIO A) Banco NOVO / zerado → rode o arquivo INTEIRO.
-- CENÁRIO B) Já rodou seu script antes → rode só a PARTE 2 (comentário abaixo).
--
-- ANTES DO SEED DE COMPRA:
--   1. Authentication → Users → copie o UUID do usuário de teste
--   2. Substitua TODAS as ocorrências de:  0eb213c8-3097-4428-8189-2ac1880da2f3
-- ============================================================

-- ############################################################
-- PARTE 1 — ESTRUTURA COMPLETA (pule se as tabelas já existem)
-- ############################################################

-- ---------- 1. ENUMS ----------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('cliente', 'feirante', 'chef', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pendente', 'pago', 'preparando', 'saiu_para_entrega', 'entregue', 'cancelado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ---------- 2. TABELAS ----------
CREATE TABLE IF NOT EXISTS mktplace_feira_profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  role        user_role DEFAULT 'cliente',
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_fairs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  location    TEXT NOT NULL,
  city        TEXT DEFAULT 'São Paulo',
  region      TEXT,
  schedule    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_producers (
  id          UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  fair_id     UUID REFERENCES mktplace_feira_fairs(id),
  stall_name  TEXT NOT NULL,
  bio         TEXT,
  rating      NUMERIC(2,1) DEFAULT 5.0,
  banner_url  TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_categories (
  id    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name  TEXT NOT NULL,
  icon  TEXT,
  slug  TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS mktplace_feira_products (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id  UUID REFERENCES mktplace_feira_producers(id) ON DELETE CASCADE,
  category_id  UUID REFERENCES mktplace_feira_categories(id),
  title        TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL,
  unit         TEXT NOT NULL,
  image_url    TEXT,
  is_organic   BOOLEAN DEFAULT FALSE,
  is_promotion BOOLEAN DEFAULT FALSE,
  stock        INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_addresses (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  street       TEXT NOT NULL,
  number       TEXT NOT NULL,
  complement   TEXT,
  neighborhood TEXT,
  city         TEXT NOT NULL,
  state        TEXT NOT NULL,
  zip_code     TEXT NOT NULL,
  is_default   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_orders (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id    UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  address_id     UUID REFERENCES mktplace_feira_addresses(id),
  total_amount   NUMERIC(10,2) NOT NULL,
  status         order_status DEFAULT 'pendente',
  payment_method TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_order_items (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id       UUID REFERENCES mktplace_feira_orders(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES mktplace_feira_products(id),
  quantity       INTEGER NOT NULL,
  price_at_time  NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS mktplace_feira_coupons (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code           TEXT UNIQUE NOT NULL,
  description    TEXT,
  discount_type  TEXT NOT NULL,
  value          NUMERIC(10,2) NOT NULL,
  min_purchase   NUMERIC(10,2) DEFAULT 0,
  active         BOOLEAN DEFAULT TRUE,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_subscriptions (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id            UUID REFERENCES mktplace_feira_producers(id) ON DELETE CASCADE,
  plan_type              TEXT NOT NULL,
  status                 TEXT DEFAULT 'active',
  amount                 NUMERIC(10,2) NOT NULL,
  starts_at              TIMESTAMPTZ DEFAULT NOW(),
  ends_at                TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_return_requests (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID REFERENCES mktplace_feira_orders(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  status      TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_payment_methods (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,
  provider_token TEXT,
  last_four      TEXT,
  brand          TEXT,
  is_default     BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  producer_id UUID REFERENCES mktplace_feira_producers(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES mktplace_feira_products(id) ON DELETE CASCADE,
  rating      INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_banners (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT,
  image_url  TEXT NOT NULL,
  link_url   TEXT,
  position   TEXT DEFAULT 'hero',
  active     BOOLEAN DEFAULT TRUE,
  starts_at  TIMESTAMPTZ DEFAULT NOW(),
  ends_at    TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_wishlist (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES mktplace_feira_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'info',
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_recipes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id     UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  prep_time   TEXT,
  difficulty  TEXT,
  servings    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_recipe_ingredients (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id    UUID REFERENCES mktplace_feira_recipes(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES mktplace_feira_products(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  amount       TEXT,
  is_sponsored BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS mktplace_feira_support_tickets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  description TEXT NOT NULL,
  priority    TEXT DEFAULT 'medium',
  status      TEXT DEFAULT 'open',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_b2b_quotes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  producer_id   UUID REFERENCES mktplace_feira_producers(id) ON DELETE CASCADE,
  items         JSONB NOT NULL,
  total_amount  NUMERIC(10,2),
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- 3. TRIGGERS updated_at ----------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_mktplace_feira_profiles_updated_at ON mktplace_feira_profiles;
CREATE TRIGGER update_mktplace_feira_profiles_updated_at BEFORE UPDATE ON mktplace_feira_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_mktplace_feira_products_updated_at ON mktplace_feira_products;
CREATE TRIGGER update_mktplace_feira_products_updated_at BEFORE UPDATE ON mktplace_feira_products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_mktplace_feira_fairs_updated_at ON mktplace_feira_fairs;
CREATE TRIGGER update_mktplace_feira_fairs_updated_at BEFORE UPDATE ON mktplace_feira_fairs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_mktplace_feira_producers_updated_at ON mktplace_feira_producers;
CREATE TRIGGER update_mktplace_feira_producers_updated_at BEFORE UPDATE ON mktplace_feira_producers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_mktplace_feira_orders_updated_at ON mktplace_feira_orders;
CREATE TRIGGER update_mktplace_feira_orders_updated_at BEFORE UPDATE ON mktplace_feira_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_mktplace_feira_coupons_updated_at ON mktplace_feira_coupons;
CREATE TRIGGER update_mktplace_feira_coupons_updated_at BEFORE UPDATE ON mktplace_feira_coupons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ---------- 4. TRIGGER perfil no cadastro (role: cliente, chef, feirante, admin) ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  r user_role := 'cliente';
BEGIN
  IF NEW.raw_user_meta_data->>'role' IN ('cliente', 'feirante', 'chef', 'admin') THEN
    r := (NEW.raw_user_meta_data->>'role')::user_role;
  END IF;

  INSERT INTO public.mktplace_feira_profiles (id, email, full_name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    r,
    COALESCE(NEW.raw_user_meta_data->>'phone', null)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------- 5. Função estoque (checkout) ----------
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE mktplace_feira_products
  SET stock = GREATEST(0, stock - p_quantity),
      updated_at = NOW()
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------- 6. RLS ----------
ALTER TABLE mktplace_feira_profiles DISABLE ROW LEVEL SECURITY;

ALTER TABLE mktplace_feira_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Produtos são públicos" ON mktplace_feira_products;
CREATE POLICY "Produtos são públicos" ON mktplace_feira_products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Feirantes gerenciam seus produtos" ON mktplace_feira_products;
CREATE POLICY "Feirantes gerenciam seus produtos" ON mktplace_feira_products FOR ALL USING (producer_id = auth.uid());

ALTER TABLE mktplace_feira_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categorias são públicas" ON mktplace_feira_categories;
CREATE POLICY "Categorias são públicas" ON mktplace_feira_categories FOR SELECT USING (true);

ALTER TABLE mktplace_feira_producers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Produtores são públicos" ON mktplace_feira_producers;
CREATE POLICY "Produtores são públicos" ON mktplace_feira_producers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Produtores editam própria banca" ON mktplace_feira_producers;
CREATE POLICY "Produtores editam própria banca" ON mktplace_feira_producers FOR UPDATE USING (auth.uid() = id);

ALTER TABLE mktplace_feira_fairs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Feiras são públicas" ON mktplace_feira_fairs;
CREATE POLICY "Feiras são públicas" ON mktplace_feira_fairs FOR SELECT USING (true);

ALTER TABLE mktplace_feira_addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários gerenciam seus endereços" ON mktplace_feira_addresses;
CREATE POLICY "Usuários gerenciam seus endereços" ON mktplace_feira_addresses FOR ALL USING (auth.uid() = user_id);

ALTER TABLE mktplace_feira_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários veem seus pedidos" ON mktplace_feira_orders;
CREATE POLICY "Usuários veem seus pedidos" ON mktplace_feira_orders FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Usuários criam pedidos" ON mktplace_feira_orders;
CREATE POLICY "Usuários criam pedidos" ON mktplace_feira_orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Usuários atualizam seus pedidos" ON mktplace_feira_orders;
CREATE POLICY "Usuários atualizam seus pedidos" ON mktplace_feira_orders FOR UPDATE USING (auth.uid() = customer_id);

ALTER TABLE mktplace_feira_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários veem itens de seus pedidos" ON mktplace_feira_order_items;
CREATE POLICY "Usuários veem itens de seus pedidos" ON mktplace_feira_order_items FOR SELECT USING (
  order_id IN (SELECT id FROM mktplace_feira_orders WHERE customer_id = auth.uid())
);
DROP POLICY IF EXISTS "Usuários inserem itens de seus pedidos" ON mktplace_feira_order_items;
CREATE POLICY "Usuários inserem itens de seus pedidos" ON mktplace_feira_order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM mktplace_feira_orders WHERE customer_id = auth.uid())
);

ALTER TABLE mktplace_feira_coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cupons ativos são visíveis" ON mktplace_feira_coupons;
CREATE POLICY "Cupons ativos são visíveis" ON mktplace_feira_coupons FOR SELECT USING (active = true);

ALTER TABLE mktplace_feira_return_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários veem suas devoluções" ON mktplace_feira_return_requests;
CREATE POLICY "Usuários veem suas devoluções" ON mktplace_feira_return_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários criam devoluções" ON mktplace_feira_return_requests;
CREATE POLICY "Usuários criam devoluções" ON mktplace_feira_return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE mktplace_feira_payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários gerenciam pagamentos" ON mktplace_feira_payment_methods;
CREATE POLICY "Usuários gerenciam pagamentos" ON mktplace_feira_payment_methods FOR ALL USING (auth.uid() = user_id);

ALTER TABLE mktplace_feira_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Feirantes veem suas assinaturas" ON mktplace_feira_subscriptions;
CREATE POLICY "Feirantes veem suas assinaturas" ON mktplace_feira_subscriptions FOR SELECT USING (producer_id = auth.uid());

ALTER TABLE mktplace_feira_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews são públicos" ON mktplace_feira_reviews;
CREATE POLICY "Reviews são públicos" ON mktplace_feira_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Usuários postam reviews" ON mktplace_feira_reviews;
CREATE POLICY "Usuários postam reviews" ON mktplace_feira_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE mktplace_feira_banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Banners ativos são visíveis" ON mktplace_feira_banners;
CREATE POLICY "Banners ativos são visíveis" ON mktplace_feira_banners FOR SELECT USING (active = true);

ALTER TABLE mktplace_feira_wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários gerenciam sua wishlist" ON mktplace_feira_wishlist;
CREATE POLICY "Usuários gerenciam sua wishlist" ON mktplace_feira_wishlist FOR ALL USING (auth.uid() = user_id);

ALTER TABLE mktplace_feira_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários veem suas notificações" ON mktplace_feira_notifications;
CREATE POLICY "Usuários veem suas notificações" ON mktplace_feira_notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários marcam notificações como lidas" ON mktplace_feira_notifications;
CREATE POLICY "Usuários marcam notificações como lidas" ON mktplace_feira_notifications FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE mktplace_feira_recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Receitas são públicas" ON mktplace_feira_recipes;
CREATE POLICY "Receitas são públicas" ON mktplace_feira_recipes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Chefs gerenciam suas receitas" ON mktplace_feira_recipes;
CREATE POLICY "Chefs gerenciam suas receitas" ON mktplace_feira_recipes FOR ALL USING (chef_id = auth.uid());

ALTER TABLE mktplace_feira_support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários veem seus tickets" ON mktplace_feira_support_tickets;
CREATE POLICY "Usuários veem seus tickets" ON mktplace_feira_support_tickets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários criam seus tickets" ON mktplace_feira_support_tickets;
CREATE POLICY "Usuários criam seus tickets" ON mktplace_feira_support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE mktplace_feira_b2b_quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Envolvidos veem cotações" ON mktplace_feira_b2b_quotes;
CREATE POLICY "Envolvidos veem cotações" ON mktplace_feira_b2b_quotes FOR SELECT USING (auth.uid() = restaurant_id OR auth.uid() = producer_id);


-- ############################################################
-- PARTE 2 — EXTRAS DO APP (rode sempre que atualizar o projeto)
-- ############################################################

-- Contato sem login (API usa service role)
ALTER TABLE mktplace_feira_support_tickets
  ALTER COLUMN user_id DROP NOT NULL;

-- Cupom do carrinho
INSERT INTO mktplace_feira_coupons (code, description, discount_type, value, min_purchase, active)
VALUES ('PRIMEIRAFEIRA', 'Desconto de boas-vindas', 'fixed', 10.00, 0, true)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  discount_type = EXCLUDED.discount_type,
  value = EXCLUDED.value,
  active = true;

-- Feiras de demonstração
INSERT INTO mktplace_feira_fairs (name, location, city, region, schedule)
SELECT 'Feira da Vila Mariana', 'Rua Joaquim Távora, 1200', 'São Paulo', 'Zona Sul', '{"terca": "07:00-13:00", "sabado": "07:00-13:00"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM mktplace_feira_fairs WHERE name = 'Feira da Vila Mariana');

INSERT INTO mktplace_feira_fairs (name, location, city, region, schedule)
SELECT 'Feira de Pinheiros', 'Praça Benedito Calixto', 'São Paulo', 'Oeste', '{"sabado": "07:00-14:00"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM mktplace_feira_fairs WHERE name = 'Feira de Pinheiros');

INSERT INTO mktplace_feira_fairs (name, location, city, region, schedule)
SELECT 'Feira Orgânica Ibirapuera', 'Rua Tutóia, 1125', 'São Paulo', 'Sul', '{"domingo": "06:00-13:00"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM mktplace_feira_fairs WHERE name = 'Feira Orgânica Ibirapuera');


-- Categorias Base do Sistema
INSERT INTO mktplace_feira_categories (name, icon, slug) VALUES
('Frutas',          'Apple',  'frutas'),
('Legumes',         'Carrot', 'legumes'),
('Verduras',        'Leaf',   'verduras'),
('Ovos e Laticínios', 'Egg', 'ovos-laticinios'),
('Grãos e Temperos', 'Wheat', 'graos-temperos')
ON CONFLICT (slug) DO NOTHING;


-- ############################################################
-- PARTE 3 — NOVOS MÓDULOS (LOGÍSTICA, CRM, PLANOS, ETC)
-- ############################################################

-- ==============================================================================
-- 1. SYSTEM LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mktplace_feira_system_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  severity varchar NOT NULL, -- 'info', 'warning', 'error'
  source varchar NOT NULL,
  message text NOT NULL,
  code varchar,
  timestamp timestamp with time zone DEFAULT now()
);

-- RLS policies
ALTER TABLE public.mktplace_feira_system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users"
ON public.mktplace_feira_system_logs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert access to authenticated users"
ON public.mktplace_feira_system_logs
FOR INSERT
TO authenticated
WITH CHECK (true);


-- ==============================================================================
-- 2. NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mktplace_feira_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title varchar NOT NULL,
  message text NOT NULL,
  type varchar DEFAULT 'info', -- 'success', 'warning', 'error', 'info'
  is_read boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.mktplace_feira_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
ON public.mktplace_feira_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admin insert"
ON public.mktplace_feira_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);


-- ==============================================================================
-- 3. CRM & CAMPAIGNS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mktplace_feira_crm_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  type varchar NOT NULL, -- 'B2B', 'Feirante', 'Franqueado', etc.
  status varchar DEFAULT 'Novo', -- 'Novo', 'Contato Feito', 'Negociação', 'Convertido', 'Perdido'
  value numeric DEFAULT 0,
  email varchar,
  phone varchar,
  last_contact timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  history jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mktplace_feira_crm_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  audience varchar,
  sent integer DEFAULT 0,
  opened integer DEFAULT 0,
  clicked integer DEFAULT 0,
  status varchar DEFAULT 'draft', -- 'draft', 'scheduled', 'sent'
  scheduled_for timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.mktplace_feira_crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mktplace_feira_crm_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access leads" ON public.mktplace_feira_crm_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access campaigns" ON public.mktplace_feira_crm_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 4. LOGISTICS & FREIGHT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mktplace_feira_logistics_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  type varchar NOT NULL,
  status varchar DEFAULT 'Ativo',
  integration_key varchar,
  contact_phone varchar,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mktplace_feira_city_freight (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  estado varchar NOT NULL,
  cidade varchar NOT NULL,
  tipo varchar NOT NULL, -- 'distancia' | 'fixo' | 'retirada'
  preco_por_km numeric,
  raio_max_km numeric,
  taxa_minima numeric,
  valor_fixo numeric,
  instrucoes text,
  ceps jsonb DEFAULT '[]'::jsonb, -- array of FeiraCEP
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.mktplace_feira_logistics_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mktplace_feira_city_freight ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access logistics providers" ON public.mktplace_feira_logistics_providers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access city freight" ON public.mktplace_feira_city_freight FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 5. SUBSCRIPTION PLANS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mktplace_feira_subscription_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  target_profile varchar NOT NULL, -- 'feirante', 'chef', 'comprador_b2b', 'comprador_b2c'
  price numeric NOT NULL,
  recurrence varchar NOT NULL, -- 'mensal', 'trimestral', 'semestral', 'anual'
  grace_period_days integer DEFAULT 0,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.mktplace_feira_subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access subscription plans" ON public.mktplace_feira_subscription_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read subscription plans" ON public.mktplace_feira_subscription_plans FOR SELECT USING (true);


-- ==============================================================================
-- 6. PORTALS (FAVORITES & RECIPES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mktplace_feira_favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.mktplace_feira_profiles(id),
  product_id uuid REFERENCES public.mktplace_feira_products(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.mktplace_feira_chef_recipes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id uuid REFERENCES public.mktplace_feira_profiles(id),
  title varchar NOT NULL,
  description text,
  image_url varchar,
  ingredients jsonb DEFAULT '[]'::jsonb,
  instructions text,
  prep_time_minutes integer,
  difficulty varchar,
  status varchar DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.mktplace_feira_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mktplace_feira_chef_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites" ON public.mktplace_feira_favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Chefs can manage their recipes" ON public.mktplace_feira_chef_recipes FOR ALL TO authenticated USING (auth.uid() = chef_id) WITH CHECK (auth.uid() = chef_id);
CREATE POLICY "Anyone can view recipes" ON public.mktplace_feira_chef_recipes FOR SELECT USING (true);

