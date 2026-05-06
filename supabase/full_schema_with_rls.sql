-- SCRIPT COMPLETO: Feira Livre Digital (Supabase SQL) - VERSÃO DE MIGRAÇÃO
-- Este script lida com tabelas existentes e renomeia colunas se necessário.

-- 1. EXTENSÕES E ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'chef', 'b2b', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Compatibilidade com enum antigo se existir
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE 'cliente';
    ALTER TYPE user_role ADD VALUE 'feirante';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELAS PRINCIPAIS E MIGRAÇÃO

-- Perfis de Usuário
CREATE TABLE IF NOT EXISTS mktplace_feira_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que a coluna user_type existe (migrar de 'role' se necessário)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mktplace_feira_profiles' AND column_name='role') THEN
    ALTER TABLE mktplace_feira_profiles RENAME COLUMN role TO user_type;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mktplace_feira_profiles' AND column_name='user_type') THEN
    ALTER TABLE mktplace_feira_profiles ADD COLUMN user_type user_role DEFAULT 'customer';
  END IF;
END $$;

-- Garantir colunas adicionais
ALTER TABLE mktplace_feira_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE mktplace_feira_profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Bancas / Produtores (Vendors)
CREATE TABLE IF NOT EXISTS mktplace_feira_producers (
  id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  stall_name TEXT NOT NULL,
  description TEXT,
  rating NUMERIC(2,1) DEFAULT 5.0,
  banner_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  category_main TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias de Produtos
CREATE TABLE IF NOT EXISTS mktplace_feira_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
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
  unit TEXT NOT NULL, 
  image_url TEXT,
  is_organic BOOLEAN DEFAULT FALSE,
  is_promotion BOOLEAN DEFAULT FALSE,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receitas (Chefs)
CREATE TABLE IF NOT EXISTS mktplace_feira_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time TEXT,
  difficulty TEXT,
  servings TEXT,
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
  address_id UUID REFERENCES mktplace_feira_addresses(id),
  total_amount NUMERIC(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FUNÇÕES E TRIGGERS DE AUTOMAÇÃO

-- Função para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.mktplace_feira_profiles (id, email, full_name, user_type)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'user_type')::user_role, 'customer'::user_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, mktplace_feira_profiles.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de criação de perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para Updated_At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON mktplace_feira_profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON mktplace_feira_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_producers_updated_at ON mktplace_feira_producers;
CREATE TRIGGER update_producers_updated_at BEFORE UPDATE ON mktplace_feira_producers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON mktplace_feira_products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON mktplace_feira_products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON mktplace_feira_recipes;
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON mktplace_feira_recipes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON mktplace_feira_orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON mktplace_feira_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS)

-- Perfis
ALTER TABLE mktplace_feira_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Qualquer um vê perfis básicos" ON mktplace_feira_profiles;
CREATE POLICY "Qualquer um vê perfis básicos" ON mktplace_feira_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários editam próprio perfil" ON mktplace_feira_profiles;
CREATE POLICY "Usuários editam próprio perfil" ON mktplace_feira_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin vê tudo" ON mktplace_feira_profiles;
CREATE POLICY "Admin vê tudo" ON mktplace_feira_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM mktplace_feira_profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- Produtores
ALTER TABLE mktplace_feira_producers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Bancas são públicas" ON mktplace_feira_producers;
CREATE POLICY "Bancas são públicas" ON mktplace_feira_producers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendor edita própria banca" ON mktplace_feira_producers;
CREATE POLICY "Vendor edita própria banca" ON mktplace_feira_producers FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin gerencia bancas" ON mktplace_feira_producers;
CREATE POLICY "Admin gerencia bancas" ON mktplace_feira_producers FOR ALL USING (
  EXISTS (SELECT 1 FROM mktplace_feira_profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- Produtos
ALTER TABLE mktplace_feira_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Produtos são públicos" ON mktplace_feira_products;
CREATE POLICY "Produtos são públicos" ON mktplace_feira_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendor gerencia seus produtos" ON mktplace_feira_products;
CREATE POLICY "Vendor gerencia seus produtos" ON mktplace_feira_products FOR ALL USING (
  producer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM mktplace_feira_profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- Receitas
ALTER TABLE mktplace_feira_recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Receitas são públicas" ON mktplace_feira_recipes;
CREATE POLICY "Receitas são públicas" ON mktplace_feira_recipes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Chef gerencia suas receitas" ON mktplace_feira_recipes;
CREATE POLICY "Chef gerencia suas receitas" ON mktplace_feira_recipes FOR ALL USING (
  chef_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM mktplace_feira_profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- Endereços
ALTER TABLE mktplace_feira_addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários gerenciam seus endereços" ON mktplace_feira_addresses;
CREATE POLICY "Usuários gerenciam seus endereços" ON mktplace_feira_addresses FOR ALL USING (auth.uid() = user_id);

-- Pedidos
ALTER TABLE mktplace_feira_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clientes veem seus pedidos" ON mktplace_feira_orders;
CREATE POLICY "Clientes veem seus pedidos" ON mktplace_feira_orders FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Clientes criam pedidos" ON mktplace_feira_orders;
CREATE POLICY "Clientes criam pedidos" ON mktplace_feira_orders FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Vendors veem pedidos de seus produtos" ON mktplace_feira_orders;
CREATE POLICY "Vendors veem pedidos de seus produtos" ON mktplace_feira_orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM mktplace_feira_order_items oi
    JOIN mktplace_feira_products p ON oi.product_id = p.id
    WHERE oi.order_id = mktplace_feira_orders.id AND p.producer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admin vê todos os pedidos" ON mktplace_feira_orders;
CREATE POLICY "Admin vê todos os pedidos" ON mktplace_feira_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM mktplace_feira_profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- 5. SEED DATA (CATEGORIAS)
INSERT INTO mktplace_feira_categories (name, icon, slug) VALUES
('Frutas', 'Apple', 'frutas'),
('Legumes', 'Carrot', 'legumes'),
('Verduras', 'Leaf', 'verduras'),
('Ovos e Laticínios', 'Egg', 'ovos-laticinios'),
('Grãos e Temperos', 'Wheat', 'graos-temperos')
ON CONFLICT (slug) DO NOTHING;
