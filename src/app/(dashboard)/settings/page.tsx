'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { 
  HiUser, 
  HiCreditCard, 
  HiGlobe, 
  HiShieldCheck,
  HiCog,
  HiTrash
} from 'react-icons/hi';
import { FaStripe } from 'react-icons/fa';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('account');
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState<string>('');
  const [customDomainLoading, setCustomDomainLoading] = useState(false);
  const [customDomainError, setCustomDomainError] = useState<string>('');
  const [customDomainSuccess, setCustomDomainSuccess] = useState<string>('');
  const [showDnsInstructions, setShowDnsInstructions] = useState(false);
  const [dnsVerifying, setDnsVerifying] = useState(false);
  const [dnsVerified, setDnsVerified] = useState(false);

  const tabs = [
    { id: 'account', name: 'Account', icon: HiUser },
    { id: 'billing', name: 'Billing', icon: HiCreditCard },
    { id: 'integrations', name: 'Integrations', icon: HiGlobe },
    { id: 'security', name: 'Security', icon: HiShieldCheck },
  ];

  // Fetch subscription on component mount
  useEffect(() => {
    if (activeTab === 'billing') {
      fetchSubscription();
    } else if (activeTab === 'integrations') {
      fetchCustomDomain();
    }
  }, [activeTab]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/billing/subscription');
      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setSubscriptionLoading(false);
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

      const data = await res.json();
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

  const fetchCustomDomain = async () => {
    try {
      const res = await fetch('/api/custom-domain');
      const data = await res.json();
      if (data.customDomain) {
        setCustomDomain(data.customDomain);
      }
    } catch (error) {
      console.error('Failed to fetch custom domain:', error);
    }
  };

  const verifyDnsRecord = async () => {
    if (!customDomain) {
      setCustomDomainError('Please enter a domain first');
      return;
    }

    setDnsVerifying(true);
    setCustomDomainError('');
    setDnsVerified(false);

    try {
      // Call our API to verify DNS
      const res = await fetch('/api/custom-domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCustomDomainError(
          data.error || 'DNS record not found. Make sure you\'ve added the A record to 23.94.251.158'
        );
        setDnsVerified(false);
      } else {
        setDnsVerified(true);
        setCustomDomainSuccess('✓ DNS record verified! Click "Activate Domain" to complete setup.');
      }
    } catch (error) {
      console.error('DNS verification error:', error);
      setCustomDomainError('Failed to verify DNS record');
      setDnsVerified(false);
    } finally {
      setDnsVerifying(false);
    }
  };

  const handleCustomDomainActivate = async () => {
    if (!dnsVerified) {
      setCustomDomainError('Please verify your DNS record first');
      return;
    }

    setCustomDomainLoading(true);
    setCustomDomainError('');
    setCustomDomainSuccess('');

    try {
      // Step 1: Save domain to database (marks as pending)
      const saveRes = await fetch('/api/custom-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain }),
      });

      if (!saveRes.ok) {
        const data = await saveRes.json();
        setCustomDomainError(data.error || 'Failed to save domain');
        setCustomDomainLoading(false);
        return;
      }

      // Step 2: Trigger domain setup on server (nginx + certbot)
      const setupRes = await fetch('/api/custom-domain/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain }),
      });

      const setupData = await setupRes.json();

      if (!setupRes.ok) {
        setCustomDomainError(
          setupData.error || 'Failed to activate domain. Please try again.'
        );
      } else {
        setCustomDomainSuccess(
          'Domain activation started! Your SSL certificate is being generated. This usually takes 1-2 minutes.'
        );
        setDnsVerified(false);
      }
    } catch (error) {
      console.error('Domain activation error:', error);
      setCustomDomainError('Failed to activate domain');
    } finally {
      setCustomDomainLoading(false);
    }
  };

  const handleCustomDomainRemove = async () => {
    if (!confirm('Are you sure you want to remove your custom domain?')) {
      return;
    }

    setCustomDomainError('');
    setCustomDomainSuccess('');
    setCustomDomainLoading(true);

    try {
      const res = await fetch('/api/custom-domain', {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setCustomDomainError(data.error || 'Failed to remove custom domain');
      } else {
        setCustomDomain('');
        setCustomDomainSuccess('Custom domain removed');
        setTimeout(() => setCustomDomainSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Custom domain remove error:', error);
      setCustomDomainError('Failed to remove custom domain');
    } finally {
      setCustomDomainLoading(false);
    }
  };

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-gray-400"
              />
              <p className="text-sm text-gray-400 mt-1">Contact support to change your email</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="your-username"
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-sm text-gray-400 mt-1">This will be your public profile URL</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Preferences</h3>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Email Notifications</h4>
              <p className="text-sm text-gray-400">Receive updates about your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Analytics Tracking</h4>
              <p className="text-sm text-gray-400">Track clicks and views on your profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-red-500 mb-4">Danger Zone</h3>
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-red-400">Delete Account</h4>
              <p className="text-sm text-red-300">Permanently delete your account and all data</p>
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-red-700 shadow-sm text-sm leading-4 font-medium rounded-md text-red-400 bg-red-900/20 hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <HiTrash className="h-4 w-4 mr-1" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingSettings = () => {
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

    if (subscriptionLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading subscription details...</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Current Plan */}
        {subscription && (
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Current Plan</h3>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
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
          </div>
        )}

        {/* Upgrade Plans - Only show for free tier */}
        {subscription?.tier === 'free' && (
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Upgrade to Pro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Plan */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition">
                <h4 className="text-xl font-bold text-white mb-2">Pro Monthly</h4>
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
                <ul className="mt-6 space-y-2">
                  {FEATURES.pro.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-slate-300">
                      <span className="w-4 h-4 mr-2 text-purple-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Yearly Plan */}
              <div className="bg-slate-800 border-2 border-purple-500 rounded-lg p-6 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Save 29%
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Pro Yearly</h4>
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
                <ul className="mt-6 space-y-2">
                  {FEATURES.pro.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-slate-300">
                      <span className="w-4 h-4 mr-2 text-purple-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Connected Apps</h3>
        <div className="bg-slate-800 rounded-lg border border-slate-700 divide-y divide-slate-700">
          {/* Google Analytics */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-900/30 rounded-full flex items-center justify-center">
                  <HiCog className="h-5 w-5 text-orange-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-white">Google Analytics</h4>
                  <p className="text-sm text-slate-400">Track detailed visitor analytics</p>
                </div>
              </div>
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                Connect
              </button>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center">
                  <HiGlobe className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-white">Custom Domain</h4>
                  <p className="text-sm text-slate-400">Use your own domain name</p>
                </div>
              </div>
            </div>
            
            {(session?.user as any)?.subscriptionTier === 'paid' ? (
              <div>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Domain
                    </label>
                    <input
                      type="text"
                      placeholder="example.com"
                      value={customDomain}
                      onChange={(e) => {
                        setCustomDomain(e.target.value.toLowerCase());
                        setDnsVerified(false); // Reset verification when input changes
                      }}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Enter your custom domain (e.g., example.com or links.example.com)
                    </p>
                  </div>

                  {/* DNS Instructions Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowDnsInstructions(!showDnsInstructions)}
                    className="text-sm text-purple-400 hover:text-purple-300 underline"
                  >
                    {showDnsInstructions ? '▼ Hide' : '▶ Show'} DNS Setup Instructions
                  </button>

                  {/* DNS Instructions */}
                  {showDnsInstructions && (
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-4">
                      <h4 className="text-sm font-semibold text-white mb-3">How to Point Your Domain</h4>
                      
                      <div className="space-y-2">
                        <p className="text-xs text-slate-300">
                          <strong>Step 1:</strong> Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
                        </p>
                        <p className="text-xs text-slate-300">
                          <strong>Step 2:</strong> Find the DNS or Domain Settings section
                        </p>
                        <p className="text-xs text-slate-300">
                          <strong>Step 3:</strong> Add <span className="bg-slate-800 px-1 py-0.5 rounded text-green-300 font-mono text-xs">A records</span> for your domain and subdomains
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* Root domain */}
                        <div>
                          <p className="text-xs text-slate-400 mb-2"><strong>For root domain (crittercodes.dev):</strong></p>
                          <div className="bg-slate-800 rounded p-3 space-y-2 text-xs font-mono ml-2">
                            <div>
                              <span className="text-slate-400">Type:</span>
                              <span className="text-green-300 ml-2 font-semibold">A Record</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Name/Host:</span>
                              <span className="text-white ml-2">@</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Value/Points to:</span>
                              <span className="text-yellow-300 ml-2 font-semibold">23.94.251.158</span>
                            </div>
                            <div>
                              <span className="text-slate-400">TTL:</span>
                              <span className="text-white ml-2">3600</span>
                              <span className="text-slate-500 ml-2">(or auto)</span>
                            </div>
                          </div>
                        </div>

                        {/* Wildcard for all subdomains */}
                        <div>
                          <p className="text-xs text-slate-400 mb-2"><strong>For all subdomains (*.crittercodes.dev):</strong></p>
                          <div className="bg-slate-800 rounded p-3 space-y-2 text-xs font-mono ml-2">
                            <div>
                              <span className="text-slate-400">Type:</span>
                              <span className="text-green-300 ml-2 font-semibold">A Record</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Name/Host:</span>
                              <span className="text-white ml-2">*</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Value/Points to:</span>
                              <span className="text-yellow-300 ml-2 font-semibold">23.94.251.158</span>
                            </div>
                            <div>
                              <span className="text-slate-400">TTL:</span>
                              <span className="text-white ml-2">3600</span>
                              <span className="text-slate-500 ml-2">(or auto)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-900/30 border border-blue-700/50 rounded p-3">
                        <p className="text-xs text-blue-300 mb-2">
                          <strong>📋 Simple Setup:</strong> Point any domain you own to your Pholio profile!
                        </p>
                        <p className="text-xs text-blue-300 mb-2">
                          Just add an <strong>A record</strong> in your domain registrar:
                        </p>
                        <ul className="text-xs text-blue-300 space-y-1 ml-4">
                          <li>• <strong>Name:</strong> <code className="bg-slate-800 px-1.5 py-0.5 rounded">@</code> (for root domain)</li>
                          <li>• <strong>Type:</strong> <code className="bg-slate-800 px-1.5 py-0.5 rounded">A</code></li>
                          <li>• <strong>Value:</strong> <code className="bg-slate-800 px-1.5 py-0.5 rounded">23.94.251.158</code></li>
                        </ul>
                        <p className="text-xs text-blue-300 mt-2">
                          Then click "Activate Domain" below and we'll automatically set up SSL and everything else!
                        </p>
                      </div>

                      <div className="bg-amber-900/30 border border-amber-700/50 rounded p-3">
                        <p className="text-xs text-amber-300">
                          <strong>⏱️ DNS Propagation:</strong> DNS changes can take a few minutes to a few hours. After updating your DNS records, click "Verify DNS" to check if they've propagated.
                        </p>
                      </div>

                      <div className="bg-green-900/30 border border-green-700/50 rounded p-3">
                        <p className="text-xs text-green-300">
                          <strong>✅ Then what?</strong> Once DNS is verified and you click "Activate Domain", we automatically set up SSL certificates and everything else. Your domain will work immediately!
                        </p>
                      </div>
                    </div>
                  )}

                  {customDomainError && (
                    <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded">
                      {customDomainError}
                    </div>
                  )}

                  {customDomainSuccess && (
                    <div className="text-sm text-green-400 bg-green-900/20 p-3 rounded">
                      {customDomainSuccess}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={verifyDnsRecord}
                      disabled={dnsVerifying || !customDomain}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      {dnsVerifying ? 'Verifying DNS...' : dnsVerified ? '✓ DNS Verified' : 'Verify DNS'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCustomDomainActivate}
                      disabled={customDomainLoading || !dnsVerified}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      {customDomainLoading ? 'Activating...' : 'Activate Domain'}
                    </button>
                    {customDomain && (
                      <button
                        type="button"
                        onClick={handleCustomDomainRemove}
                        disabled={customDomainLoading}
                        className="px-4 py-2 border border-red-600/50 hover:bg-red-900/20 text-red-400 rounded-lg font-medium text-sm transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300">
                  PRO
                </span>
                <span className="text-slate-500 text-sm font-medium">
                  Upgrade to Pro to use a custom domain
                </span>
              </div>
            )}
          </div>

          {/* Email Capture */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-900/30 rounded-full flex items-center justify-center">
                  <HiUser className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-white">Email Capture</h4>
                  <p className="text-sm text-slate-400">Collect visitor email addresses</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">API Access</h3>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-white">API Key</h4>
              <p className="text-sm text-slate-400">Use our API to manage your profile programmatically</p>
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-slate-600 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              Generate Key
            </button>
          </div>
          <div className="text-center py-4">
            <HiCog className="mx-auto h-8 w-8 text-slate-500 mb-2" />
            <p className="text-sm text-slate-400">No API key generated yet</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Password</h3>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Two-Factor Authentication</h3>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Authenticator App</h4>
              <p className="text-sm text-slate-400">Secure your account with 2FA</p>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300 mr-3">
                Disabled
              </span>
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Login Activity</h3>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div>
                <div className="text-sm font-medium text-white">Chrome on Windows</div>
                <div className="text-sm text-slate-400">Current session • IP: 192.168.1.1</div>
              </div>
              <div className="text-sm text-slate-400">Now</div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div>
                <div className="text-sm font-medium text-white">Safari on iPhone</div>
                <div className="text-sm text-slate-400">IP: 192.168.1.5</div>
              </div>
              <div className="text-sm text-slate-400">2 hours ago</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <button className="text-red-400 hover:text-red-300 text-sm font-medium">
              Sign out all other sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <HiCog className="h-8 w-8 mr-3 text-purple-400" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your account settings, billing, and integrations
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        {/* Sidebar */}
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  activeTab === tab.id
                    ? 'bg-purple-900/40 border-purple-500 text-purple-300'
                    : 'border-transparent text-gray-300 hover:bg-slate-800',
                  'w-full group border-l-4 px-3 py-2 flex items-center text-sm font-medium text-left'
                )}
              >
                <tab.icon
                  className={cn(
                    activeTab === tab.id ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400',
                    'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                  )}
                />
                <span className="truncate">{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-9">
          {activeTab === 'account' && renderAccountSettings()}
          {activeTab === 'billing' && renderBillingSettings()}
          {activeTab === 'integrations' && renderIntegrationsSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
        </div>
      </div>
    </div>
  );
}