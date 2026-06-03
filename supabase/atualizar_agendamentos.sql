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

ALTER TABLE mktplace_feira_chef_appointments ENABLE ROW LEVEL SECURITY;

-- Clientes podem ver seus agendamentos e cria-los
CREATE POLICY "Clientes veem seus proprios agendamentos" 
ON mktplace_feira_chef_appointments FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Clientes criam seus agendamentos" 
ON mktplace_feira_chef_appointments FOR INSERT 
WITH CHECK (customer_id = auth.uid());

-- Chefs podem ver e gerenciar os agendamentos deles
CREATE POLICY "Chefs veem seus agendamentos" 
ON mktplace_feira_chef_appointments FOR SELECT 
USING (chef_id = auth.uid());

CREATE POLICY "Chefs atualizam seus agendamentos" 
ON mktplace_feira_chef_appointments FOR UPDATE 
USING (chef_id = auth.uid());

DROP TRIGGER IF EXISTS update_mktplace_feira_chef_appointments_updated_at ON mktplace_feira_chef_appointments;
CREATE TRIGGER update_mktplace_feira_chef_appointments_updated_at 
BEFORE UPDATE ON mktplace_feira_chef_appointments 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
