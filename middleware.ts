import { type NextRequest, NextResponse } from 'next/server';

const rootDomain = 'pholio.link';

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];

  // Handle Vercel preview deployments
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const subdomain = extractSubdomain(request);

  console.log('[MIDDLEWARE] Host:', host, 'Pathname:', pathname, 'Subdomain:', subdomain);

  if (subdomain) {
    console.log('[MIDDLEWARE] Subdomain detected:', subdomain);
    
    // Block access to auth pages from subdomains
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      console.log('[MIDDLEWARE] Blocking auth page access from subdomain');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For the root path on a subdomain, redirect to /profile
    if (pathname === '/') {
      console.log('[MIDDLEWARE] Root path on subdomain - redirecting to /profile');
      const url = request.nextUrl.clone();
      url.pathname = '/profile';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths
    '/:path*',
  ],
};
