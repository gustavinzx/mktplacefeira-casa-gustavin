CREATE TABLE IF NOT EXISTS mktplace_feira_crm_leads (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  type         TEXT DEFAULT 'feirante',
  stage        TEXT DEFAULT 'novo',
  city         TEXT,
  phone        TEXT,
  email        TEXT,
  category     TEXT,
  source       TEXT,
  score        NUMERIC(3,1) DEFAULT 7.0,
  last_contact TEXT,
  next_contact DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_crm_interactions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id    UUID REFERENCES mktplace_feira_crm_leads(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  channel    TEXT DEFAULT 'note',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mktplace_feira_crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktplace_feira_crm_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gerencia leads"
  ON mktplace_feira_crm_leads FOR ALL
  USING (EXISTS (
    SELECT 1 FROM mktplace_feira_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin gerencia interações"
  ON mktplace_feira_crm_interactions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM mktplace_feira_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));
