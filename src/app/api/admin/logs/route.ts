import { getTable } from '@/lib/json-db';
import { ok, err } from '@/lib/supabase-server';

export async function GET() {
  try {
    const logs = getTable('logs');
    return ok(logs);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
