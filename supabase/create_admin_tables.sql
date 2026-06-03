-- Tabela de Audit Logs
CREATE TABLE IF NOT EXISTS public.mktplace_feira_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Configurações Logísticas
CREATE TABLE IF NOT EXISTS public.mktplace_feira_logistics_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    cep TEXT,
    rain_tax NUMERIC DEFAULT 0,
    weekend_tax NUMERIC DEFAULT 0,
    fairs JSONB DEFAULT '[]'::jsonb,
    distance_tiers JSONB DEFAULT '[]'::jsonb,
    fleet JSONB DEFAULT '[]'::jsonb,
    freight_config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(cidade, estado)
);

-- Tabela de Zonas de Entrega
CREATE TABLE IF NOT EXISTS public.mktplace_feira_delivery_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    cep TEXT,
    tipos_frete JSONB DEFAULT '[]'::jsonb,
    parceiro TEXT,
    status TEXT DEFAULT 'Ativo',
    rain_tax NUMERIC DEFAULT 0,
    weekend_tax NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(cidade, estado)
);

-- Tabela de Roles
CREATE TABLE IF NOT EXISTS public.mktplace_feira_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#125d30',
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Admins
CREATE TABLE IF NOT EXISTS public.mktplace_feira_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    department TEXT,
    job_role TEXT,
    access_level TEXT,
    role_id UUID REFERENCES public.mktplace_feira_roles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Policies)
ALTER TABLE public.mktplace_feira_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for admins" ON public.mktplace_feira_audit_logs FOR ALL USING (true);

ALTER TABLE public.mktplace_feira_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for admins" ON public.mktplace_feira_roles FOR ALL USING (true);

ALTER TABLE public.mktplace_feira_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for admins" ON public.mktplace_feira_admins FOR ALL USING (true);

ALTER TABLE public.mktplace_feira_delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for admins" ON public.mktplace_feira_delivery_zones FOR ALL USING (true);

ALTER TABLE public.mktplace_feira_logistics_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for admins" ON public.mktplace_feira_logistics_configs FOR ALL USING (true);
