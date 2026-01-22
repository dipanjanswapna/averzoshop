'use client';

import { getAuth, sendPasswordResetEmail, sendSignInLinkToEmail } from 'firebase/auth';
import type { Auth } from 'firebase/auth';

/**
 * Sends a password reset email using Firebase's built-in functionality.
 * @param auth Firebase Auth instance.
 * @param email The user's email address.
 */
export async function sendPasswordReset(auth: Auth, email: string): Promise<{ success: boolean; message: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset link has been sent to your email. Please check your inbox (and spam folder).",
    };
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    if (error.code === 'auth/too-many-requests') {
      return { success: false, message: 'Too many requests have been sent from this device. Please wait a while before trying again.' };
    }
    // Firebase provides user-friendly error messages for other cases
    return { success: false, message: error.message };
  }
}

/**
 * Sends a "magic link" for passwordless sign-in.
 * @param auth Firebase Auth instance.
 * @param email The user's email address.
 */
export async function sendMagicLink(auth: Auth, email: string): Promise<{ success: boolean; message: string }> {
  const actionCodeSettings = {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Store the email locally to use it upon redirect.
    window.localStorage.setItem('emailForSignIn', email);
    return {
      success: true,
      message: "A sign-in link has been sent to your email. Please check your inbox.",
    };
  } catch (error: any) {
    console.error("Error sending sign-in link:", error);
    if (error.code === 'auth/too-many-requests') {
      return { success: false, message: 'Too many requests have been sent from this device. Please wait a while before trying again.' };
    }
    return { success: false, message: error.message };
  }
}