import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const path = request.nextUrl.pathname

  // Rotas públicas — nunca bloquear
  const publicPaths = [
    '/login', '/signup', '/cadastro', '/register', '/reset-password',
    '/sobre', '/contato', '/fairs', '/search', '/product', '/producer',
    '/receitas', '/recipe', '/chef', '/como-funciona', '/termos',
    '/privacidade', '/offers', '/categories', '/produtores', '/feiras',
    '/admin/login',
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
    { prefix: '/api/admin',         roles: ['admin'] },
    { prefix: '/portal/feirante',   roles: ['admin', 'feirante', 'vendor'] },
    { prefix: '/portal/chef',       roles: ['admin', 'chef'] },
    { prefix: '/portal/delivery',   roles: ['admin', 'delivery', 'logistica'] },
    { prefix: '/portal/franchisee', roles: ['admin', 'franchisee'] },
    { prefix: '/portal/admin',      roles: ['admin'] },
    { prefix: '/api/portal',        roles: ['admin', 'feirante', 'chef', 'delivery', 'logistica', 'franchisee', 'vendor'] },
    { prefix: '/api/feirante',      roles: ['admin', 'feirante', 'vendor'] },
    { prefix: '/api/franchisee',    roles: ['admin', 'franchisee'] },
    { prefix: '/b2b',               roles: ['admin', 'b2b'] },
    { prefix: '/account',           roles: ['admin', 'feirante', 'chef', 'delivery', 'logistica', 'franchisee', 'b2b', 'cliente', 'customer', 'b2c', 'vendor'] },
    { prefix: '/checkout',          roles: ['admin', 'feirante', 'chef', 'delivery', 'logistica', 'franchisee', 'b2b', 'cliente', 'customer', 'b2c', 'vendor'] },
    { prefix: '/api/account',       roles: ['admin', 'feirante', 'chef', 'delivery', 'logistica', 'franchisee', 'b2b', 'cliente', 'customer', 'b2c', 'vendor'] },
  ]

  const matched = protectedRoutes.find(r => path.startsWith(r.prefix))

  if (matched) {
    if (!user) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
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
      if (path.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: 'Forbidden. Access denied.' }, { status: 403 })
      }
      // Se não tem permissão para a rota, redireciona pro inicio. Não permitir o acesso cego.
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
