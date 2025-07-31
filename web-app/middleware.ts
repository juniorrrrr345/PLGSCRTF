import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Ne pas appliquer le middleware sur les routes API, _next, et /config
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/config' ||
    request.nextUrl.pathname.startsWith('/maintenance')
  ) {
    return NextResponse.next()
  }

  try {
    // Vérifier le cookie de maintenance d'abord (plus rapide)
    const maintenanceCookie = request.cookies.get('maintenanceMode')
    
    if (maintenanceCookie?.value === 'true') {
      // Rediriger vers la page de maintenance
      return NextResponse.rewrite(new URL('/maintenance', request.url))
    }

    // Si pas de cookie, vérifier via l'API
    const response = await fetch(`${request.nextUrl.origin}/api/settings`)
    
    if (response.ok) {
      const data = await response.json()
      
      // Créer la réponse
      const res = NextResponse.next()
      
      // Mettre à jour le cookie
      res.cookies.set('maintenanceMode', data.maintenanceMode ? 'true' : 'false', {
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 // 1 minute
      })
      
      if (data.maintenanceMode) {
        // Rediriger vers la page de maintenance
        return NextResponse.rewrite(new URL('/maintenance', request.url))
      }
      
      return res
    }
  } catch (error) {
    console.error('Middleware error:', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}