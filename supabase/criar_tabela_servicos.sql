CREATE TABLE IF NOT EXISTS mktplace_feira_chef_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT DEFAULT 'Ativo',
  rating NUMERIC DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mktplace_feira_chef_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servicos sao publicos para leitura" ON mktplace_feira_chef_services FOR SELECT USING (true);
CREATE POLICY "Chefs gerenciam seus servicos" ON mktplace_feira_chef_services FOR ALL USING (chef_id = auth.uid());
