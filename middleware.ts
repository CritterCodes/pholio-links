import { type NextRequest, NextResponse } from 'next/server';

const rootDomain = 'pholio.link';

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  console.log(`[MIDDLEWARE] hostname="${hostname}", url="${url}"`);

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    console.log('[MIDDLEWARE] Localhost detected');
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      console.log(`[MIDDLEWARE] Localhost subdomain: ${fullUrlMatch[1]}`);
      return fullUrlMatch[1];
    }
    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];
  console.log(`[MIDDLEWARE] rootDomain="${rootDomainFormatted}"`);

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    const subdomain = parts[0];
    console.log(`[MIDDLEWARE] Vercel preview subdomain: ${subdomain}`);
    return subdomain;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  if (isSubdomain) {
    const subdomain = hostname.replace(`.${rootDomainFormatted}`, '');
    console.log(`[MIDDLEWARE] ✓ Subdomain detected: "${subdomain}"`);
    return subdomain;
  }

  console.log('[MIDDLEWARE] No subdomain detected');
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  console.log(`[MIDDLEWARE] pathname="${pathname}", subdomain="${subdomain}"`);

  if (subdomain) {
    // Block access to certain admin paths from subdomains
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      console.log(`[MIDDLEWARE] Blocking auth page on subdomain`);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For the root path on a subdomain, rewrite to the subdomain page
    if (pathname === '/') {
      console.log(`[MIDDLEWARE] Root path on subdomain, rewriting to /s/${subdomain}`);
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
    }

    // For other paths on subdomain, rewrite them to /s/subdomain/path
    console.log(`[MIDDLEWARE] Rewriting ${pathname} to /s/${subdomain}${pathname}`);
    return NextResponse.rewrite(new URL(`/s/${subdomain}${pathname}`, request.url));
  }

  // On the root domain, allow normal access
  console.log('[MIDDLEWARE] Root domain, allowing normal access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)',
  ],
};

