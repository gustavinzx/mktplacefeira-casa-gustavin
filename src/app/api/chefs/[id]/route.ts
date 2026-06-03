import { createSupabaseAdmin, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createSupabaseAdmin();
  
  try {
    // Busca o perfil do chef
    const { data: profile, error: profileError } = await admin
      .from('mktplace_feira_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) throw profileError;
    if (!profile) return err('Chef não encontrado', 404);

    // Busca as receitas desse chef
    const { data: recipes, error: recipesError } = await admin
      .from('mktplace_feira_recipes')
      .select('*')
      .eq('chef_id', id)
      .order('created_at', { ascending: false });

    if (recipesError) throw recipesError;

    return ok({
      chef: profile,
      recipes: recipes || []
    });
  } catch (error: any) {
    return err(error.message || 'Erro ao buscar perfil do chef');
  }
}
