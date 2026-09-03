import { auth } from '@/lib/firebase/client';
import { signInAnonymously } from 'firebase/auth';

/**
 * Safely retrieves the current user's Firebase ID Token.
 * If no user is signed in, it automatically signs them in anonymously.
 * Firebase Anonymous Auth provides a stable UID and valid ID token for the session,
 * allowing us to track authorship without forcing immediate email/password registration.
 * 
 * @returns Promise<string> The Firebase ID Token
 */
export async function getIdToken(): Promise<string> {
  let currentUser = auth.currentUser;

  if (!currentUser) {
    // Automatically sign in anonymously if no session exists
    const userCredential = await signInAnonymously(auth);
    currentUser = userCredential.user;
  }

  // Force refresh to ensure we have the latest token, especially after state changes
  const token = await currentUser.getIdToken(true);
  
  if (!token) {
    throw new Error('Failed to retrieve Firebase ID Token');
  }

  return token;
}