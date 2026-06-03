import { createSupabaseAdmin, ok, err } from '@/lib/supabase-server';

export async function GET() {
  const admin = createSupabaseAdmin();
  const { data: prods, error } = await admin
    .from('mktplace_feira_products')
    .select('id, title, price, unit, image_url, producer:mktplace_feira_producers(stall_name)')
    .ilike('title', `%Chocolate%`)
    .limit(1);
    
  return ok({ prods, error });
}
