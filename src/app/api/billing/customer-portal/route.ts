import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    
    if (!authSession || !authSession.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: authSession.user.email });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Stripe customer not found' },
        { status: 404 }
      );
    }

    // Get the protocol and host for return URL
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const returnUrl = `${protocol}://${host}/billing`;

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
