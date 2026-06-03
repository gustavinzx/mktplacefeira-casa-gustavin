-- Permite ticket de contato sem login (visitante)
ALTER TABLE mktplace_feira_support_tickets
  ALTER COLUMN user_id DROP NOT NULL;
