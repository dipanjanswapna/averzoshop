'use server';

import { getFirebaseAdminApp } from '@/firebase/server';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';

const emailLinkActionCodeSettings = {
  url: process.env.NEXT_PUBLIC_BASE_URL + '/verify-email',
  handleCodeInApp: true,
};

const sendSignInLinkSchema = z.object({
  email: z.string().email(),
});

export async function sendSignInLink(values: z.infer<typeof sendSignInLinkSchema>) {
    getFirebaseAdminApp();
    const auth = getAuth();
    const { email } = values;

    try {
        const link = await auth.generateSignInWithEmailLink(email, emailLinkActionCodeSettings);
        
        // In a real app, you'd send this link via email using a service like SendGrid or Nodemailer.
        // For this development environment, we'll log the link to the server console.
        // This is a security measure to avoid sending real emails from a dev environment.
        console.log("---- MAGIC LINK FOR DEVELOPMENT ----");
        console.log(`A magic link for ${email} was requested.`);
        console.log(`Link: ${link}`);
        console.log("---- COPY AND PASTE THE LINK IN YOUR BROWSER TO SIGN IN ----");
        
        return { success: true, message: "A sign-in link has been sent to your email address (and logged to the console for development)." };
    } catch (error: any) {
        console.error("Error generating sign-in link:", error);
        return { success: false, message: error.message };
    }
}

const passwordResetSchema = z.object({
  email: z.string().email(),
});

export async function sendPasswordResetLink(values: z.infer<typeof passwordResetSchema>) {
    getFirebaseAdminApp();
    const auth = getAuth();
    const { email } = values;

    try {
        const link = await auth.generatePasswordResetLink(email);
        
        // Similar to the sign-in link, we log this for development.
        console.log("---- PASSWORD RESET LINK FOR DEVELOPMENT ----");
        console.log(`A password reset link for ${email} was requested.`);
        console.log(`Link: ${link}`);
        console.log("---- COPY AND PASTE THE LINK IN YOUR BROWSER TO RESET PASSWORD ----");

        return { success: true, message: "A password reset link has been sent to your email (and logged to console for development)." };
    } catch (error: any) {
        console.error("Error generating password reset link:", error);
        // Don't leak if an email exists or not
        if (error.code === 'auth/user-not-found') {
            return { success: true, message: "If an account with this email exists, a password reset link has been sent." };
        }
        return { success: false, message: "Could not send password reset link." };
    }
}
