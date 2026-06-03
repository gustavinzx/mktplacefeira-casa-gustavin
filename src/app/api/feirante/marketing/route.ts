import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  try {
    const { data: campaigns } = await admin
      .from('mktplace_feira_marketing_campaigns')
      .select('*, product:mktplace_feira_products(title, image_url)')
      .eq('producer_id', user.id)
      .order('created_at', { ascending: false });

    const { data: packages } = await admin
      .from('mktplace_feira_ad_packages')
      .select('*')
      .eq('active', true);

    return ok({ 
      campaigns: campaigns || [],
      packages: packages || []
    });
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar hub de marketing');
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  try {
    const body = await request.json();
    const admin = createSupabaseAdmin();

    const { error } = await admin
      .from('mktplace_feira_marketing_campaigns')
      .insert({
        producer_id: user.id,
        title: body.title,
        type: body.type, // 'discount', 'featured', 'banner'
        product_id: body.product_id || null,
        discount_value: body.discount_value || null,
        budget: body.budget || null,
        status: 'active'
      });

    if (error) throw error;
    return ok({ success: true });
  } catch (error: any) {
    return err(error.message || 'Erro ao criar campanha');
  }
}
