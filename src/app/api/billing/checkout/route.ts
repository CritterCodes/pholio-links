import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';
import { createCheckoutSession, createCustomer, SUBSCRIPTION_PLANS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    
    if (!authSession || !authSession.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { plan } = await request.json();

    // Validate plan
    if (!plan || (plan !== 'pro_monthly' && plan !== 'pro_yearly')) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
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

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await createCustomer(user.email, user.username);
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { stripeCustomerId } }
      );
    }

    // Get the pricing plan
    const selectedPlan = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
    
    const priceId = (selectedPlan as Record<string, unknown>).priceId as string;
    if (!selectedPlan || !priceId) {
      return NextResponse.json(
        { error: 'Plan pricing not configured' },
        { status: 500 }
      );
    }

    // Get the protocol and host for success/cancel URLs
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Create checkout session
    let checkoutSession;
    try {
      checkoutSession = await createCheckoutSession(
        stripeCustomerId,
        priceId,
        `${baseUrl}/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}`,
        `${baseUrl}/settings?tab=billing`,
        { username: user.username, plan },
        true, // Allow promotion codes
        (selectedPlan as any).trialPeriodDays // Pass trial period if defined in plan
      );
    } catch (error: any) {
      // Handle invalid customer ID (e.g. from sandbox/live switch)
      if (error?.code === 'resource_missing' && error?.param === 'customer') {
        console.warn(`Stripe customer ${stripeCustomerId} missing during checkout. Creating new customer.`);
        
        const customer = await createCustomer(user.email, user.username);
        stripeCustomerId = customer.id;
        
        // Update user with new Stripe customer ID
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { stripeCustomerId } }
        );
        
        // Retry checkout with new customer ID
        checkoutSession = await createCheckoutSession(
          stripeCustomerId,
          priceId,
          `${baseUrl}/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}`,
          `${baseUrl}/settings?tab=billing`,
          { username: user.username, plan },
          true,
          (selectedPlan as any).trialPeriodDays
        );
      } else {
        throw error;
      }
    }

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
