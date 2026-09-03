import { initializeAppCheck, ReCaptchaV3Provider, AppCheck, getToken } from 'firebase/app-check';
import { auth } from './firebase/client';

let appCheckInstance: AppCheck | null = null;

/**
 * Initialize Firebase App Check with reCAPTCHA v3
 * Security rationale: Prevents API abuse from unauthorized domains/bots
 */
export function initAppCheck(): AppCheck | null {
  if (appCheckInstance) return appCheckInstance;

  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
  
  if (!recaptchaKey) {
    console.warn('App Check: reCAPTCHA key not configured');
    return null;
  }

  try {
    appCheckInstance = initializeAppCheck(auth.app, {
      provider: new ReCaptchaV3Provider(recaptchaKey),
      isTokenAutoRefreshEnabled: true
    });

    return appCheckInstance;
  } catch (error) {
    console.error('Failed to initialize App Check:', error);
    return null;
  }
}

/**
 * Get App Check token for API requests
 */
export async function getAppCheckToken(): Promise<string | null> {
  if (!appCheckInstance) {
    initAppCheck();
  }

  if (!appCheckInstance) return null;

  try {
    const { token } = await getToken(appCheckInstance, true);
    return token;
  } catch (error) {
    console.error('Failed to get App Check token:', error);
    return null;
  }
}