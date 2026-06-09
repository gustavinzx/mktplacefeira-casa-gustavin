import { getAuthUser, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return err('Não autorizado', 401);

    const { text, title } = await request.json();
    if (!text) return err('Texto é obrigatório', 400);

    let rewrittenText = text;
    
    // Adiciona um sabor de marketing se for muito curto
    if (rewrittenText.length < 30) {
      rewrittenText = `Selecionado com carinho diretamente do produtor. ${rewrittenText}. Qualidade garantida para sua mesa!`;
    } else {
      rewrittenText = `${rewrittenText.charAt(0).toUpperCase() + rewrittenText.slice(1)}`;
    }
    
    if (title) {
       rewrittenText = `O melhor ${title} que você vai encontrar! ${rewrittenText}`;
    }
    
    // Delay fake de 1.5s para simular o tempo de pensamento da IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return ok({ rewritten: rewrittenText });

  } catch (error: any) {
    return err('Erro ao processar IA simulada');
  }
}
