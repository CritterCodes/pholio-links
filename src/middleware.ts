import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  
  // Skip API routes and static files
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/static') ||
      pathname.startsWith('/images') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.json')) {
    return NextResponse.next();
  }

  // Parse hostname parts
  const parts = hostname.split('.');
  let subdomain = null;
  let isLocalhost = hostname.includes('localhost');
  let isPholia = hostname.includes('pholio.link');
  
  // Detect environment and extract subdomain
  if (isLocalhost) {
    // For development (user.localhost:3000)
    if (parts.length > 1 && parts[0] !== 'localhost') {
      subdomain = parts[0];
    }
  } else {
    // For production (user.pholio.links)
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

  // Check for custom domain (only for root path requests to minimize database queries)
  // Only attempt custom domain lookup if:
  // 1. Not pholio.link domain
  // 2. Not localhost
  // 3. Is a root path request (/)
  // 4. Has no subdomain already
  if (!isPholia && !isLocalhost && pathname === '/' && !subdomain) {
    try {
      // Lazy load the database module only when needed
      const { getUsersCollection } = await import('@/lib/mongodb');
      const usersCollection = await getUsersCollection();
      
      let user = null;

      // Strategy 1: Try exact domain match (e.g., crittercodes.dev)
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

      // If we found a user with this custom domain, rewrite the request
      if (user) {
        url.pathname = `/${user.username}`;
        return NextResponse.rewrite(url);
      }
    } catch (error) {
      console.error('Error checking custom domain in middleware:', error);
      // If database error, continue to normal flow - don't crash
      // This prevents middleware from breaking the entire app
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