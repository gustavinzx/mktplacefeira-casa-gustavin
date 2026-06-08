import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
export const supabasePublic = supabase; // alias

// Apenas cria o client Admin se a variável existir (ou seja, apenas no servidor)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : (null as any);

export function getAdminClient() {
  if (!supabaseAdmin) {
    throw new Error(
      '[Feira Casa] SUPABASE_SERVICE_ROLE_KEY não configurada. ' +
      'Operações administrativas requerem a service role key.'
    );
  }
  return supabaseAdmin;
}

// Helper para prefixo das tabelas
export const TABLE_PREFIX = 'mktplace_feira_';

export const getTableName = (name: string) => `${TABLE_PREFIX}${name}`;
