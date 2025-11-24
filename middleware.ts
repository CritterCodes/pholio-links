import { type NextRequest, NextResponse } from 'next/server';

const rootDomain = 'pholio.link';

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0]; // Remove port if present

  // Local development
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Handle Vercel preview deployments (subdomain---branch.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Production environment - check if it's a subdomain of pholio.link
  const rootDomainFormatted = rootDomain.split(':')[0];
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  // Debug logging
  const host = request.headers.get('host') || 'unknown';
  console.log(`[MW] host=${host} path=${pathname} subdomain=${subdomain} [v3]`);

  if (subdomain) {
    // Block access to auth pages from subdomains
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For the root path on a subdomain, redirect to www with /s/[subdomain]
    if (pathname === '/') {
      const redirectUrl = `https://www.pholio.link/s/${subdomain}`;
      console.log(`[MW] Redirecting to ${redirectUrl}`);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // On the root domain, allow normal access
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths on subdomains
    '/:path*',
  ],
};

