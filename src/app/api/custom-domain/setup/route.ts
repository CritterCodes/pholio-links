/**
 * Updated custom domain setup endpoint
 * Uses the standalone Domain Setup Microservice
 * 
 * POST /api/custom-domain/setup
 * Triggers domain setup on the microservice which:
 * 1. Creates nginx config
 * 2. Generates SSL certificate
 * 3. Reloads nginx
 * 4. Sends webhook notification when complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { DomainSetupClient } from '@/lib/domain-setup/client';
import { validateDomain, checkBlacklist } from '@/lib/domain-setup/validation';

const client = new DomainSetupClient(
  process.env.DOMAIN_SETUP_SERVER_URL || 'https://65.21.227.202:3001',
  process.env.DOMAIN_SETUP_SECRET || 'change-this-secret'
);

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
    const validation = validateDomain(domain);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check blacklist
    const blacklist = checkBlacklist(domain);
    if (blacklist.blacklisted) {
      return NextResponse.json(
        { error: blacklist.reason },
        { status: 400 }
      );
    }

    // Build webhook URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pholio.link';
    const webhookUrl = `${baseUrl}/api/webhooks/domain-setup`;

    // Trigger domain setup on microservice
    const result = await client.setupDomain(
      domain.toLowerCase(),
      authSession.user.email,
      webhookUrl
    );

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    console.error('Domain setup error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('unavailable')
    ) {
      return NextResponse.json(
        {
          error:
            'Unable to reach setup server. Please try again in a few moments.',
          status: 'queued',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to initiate domain setup' },
      { status: 500 }
    );
  }
}