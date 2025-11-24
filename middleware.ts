import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  
  if (!hostname) {
    return NextResponse.next();
  }

  // Extract subdomain from hostname
  // Format: subdomain.pholio.link
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

  const pathname = request.nextUrl.pathname;

  // Route root domain and www to landing page
  if (!subdomain || subdomain === 'www') {
    // API routes pass through
    if (pathname.startsWith('/api')) {
      return NextResponse.next();
    }
    
    // Auth routes pass through
    if (pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.next();
    }
    
    // Everything on root/www domain shows landing page (already handled by root page.tsx)
    return NextResponse.next();
  }

  // If we have a subdomain (and it's not www), route to the public profile
  if (subdomain && subdomain !== 'www' && subdomain !== 'dashboard') {
    // If it's a dashboard path, rewrite with username parameter
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.rewrite(
        new URL(`/dashboard?username=${subdomain}${pathname.substring(10)}`, request.url)
      );
    }
    
    // For any other path on username subdomain, rewrite to /{username}
    // This matches the (public)/[username]/page.tsx route
    return NextResponse.rewrite(
      new URL(`/${subdomain}${pathname}`, request.url)
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

