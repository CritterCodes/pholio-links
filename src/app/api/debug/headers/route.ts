import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return NextResponse.json({
    headers,
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    host: req.headers.get('host'),
    forwardedHost: req.headers.get('x-forwarded-host'),
  });
}
