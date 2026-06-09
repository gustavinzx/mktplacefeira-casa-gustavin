import { getAuthUser, createSupabaseAdmin, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  try {
    const { text } = await request.json();
    if (!text) return err('Texto é obrigatório', 400);

    const admin = createSupabaseAdmin();
    
    // Busca todos os produtos ativos para enriquecer o texto
    const { data: products } = await admin
      .from('mktplace_feira_products')
      .select('title')
      .gt('stock', 0);
      
    let rewrittenText = text;
    
    if (products) {
      // Dicionário básico para procurar palavras simples no texto
      const keywords = ['tomate', 'banana', 'ovo', 'ovos', 'alface', 'morango', 'chocolate', 'cenoura', 'laranja', 'limão'];
      
      for (const keyword of keywords) {
        // Verifica se a palavra existe no texto original
        const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
        if (regex.test(rewrittenText)) {
          // Busca um produto real no banco que contém essa palavra
          const matchingProduct = products.find(p => p.title.toLowerCase().includes(keyword.replace('ovos', 'ovo')));
          if (matchingProduct) {
            // Substitui a menção genérica pelo nome exato do produto (com destaque em maiúsculo)
            rewrittenText = rewrittenText.replace(regex, matchingProduct.title);
          }
        }
      }
    }
    
    // Adiciona um sabor mais profissional ao texto se for muito curto
    if (rewrittenText.length < 50) {
      rewrittenText = `Comece preparando os ingredientes com carinho. ${rewrittenText}. Sirva fresco e aproveite os sabores da nossa feira local!`;
    } else {
      rewrittenText = `${rewrittenText.charAt(0).toUpperCase() + rewrittenText.slice(1)}`;
    }
    
    // Delay fake de 1.5s para simular o tempo de pensamento da IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return ok({ rewritten: rewrittenText });

  } catch (error: any) {
    return err('Erro ao processar IA simulada');
  }
}
