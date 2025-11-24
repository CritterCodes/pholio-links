import { type NextRequest, NextResponse } from 'next/server';

const rootDomain = 'pholio.link';

function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  
  console.log('[MIDDLEWARE_EXTRACT] Host header:', host);
  console.log('[MIDDLEWARE_EXTRACT] Hostname:', hostname);
  console.log('[MIDDLEWARE_EXTRACT] Root domain:', rootDomain);

  // Local development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const parts = hostname.split('.');
    if (parts.length > 1) {
      return parts[0];
    }
    return null;
  }

  // Check if it's a subdomain of pholio.link
  if (hostname.endsWith(rootDomain)) {
    const subdomain = hostname.replace(`.${rootDomain}`, '');
    console.log('[MIDDLEWARE_EXTRACT] Extracted subdomain:', subdomain);
    
    // Make sure it's not the root domain or www
    if (subdomain && subdomain !== rootDomain && subdomain !== 'www') {
      return subdomain;
    }
  }

  console.log('[MIDDLEWARE_EXTRACT] No subdomain found');
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  console.log('[MIDDLEWARE] Full path:', request.nextUrl.toString());
  console.log('[MIDDLEWARE] Pathname:', pathname, 'Subdomain:', subdomain);

  if (subdomain) {
    console.log('[MIDDLEWARE] Processing subdomain:', subdomain);
    
    // Block access to auth pages from subdomains
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      console.log('[MIDDLEWARE] Blocking auth page access from subdomain');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For the root path on a subdomain, redirect to /profile
    if (pathname === '/') {
      console.log('[MIDDLEWARE] Root path detected - redirecting to /profile');
      const url = request.nextUrl.clone();
      url.pathname = '/profile';
      console.log('[MIDDLEWARE] Redirect URL:', url.toString());
      return NextResponse.redirect(url);
    }
  } else {
    console.log('[MIDDLEWARE] No subdomain - passing through');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths
    '/:path*',
  ],
};
