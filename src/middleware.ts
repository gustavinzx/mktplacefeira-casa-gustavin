import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;
  
  // Definição das rotas protegidas e seus roles permitidos
  const protectedRoutes = [
    { prefix: '/admin', roles: ['admin'] },
    { prefix: '/portal/feirante', roles: ['admin', 'feirante'] },
    { prefix: '/portal/chef', roles: ['admin', 'chef'] },
    { prefix: '/portal/delivery', roles: ['admin', 'delivery', 'logistica'] },
    { prefix: '/portal/franchisee', roles: ['admin', 'franchisee'] },
    { prefix: '/b2b', roles: ['admin', 'b2b'] },
    { prefix: '/account', roles: ['admin', 'feirante', 'chef', 'delivery', 'logistica', 'franchisee', 'b2b', 'cliente'] },
    { prefix: '/checkout', roles: ['admin', 'feirante', 'chef', 'delivery', 'logistica', 'franchisee', 'b2b', 'cliente'] },
  ];

  // Ignorar checagem para rotas de auth para evitar loop
  if (path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/cadastro') || path === '/admin/login') {
    return supabaseResponse;
  }

  const matchedRoute = protectedRoutes.find(r => path.startsWith(r.prefix));

  if (matchedRoute) {
    if (!user) {
      // Não autenticado: joga pro login com parâmetro next
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', path)
      return NextResponse.redirect(url)
    }

    // Busca o role na tabela profiles
    const { data: profile } = await supabase
      .from('mktplace_feira_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || 'cliente';

    if (!matchedRoute.roles.includes(userRole)) {
      // Role não permitido, manda para home
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Processa todas rotas, exceto estáticos e arquivos da api
     */
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
