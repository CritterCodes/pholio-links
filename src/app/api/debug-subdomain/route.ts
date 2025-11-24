import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'unknown';
  const pathname = request.nextUrl.pathname;
  const url = request.url;
  
  // Extract subdomain logic (same as middleware)
  let subdomain: string | null = null;
  
  if (host.includes('localhost')) {
    const match = url.match(/http:\/\/([^.]+)\.localhost/);
    if (match) subdomain = match[1];
  } else if (host.includes('vercel.app')) {
    if (host.includes('---')) {
      const sub = host.split('---')[0];
      if (sub !== 'pholio') subdomain = sub;
    }
  } else if (host.includes('pholio.link')) {
    const parts = host.split('.');
    if (parts[0] !== 'pholio' && parts[0] !== 'www') {
      subdomain = parts[0];
    }
  }

  return NextResponse.json({
    host,
    pathname,
    url,
    extractedSubdomain: subdomain,
    timestamp: new Date().toISOString(),
  });
}
