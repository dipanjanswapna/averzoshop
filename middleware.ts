import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// মনে রাখবেন: মিডলওয়্যারে firebase-admin বা @/firebase/server ইম্পোর্ট করা যাবে না।
// কারণ এগুলো Node.js এর ওপর নির্ভরশীল এবং Edge-এ চলে না।

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ১. পেজ টাইপ চেক করা
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedPage = pathname.startsWith('/dashboard');

  // ২. কুকি থেকে টোকেন চেক করা (এটি Edge Runtime-এ নিরাপদ)
  const idToken = request.cookies.get('firebaseIdToken')?.value;

  // ৩. লজিক: টোকেন না থাকলে এবং প্রোটেক্টড পেজে যেতে চাইলে রিডাইরেক্ট
  if (!idToken && isProtectedPage) {
    const loginUrl = new URL('/login', request.url);
    // বর্তমানে কোন পেজে যেতে চেয়েছিল সেটি মনে রাখার জন্য searchParams ব্যবহার করা যেতে পারে
    return NextResponse.redirect(loginUrl);
  }

  // ৪. লজিক: টোকেন থাকলে লগইন/রেজিস্টার পেজে যেতে বাধা দেওয়া
  if (idToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// কোন কোন পাথে মিডলওয়্যারটি রান হবে সেটি কনফিগার করা
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};