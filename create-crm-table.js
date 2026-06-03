const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Ler as variáveis do .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { error } = await supabase.rpc('run_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS mktplace_feira_crm_leads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        city TEXT,
        category TEXT,
        source TEXT,
        stage TEXT DEFAULT 'prospecto',
        score NUMERIC DEFAULT 5.0,
        history JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `
  });
  if (error) console.error('Error:', error);
  else console.log('Table mktplace_feira_crm_leads created successfully.');
}

run();
