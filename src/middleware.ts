import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Allowed origins for CORS (in production, fetch from Firestore/sites collection)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://apps.adityoarr.com',
  // Add registered site domains here
];

const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // ============================================
  // CORS Handling for API Routes
  // ============================================
  if (pathname.startsWith('/api/') || pathname.startsWith('/comments-plugin/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });

      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      } else {
        response.headers.set('Access-Control-Allow-Origin', '*');
      }

      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-App-Check-Token');
      response.headers.set('Access-Control-Max-Age', '86400');

      return response;
    }

    // Add CORS headers to actual requests
    const response = NextResponse.next();

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  }

  // ============================================
  // Dashboard Protection
  // ============================================
  if (pathname.startsWith('/dashboard')) {
    // Check for session cookie or auth token
    const authCookie = request.cookies.get('firebase-auth');

    if (!authCookie) {
      // Redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ============================================
  // Security Logging
  // ============================================
  if (process.env.NODE_ENV === 'production') {
    console.log('[Security]', {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: pathname,
      origin: origin || 'none',
      userAgent: request.headers.get('user-agent')?.substring(0, 100)
    });
  }

  // /login lives outside the [locale] tree (see src/app/(app)/login), so it
  // must never be rewritten/prefixed by next-intl.
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return NextResponse.next();
  }

  // ============================================
  // Locale routing for the public marketing/docs site
  // ============================================
  // Everything else (the "/" and "/docs" pages) falls through to next-intl,
  // which resolves the "/" vs "/id" prefix and sets the request locale for
  // the src/app/[locale] route tree.
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/api/:path*',
    '/comments-plugin/api/:path*',
    '/dashboard/:path*',
    '/embed',
    // Explicit root: with `basePath: '/comments-plugin'`, Next.js prefixes
    // every matcher entry with the basePath, so the catch-all regex below
    // (which needs a "/" plus something after it) never matches the bare
    // "/comments-plugin" request for the homepage — only deeper paths like
    // "/comments-plugin/docs". This entry covers that bare-root case.
    '/',
    // Public marketing/docs site: match everything except API routes,
    // Next.js internals, the embed widget/dashboard (handled above), and
    // requests for files with an extension (images, embed.js, etc.).
    '/((?!api|comments-plugin/api|dashboard|embed|_next|_vercel|.*\\..*).*)',
  ],
};
