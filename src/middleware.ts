import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const path = request.nextUrl.pathname

  // Rotas públicas — nunca bloquear
  const publicPaths = [
    '/login', '/signup', '/cadastro', '/register', '/reset-password',
    '/sobre', '/contato', '/fairs', '/search', '/product', '/producer',
    '/receitas', '/recipe', '/chef', '/como-funciona', '/termos',
    '/privacidade', '/offers', '/categories', '/produtores', '/feiras',
  ]
  if (
    publicPaths.some(p => path === p || path.startsWith(p + '/')) ||
    path === '/'
  ) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() é seguro — valida o JWT sem ir ao banco
  const { data: { user } } = await supabase.auth.getUser()

  const protectedRoutes = [
    { prefix: '/admin',             roles: ['admin'] },
    { prefix: '/portal/feirante',   roles: ['admin', 'feirante', 'vendor'] },
    { prefix: '/portal/chef',       roles: ['admin', 'chef'] },
    { prefix: '/portal/delivery',   roles: ['admin', 'delivery', 'logistica'] },
    { prefix: '/portal/franchisee', roles: ['admin', 'franchisee'] },
    { prefix: '/portal/admin',      roles: ['admin'] },
    { prefix: '/b2b',               roles: ['admin', 'b2b'] },
    { prefix: '/account',           roles: ['admin', 'feirante', 'chef', 'delivery', 'logistica', 'franchisee', 'b2b', 'cliente', 'customer', 'b2c', 'vendor'] },
    { prefix: '/checkout',          roles: ['admin', 'feirante', 'chef', 'delivery', 'logistica', 'franchisee', 'b2b', 'cliente', 'customer', 'b2c', 'vendor'] },
  ]

  const matched = protectedRoutes.find(r => path.startsWith(r.prefix))

  if (matched) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', path)
      return NextResponse.redirect(url)
    }

    // Role do user_metadata (sem query ao banco)
    const role = user.user_metadata?.role ||
                 user.user_metadata?.user_role ||
                 user.app_metadata?.role ||
                 'cliente'

    const normalized: Record<string, string> = {
      b2c: 'cliente', customer: 'cliente', vendor: 'feirante'
    }
    const userRole = normalized[role] || role

    if (!matched.roles.includes(userRole)) {
      // Se não tem role no metadata, tentar buscar no banco (fallback único)
      if (!user.user_metadata?.role && !user.app_metadata?.role) {
        // Permitir acesso e deixar a página verificar — evitar loop
        return response
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
