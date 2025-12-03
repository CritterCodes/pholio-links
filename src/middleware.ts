import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use Node.js runtime for MongoDB support

// Cache for custom domain lookups (in-memory, 1 hour TTL)
const domainCache = new Map<string, { username: string; timestamp: number } | null>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getCachedUser(
  domain: string,
  usersCollection: any
): Promise<{ username: string } | null> {
  const cached = domainCache.get(domain);
  const now = Date.now();

  // Return cached result if still valid
  if (cached && typeof cached === 'object' && 'timestamp' in cached && now - cached.timestamp < CACHE_TTL) {
    return { username: cached.username };
  }

  // If we have a cached null marker, return null
  if (cached === null) {
    return null;
  }

  // Query database
  const user = await usersCollection.findOne({
    'profile.customDomain': domain.toLowerCase(),
  });

  // Cache the result
  if (user) {
    domainCache.set(domain, { username: user.username, timestamp: now });
    return { username: user.username };
  } else {
    domainCache.set(domain, null);
    return null;
  }
}

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
    // For production (user.pholio.link)
    if (isPholia && parts.length >= 3 && parts[1] === 'pholio' && parts[2] === 'link') {
      subdomain = parts[0];
    }
  }

  // Handle pholio.link subdomain routing (e.g., username.pholio.link)
  if (subdomain && subdomain !== 'www') {
    // Redirect root to /profile
    if (pathname === '/') {
      url.pathname = `/${subdomain}/profile`;
      return NextResponse.rewrite(url);
    }
    // For dashboard/authenticated routes, let them pass through normally
    // Users should access dashboard at username.pholio.link/dashboard, not as /username/dashboard
    return NextResponse.next();
  }

  // Check for custom domain - handle gracefully with caching
  if (!isPholia && !isLocalhost && !subdomain) {
    try {
      // Lazy load the database module only when needed
      const { getUsersCollection } = await import('@/lib/mongodb');
      const usersCollection = await getUsersCollection();

      let user = null;

      // Strategy 1: Try exact domain match (e.g., links.crittercodes.dev)
      user = await getCachedUser(hostname, usersCollection);
      if (user) {
        console.log(`[Custom Domain] Exact match: ${hostname} -> ${user.username}`);
      }

      // Strategy 2: If no exact match and hostname has multiple parts (subdomain), try root domain
      // This allows subdomain.links.crittercodes.dev to work if links.crittercodes.dev is registered
      if (!user && parts.length > 2) {
        const rootDomain = parts.slice(1).join('.');
        user = await getCachedUser(rootDomain, usersCollection);
        if (user) {
          console.log(`[Custom Domain] Root domain fallback: ${hostname} -> ${rootDomain} -> ${user.username}`);
        }
      }

      // If we found a user with this custom domain, rewrite the request
      if (user) {
        if (pathname === '/' || pathname === '/profile') {
          url.pathname = `/${user.username}/profile`;
          console.log(`[Custom Domain] Rewriting ${hostname}${pathname} to ${url.pathname}`);
          return NextResponse.rewrite(url);
        }
      } else {
        console.log(`[Custom Domain] No user found for ${hostname}`);
      }
    } catch (error) {
      console.error('Error checking custom domain in middleware:', error);
      // Continue to normal flow - don't crash
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