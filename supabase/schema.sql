-- Script de Inicialização: Feira Livre Digital

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('cliente', 'feirante', 'chef', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pendente', 'pago', 'preparando', 'saiu_para_entrega', 'entregue', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELAS

-- Perfis de Usuário
CREATE TABLE IF NOT EXISTS mktplace_feira_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'cliente',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feiras Livres
CREATE TABLE IF NOT EXISTS mktplace_feira_fairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT DEFAULT 'São Paulo',
  region TEXT,
  schedule JSONB, -- Ex: {"segunda": "07:00-13:00", ...}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados do Feirante/Banca
CREATE TABLE IF NOT EXISTS mktplace_feira_producers (
  id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  fair_id UUID REFERENCES mktplace_feira_fairs(id),
  stall_name TEXT NOT NULL,
  bio TEXT,
  rating NUMERIC(2,1) DEFAULT 5.0,
  banner_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias
CREATE TABLE IF NOT EXISTS mktplace_feira_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT, -- Lucide icon name
  slug TEXT UNIQUE NOT NULL
);

-- Produtos
CREATE TABLE IF NOT EXISTS mktplace_feira_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID REFERENCES mktplace_feira_producers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES mktplace_feira_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL, -- Ex: "kg", "unidade", "bandeja 250g"
  image_url TEXT,
  is_organic BOOLEAN DEFAULT FALSE,
  is_promotion BOOLEAN DEFAULT FALSE,
  is_wholesale BOOLEAN DEFAULT FALSE,
  wholesale_price NUMERIC(10,2),
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receitas (Chef Gourmet)
CREATE TABLE IF NOT EXISTS mktplace_feira_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time TEXT,
  difficulty TEXT,
  servings TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredientes da Receita
CREATE TABLE IF NOT EXISTS mktplace_feira_recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES mktplace_feira_recipes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES mktplace_feira_products(id) ON DELETE SET NULL, -- Link opcional para produto na feira
  name TEXT NOT NULL,
  amount TEXT,
  is_sponsored BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS mktplace_feira_chef_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT DEFAULT 'Ativo',
  rating NUMERIC DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agendamentos de Chefs
CREATE TABLE IF NOT EXISTS mktplace_feira_chef_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  chef_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES mktplace_feira_chef_services(id) ON DELETE SET NULL,
  event_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pendente', -- pendente, confirmado, concluido, cancelado
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts (Artigos do Portal)
CREATE TABLE IF NOT EXISTS mktplace_feira_blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Endereços
CREATE TABLE IF NOT EXISTS mktplace_feira_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS mktplace_feira_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  producer_id UUID REFERENCES mktplace_feira_producers(id) ON DELETE CASCADE,
  address_id UUID REFERENCES mktplace_feira_addresses(id),
  total_amount NUMERIC(10,2) NOT NULL,
  status order_status DEFAULT 'pendente',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens do Pedido
CREATE TABLE IF NOT EXISTS mktplace_feira_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES mktplace_feira_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES mktplace_feira_products(id),
  quantity INTEGER NOT NULL,
  price_at_time NUMERIC(10,2) NOT NULL
);

-- Banco de Imagens de Produtos
CREATE TABLE IF NOT EXISTS mktplace_feira_product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES mktplace_feira_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cupons de Desconto
CREATE TABLE IF NOT EXISTS mktplace_feira_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percent' ou 'fixed'
  value NUMERIC(10,2) NOT NULL,
  min_purchase NUMERIC(10,2) DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avaliações (Reviews)
CREATE TABLE IF NOT EXISTS mktplace_feira_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  producer_id UUID REFERENCES mktplace_feira_producers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES mktplace_feira_products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners e Marketing
CREATE TABLE IF NOT EXISTS mktplace_feira_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT DEFAULT 'hero', -- 'hero', 'sidebar', 'footer'
  active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assinaturas (Feirante)
CREATE TABLE IF NOT EXISTS mktplace_feira_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID REFERENCES mktplace_feira_producers(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- 'basic', 'premium', 'master'
  status TEXT DEFAULT 'active',
  amount NUMERIC(10,2) NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Devoluções (Returns)
CREATE TABLE IF NOT EXISTS mktplace_feira_return_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES mktplace_feira_orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'refunded'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métodos de Pagamento Salvos
CREATE TABLE IF NOT EXISTS mktplace_feira_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'card', 'pix'
  provider_token TEXT,
  last_four TEXT,
  brand TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets de Suporte
CREATE TABLE IF NOT EXISTS mktplace_feira_support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cotações B2B (Chef)
CREATE TABLE IF NOT EXISTS mktplace_feira_b2b_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  producer_id UUID REFERENCES mktplace_feira_producers(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2),
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'accepted', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lista de Desejos (Wishlist)
CREATE TABLE IF NOT EXISTS mktplace_feira_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES mktplace_feira_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificações
CREATE TABLE IF NOT EXISTS mktplace_feira_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BANCO DE IMAGENS (SEED DATA)
-- Sugestão de URLs para o banco de imagens inicial

INSERT INTO mktplace_feira_categories (name, icon, slug) VALUES
('Frutas', 'Apple', 'frutas'),
('Legumes', 'Carrot', 'legumes'),
('Verduras', 'Leaf', 'verduras'),
('Ovos e Laticínios', 'Egg', 'ovos-laticinios'),
('Grãos e Temperos', 'Wheat', 'graos-temperos');

-- 4. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE mktplace_feira_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles são públicos" ON mktplace_feira_profiles FOR SELECT USING (true);
CREATE POLICY "Usuários editam próprio perfil" ON mktplace_feira_profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE mktplace_feira_fairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feiras são públicas" ON mktplace_feira_fairs FOR SELECT USING (true);

ALTER TABLE mktplace_feira_producers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produtores são públicos" ON mktplace_feira_producers FOR SELECT USING (true);
CREATE POLICY "Produtores editam própria banca" ON mktplace_feira_producers FOR UPDATE USING (auth.uid() = id);

ALTER TABLE mktplace_feira_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categorias são públicas" ON mktplace_feira_categories FOR SELECT USING (true);

ALTER TABLE mktplace_feira_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Receitas são públicas" ON mktplace_feira_recipes FOR SELECT USING (true);
CREATE POLICY "Chefs gerenciam suas receitas" ON mktplace_feira_recipes FOR ALL USING (chef_id = auth.uid());

ALTER TABLE mktplace_feira_recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ingredientes são públicos" ON mktplace_feira_recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Chefs gerenciam ingredientes de suas receitas" ON mktplace_feira_recipe_ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM mktplace_feira_recipes WHERE id = mktplace_feira_recipe_ingredients.recipe_id AND chef_id = auth.uid())
);

ALTER TABLE mktplace_feira_chef_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servicos sao publicos para leitura" ON mktplace_feira_chef_services FOR SELECT USING (true);
CREATE POLICY "Chefs gerenciam seus servicos" ON mktplace_feira_chef_services FOR ALL USING (chef_id = auth.uid());

ALTER TABLE mktplace_feira_chef_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clientes veem seus proprios agendamentos" ON mktplace_feira_chef_appointments FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Clientes criam seus agendamentos" ON mktplace_feira_chef_appointments FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Chefs veem seus agendamentos" ON mktplace_feira_chef_appointments FOR SELECT USING (chef_id = auth.uid());
CREATE POLICY "Chefs atualizam seus agendamentos" ON mktplace_feira_chef_appointments FOR UPDATE USING (chef_id = auth.uid());

ALTER TABLE mktplace_feira_blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog posts são públicos" ON mktplace_feira_blog_posts FOR SELECT USING (true);

ALTER TABLE mktplace_feira_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam seus endereços" ON mktplace_feira_addresses FOR ALL USING (auth.uid() = user_id);

ALTER TABLE mktplace_feira_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem seus próprios pedidos" ON mktplace_feira_orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Usuários criam seus pedidos" ON mktplace_feira_orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Feirantes veem seus proprios pedidos" ON mktplace_feira_orders FOR SELECT USING (producer_id = auth.uid());
CREATE POLICY "Feirantes atualizam status de seus pedidos" ON mktplace_feira_orders FOR UPDATE USING (producer_id = auth.uid());

ALTER TABLE mktplace_feira_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem itens de seus pedidos" ON mktplace_feira_order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM mktplace_feira_orders WHERE id = mktplace_feira_order_items.order_id AND customer_id = auth.uid())
);

ALTER TABLE mktplace_feira_product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Imagens são públicas" ON mktplace_feira_product_images FOR SELECT USING (true);
CREATE POLICY "Feirantes gerenciam imagens de seus produtos" ON mktplace_feira_product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM mktplace_feira_products WHERE id = mktplace_feira_product_images.product_id AND producer_id = auth.uid())
);

ALTER TABLE mktplace_feira_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cupons ativos são visíveis" ON mktplace_feira_coupons FOR SELECT USING (active = true);

ALTER TABLE mktplace_feira_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews são públicos" ON mktplace_feira_reviews FOR SELECT USING (true);
CREATE POLICY "Usuários postam reviews" ON mktplace_feira_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE mktplace_feira_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Banners ativos são visíveis" ON mktplace_feira_banners FOR SELECT USING (active = true);

ALTER TABLE mktplace_feira_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feirantes veem suas assinaturas" ON mktplace_feira_subscriptions FOR SELECT USING (producer_id = auth.uid());

ALTER TABLE mktplace_feira_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produtos são públicos" ON mktplace_feira_products FOR SELECT USING (true);
CREATE POLICY "Feirantes gerenciam seus produtos" ON mktplace_feira_products FOR ALL USING (producer_id = auth.uid());

ALTER TABLE mktplace_feira_return_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem suas devoluções" ON mktplace_feira_return_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam devoluções" ON mktplace_feira_return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE mktplace_feira_payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam seus métodos de pagamento" ON mktplace_feira_payment_methods FOR ALL USING (auth.uid() = user_id);

ALTER TABLE mktplace_feira_support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem seus tickets" ON mktplace_feira_support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam seus tickets" ON mktplace_feira_support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE mktplace_feira_b2b_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Involvidos veem cotações" ON mktplace_feira_b2b_quotes FOR SELECT USING (auth.uid() = restaurant_id OR auth.uid() = producer_id);

ALTER TABLE mktplace_feira_wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam sua wishlist" ON mktplace_feira_wishlist FOR ALL USING (auth.uid() = user_id);

ALTER TABLE mktplace_feira_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem suas notificações" ON mktplace_feira_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários marcam notificações como lidas" ON mktplace_feira_notifications FOR UPDATE USING (auth.uid() = user_id);

-- 5. TRIGGERS PARA UPDATED_AT
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

DROP TRIGGER IF EXISTS update_mktplace_feira_banners_updated_at ON mktplace_feira_banners;
CREATE TRIGGER update_mktplace_feira_banners_updated_at BEFORE UPDATE ON mktplace_feira_banners FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_mktplace_feira_subscriptions_updated_at ON mktplace_feira_subscriptions;
CREATE TRIGGER update_mktplace_feira_subscriptions_updated_at BEFORE UPDATE ON mktplace_feira_subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_mktplace_feira_return_requests_updated_at ON mktplace_feira_return_requests;
CREATE TRIGGER update_mktplace_feira_return_requests_updated_at BEFORE UPDATE ON mktplace_feira_return_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
