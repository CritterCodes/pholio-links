'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SubscriptionData {
  tier: 'free' | 'paid';
  plan: 'pro_monthly' | 'pro_yearly' | null;
  active: boolean;
  currentPeriodEnd: string | null;
  price: number;
  status?: string;
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

const FEATURES = {
  free: [
    'Unlimited profile links',
    'Basic customization',
    'Link analytics (basic)',
  ],
  pro: [
    'Everything in Free',
    'Advanced customization',
    'Detailed analytics',
    'Custom domain',
    'Link groups & collections',
    'Priority support',
  ],
};

export default function BillingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchSubscription();
  }, [status, router]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/billing/subscription');
      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (plan: 'pro_monthly' | 'pro_yearly') => {
    setCheckoutLoading(plan);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data: CheckoutResponse = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    try {
      const res = await fetch('/api/billing/customer-portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Billing & Plans</h1>
          <p className="text-slate-400">Manage your subscription and upgrade your account</p>
        </div>

        {/* Current Plan */}
        {subscription && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {subscription.tier === 'paid' ? 'Pro Plan' : 'Free Plan'}
                </h2>
                <p className="text-slate-400">
                  {subscription.tier === 'paid' && subscription.currentPeriodEnd
                    ? `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : 'Upgrade to unlock premium features'}
                </p>
              </div>
              {subscription.tier === 'paid' && (
                <button
                  onClick={handlePortal}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Manage Subscription
                </button>
              )}
            </div>

            {/* Features */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase mb-4">Included features:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(subscription.tier === 'paid' ? FEATURES.pro : FEATURES.free).map((feature) => (
                  <li key={feature} className="flex items-center text-slate-300">
                    <span className="w-5 h-5 mr-3 text-purple-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Plans */}
        {subscription?.tier === 'free' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-8">Upgrade to Pro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Monthly Plan */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 hover:border-purple-500 transition">
                <h3 className="text-xl font-bold text-white mb-2">Pro Monthly</h3>
                <p className="text-slate-400 mb-6">Perfect for getting started</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$7</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <button
                  onClick={() => handleCheckout('pro_monthly')}
                  disabled={checkoutLoading === 'pro_monthly'}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-semibold transition"
                >
                  {checkoutLoading === 'pro_monthly' ? 'Processing...' : 'Upgrade Now'}
                </button>
                <ul className="mt-8 space-y-3">
                  {FEATURES.pro.map((feature) => (
                    <li key={feature} className="flex items-center text-slate-300">
                      <span className="w-5 h-5 mr-3 text-purple-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Yearly Plan */}
              <div className="bg-slate-800 border-2 border-purple-500 rounded-lg p-8 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Save 29%
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pro Yearly</h3>
                <p className="text-slate-400 mb-6">Best value for annual commitment</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$60</span>
                  <span className="text-slate-400">/year</span>
                </div>
                <button
                  onClick={() => handleCheckout('pro_yearly')}
                  disabled={checkoutLoading === 'pro_yearly'}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-semibold transition"
                >
                  {checkoutLoading === 'pro_yearly' ? 'Processing...' : 'Upgrade Now'}
                </button>
                <ul className="mt-8 space-y-3">
                  {FEATURES.pro.map((feature) => (
                    <li key={feature} className="flex items-center text-slate-300">
                      <span className="w-5 h-5 mr-3 text-purple-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12">
          <Link
            href="/dashboard"
            className="text-purple-400 hover:text-purple-300 transition flex items-center"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
