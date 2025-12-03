/**
 * API endpoint to verify DNS record for custom domain
 * POST /api/custom-domain/verify
 *
 * Checks if the domain's A record points to our server IP (65.21.227.202)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

const SERVER_IP = '65.21.227.202';

export async function POST(request: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { domain } = await request.json();

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Prevent checking pholio.link
    if (domain.toLowerCase().includes('pholio.link')) {
      return NextResponse.json(
        { error: 'Cannot use pholio.link domain' },
        { status: 400 }
      );
    }

    try {
      // Resolve domain to IP
      const addresses = await resolve4(domain);

      if (!addresses || addresses.length === 0) {
        return NextResponse.json(
          {
            error: `No A record found for ${domain}. Make sure you've added the A record pointing to ${SERVER_IP}`,
            verified: false,
          },
          { status: 400 }
        );
      }

      // Check if any resolved address matches our server IP
      const isCorrectIP = addresses.includes(SERVER_IP);

      if (!isCorrectIP) {
        return NextResponse.json(
          {
            error: `Domain ${domain} is currently pointing to ${addresses.join(
              ', '
            )}. Please update your DNS A record to point to ${SERVER_IP}`,
            verified: false,
            currentIPs: addresses,
          },
          { status: 400 }
        );
      }

      // DNS verification successful!
      return NextResponse.json({
        verified: true,
        domain,
        ip: SERVER_IP,
        message: `✓ DNS record verified! ${domain} is correctly pointing to ${SERVER_IP}`,
      });
    } catch (dnsError) {
      const errorMessage = dnsError instanceof Error ? dnsError.message : 'Unknown error';

      // Common DNS errors
      if (errorMessage.includes('ENOTFOUND')) {
        return NextResponse.json(
          {
            error: `Domain ${domain} not found. Please check the domain name and try again.`,
            verified: false,
          },
          { status: 400 }
        );
      }

      if (errorMessage.includes('ETIMEDOUT')) {
        return NextResponse.json(
          {
            error: `DNS lookup timed out for ${domain}. Please try again.`,
            verified: false,
          },
          { status: 400 }
        );
      }

      throw dnsError;
    }
  } catch (error) {
    console.error('DNS verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify DNS record. Please try again.' },
      { status: 500 }
    );
  }
}
