const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('mktplace_feira_profiles')
    .select('*, producer:mktplace_feira_producers(*)')
    .in('role', ['feirante', 'atacadista', 'varejista']);
  
  if (error) {
    console.error('Error fetching partners:', error);
  } else {
    console.log('Success, data length:', data.length);
  }
}

run();
