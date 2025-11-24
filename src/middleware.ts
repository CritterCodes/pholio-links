import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Skip API routes and static files
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Parse hostname parts
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
  
  // If we have a subdomain on pholio.link, rewrite to the public profile page
  if (subdomain && subdomain !== 'www') {
    // Avoid infinite loops by checking if we're already on the profile page
    if (url.pathname === '/') {
      url.pathname = `/${subdomain}`;
      return NextResponse.rewrite(url);
    }
  }

  // Check for custom domain with optional subdomain
  // This handles: example.com, subdomain.example.com, links.crittercodes.dev, etc.
  const isPholia = hostname.includes('pholio.link');
  const isLocalhost = hostname.includes('localhost');
  
  if (!isPholia && !isLocalhost && url.pathname === '/') {
    try {
      const usersCollection = await getUsersCollection();
      
      // Check for exact domain match first
      let user = await usersCollection.findOne({
        'profile.customDomain': hostname.toLowerCase(),
      });

      // If no exact match and hostname has a subdomain, try matching just the root domain
      // This allows links.crittercodes.dev to work even if only crittercodes.dev is registered
      if (!user && parts.length > 2) {
        // Try root domain (without the subdomain)
        const rootDomain = parts.slice(1).join('.').toLowerCase();
        user = await usersCollection.findOne({
          'profile.customDomain': rootDomain,
        });
      }

      if (user) {
        // Rewrite the request to show the custom domain user's profile
        url.pathname = `/${user.username}`;
        return NextResponse.rewrite(url);
      }
    } catch (error) {
      console.error('Error checking custom domain in middleware:', error);
      // If database error, continue to normal flow
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