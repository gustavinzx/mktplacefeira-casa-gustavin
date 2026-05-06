import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para prefixo das tabelas
export const TABLE_PREFIX = 'mktplace_feira_';

export const getTableName = (name: string) => `${TABLE_PREFIX}${name}`;
