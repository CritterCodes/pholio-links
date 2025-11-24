# Stripe Billing Setup Guide

## Overview
Complete Stripe billing integration has been implemented with subscription management, checkout, and billing portal access.

## Implemented Features

### API Endpoints

#### 1. `POST /api/billing/checkout`
Creates a Stripe checkout session for subscription purchase.
- **Authentication**: Requires NextAuth session
- **Request**: `{ plan: "pro_monthly" | "pro_yearly" }`
- **Response**: `{ sessionId: string, url: string }`
- **Behavior**:
  - Creates Stripe customer if user doesn't have one
  - Updates database with `stripeCustomerId`
  - Returns checkout URL for payment

#### 2. `POST /api/billing/customer-portal`
Opens Stripe Customer Portal for subscription management.
- **Authentication**: Requires NextAuth session
- **Response**: `{ url: string }`
- **Features**: Upgrade, downgrade, cancel subscription, update payment method

#### 3. `GET /api/billing/subscription`
Fetches current subscription status for the user.
- **Authentication**: Requires NextAuth session
- **Response**:
  ```typescript
  {
    tier: 'free' | 'paid',
    plan: 'pro_monthly' | 'pro_yearly' | null,
    active: boolean,
    currentPeriodStart: Date | null,
    currentPeriodEnd: Date | null,
    price: number,
    status: string
  }
  ```
- **Auto-sync**: Updates `subscriptionTier` in database

#### 4. `POST /api/billing/webhook`
Handles Stripe webhook events for subscription state synchronization.
- **Signature Verification**: Uses `STRIPE_WEBHOOK_SECRET`
- **Handled Events**:
  - `checkout.session.completed`: Creates customer record
  - `customer.subscription.updated`: Updates tier to paid/free
  - `customer.subscription.deleted`: Downgrade to free tier
  - `invoice.payment_succeeded`: Logs successful payment
  - `invoice.payment_failed`: Logs failed payment

### Frontend Components

#### Billing Page (`/billing`)
Full-featured billing management page:
- **Current Plan Display**: Shows active subscription details
- **Manage Subscription Button**: Links to Stripe Customer Portal (for paid users)
- **Upgrade Options**: Two pricing tiers displayed
  - Pro Monthly: $7/month
  - Pro Yearly: $60/year (29% savings)
- **Feature Lists**: Displays features for each plan
- **Responsive Design**: Works on mobile and desktop
- **Dark Theme**: Consistent with app styling

### Database Integration

User model includes:
- `stripeCustomerId?: string` - Stripe customer ID (created on checkout)
- `subscriptionTier: 'free' | 'paid'` - Updated via webhooks and API

## Pricing Plans

```typescript
Free Tier ($0)
- Unlimited profile links
- Basic customization
- Link analytics (basic)

Pro Monthly ($7/month)
- Everything in Free +
- Advanced customization
- Detailed analytics
- Custom domain
- Link groups & collections
- Priority support

Pro Yearly ($60/year)
- Same as Pro Monthly
- 29% savings vs monthly
```

## Required Environment Variables

Add these to `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_PRICE_ID_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_YEARLY=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# NextAuth (existing)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

## Stripe Dashboard Setup

### 1. Create Products and Prices
1. Go to Products in Stripe Dashboard
2. Create "Pro Monthly" product with $7/month price
3. Create "Pro Yearly" product with $60/year price
4. Copy `price_*` IDs to `.env.local`

### 2. Setup Webhook
1. Go to Webhooks in Stripe Dashboard
2. Create endpoint pointing to: `https://your-domain.com/api/billing/webhook`
3. Subscribe to these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`

### 3. Configure Customer Portal
1. Go to Settings → Billing → Customer Portal
2. Enable:
   - Update payment method
   - Cancel subscriptions
   - Download invoices
3. Set billing pages link to your app

## Usage Flow

### User Purchases Subscription
1. User clicks "Upgrade Now" on billing page
2. Frontend calls `POST /api/billing/checkout`
3. Backend creates Stripe checkout session
4. User redirected to Stripe payment page
5. After payment, Stripe sends `checkout.session.completed` webhook
6. Webhook creates Stripe customer and updates database
7. User subscription tier updated to 'paid'

### User Manages Subscription
1. User clicks "Manage Subscription" on billing page
2. Frontend calls `POST /api/billing/customer-portal`
3. Backend creates Stripe portal session
4. User redirected to Stripe Portal
5. User can upgrade, downgrade, or cancel
6. Stripe sends appropriate webhooks
7. Database automatically synced

### Check User Subscription
1. Call `GET /api/billing/subscription`
2. Returns current tier and plan info
3. Automatically syncs if out of date

## Testing

### Test Mode
Use Stripe test keys:
- **Test Card**: 4242 4242 4242 4242 (any future date, any CVC)
- **Decline Card**: 4000 0000 0000 0002

### Test Webhook Events
1. Use Stripe CLI to forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/billing/webhook
   ```
2. Trigger test events in Stripe Dashboard

### Test Flow
1. Go to `/billing` in dev environment
2. Click "Upgrade Now"
3. Enter test card 4242 4242 4242 4242
4. Complete payment
5. Check database - user should have `stripeCustomerId` and `subscriptionTier: 'paid'`
6. Billing page should show "Pro Monthly" as current plan

## Important Notes

- **Webhook Signature Verification**: Always verify webhook signatures to prevent spoofing
- **Idempotency**: Webhooks may be retried; ensure operations are idempotent
- **Session Handling**: User session needs to be refreshed after subscription changes to reflect new tier
- **Error Handling**: All endpoints include error handling and logging
- **TypeScript Safety**: Full type safety with proper async handling

## Troubleshooting

### Checkout Not Working
1. Verify `STRIPE_PRICE_ID_*` env variables are set
2. Check price IDs match Stripe dashboard
3. Ensure user email is set in session

### Webhooks Not Syncing
1. Verify webhook secret in `.env.local`
2. Check webhook endpoint receives POST requests
3. Look at Stripe Dashboard → Webhooks → Recent Deliveries

### Session Not Updating
1. Session is read on login/page refresh
2. May need to refresh page after subscription change
3. Check NextAuth session configuration

## Files Created/Modified

### New Files
- `/api/billing/checkout/route.ts` - Checkout endpoint
- `/api/billing/customer-portal/route.ts` - Portal endpoint
- `/api/billing/subscription/route.ts` - Status endpoint
- `/api/billing/webhook/route.ts` - Webhook handler
- `/(dashboard)/billing/page.tsx` - Billing page UI

### Modified Files
- `/lib/stripe.ts` - Enhanced with pricing and helpers
- `/types/index.ts` - User type (no changes needed, already has fields)

## Next Steps

1. **Get Stripe API Keys**
   - Sign up at stripe.com
   - Copy secret key and webhook secret

2. **Create Products in Stripe**
   - Create prices and copy IDs

3. **Set Environment Variables**
   - Add all required env vars to `.env.local`

4. **Test Locally**
   - Use Stripe CLI for webhook testing
   - Test full purchase flow

5. **Deploy**
   - Add env vars to Vercel/hosting
   - Update webhook URL to production domain
   - Monitor webhook events in Stripe Dashboard

6. **Monitor**
   - Check Webhook logs in Stripe Dashboard
   - Monitor database for sync issues
   - Set up alerts for failed payments
