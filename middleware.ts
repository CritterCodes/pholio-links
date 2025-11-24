import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const pathname = request.nextUrl.pathname;
  
  console.log(`[MIDDLEWARE] Request to: ${hostname}${pathname}`);
  
  if (!hostname) {
    console.log('[MIDDLEWARE] No hostname detected');
    return NextResponse.next();
  }

  // Extract subdomain from hostname
  // Format: subdomain.pholio.link
  const parts = hostname.split('.');
  let subdomain: string | null = null;

  console.log(`[MIDDLEWARE] Hostname parts:`, parts);

  if (hostname.includes('pholio.link')) {
    // Production: subdomain.pholio.link
    if (parts.length > 2) {
      subdomain = parts[0];
      console.log(`[MIDDLEWARE] Detected subdomain: "${subdomain}"`);
    } else {
      console.log(`[MIDDLEWARE] Root/www domain detected (parts.length=${parts.length})`);
    }
  } else if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
    // Local development: localhost:3000 - no subdomain routing
    console.log('[MIDDLEWARE] Localhost detected, skipping subdomain routing');
    return NextResponse.next();
  }

  // Route root domain and www to landing page
  if (!subdomain || subdomain === 'www') {
    console.log('[MIDDLEWARE] Routing to landing page (root/www domain)');
    // API routes pass through
    if (pathname.startsWith('/api')) {
      console.log('[MIDDLEWARE] API route, passing through');
      return NextResponse.next();
    }
    
    // Auth routes pass through
    if (pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register')) {
      console.log('[MIDDLEWARE] Auth route, passing through');
      return NextResponse.next();
    }
    
    // Everything on root/www domain shows landing page (already handled by root page.tsx)
    return NextResponse.next();
  }

  // If we have a subdomain (and it's not www), route to the public profile
  if (subdomain && subdomain !== 'www' && subdomain !== 'dashboard') {
    console.log(`[MIDDLEWARE] Username subdomain detected: "${subdomain}"`);
    
    // If it's a dashboard path, rewrite with username parameter
    if (pathname.startsWith('/dashboard')) {
      console.log(`[MIDDLEWARE] Dashboard path detected, rewriting to /dashboard?username=${subdomain}`);
      return NextResponse.rewrite(
        new URL(`/dashboard?username=${subdomain}${pathname.substring(10)}`, request.url)
      );
    }
    
    // For root path on username subdomain, show the profile
    // We'll handle this by setting a header so the root page can check it
    if (pathname === '/' || pathname === '') {
      // Rewrite to the username route
      console.log(`[MIDDLEWARE] Root path on username subdomain, rewriting to /${subdomain}`);
      return NextResponse.rewrite(
        new URL(`/${subdomain}`, request.url)
      );
    }
    
    // For other paths on username subdomain, rewrite to username-prefixed path
    console.log(`[MIDDLEWARE] Other path on username subdomain, rewriting to /${subdomain}${pathname}`);
    return NextResponse.rewrite(
      new URL(`/${subdomain}${pathname}`, request.url)
    );
  }

  console.log('[MIDDLEWARE] No special routing matched, passing through');
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

