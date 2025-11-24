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

  console.log(`[MIDDLEWARE] Hostname: ${hostname}, Parts:`, parts);

  if (hostname.includes('pholio.link')) {
    // Production: subdomain.pholio.link
    if (parts.length > 2) {
      subdomain = parts[0];
      console.log(`[MIDDLEWARE] ✓ Subdomain detected: "${subdomain}"`);
    } else {
      console.log(`[MIDDLEWARE] Root or www domain (parts.length=${parts.length})`);
    }
  } else if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
    // Local development: localhost:3000 - no subdomain routing
    console.log('[MIDDLEWARE] Localhost detected, skipping subdomain routing');
    return NextResponse.next();
  }

  // Route root domain and www to landing page
  if (!subdomain || subdomain === 'www') {
    console.log('[MIDDLEWARE] No subdomain or www detected');
    // API routes pass through
    if (pathname.startsWith('/api')) {
      console.log('[MIDDLEWARE] → API route, passing through');
      return NextResponse.next();
    }
    
    // Auth routes pass through
    if (pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register')) {
      console.log('[MIDDLEWARE] → Auth route, passing through');
      return NextResponse.next();
    }
    
    // Everything on root/www domain shows landing page
    console.log('[MIDDLEWARE] → Landing page');
    return NextResponse.next();
  }

  // If we have a subdomain (and it's not www), route to the public profile
  if (subdomain && subdomain !== 'www' && subdomain !== 'dashboard') {
    console.log(`[MIDDLEWARE] ✓ Username subdomain: "${subdomain}"`);
    
    // If it's a dashboard path, rewrite with username parameter
    if (pathname.startsWith('/dashboard')) {
      console.log(`[MIDDLEWARE] → Dashboard path, rewriting to /dashboard?username=${subdomain}`);
      return NextResponse.rewrite(
        new URL(`/dashboard?username=${subdomain}${pathname.substring(10)}`, request.url)
      );
    }
    
    // For any path on username subdomain, redirect to the profile route
    // This is more reliable than rewrites on Vercel
    console.log(`[MIDDLEWARE] → Redirecting to /${subdomain}${pathname}`);
    return NextResponse.redirect(
      new URL(`https://pholio.link/${subdomain}${pathname}`, request.url)
    );
  }

  console.log('[MIDDLEWARE] No special routing matched');
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

