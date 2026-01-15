
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware file is designed to be Edge-compatible.
// Avoid importing Node.js-dependent modules here.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const idToken = request.cookies.get('firebaseIdToken')?.value;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/customer');

  // If the user is not authenticated and tries to access a protected page,
  // redirect them to the login page.
  if (!idToken && isProtectedPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is authenticated and tries to access an auth page (login/register),
  // let them stay. The login page itself will handle the "Go to Dashboard" logic.
  // This prevents redirect loops if they land on /login while already having a cookie.

  return NextResponse.next();
}

// Configure which paths the middleware will run on.
export const config = {
  matcher: ['/dashboard/:path*', '/customer/:path*', '/login', '/register'],
};
