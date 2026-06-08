
-- ============================================================
-- SCRIPT DE CORREÇÕES CRÍTICAS DE ESTABILIDADE E PERFORMANCE
-- ============================================================

-- DESEMPENHO DE BUSCA DE FEIRAS POR LOCALIZAÇÃO (POSTGIS)
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE public.mktplace_feira_fairs 
ADD COLUMN IF NOT EXISTS geog geography(Point, 4326);

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

CREATE INDEX IF NOT EXISTS idx_mktplace_feira_fairs_geog 
ON public.mktplace_feira_fairs USING GIST (geog);
