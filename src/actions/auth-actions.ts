'use server';

import { getFirebaseAdminApp } from '@/firebase/server';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import nodemailer from 'nodemailer';

/**
 * ১. Nodemailer সেটআপ (Gmail এর মাধ্যমে ইমেইল পাঠানোর জন্য)
 * মনে রাখবেন: .env ফাইলে GMAIL_USER এবং GMAIL_APP_PASSWORD থাকতে হবে।
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Google App Password ব্যবহার করতে হবে
  },
});

const emailLinkActionCodeSettings = {
  url: process.env.NEXT_PUBLIC_BASE_URL + '/verify-email',
  handleCodeInApp: true,
};

const emailSchema = z.object({
  email: z.string().email(),
});

/**
 * ২. পাসওয়ার্ড রিসেট লিঙ্ক পাঠানোর অ্যাকশন
 */
export async function sendPasswordResetLink(values: z.infer<typeof emailSchema>) {
  getFirebaseAdminApp();
  const auth = getAuth();
  const { email } = values;

  try {
    // লিঙ্ক জেনারেট করা
    const link = await auth.generatePasswordResetLink(email);

    // ইমেইল পাঠানো
    await transporter.sendMail({
      from: `"Averzo Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Averzo',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Password Reset</h2>
          <p>আপনি আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য অনুরোধ করেছেন। নিচের বাটনে ক্লিক করে পাসওয়ার্ড পরিবর্তন করুন:</p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">এই লিঙ্কটি ১ ঘণ্টা পর অকার্যকর হয়ে যাবে। যদি আপনি এই অনুরোধ না করে থাকেন, তবে ইমেইলটি ইগনোর করুন।</p>
        </div>
      `,
    });

    return { success: true, message: "পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে।" };
  } catch (error: any) {
    console.error("Error sending reset link:", error);
    return { success: false, message: "ইমেইল পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।" };
  }
}

/**
 * ৩. কাস্টমারদের জন্য ম্যাজিক সাইন-ইন লিঙ্ক পাঠানোর অ্যাকশন
 */
export async function sendSignInLink(values: z.infer<typeof emailSchema>) {
  getFirebaseAdminApp();
  const auth = getAuth();
  const { email } = values;

  try {
    const link = await auth.generateSignInWithEmailLink(email, emailLinkActionCodeSettings);

    await transporter.sendMail({
      from: `"Averzo Login" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Login to Averzo - Magic Link',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Welcome to Averzo</h2>
          <p>নিচের বাটনে ক্লিক করে সরাসরি লগইন করুন:</p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">নিরাপত্তার স্বার্থে এই লিঙ্কটি কাউকে শেয়ার করবেন না।</p>
        </div>
      `,
    });

    return { success: true, message: "সাইন-ইন লিঙ্ক ইমেইলে পাঠানো হয়েছে। আপনার ইনবক্স চেক করুন।" };
  } catch (error: any) {
    console.error("Error sending sign-in link:", error);
    return { success: false, message: "লিঙ্ক পাঠানো সম্ভব হয়নি।" };
  }
}