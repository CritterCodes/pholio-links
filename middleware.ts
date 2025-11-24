import { type NextRequest, NextResponse } from 'next/server';

const rootDomain = 'pholio.link';

function extractSubdomain(request: NextRequest): string | null {
  const hostname = request.headers.get('host') || '';
  const url = request.url;

  // Handle localhost for development
  if (hostname.includes('localhost')) {
    const match = url.match(/http:\/\/([^.]+)\.localhost/);
    if (match) return match[1];
    return null;
  }

  // Handle Vercel preview deployments (user---branch.vercel.app)
  if (hostname.includes('vercel.app')) {
    if (hostname.includes('---')) {
      const subdomain = hostname.split('---')[0];
      if (subdomain !== 'pholio') return subdomain;
    }
    return null;
  }

  // Handle production (subdomain.pholio.link)
  if (hostname.includes('pholio.link')) {
    // Split and check if we have a subdomain
    const parts = hostname.split('.');
    
    // pholio.link = no subdomain
    // www.pholio.link = no subdomain
    // username.pholio.link = subdomain
    if (parts[0] !== 'pholio' && parts[0] !== 'www') {
      return parts[0];
    }
  }

  return null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const subdomain = extractSubdomain(request);

  // Always log for debugging
  const host = request.headers.get('host') || 'unknown';
  console.log(`[MW] host=${host} path=${pathname} subdomain=${subdomain}`);

  // If no subdomain, allow normal routing
  if (!subdomain) {
    return NextResponse.next();
  }

  // Block auth pages on subdomains
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Rewrite subdomain requests to /s/[subdomain]
  if (pathname === '/') {
    return NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
  }

  // Other paths on subdomain
  return NextResponse.rewrite(new URL(`/s/${subdomain}${pathname}`, request.url));
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
    '/((?!api|_next/static|_next/image|favicon\\.ico).*)',
  ],
};

