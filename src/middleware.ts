import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const idToken = request.cookies.get('firebaseIdToken')?.value;

  // প্রোটেক্টেড এবং অথ পেজ নির্ধারণ
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/customer');

  // ১. লগইন নেই কিন্তু সুরক্ষিত পেজে যাওয়ার চেষ্টা করলে লগইনে পাঠানো
  if (!idToken && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ২. লগইন আছে কিন্তু লগইন পেজে যেতে চাইলে ড্যাশবোর্ডে পাঠানো
  if (idToken && isAuthPage) {
    // এখানে ডিফল্ট ড্যাশবোর্ডে পাঠানো হচ্ছে
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // matcher-এ অবশ্যই /customer যোগ করতে হবে
  matcher: ['/dashboard/:path*', '/customer/:path*', '/login', '/register'],
};