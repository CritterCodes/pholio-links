import { NextRequest, NextResponse } from 'next/server';

// Cache for custom domain lookups (in-memory, 1 minute TTL)
const domainCache = new Map<string, { username: string | null; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

async function getCachedUser(
  domain: string,
  origin: string
): Promise<{ username: string } | null> {
  const cached = domainCache.get(domain);
  const now = Date.now();

  // Return cached result if still valid
  if (cached && now - cached.timestamp < CACHE_TTL) {
    if (cached.username) {
      return { username: cached.username };
    }
    return null;
  }

  // Query API instead of database directly
  try {
    // Construct absolute URL for the API call
    // We use the request origin to ensure we hit the same environment
    const apiUrl = new URL('/api/internal/lookup-domain', origin);
    apiUrl.searchParams.set('domain', domain);

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache the fetch result for 60 seconds at the edge
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      // If 404, cache null result
      if (response.status === 404) {
        domainCache.set(domain, { username: null, timestamp: now });
      }
      return null;
    }

    const data = await response.json();
    if (data.username) {
      domainCache.set(domain, { username: data.username, timestamp: now });
      return { username: data.username };
    }
    
    domainCache.set(domain, { username: null, timestamp: now });
    return null;
  } catch (error) {
    console.error('Error fetching domain info:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  // Check X-Pholio-Custom-Domain first (explicit override), then X-Forwarded-Host, then Host
  let hostname = request.headers.get('x-pholio-custom-domain') || 
                 request.headers.get('x-forwarded-host') || 
                 request.headers.get('host') || '';
  
  // Handle multiple values in headers (take the first one)
  if (hostname.includes(',')) {
    hostname = hostname.split(',')[0].trim();
  }

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
      const response = NextResponse.rewrite(url);
      response.cookies.set('debug-hostname', hostname, { path: '/', maxAge: 60 });
      return response;
    }
    // For dashboard/authenticated routes, let them pass through normally
    // Users should access dashboard at username.pholio.link/dashboard, not as /username/dashboard
    const response = NextResponse.next();
    response.cookies.set('debug-hostname', hostname, { path: '/', maxAge: 60 });
    return response;
  }

  // Check for custom domain - handle gracefully with caching
  if (!isPholia && !isLocalhost && !subdomain) {
    try {
      let user = null;
      // Use a hardcoded origin for internal API calls to avoid loop issues or invalid origins
      // In production, this should be the main domain
      const origin = 'https://www.pholio.link';

      // Strategy 1: Try exact domain match (e.g., links.crittercodes.dev)
      user = await getCachedUser(hostname, origin);
      if (user) {
        console.log(`[Custom Domain] Exact match: ${hostname} -> ${user.username}`);
      }

      // Strategy 2: If no exact match and hostname has multiple parts (subdomain), try root domain
      // This allows subdomain.links.crittercodes.dev to work if links.crittercodes.dev is registered
      if (!user && parts.length > 2) {
        const rootDomain = parts.slice(1).join('.');
        user = await getCachedUser(rootDomain, origin);
        if (user) {
          console.log(`[Custom Domain] Root domain fallback: ${hostname} -> ${rootDomain} -> ${user.username}`);
        }
      }

      // If we found a user with this custom domain, rewrite the request
      if (user) {
        if (pathname === '/' || pathname === '/profile') {
          url.pathname = `/${user.username}/profile`;
          console.log(`[Custom Domain] Rewriting ${hostname}${pathname} to ${url.pathname}`);
          const response = NextResponse.rewrite(url);
          response.headers.set('X-Custom-Domain-User', user.username);
          // Set a cookie for client-side debugging
          response.cookies.set('debug-custom-domain', `User found: ${user.username}`, { path: '/', maxAge: 10 });
          response.cookies.set('debug-hostname', hostname, { path: '/', maxAge: 60 });
          return response;
        }
      } else {
        console.log(`[Custom Domain] No user found for ${hostname}`);
        const response = NextResponse.next();
        response.headers.set('X-Custom-Domain-Debug', `No user found for ${hostname}`);
        // Set a cookie for client-side debugging
        response.cookies.set('debug-custom-domain', `No user found for ${hostname}`, { path: '/', maxAge: 10 });
        response.cookies.set('debug-hostname', hostname, { path: '/', maxAge: 60 });
        return response;
      }
    } catch (error) {
      console.error('Error checking custom domain in middleware:', error);
      // Continue to normal flow - don't crash
      const response = NextResponse.next();
      response.headers.set('X-Custom-Domain-Error', 'Internal Error');
      response.cookies.set('debug-custom-domain', `Error: ${error instanceof Error ? error.message : String(error)}`, { path: '/', maxAge: 10 });
      response.cookies.set('debug-hostname', hostname, { path: '/', maxAge: 60 });
      return response;
    }
  }

  const response = NextResponse.next();
  response.cookies.set('debug-hostname', hostname, { path: '/', maxAge: 60 });
  return response;
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