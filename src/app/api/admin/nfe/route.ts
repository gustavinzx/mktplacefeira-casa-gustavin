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
      // Delay simulado (remover quando integrar SEFAZ real)
      await new Promise(r => setTimeout(r, 1500));

      const results = [];

      for (const orderId of orderIds) {
        // Chave no formato da SEFAZ: 44 dígitos
        // Em homologação, usa-se série 990 e ambiente 2
        const fakeChave = [
          '35',                                          // UF SP
          new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7), // AAMM
          '00000000000000',                              // CNPJ emissor (placeholder)
          '55',                                          // modelo NF-e
          '001',                                         // série
          String(Math.floor(Math.random() * 999999999)).padStart(9, '0'), // número
          '1',                                           // tipo emissão
          String(Math.floor(Math.random() * 99999999)).padStart(8, '0'),  // código
        ].join('');

        // Upsert correto: tenta inserir, se já existe faz update
        const { error } = await admin
          .from('mktplace_feira_nfe')
          .upsert(
            {
              id: orderId,  // usa order_id como PK apenas se for o design; ajuste se necessário
              status: 'homologacao',  // NUNCA 'autorizada' sem SEFAZ real
              access_key: fakeChave,
              sefaz_message: '[SIMULAÇÃO] Ambiente de homologação — NF-e não válida na SEFAZ',
            },
            { onConflict: 'id' }
          );

        if (!error) results.push(orderId);
      }

      return ok({
        transmitted: results.length,
        warning: 'Ambiente de homologação: chaves geradas são simuladas e não têm validade fiscal.',
      });
    }

    return err('Ação desconhecida', 400);
  } catch (error: any) {
    return err(error.message || 'Erro ao processar NFes');
  }
}
