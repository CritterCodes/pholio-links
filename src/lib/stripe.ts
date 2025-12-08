import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

export default stripe;

// Pricing plans - update these with your actual Stripe product/price IDs
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Profile page',
      'Bio and social links',
      'Subdomain',
      '5 links',
      'Basic theme',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 7.00,
    monthlyPrice: 7.00,
    yearlyPrice: null,
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY || 'price_pro_monthly', // Update with your Stripe price ID
    trialPeriodDays: 30, // 30-day free trial
    features: [
      'Everything in Free',
      'Unlimited links',
      'Advanced themes',
      'Photo galleries',
      'Detailed analytics',
      'Custom splash screen',
      'Priority support',
    ],
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    price: 60.00,
    monthlyPrice: 5.00,
    yearlyPrice: 60.00,
    priceId: process.env.STRIPE_PRICE_ID_YEARLY || 'price_pro_yearly', // Update with your Stripe price ID
    trialPeriodDays: 30, // 30-day free trial
    features: [
      'Everything in Free',
      'Unlimited links',
      'Advanced themes',
      'Photo galleries',
      'Detailed analytics',
      'Custom splash screen',
      'Priority support',
    ],
  },
};

export async function createCustomer(email: string, username: string) {
  try {
    return await stripe.customers.create({
      email,
      metadata: {
        username,
      },
    });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

export async function updateCustomer(customerId: string, metadata: Record<string, string>) {
  try {
    return await stripe.customers.update(customerId, { metadata });
  } catch (error) {
    console.error('Error updating Stripe customer:', error);
    throw error;
  }
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
  allowPromotionCodes: boolean = false,
  trialPeriodDays?: number
) {
  try {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
      allow_promotion_codes: allowPromotionCodes,
    };

    if (trialPeriodDays) {
      sessionConfig.subscription_data = {
        trial_period_days: trialPeriodDays,
      };
    }

    return await stripe.checkout.sessions.create(sessionConfig);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  try {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw error;
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    throw error;
  }
}

export async function createPromotionCode(
  code: string,
  percentOff: number,
  duration: 'once' | 'repeating' | 'forever',
  durationInMonths?: number
) {
  try {
    // 1. Create a Coupon
    const coupon = await stripe.coupons.create({
      percent_off: percentOff,
      duration: duration,
      duration_in_months: duration === 'repeating' ? durationInMonths : undefined,
      name: `${percentOff}% OFF (${code})`,
    });

    // 2. Create a Promotion Code linked to the Coupon
    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: code,
    } as any);

    return promotionCode;
  } catch (error) {
    console.error('Error creating Stripe promotion code:', error);
    throw error;
  }
}

export async function getSubscriptionsByCustomer(customerId: string) {
  try {
    // Fetch active and trialing subscriptions separately to ensure we get them
    // regardless of API version defaults or 'all' support
    const [activeSubs, trialingSubs] = await Promise.all([
      stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      }),
      stripe.subscriptions.list({
        customer: customerId,
        status: 'trialing',
        limit: 1,
      })
    ]);
    
    return activeSubs.data[0] || trialingSubs.data[0] || null;
  } catch (error) {
    console.error('Error retrieving customer subscriptions:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function updateSubscription(
  subscriptionId: string,
  priceId: string
) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function getCustomer(customerId: string) {
  try {
    return await stripe.customers.retrieve(customerId);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    throw error;
  }
}