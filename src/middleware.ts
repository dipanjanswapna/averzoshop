import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// মনে রাখবেন: মিডলওয়্যারে firebase-admin বা @/firebase/server ইম্পোর্ট করা যাবে না।
// কারণ এগুলো Node.js এর ওপর নির্ভরশীল এবং Edge-এ চলে না।

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ১. পেজ টাইপ চেক করা
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/customer');

  // ২. কুকি থেকে টোকেন চেক করা (এটি Edge Runtime-এ নিরাপদ)
  const idToken = request.cookies.get('firebaseIdToken')?.value;

  // ৩. লজিক: টোকেন না থাকলে এবং প্রোটেক্টড পেজে যেতে চাইলে রিডাইরেক্ট
  if (!idToken && isProtectedPage) {
    const loginUrl = new URL('/login', request.url);
    // বর্তমানে কোন পেজে যেতে চেয়েছিল সেটি মনে রাখার জন্য searchParams ব্যবহার করা যেতে পারে
    return NextResponse.redirect(loginUrl);
  }

  // ৪. লগইন থাকা অবস্থায় লগইন পেজে গেলে কোনো স্বয়ংক্রিয় রিডাইরেক্ট হবে না।
  // ব্যবহারকারী "Go to Dashboard" বাটনে ক্লিক করে ড্যাশবোর্ডে যাবেন।

  return NextResponse.next();
}

// কোন কোন পাথে মিডলওয়্যারটি রান হবে সেটি কনফিগার করা
export const config = {
  matcher: ['/dashboard/:path*', '/customer/:path*', '/login', '/register'],
};
