import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

function getSearchTerm(name: string): string {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (cleanWord.length >= 3 && isNaN(Number(cleanWord))) {
      return cleanWord;
    }
  }
  return name;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createSupabaseAdmin();

  try {
    // Busca a receita
    const { data: recipe, error } = await admin
      .from('mktplace_feira_recipes')
      .select('*, chef:mktplace_feira_profiles!chef_id(full_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!recipe) return err('Receita não encontrada', 404);

    // Busca os ingredientes da receita
    const { data: ingredients } = await admin
      .from('mktplace_feira_recipe_ingredients')
      .select('*')
      .eq('recipe_id', id);

    // Busca os produtos que possivelmente dão match com esses ingredientes na feira
    const items = await Promise.all((ingredients || []).map(async (ing) => {
      const searchTerm = getSearchTerm(ing.name);
      
      const { data: prods } = await admin
        .from('mktplace_feira_products')
        .select('id, title, price, unit, image_url, producer_id, producer:mktplace_feira_producers(id, stall_name)')
        .ilike('title', `%${searchTerm}%`)
        .limit(1);
      
      const prodData = prods && prods.length > 0 ? prods[0] : null;
      
      return {
        ...ing,
        suggested_product: prodData
      };
    }));

    // --- INÍCIO DA EXTRAÇÃO INTELIGENTE (IA AVANÇADA NLP) ---
    const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const fullTextNormalized = removeAccents(`${recipe.title} ${recipe.description || ''} ${recipe.instructions || ''}`.toLowerCase());
    
    // Busca todos os produtos com estoque
    const { data: allProducts } = await admin
      .from('mktplace_feira_products')
      .select('id, title, price, unit, image_url, producer_id, producer:mktplace_feira_producers(id, stall_name)')
      .gt('stock', 0);

    const autoExtracted = [];
    if (allProducts) {
      for (const prod of allProducts) {
        // Pega a palavra principal e remove acentos
        const mainWordRaw = prod.title.split(' ')[0].toLowerCase();
        const mainWordNorm = removeAccents(mainWordRaw);
        
        // Evita matches com palavras muito curtas (menor que 3 letras)
        if (mainWordNorm.length > 2) {
          // Lógica de Singular/Plural
          const isPlural = mainWordNorm.endsWith('s');
          const singularForm = isPlural ? mainWordNorm.slice(0, -1) : mainWordNorm;
          const pluralForm = !isPlural ? mainWordNorm + 's' : mainWordNorm;
          
          const matchFound = fullTextNormalized.includes(singularForm) || fullTextNormalized.includes(pluralForm);
          
          if (matchFound) {
            // Verifica se já não está na lista manual
            const alreadyExists = items.some(i => i.suggested_product?.id === prod.id || removeAccents(i.name.toLowerCase()).includes(singularForm));
            if (!alreadyExists) {
              autoExtracted.push({
                name: prod.title,
                amount: 'Qtd. na receita',
                suggested_product: prod,
                is_auto_extracted: true
              });
            }
          }
        }
      }
    }

    const finalIngredients = [...items, ...autoExtracted];
    // --- FIM DA EXTRAÇÃO INTELIGENTE ---

    return ok({ ...recipe, ingredients: finalIngredients });
  } catch (error: any) {
    return err(error.message || 'Erro ao buscar receita');
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  
  try {
    // Busca a receita pra ver se existe
    const { data: recipe } = await admin.from('mktplace_feira_recipes').select('id').eq('id', id).single();
    if (!recipe) return err('Receita não encontrada', 404);

    const { error } = await admin.from('mktplace_feira_recipes').delete().eq('id', id);
    if (error) throw error;

    return ok({ message: 'Receita excluída' });
  } catch (error: any) {
    return err(error.message || 'Erro ao excluir receita');
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const admin = createSupabaseAdmin();
  
  try {
    const { data: recipe } = await admin.from('mktplace_feira_recipes').select('chef_id').eq('id', id).single();
    if (!recipe) return err('Receita não encontrada', 404);
    if (recipe.chef_id !== user.id) return err('Não autorizado', 403);

    const body = await request.json();
    const { title, description, instructions, image_url, ingredients } = body;

    const { error: updateError } = await admin
      .from('mktplace_feira_recipes')
      .update({
        title,
        description,
        instructions,
        image_url
      })
      .eq('id', id);

    if (updateError) throw updateError;

    if (Array.isArray(ingredients)) {
      await admin.from('mktplace_feira_recipe_ingredients').delete().eq('recipe_id', id);
      if (ingredients.length > 0) {
        const ingsToInsert = ingredients.map((ing: any) => ({
          recipe_id: id,
          name: ing.name,
          amount: ing.amount || 'A gosto'
        }));
        await admin.from('mktplace_feira_recipe_ingredients').insert(ingsToInsert);
      }
    }

    return ok({ message: 'Receita atualizada com sucesso' });
  } catch (error: any) {
    return err(error.message || 'Erro ao atualizar receita');
  }
}

