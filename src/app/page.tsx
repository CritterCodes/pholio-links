'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import CampaignBanner from '@/components/CampaignBanner';
import { Hero } from '@/components/landing/Hero';
import { FeatureBento } from '@/components/landing/FeatureBento';

function extractSubdomainFromHost(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // localhost or IP
  if (parts.length === 1 || hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return null;
  }
  
  // Check if it's a subdomain of pholio.link
  if (hostname.endsWith('pholio.link') && hostname !== 'pholio.link' && hostname !== 'www.pholio.link') {
    return parts[0];
  }
  
  return null;
}

export default function Home() {
  const router = useRouter();
  const subdomain = extractSubdomainFromHost();

  useEffect(() => {
    if (subdomain) {
      console.log('[HOME] Detected subdomain:', subdomain, '- redirecting to /profile');
      router.push('/profile');
    }
  }, [subdomain, router]);

  // Show loading state while redirecting
  if (subdomain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-pink-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white overflow-x-hidden">
      <CampaignBanner />
      
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Pholio
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-lg hover:scale-105 transition font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <Hero />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Powerful features to help you grow your audience and business.
            </p>
          </div>
          <FeatureBento />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-16">Start free, upgrade anytime</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="border border-gray-200 dark:border-gray-700 p-8 rounded-3xl bg-white dark:bg-slate-800/50">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Perfect to get started</p>
              <p className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-500 dark:text-gray-400">/mo</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Custom profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Basic theme</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Unlimited links</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Check className="w-5 h-5" />
                  <span>Basic Analytics</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center block"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="border border-purple-500 p-8 rounded-3xl bg-white dark:bg-slate-800 relative shadow-xl shadow-purple-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-semibold text-white">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">For growing brands</p>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">$7</span>
                  <span className="text-lg text-gray-500 dark:text-gray-400">/mo</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">or $60/year (save 29%)</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Advanced themes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Deep Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Campaign Manager</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition text-center block"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="border border-gray-200 dark:border-gray-700 p-8 rounded-3xl bg-white dark:bg-slate-800/50">
              <h3 className="text-2xl font-bold mb-2">Custom</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">For enterprises</p>
              <p className="text-4xl font-bold mb-6">Custom</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Custom domain</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>API access</span>
                </li>
              </ul>
              <button className="w-full border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to build your brand?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of creators already using Pholio</p>
          <Link
            href="/register"
            className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:scale-105 transition"
          >
            Sign Up Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Pholio
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            &copy; 2024 Pholio. All rights reserved.
          </div>
          <div className="flex gap-6 text-gray-500 dark:text-gray-400">
            <Link href="#" className="hover:text-purple-600 transition">Terms</Link>
            <Link href="#" className="hover:text-purple-600 transition">Privacy</Link>
            <Link href="#" className="hover:text-purple-600 transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
