import { getRecommendationsForUser, getTopSellingProducts } from './src/lib/ml/recommendations';
import { createSupabaseAdmin } from './src/lib/supabase-server';

async function test() {
  try {
    console.log('Testing getTopSellingProducts...');
    const top = await getTopSellingProducts();
    console.log('Top Selling Products:', top.length);
    if (top.length === 0) {
      console.log('WHY EMPTY? Let us query products directly...');
      const admin = createSupabaseAdmin();
      const { data, error } = await admin.from('mktplace_feira_products').select('*').limit(5);
      console.log('Direct query error:', error);
      console.log('Direct query length:', data?.length);
    }
  } catch (e) {
    console.error('ERROR:', e);
  }
}
test();
