import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';
import { getSubscriptionsByCustomer } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If no Stripe customer, return free tier
    if (!user.stripeCustomerId) {
      return NextResponse.json({
        tier: 'free',
        plan: null,
        active: false,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        price: 0,
      });
    }

    // Get subscriptions from Stripe
    const subscription = await getSubscriptionsByCustomer(user.stripeCustomerId);

    if (!subscription) {
      return NextResponse.json({
        tier: 'free',
        plan: null,
        active: false,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        price: 0,
      });
    }

    const priceData = subscription.items.data[0]?.price;

    // Determine plan from price ID
    let plan = 'free';
    let price = 0;
    
    if (priceData?.id === process.env.STRIPE_PRICE_ID_MONTHLY) {
      plan = 'pro_monthly';
      price = 7;
    } else if (priceData?.id === process.env.STRIPE_PRICE_ID_YEARLY) {
      plan = 'pro_yearly';
      price = 60;
    }

    // Update user's subscription tier if needed
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    const expectedTier = isActive ? 'paid' : 'free';
    
    if (user.subscriptionTier !== expectedTier) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { subscriptionTier: expectedTier } }
      );
    }

    const subData = subscription as unknown as { current_period_start: number; current_period_end: number };
    return NextResponse.json({
      tier: expectedTier,
      plan,
      active: isActive,
      currentPeriodStart: new Date(subData.current_period_start * 1000),
      currentPeriodEnd: new Date(subData.current_period_end * 1000),
      price,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: `Failed to fetch subscription: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
