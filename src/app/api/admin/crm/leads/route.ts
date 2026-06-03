import { getTable, saveTable } from '@/lib/json-db';
import { ok, err } from '@/lib/supabase-server';

export async function GET() {
  try {
    const leads = getTable('leads');
    return ok(leads);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
