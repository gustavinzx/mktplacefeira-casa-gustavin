const fs = require('fs');
const file = 'c:/Users/gsds0/Desktop/mktplacefeira.casa/supabase/RODAR_NO_SUPABASE_COMPLETO.sql';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `CREATE TABLE IF NOT EXISTS mktplace_feira_subscriptions`;
const tableToInsert = `CREATE TABLE IF NOT EXISTS mktplace_feira_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES mktplace_feira_profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

`;

if (content.includes(targetStr) && !content.includes('mktplace_feira_carts')) {
  content = content.replace(targetStr, tableToInsert + targetStr);
  
  // RLS for carts
  const rlsTarget = `ALTER TABLE mktplace_feira_subscriptions ENABLE ROW LEVEL SECURITY;`;
  const rlsToInsert = `ALTER TABLE mktplace_feira_carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários gerenciam seus próprios carrinhos" ON mktplace_feira_carts;
CREATE POLICY "Usuários gerenciam seus próprios carrinhos" ON mktplace_feira_carts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

`;
  
  if (content.includes(rlsTarget)) {
    content = content.replace(rlsTarget, rlsToInsert + rlsTarget);
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log("Successfully added mktplace_feira_carts to RODAR_NO_SUPABASE_COMPLETO.sql");
} else {
  console.log("Could not find target string or table already exists.");
}
