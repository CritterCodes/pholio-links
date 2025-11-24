import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  console.log(`[MIDDLEWARE] hostname="${hostname}", pathname="${pathname}"`);

  // Don't process localhost
  if (hostname.includes('localhost')) {
    return NextResponse.next();
  }

  // Check if this is pholio.link domain
  if (!hostname.includes('pholio.link')) {
    return NextResponse.next();
  }

  // Split hostname to get subdomain
  // crittercodes.pholio.link -> subdomain = "crittercodes"
  // www.pholio.link -> subdomain = "www"  
  // pholio.link -> no subdomain
  const subdomain = hostname.split('.')[0];
  
  console.log(`[MIDDLEWARE] subdomain="${subdomain}"`);

  // Skip if no subdomain or if it's root domain
  if (subdomain === 'pholio') {
    console.log(`[MIDDLEWARE] Root domain, skipping`);
    return NextResponse.next();
  }

  // Skip if www or other common subdomains
  if (subdomain === 'www') {
    console.log(`[MIDDLEWARE] www subdomain, skipping`);
    return NextResponse.next();
  }

  // Skip API and other special paths
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    console.log(`[MIDDLEWARE] Special path, passing through`);
    return NextResponse.next();
  }

  // This is a username subdomain (e.g., crittercodes.pholio.link)
  console.log(`[MIDDLEWARE] Username subdomain detected: ${subdomain}`);
  
  // For dashboard paths, keep them but add username param
  if (pathname.startsWith('/dashboard')) {
    console.log(`[MIDDLEWARE] Rewriting /dashboard to /dashboard?username=${subdomain}`);
    return NextResponse.rewrite(
      new URL(`/dashboard?username=${subdomain}`, request.url)
    );
  }

  // For root or any other path, rewrite to /{username}
  console.log(`[MIDDLEWARE] Rewriting to /${subdomain}${pathname}`);
  return NextResponse.rewrite(
    new URL(`/${subdomain}${pathname}`, request.url)
  );
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

