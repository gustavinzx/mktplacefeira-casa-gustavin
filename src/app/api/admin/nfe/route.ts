import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();
  
  try {
    // Check if user is admin
    const { data: profile } = await admin.from('mktplace_feira_profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return err('Sem permissão', 403);
    }

    // Busca pedidos com seus dados de NFe e produtores
    const { data: orders, error: errOrders } = await admin
      .from('mktplace_feira_orders')
      .select(`
        id, 
        total_amount, 
        created_at, 
        nfe:mktplace_feira_nfe(id, status, access_key, sefaz_message, pdf_url)
      `)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (errOrders) {
      console.error('Erro NFE fetching:', errOrders);
      throw errOrders;
    }

    // Formatar notas
    const notas = (orders || []).map(o => {
      const nfeData = Array.isArray(o.nfe) ? o.nfe[0] : o.nfe;
      
      return {
        id: o.id,
        nfe_id: nfeData?.id || null,
        vendor: 'Vendedor Local',
        cnpj: '11.222.333/0001-44',
        value: `R$ ${Number(o.total_amount).toFixed(2).replace('.', ',')}`,
        date: new Date(o.created_at).toLocaleString('pt-BR'),
        status: nfeData?.status || 'pendente',
        access_key: nfeData?.access_key,
        sefaz_message: nfeData?.sefaz_message,
        pdf_url: nfeData?.pdf_url
      };
    });

    return ok({ notas });
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar NFe');
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();
  
  try {
    const { data: profile } = await admin.from('mktplace_feira_profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return err('Sem permissão', 403);
    }

    const body = await request.json();
    const { orderIds, action } = body;

    if (!orderIds || !Array.isArray(orderIds) || !action) {
      return err('Dados inválidos', 400);
    }

    if (action === 'transmitir') {
      // Simulação de delay da SEFAZ
      await new Promise(r => setTimeout(r, 1500));

      // Atualiza as notas para autorizada com chave simulada
      for (const id of orderIds) {
        const fakeChave = `3526${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`;
        
        // Verifica se a nota já existe (foi gerada mas rejeitada, etc) ou cria
        const { data: nfeExist } = await admin.from('mktplace_feira_nfe').select('id').eq('id', id).single();
        
        if (nfeExist) {
            await admin.from('mktplace_feira_nfe').update({
                status: 'autorizada',
                access_key: fakeChave,
                sefaz_message: 'Autorizado o uso da NF-e'
            }).eq('id', id);
        } else {
             // Caso a NFE seja criada pela primeira vez (id viria como order_id da UI)
             await admin.from('mktplace_feira_nfe').update({
                status: 'autorizada',
                access_key: fakeChave,
                sefaz_message: 'Autorizado o uso da NF-e'
             }).eq('id', id);
        }
      }

      return ok({ message: 'Notas emitidas com sucesso!' });
    }

    return err('Ação desconhecida', 400);
  } catch (error: any) {
    return err(error.message || 'Erro ao processar NFes');
  }
}
