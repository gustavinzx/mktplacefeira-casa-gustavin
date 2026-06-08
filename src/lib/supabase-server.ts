import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cliente com ANON KEY — respeita RLS (para operações do usuário logado)
export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Cliente com SERVICE ROLE — bypassa RLS (apenas para operações admin/server)
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const TABLE = {
  profiles: 'mktplace_feira_profiles',
  products: 'mktplace_feira_products',
  categories: 'mktplace_feira_categories',
  orders: 'mktplace_feira_orders',
  orderItems: 'mktplace_feira_order_items',
  subscriptions: 'mktplace_feira_subscriptions',
  returns: 'mktplace_feira_return_requests',
  paymentMethods: 'mktplace_feira_payment_methods',
  producers: 'mktplace_feira_producers',
  addresses: 'mktplace_feira_addresses',
  coupons: 'mktplace_feira_coupons',
  fairs: 'mktplace_feira_fairs',
  supportTickets: 'mktplace_feira_support_tickets',
  walletTransactions: 'mktplace_feira_wallet_transactions',
  userEvents: 'mktplace_feira_user_events',
  searchQueries: 'mktplace_feira_search_queries',
  anomalyLogs: 'mktplace_feira_anomaly_logs',
  productViews: 'mktplace_feira_product_views',
  orderStatusHistory: 'mktplace_feira_order_status_history',
  banners: 'mktplace_feira_banners',
  producerFairs: 'mktplace_feira_producer_fairs',
  campaigns: 'mktplace_feira_marketing_campaigns',
  adPackages: 'mktplace_feira_ad_packages',
  notifications: 'mktplace_feira_notifications',
} as const;

// Extrai o usuário autenticado do header Authorization: Bearer <token> ou dos cookies SSR
export async function getAuthUser(request?: Request) {
  // MÉTODO 1: Bearer token no header (compatibilidade com páginas antigas)
  if (request) {
    const auth = request.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const token = auth.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) return data.user;
      }
    }
  }

  // MÉTODO 2: Sessão SSR via cookies (padrão correto do @supabase/ssr)
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
  } catch {
    // cookies() pode falhar fora de contexto Server Component — ignorar
  }

  return null;
}

export const getTableName = (name: keyof typeof TABLE) => TABLE[name] || `mktplace_feira_${name}`;

// Helper para respostas padronizadas
export function ok(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function err(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
