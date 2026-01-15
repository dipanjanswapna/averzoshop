
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/customer')
  
  const idToken = request.cookies.get('firebaseIdToken')?.value;

  if (!idToken && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (idToken && isAuthPage) {
     // This is a simplified redirect, a full solution would decode the token
     // and check the role, but that requires a Node.js environment.
     // For now, we assume if they have a token and try to access auth pages,
     // we send them to a generic dashboard start.
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/customer/:path*', '/login', '/register'],
}
