import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed origins for CORS (in production, fetch from Firestore/sites collection)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://apps.adityoarr.com',
  // Add registered site domains here
];

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/comments-plugin/api/:path*',
    '/dashboard/:path*',
    '/embed'
  ]
};