
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/firebase/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login' || pathname === '/register'

  const idToken = request.cookies.get('firebaseIdToken')?.value;

  // Since middleware runs on the edge, we can't use firebase-admin to verify the token here.
  // We'll do a simple check for the cookie's existence.
  // The actual token verification will happen on pages/layouts that require auth.
  // Server components can verify it, and client components will use the auth state listener.

  if (!idToken && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (idToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}
