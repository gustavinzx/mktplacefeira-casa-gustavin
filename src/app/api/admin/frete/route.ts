import { getTable, saveTable } from '@/lib/json-db';
import { ok, err } from '@/lib/supabase-server';

export async function GET() {
  try {
    const frete = getTable('frete');
    return ok(frete);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
