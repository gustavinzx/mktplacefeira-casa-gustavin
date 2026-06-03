-- ============================================================
-- SCRIPT DE CORREÇÕES CRÍTICAS DE ESTABILIDADE E PERFORMANCE
-- ============================================================
-- Este script resolve falhas apontadas no relatório de análise:
-- 1. Prevenção de Condições de Corrida no Estoque (Deadlocks / Overselling)
-- 2. Suporte Geoespacial real e performático para Feiras (PostGIS)
-- 3. Restrições de Integridade de Dados (Constraints)
--
-- Execute isso no SQL Editor do Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PREVENÇÃO DE DEADLOCKS E OVERSELLING NO ESTOQUE
-- ------------------------------------------------------------
-- A função antiga apenas usava GREATEST(0, stock - qty) o que 
-- permitia compras silenciosamente falsas se o estoque fosse zero.
-- Agora usamos FOR UPDATE para travar a linha (Pessimistic Lock)
-- garantindo a integridade transacional sob alta carga.

CREATE OR REPLACE FUNCTION decrement_stock_safe(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Bloqueio de linha para evitar race conditions simultâneas
  SELECT stock INTO current_stock 
  FROM public.mktplace_feira_products 
  WHERE id = p_product_id 
  FOR UPDATE;

  -- Se o produto nem existir, falha
  IF current_stock IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verifica se tem estoque suficiente
  IF current_stock >= p_quantity THEN
    UPDATE public.mktplace_feira_products
    SET stock = stock - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------------------------
-- 2. DESEMPENHO DE BUSCA DE FEIRAS POR LOCALIZAÇÃO (POSTGIS)
-- ------------------------------------------------------------
-- O relatório indicou lentidão na busca de feiras próximas. 
-- Precisamos de suporte geoespacial de verdade (PostGIS + GIST Index).

-- Ativa a extensão PostGIS se não estiver ativa
CREATE EXTENSION IF NOT EXISTS postgis;

-- Adiciona colunas reais de coordenadas na tabela de feiras
ALTER TABLE public.mktplace_feira_fairs 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS geog geography(Point, 4326);

-- Gatilho para converter lat/long simples no tipo geography do PostGIS automaticamente
CREATE OR REPLACE FUNCTION update_fair_geography()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geog := st_setsrid(st_makepoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.geog := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_fair_geog ON public.mktplace_feira_fairs;
CREATE TRIGGER trg_update_fair_geog
BEFORE INSERT OR UPDATE OF latitude, longitude
ON public.mktplace_feira_fairs
FOR EACH ROW
EXECUTE PROCEDURE update_fair_geography();

-- Criação do índice GIST para buscas hiper-rápidas (Raio de KM)
CREATE INDEX IF NOT EXISTS idx_mktplace_feira_fairs_geog 
ON public.mktplace_feira_fairs USING GIST (geog);


-- ------------------------------------------------------------
-- 3. RESTRIÇÕES DE INTEGRIDADE DE DADOS (CONSTRAINTS)
-- ------------------------------------------------------------
-- Prevenção absoluta contra dados corrompidos entrando no DB.

-- Garante que o preço nunca seja negativo
ALTER TABLE public.mktplace_feira_products 
ADD CONSTRAINT mktplace_feira_products_price_check CHECK (price >= 0);

-- Garante que o estoque nunca fique negativo no banco
ALTER TABLE public.mktplace_feira_products 
ADD CONSTRAINT mktplace_feira_products_stock_check CHECK (stock >= 0);

-- Garante que valores de pedido não sejam absurdos
ALTER TABLE public.mktplace_feira_orders
ADD CONSTRAINT mktplace_feira_orders_total_check CHECK (total_amount >= 0);

-- Garante que as avaliações fiquem sempre entre 1 e 5
-- A constraint CHECK (rating >= 1 AND rating <= 5) já existia na 
-- tabela original, validamos que está mantida.

-- ============================================================
-- FIM DAS CORREÇÕES CRÍTICAS
-- ============================================================
