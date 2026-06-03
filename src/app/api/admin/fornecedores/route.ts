import { getTable } from '@/lib/json-db';
import { ok, err } from '@/lib/supabase-server';

export async function GET() {
  try {
    const fornecedores = getTable('fornecedores');
    return ok(fornecedores);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
