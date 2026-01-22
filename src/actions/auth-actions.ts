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
        
        // In a real app, you'd send this link via email.
        // For this development environment, we log the link to the server console.
        console.log("---- MAGIC LINK FOR DEVELOPMENT ----");
        console.log(`A magic link for ${email} was requested.`);
        console.log(`Link: ${link}`);
        console.log("---- COPY AND PASTE THE LINK IN YOUR BROWSER TO SIGN IN ----");
        
        return { success: true, message: "Link generated! In a real app, this would be emailed. For development, check the server console for the sign-in link." };
    } catch (error: any) {
        console.error("Error generating sign-in link:", error);
        return { success: false, message: "Could not generate a sign-in link. Please check the email address and try again." };
    }
}

const passwordResetSchema = z.object({
  email: z.string().email(),
});

export async function sendPasswordResetLink(values: z.infer<typeof passwordResetSchema>) {
    getFirebaseAdminApp();
    const auth = getAuth();
    const { email } = values;

    const successMessage = "If an account with this email exists, a password reset link has been generated (for development, check the server console).";

    try {
        const link = await auth.generatePasswordResetLink(email);
        
        console.log("---- PASSWORD RESET LINK FOR DEVELOPMENT ----");
        console.log(`A password reset link for ${email} was requested.`);
        console.log(`Link: ${link}`);
        console.log("---- COPY AND PASTE THE LINK IN YOUR BROWSER TO RESET PASSWORD ----");
        
        return { success: true, message: successMessage };
    } catch (error: any) {
        console.error("Error generating password reset link:", error);
        // To prevent email enumeration attacks, we still return a success response for "user-not-found" errors.
        if (error.code === 'auth/user-not-found') {
            console.log(`Password reset for non-existent user ${email} requested. No link generated or sent.`);
            return { success: true, message: successMessage };
        }
        // For other errors, we return a failure.
        return { success: false, message: "Could not process password reset request. Please try again later." };
    }
}