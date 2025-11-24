import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import { getUsersCollection } from '@/lib/mongodb';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = (await headers()).get('stripe-signature');

    if (!sig || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as unknown as { customer: string; metadata?: Record<string, string> };
        const customerId = session.customer;
        const metadata = session.metadata || {};

        if (customerId) {
          // Update user with Stripe customer ID
          await usersCollection.updateOne(
            { username: metadata.username },
            { 
              $set: { 
                stripeCustomerId: customerId,
                subscriptionTier: 'paid'
              } 
            }
          );

          console.log(`✅ Checkout completed for customer: ${customerId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as { customer: string; status: string };
        const customerId = subscription.customer;

        // Find user with this Stripe customer ID
        const user = await usersCollection.findOne({ stripeCustomerId: customerId });

        if (user) {
          const isActive = subscription.status === 'active';
          await usersCollection.updateOne(
            { _id: user._id },
            { 
              $set: { 
                subscriptionTier: isActive ? 'paid' : 'free'
              } 
            }
          );

          console.log(`✅ Subscription updated for customer: ${customerId}, active: ${isActive}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as unknown as { customer: string };
        const customerId = subscription.customer;

        // Find user with this Stripe customer ID
        const user = await usersCollection.findOne({ stripeCustomerId: customerId });

        if (user) {
          await usersCollection.updateOne(
            { _id: user._id },
            { 
              $set: { 
                subscriptionTier: 'free'
              } 
            }
          );

          console.log(`✅ Subscription deleted for customer: ${customerId}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as unknown as { customer: string };
        const customerId = invoice.customer;

        console.log(`✅ Payment succeeded for customer: ${customerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as { customer: string };
        const customerId = invoice.customer;

        console.log(`⚠️ Payment failed for customer: ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
