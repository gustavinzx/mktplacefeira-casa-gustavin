CREATE TABLE IF NOT EXISTS mktplace_feira_chats (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id   UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE SET NULL,
  last_message TEXT,
  last_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mktplace_feira_messages (
  id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id  UUID REFERENCES mktplace_feira_chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE SET NULL,
  content  TEXT NOT NULL,
  read     BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mktplace_feira_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktplace_feira_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participantes veem o chat" ON mktplace_feira_chats;
CREATE POLICY "Participantes veem o chat"
  ON mktplace_feira_chats FOR SELECT
  USING (auth.uid() = vendor_id OR auth.uid() = customer_id);

DROP POLICY IF EXISTS "Participantes veem mensagens" ON mktplace_feira_messages;
CREATE POLICY "Participantes veem mensagens"
  ON mktplace_feira_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mktplace_feira_chats c
      WHERE c.id = chat_id
        AND (auth.uid() = c.vendor_id OR auth.uid() = c.customer_id)
    )
  );

DROP POLICY IF EXISTS "Participantes enviam mensagens" ON mktplace_feira_messages;
CREATE POLICY "Participantes enviam mensagens"
  ON mktplace_feira_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
