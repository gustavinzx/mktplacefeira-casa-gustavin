import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const chefId = url.searchParams.get('chef_id');
  const admin = createSupabaseAdmin();
  
  try {
    let query = admin
      .from('mktplace_feira_recipes')
      .select('*, chef:mktplace_feira_profiles!chef_id(full_name, avatar_url), ingredients:mktplace_feira_recipe_ingredients(name, amount)')
      .order('created_at', { ascending: false });

    if (chefId) {
      query = query.eq('chef_id', chefId);
    }

    const { data: recipes, error } = await query;

    if (error) throw error;

    return ok(recipes || []);
  } catch (error: any) {
    return err(error.message || 'Erro ao buscar receitas');
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  try {
    const body = await request.json();
    const admin = createSupabaseAdmin();

    const { data: recipe, error: recipeError } = await admin
      .from('mktplace_feira_recipes')
      .insert({
        title: body.title,
        description: body.description,
        instructions: body.instructions,
        image_url: body.image_url,
        chef_id: user.id
      })
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Se tiver ingredientes, insere
    if (body.ingredients && body.ingredients.length > 0) {
      const ingredientsData = body.ingredients.map((ing: any) => ({
        recipe_id: recipe.id,
        name: ing.name,
        amount: ing.amount
      }));
      const { error: ingredientsError } = await admin
        .from('mktplace_feira_recipe_ingredients')
        .insert(ingredientsData);
      
      if (ingredientsError) throw ingredientsError;
    }

    return ok(recipe);
  } catch (error: any) {
    return err(error.message || 'Erro ao criar receita');
  }
}
