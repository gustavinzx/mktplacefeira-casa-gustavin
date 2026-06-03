import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const admin = createSupabaseAdmin();

  try {
    // 1. Fetch nearest fair
    const { data: fair } = await admin
      .from(TABLE.fairs)
      .select('*')
      .limit(1)
      .maybeSingle();

    // 2. Fetch featured producer (get first one with a profile avatar for better looks)
    let { data: producers } = await admin
      .from(TABLE.producers)
      .select(`
        *,
        profile:mktplace_feira_profiles(full_name, avatar_url)
      `)
      .limit(5);

    let featuredProducers = [];

    if (producers && producers.length > 0) {
      featuredProducers = await Promise.all(
        producers.map(async (p) => {
          const { data: products } = await admin
            .from(TABLE.products)
            .select('*')
            .eq('producer_id', p.id)
            .limit(2);
          return { ...p, products: products || [] };
        })
      );
    }

    // 3. Fetch 2 recent recipes
    const { data: recipes } = await admin
      .from('mktplace_feira_recipes')
      .select(`
        *,
        chef:mktplace_feira_profiles(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(2);

    // 4. ML Recommendations: "Para Você" or "Mais Vendidos"
    const user = await getAuthUser(request);
    let featuredProducts = [];
    
    if (user) {
      const { getRecommendationsForUser } = await import('@/lib/ml/recommendations');
      featuredProducts = await getRecommendationsForUser(user.id, 4);
    } else {
      const { getTopSellingProducts } = await import('@/lib/ml/recommendations');
      featuredProducts = await getTopSellingProducts(4);
    }

    // 5. Fetch varied products (Produtos Variados)
    const { data: variedProducts } = await admin
      .from(TABLE.products)
      .select(`
        *,
        producer:mktplace_feira_producers(stall_name)
      `)
      .limit(12);

    return ok({
      fair,
      featuredProducers,
      recipes: recipes || [],
      featuredProducts: featuredProducts || [],
      variedProducts: variedProducts || []
    });

  } catch (error: any) {
    return err(error.message || 'Erro ao buscar dados da home');
  }
}
