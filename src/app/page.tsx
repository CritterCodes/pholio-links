'use client';

import Link from 'next/link';
import { ArrowRight, Check, Sparkles, Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Pholio
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-gray-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <div className="inline-block mb-4 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full">
          <span className="text-sm font-medium text-purple-300">✨ Modern Link in Bio Platform</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Your Digital<span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent"> Presence</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Create a stunning personal brand website with custom themes, analytics, and everything you need to grow your audience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center justify-center gap-2"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="border border-gray-400 px-8 py-4 rounded-lg font-semibold hover:border-white transition">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-8 rounded-xl hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Custom Themes</h3>
              <p className="text-gray-400">
                Choose from beautiful pre-designed themes or create your own with our intuitive theme builder.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-8 rounded-xl hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-gray-400">
                Optimized for speed and performance. Your profile loads instantly, no matter where your audience is.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-8 rounded-xl hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics</h3>
              <p className="text-gray-400">
                Track clicks, views, and engagement. Understand what resonates with your audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Pholio?</h2>
          
          <div className="space-y-4">
            {[
              'Subdomain-based profiles - your unique brand on pholio.link',
              'Fully customizable themes with dark mode support',
              'Add links, galleries, contact forms, and more',
              'Social media integration and analytics',
              'Free tier with optional premium features',
              'SEO optimized for better discoverability',
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-lg text-gray-300">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-400 mb-16">Start free, upgrade anytime</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="border border-gray-700 p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-400 mb-6">Perfect to get started</p>
              <p className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-400">/mo</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Custom profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Basic theme</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>5 links</span>
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <Check className="w-5 h-5" />
                  <span>Analytics</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full border border-gray-700 py-3 rounded-lg font-semibold hover:border-white transition text-center block"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="border border-purple-500 p-8 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-1 rounded-full text-sm font-semibold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">For growing brands</p>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">$7</span>
                  <span className="text-lg text-gray-400">/mo</span>
                </div>
                <p className="text-sm text-gray-400">or $60/year (save 29%)</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Unlimited links</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Advanced themes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Analytics</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition text-center block"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="border border-gray-700 p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-2">Custom</h3>
              <p className="text-gray-400 mb-6">For enterprises</p>
              <p className="text-4xl font-bold mb-6">Custom</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Custom domain</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>API access</span>
                </li>
              </ul>
              <button className="w-full border border-gray-700 py-3 rounded-lg font-semibold hover:border-white transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to build your brand?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of creators already using Pholio</p>
          <Link
            href="/register"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold hover:shadow-lg transition"
          >
            Sign Up Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 Pholio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
