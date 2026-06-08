-- =============================================================
-- FIX: "Database error saving new user"
-- Problema: O trigger handle_new_user() falha ao inserir na 
-- mktplace_feira_profiles quando há colunas NOT NULL não preenchidas
-- ou quando o ENUM user_role não contém o valor enviado.
--
-- RODAR NO SQL EDITOR DO SUPABASE DASHBOARD
-- =============================================================

-- 1. Garantir que o ENUM user_role tem todos os valores necessários
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cliente';
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'feirante';
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'chef';
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'b2b';
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'delivery';
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'logistica';
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'franchisee';
EXCEPTION WHEN others THEN null;
END $$;

-- 2. Garantir que TODAS as colunas da tabela profiles aceitam NULL 
-- (exceto id e email que são obrigatórios)
ALTER TABLE mktplace_feira_profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE mktplace_feira_profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE mktplace_feira_profiles ALTER COLUMN avatar_url DROP NOT NULL;

-- 3. Recriar o trigger com tratamento de erro robusto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role user_role := 'cliente';
  v_raw_role TEXT;
BEGIN
  -- Tenta ler a role dos metadados, com fallback seguro
  v_raw_role := COALESCE(NEW.raw_user_meta_data->>'role', 'cliente');
  
  -- Valida se o valor é um enum válido
  BEGIN
    v_role := v_raw_role::user_role;
  EXCEPTION WHEN invalid_text_representation THEN
    v_role := 'cliente'; -- Fallback se o valor não é um enum válido
  END;

  -- Insere o perfil (ou atualiza se já existe)
  INSERT INTO public.mktplace_feira_profiles (id, email, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_role,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, mktplace_feira_profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, mktplace_feira_profiles.full_name),
    role = EXCLUDED.role,
    phone = COALESCE(EXCLUDED.phone, mktplace_feira_profiles.phone);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Se QUALQUER erro acontecer, loga e continua (não bloqueia o signup)
  RAISE WARNING 'handle_new_user falhou para user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
