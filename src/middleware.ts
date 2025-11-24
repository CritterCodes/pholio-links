import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  
  // Skip API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // Parse hostname parts
  const parts = hostname.split('.');
  let subdomain = null;
  let isDevelopment = false;
  let isPholia = false;
  let isLocalhost = hostname.includes('localhost');
  
  // Detect environment and extract subdomain
  if (isLocalhost) {
    isDevelopment = true;
    // For development (user.localhost:3000)
    if (parts.length > 1 && parts[0] !== 'localhost') {
      subdomain = parts[0];
    }
  } else {
    // For production (user.pholio.links)
    isPholia = hostname.includes('pholio.link');
    if (isPholia && parts.length >= 3 && parts[1] === 'pholio' && parts[2] === 'links') {
      subdomain = parts[0];
    }
  }
  
  // Handle pholio.link subdomain routing (e.g., username.pholio.link)
  if (subdomain && subdomain !== 'www') {
    // Rewrite all paths to include the subdomain username
    if (pathname === '/' || pathname.startsWith('/profile')) {
      url.pathname = `/${subdomain}`;
      return NextResponse.rewrite(url);
    }
  }

  // Check for custom domain with optional subdomain
  // This handles: example.com, subdomain.example.com, links.crittercodes.dev, etc.
  if (!isPholia && !isLocalhost) {
    try {
      const usersCollection = await getUsersCollection();
      let user = null;

      // Strategy 1: Try exact domain match (e.g., crittercodes.dev or links.crittercodes.dev)
      user = await usersCollection.findOne({
        'profile.customDomain': hostname.toLowerCase(),
      });

      // Strategy 2: If no exact match and hostname has multiple parts, try root domain
      // This allows links.crittercodes.dev to work if crittercodes.dev is registered
      if (!user && parts.length > 2) {
        const rootDomain = parts.slice(1).join('.').toLowerCase();
        user = await usersCollection.findOne({
          'profile.customDomain': rootDomain,
        });
      }

      // If we found a user with this custom domain
      if (user) {
        // For root path requests, rewrite to the user's profile
        if (pathname === '/') {
          url.pathname = `/${user.username}`;
          return NextResponse.rewrite(url);
        }
        
        // For other paths, still show the user's profile but preserve the path
        // This allows direct access to /profile, /links, etc. on custom domains
        if (pathname.startsWith('/profile') || pathname.startsWith('/links') || pathname.startsWith('/gallery')) {
          // Keep the pathname as is, but the request is authenticated to this user
          // The profile page will handle showing the correct user
          return NextResponse.next();
        }

        // For any other path on the custom domain, show the profile
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