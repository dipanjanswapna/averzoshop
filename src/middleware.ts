export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/firebase/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const idToken = request.cookies.get('firebaseIdToken')?.value;

  let decodedToken = null;
  if (idToken) {
    try {
      decodedToken = await auth().verifyIdToken(idToken);
    } catch (error) {
      // Invalid token, clear the cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('firebaseIdToken');
      return response;
    }
  }

  if (!decodedToken && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (decodedToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
