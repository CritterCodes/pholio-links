import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  
  if (!hostname) {
    return NextResponse.next();
  }

  // Extract subdomain from hostname
  // Format: subdomain.pholio.link or localhost:3000
  const parts = hostname.split('.');
  let subdomain: string | null = null;

  if (hostname.includes('pholio.link')) {
    // Production: subdomain.pholio.link
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  } else if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
    // Local development: localhost:3000 - no subdomain routing
    return NextResponse.next();
  }

  // Route root domain and www to landing page
  if (!subdomain || subdomain === 'www') {
    const pathname = request.nextUrl.pathname;
    
    // Keep dashboard and auth routes accessible
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/auth') || pathname.startsWith('/api')) {
      return NextResponse.next();
    }
    
    // Everything else on root/www goes to landing page
    return NextResponse.rewrite(
      new URL('/landing', request.url)
    );
  }

  // If we have a subdomain (and it's not www), route to the public profile
  if (subdomain && subdomain !== 'www' && subdomain !== 'dashboard') {
    const pathname = request.nextUrl.pathname;
    
    // If it's a dashboard path, keep it as is but mark it as a user profile request
    if (pathname.startsWith('/dashboard')) {
      // Rewrite to /dashboard but keep subdomain context
      return NextResponse.rewrite(
        new URL(`/dashboard?username=${subdomain}${pathname.substring(10)}`, request.url)
      );
    }
    
    // Otherwise, show the public profile for this username
    return NextResponse.rewrite(
      new URL(`/${subdomain}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

