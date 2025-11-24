import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  
  console.log(`\n[MIDDLEWARE START] =========================================`);
  console.log(`[MIDDLEWARE] Full URL: ${request.url}`);
  console.log(`[MIDDLEWARE] Hostname: ${hostname}`);
  console.log(`[MIDDLEWARE] Pathname: ${pathname}`);

  // Don't process localhost
  if (hostname.includes('localhost')) {
    console.log(`[MIDDLEWARE] → localhost detected, skipping`);
    return NextResponse.next();
  }

  // Check if this is pholio.link domain
  if (!hostname.includes('pholio.link')) {
    console.log(`[MIDDLEWARE] → not pholio.link domain, skipping`);
    return NextResponse.next();
  }

  // Skip API and other special paths
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
    console.log(`[MIDDLEWARE] → special path (${pathname}), skipping`);
    return NextResponse.next();
  }

  // Split hostname to get subdomain
  const parts = hostname.split('.');
  console.log(`[MIDDLEWARE] Hostname parts: ${JSON.stringify(parts)}`);
  
  const subdomain = parts[0];
  console.log(`[MIDDLEWARE] Extracted subdomain: "${subdomain}"`);

  // Skip if no subdomain or if it's root domain
  if (subdomain === 'pholio') {
    console.log(`[MIDDLEWARE] → root domain (pholio.link), skipping`);
    return NextResponse.next();
  }

  // Skip if www
  if (subdomain === 'www') {
    console.log(`[MIDDLEWARE] → www subdomain, skipping`);
    return NextResponse.next();
  }

  // This is a username subdomain
  console.log(`[MIDDLEWARE] ✓ Username subdomain: "${subdomain}"`);
  
  // For dashboard paths, rewrite with username param
  if (pathname.startsWith('/dashboard')) {
    console.log(`[MIDDLEWARE] Dashboard detected, rewriting to /dashboard?username=${subdomain}`);
    const rewriteUrl = new URL(`/dashboard?username=${subdomain}`, request.url);
    console.log(`[MIDDLEWARE] Rewrite URL: ${rewriteUrl.toString()}`);
    return NextResponse.rewrite(rewriteUrl);
  }

  // For root or any other path, rewrite to /{username}{pathname}
  const rewritePath = `/${subdomain}${pathname}`;
  console.log(`[MIDDLEWARE] Rewriting to: ${rewritePath}`);
  const rewriteUrl = new URL(rewritePath, request.url);
  console.log(`[MIDDLEWARE] Full rewrite URL: ${rewriteUrl.toString()}`);
  console.log(`[MIDDLEWARE END] =========================================\n`);
  
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

