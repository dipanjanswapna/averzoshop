import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isDashboardRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/customer');

  const idToken = request.cookies.get('firebaseIdToken')?.value;

  // If the user is not logged in and tries to access a protected route,
  // redirect them to the login page.
  if (!idToken && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is logged in and tries to access an auth page (login/register),
  // redirect them to their dashboard.
  if (idToken && isAuthPage) {
    // A full solution would decode the token to check the role, but that's
    // not feasible in Edge middleware without external services.
    // Redirecting to a generic start page is a safe default.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/customer/:path*', '/login', '/register'],
}
