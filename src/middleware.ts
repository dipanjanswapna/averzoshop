
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const idToken = request.cookies.get('firebaseIdToken')?.value;

  // Define protected and auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/customer');

  // 1. If user is not logged in and tries to access a protected page, redirect to login
  if (!idToken && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If user is logged in and tries to access an auth page, redirect to the main dashboard entry
  if (idToken && isAuthPage) {
    // The main protected layout will handle role-based redirection from here.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Apply middleware to all protected and auth routes
export const config = {
  matcher: ['/dashboard/:path*', '/customer/:path*', '/login', '/register'],
};
