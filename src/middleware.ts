import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Simple subdomain detection for development
  const parts = hostname.split('.');
  let subdomain = null;
  
  // For development (user.localhost:3000)
  if (hostname.includes('localhost')) {
    if (parts.length > 1 && parts[0] !== 'localhost') {
      subdomain = parts[0];
    }
  } else {
    // For production (user.pholio.links)
    if (parts.length >= 3 && parts[1] === 'pholio' && parts[2] === 'links') {
      subdomain = parts[0];
    }
  }
  
  // If we have a subdomain, rewrite to the public profile page
  if (subdomain && subdomain !== 'www') {
    // Avoid infinite loops by checking if we're already on the profile page
    if (!url.pathname.startsWith('/api') && url.pathname === '/') {
      url.pathname = `/${subdomain}`;
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};