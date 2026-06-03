-- ============================================================
-- RODE UMA VEZ no Supabase SQL Editor (projeto já em produção/dev)
-- Cadastro automático: cliente, feirante, chef, b2b + banca do feirante
-- ============================================================

-- 1) Papel "b2b" no enum (comprador atacadista)
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE 'b2b';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Dados extras no perfil (empresa B2B)
ALTER TABLE mktplace_feira_profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- 3) Feirante pode criar a própria banca (além do trigger)
DROP POLICY IF EXISTS "Feirante cria própria banca" ON mktplace_feira_producers;
CREATE POLICY "Feirante cria própria banca"
  ON mktplace_feira_producers FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4) Trigger unificado no cadastro Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  r user_role := 'cliente';
  raw_role text;
  stall text;
BEGIN
  raw_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'user_type',
    'cliente'
  );

  CASE raw_role
    WHEN 'feirante', 'vendor' THEN r := 'feirante';
    WHEN 'chef' THEN r := 'chef';
    WHEN 'admin' THEN r := 'admin';
    WHEN 'b2b', 'atacadista' THEN
      BEGIN
        r := 'b2b'::user_role;
      EXCEPTION WHEN invalid_text_representation THEN
        r := 'cliente';
      END;
    WHEN 'cliente', 'customer', 'user' THEN r := 'cliente';
    ELSE
      IF raw_role IN ('cliente', 'feirante', 'chef', 'admin') THEN
        r := raw_role::user_role;
      END IF;
  END CASE;

  INSERT INTO public.mktplace_feira_profiles (
    id, email, full_name, role, phone, company_name, cnpj
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    r,
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'company_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'cnpj', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    company_name = COALESCE(EXCLUDED.company_name, mktplace_feira_profiles.company_name),
    cnpj = COALESCE(EXCLUDED.cnpj, mktplace_feira_profiles.cnpj),
    updated_at = NOW();

  IF r = 'feirante' THEN
    stall := COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'business_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'stall_name', ''),
      'Minha Banca'
    );
    INSERT INTO public.mktplace_feira_producers (id, stall_name, bio, is_verified, rating)
    VALUES (
      NEW.id,
      stall,
      NULLIF(NEW.raw_user_meta_data->>'category', ''),
      false,
      5.0
    )
    ON CONFLICT (id) DO UPDATE SET
      stall_name = EXCLUDED.stall_name,
      bio = COALESCE(EXCLUDED.bio, mktplace_feira_producers.bio);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
