/**
 * Webhook receiver for domain setup completion
 * Called by the Domain Setup Microservice when setup completes
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/domain-setup/signature';
import { MongoClient } from 'mongodb';

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri as string);
  await client.connect();
  return client.db(process.env.MONGODB_DB);
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('X-Signature') || '';

    // Verify signature
    if (!verifySignature(body, signature)) {
      console.warn('Invalid signature on domain setup webhook');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse body
    const data = JSON.parse(body) as {
      userId: string;
      domain: string;
      status: 'active' | 'failed';
      message: string;
      error?: string;
    };

    const { userId, domain, status, error } = data;

    // Connect to database
    const db = await connectToDatabase();

    // Update user's domain status
    const result = await db
      .collection('profiles')
      .updateOne(
        { userId },
        {
          $set: {
            customDomainStatus: status,
            customDomain: domain,
            customDomainSetupAt: new Date(),
            ...(error && { customDomainError: error }),
          },
        }
      );

    if (result.matchedCount === 0) {
      console.warn(`User not found: ${userId}`);
    }

    console.log(
      `[${domain}] Setup ${status === 'active' ? 'completed' : 'failed'} for user ${userId}`
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
