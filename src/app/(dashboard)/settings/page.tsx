'use client';

import { useState } from 'react';
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
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', name: 'Account', icon: HiUser },
    { id: 'billing', name: 'Billing', icon: HiCreditCard },
    { id: 'integrations', name: 'Integrations', icon: HiGlobe },
    { id: 'security', name: 'Security', icon: HiShieldCheck },
  ];

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

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Current Plan</h3>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white">Free Plan</h4>
              <p className="text-sm text-gray-400">Perfect for getting started</p>
              <ul className="mt-3 text-sm text-gray-300 space-y-1">
                <li>• Unlimited links</li>
                <li>• Basic themes</li>
                <li>• Analytics</li>
              </ul>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Pro Features</h3>
        <div className="bg-gradient-to-br from-purple-900/40 to-slate-800 rounded-lg border border-purple-700/50 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              PRO
            </div>
            <span className="ml-3 text-lg font-semibold text-white">$7/month or $60/year</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Advanced themes and customization
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Custom domains
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Photo galleries
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Detailed analytics
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Priority support
            </li>
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Payment Method</h3>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="text-center py-8">
            <HiCreditCard className="mx-auto h-12 w-12 text-gray-500" />
            <h4 className="mt-2 text-sm font-medium text-white">Manage your billing</h4>
            <p className="mt-1 text-sm text-gray-400">View plans, upgrade, and manage your subscription</p>
            <button 
              onClick={() => window.location.href = '/billing'}
              className="mt-4 inline-flex items-center px-4 py-2 border border-slate-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FaStripe className="h-4 w-4 mr-2 text-purple-400" />
              Go to Billing
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Connected Apps</h3>
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {/* Google Analytics */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <HiCog className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Google Analytics</h4>
                  <p className="text-sm text-gray-500">Track detailed visitor analytics</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                Connect
              </button>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <HiGlobe className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Custom Domain</h4>
                  <p className="text-sm text-gray-500">Use your own domain name</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-3">
                  PRO
                </span>
                <button className="text-gray-400 text-sm font-medium cursor-not-allowed">
                  Upgrade Required
                </button>
              </div>
            </div>
          </div>

          {/* Email Capture */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <HiUser className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Email Capture</h4>
                  <p className="text-sm text-gray-500">Collect visitor email addresses</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Access</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">API Key</h4>
              <p className="text-sm text-gray-500">Use our API to manage your profile programmatically</p>
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Generate Key
            </button>
          </div>
          <div className="text-center py-4">
            <HiCog className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No API key generated yet</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Authenticator App</h4>
              <p className="text-sm text-gray-500">Secure your account with 2FA</p>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3">
                Disabled
              </span>
              <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Login Activity</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm font-medium text-gray-900">Chrome on Windows</div>
                <div className="text-sm text-gray-500">Current session • IP: 192.168.1.1</div>
              </div>
              <div className="text-sm text-gray-500">Now</div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm font-medium text-gray-900">Safari on iPhone</div>
                <div className="text-sm text-gray-500">IP: 192.168.1.5</div>
              </div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-red-600 hover:text-red-500 text-sm font-medium">
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