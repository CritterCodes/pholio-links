/**
 * Webhook endpoint to receive domain setup completion from private server
 * POST /api/custom-domains/webhook
 * 
 * Receives callbacks from the domain setup server when:
 * - Domain is successfully configured
 * - Domain setup fails
 * - SSL certificate is generated
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import crypto from 'crypto';

const DOMAIN_SETUP_SECRET = process.env.DOMAIN_SETUP_SECRET || 'your-secret-key-change-in-production';

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', DOMAIN_SETUP_SECRET)
    .update(body)
    .digest('hex');
  return hash === signature;
}

interface WebhookPayload {
  userId: string;
  domain: string;
  status: 'active' | 'pending' | 'failed';
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('X-Signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const body = await request.text();

    // Verify signature
    if (!verifySignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body) as WebhookPayload;
    const { userId, domain, status, message, error } = payload;

    const usersCollection = await getUsersCollection();

    // Update user's domain status
    const updateData: Record<string, unknown> = {
      'profile.customDomain': domain.toLowerCase(),
      'profile.customDomainStatus': status,
      'profile.customDomainSetupAt': new Date(),
    };

    if (message) {
      updateData['profile.customDomainMessage'] = message;
    }

    if (error) {
      updateData['profile.customDomainError'] = error;
    }

    await usersCollection.updateOne(
      { email: userId }, // Use email as identifier since that's what we store
      { $set: updateData }
    );

    console.log(`[Webhook] Domain ${domain} status updated to ${status} for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Domain ${domain} status updated to ${status}`,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
