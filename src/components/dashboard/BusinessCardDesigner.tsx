'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Save, Layout, Type, Palette, Image as ImageIcon, Check } from 'lucide-react';
import Image from 'next/image';

interface BusinessCardConfig {
  layout: 'classic' | 'modern' | 'minimal';
  showQr: boolean;
  showAvatar: boolean;
  showSubtitle: boolean;
  theme: 'default' | 'custom';
  customColors: {
    background: string;
    text: string;
    accent: string;
  };
}

interface ProfileData {
  displayName: string;
  subtitle: string;
  profileImage: string;
  username: string;
  theme: {
    backgroundColor: string;
    textColor: string;
    linkColor: string;
  };
}

export default function BusinessCardDesigner() {
  const [config, setConfig] = useState<BusinessCardConfig>({
    layout: 'classic',
    showQr: true,
    showAvatar: true,
    showSubtitle: true,
    theme: 'default',
    customColors: {
      background: '#ffffff',
      text: '#000000',
      accent: '#3b82f6'
    }
  });
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, configRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/business-card')
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        // We need the username for the QR code URL, but api/profile might not return it directly if it's the logged in user's profile endpoint
        // Let's assume the profile endpoint returns enough info or we can get it from session if needed.
        // Actually api/profile returns the profile object. We might need to fetch user to get username if not in profile.
        // Let's check what api/profile returns.
        setProfile(data);
      }

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/business-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (res.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (error) {
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading designer...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center">Please set up your profile first.</div>;
  }

  // Determine colors based on config
  const colors = config.theme === 'default' ? {
    background: profile.theme.backgroundColor,
    text: profile.theme.textColor,
    accent: profile.theme.linkColor
  } : config.customColors;

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/${profile.username || ''}` : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
          
          {/* Layout */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Layout className="w-4 h-4" /> Layout
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {['classic', 'modern', 'minimal'].map((layout) => (
                <button
                  key={layout}
                  onClick={() => setConfig({ ...config, layout: layout as any })}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    config.layout === layout
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  {layout.charAt(0).toUpperCase() + layout.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Elements
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showAvatar}
                  onChange={(e) => setConfig({ ...config, showAvatar: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Show Profile Image
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showSubtitle}
                  onChange={(e) => setConfig({ ...config, showSubtitle: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Show Subtitle
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showQr}
                  onChange={(e) => setConfig({ ...config, showQr: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Show QR Code
              </label>
            </div>
          </div>

          {/* Theme */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Colors
            </h3>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setConfig({ ...config, theme: 'default' })}
                className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                  config.theme === 'default'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                Match Profile
              </button>
              <button
                onClick={() => setConfig({ ...config, theme: 'custom' })}
                className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                  config.theme === 'custom'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                Custom
              </button>
            </div>

            {config.theme === 'custom' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Background</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.customColors.background}
                      onChange={(e) => setConfig({
                        ...config,
                        customColors: { ...config.customColors, background: e.target.value }
                      })}
                      className="h-8 w-8 rounded cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      value={config.customColors.background}
                      onChange={(e) => setConfig({
                        ...config,
                        customColors: { ...config.customColors, background: e.target.value }
                      })}
                      className="flex-1 text-sm border border-gray-200 rounded px-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Text</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.customColors.text}
                      onChange={(e) => setConfig({
                        ...config,
                        customColors: { ...config.customColors, text: e.target.value }
                      })}
                      className="h-8 w-8 rounded cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      value={config.customColors.text}
                      onChange={(e) => setConfig({
                        ...config,
                        customColors: { ...config.customColors, text: e.target.value }
                      })}
                      className="flex-1 text-sm border border-gray-200 rounded px-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
          {message && (
            <p className={`text-sm text-center ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="lg:col-span-2">
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-8 flex items-center justify-center min-h-[400px] border border-gray-200 dark:border-gray-800">
          <div 
            className="w-full max-w-md aspect-[1.586/1] rounded-xl shadow-2xl overflow-hidden relative flex flex-col transition-all duration-300"
            style={{
              background: config.layout === 'modern' 
                ? `linear-gradient(135deg, ${colors.background}, ${colors.background === '#ffffff' ? '#f3f4f6' : '#000000'})`
                : colors.background,
              color: colors.text
            }}
          >
            {/* Decorative Elements based on layout */}
            {config.layout === 'modern' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-bl-full"></div>
            )}
            {config.layout === 'classic' && (
              <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: colors.accent }}></div>
            )}

            <div className={`flex-1 p-6 flex ${config.layout === 'minimal' ? 'flex-col items-center text-center justify-center' : 'items-center'} gap-6 relative z-10`}>
              
              {/* Profile Image */}
              {config.showAvatar && (
                <div className="shrink-0">
                  {profile.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={profile.profileImage} 
                      alt="Profile" 
                      className={`w-24 h-24 object-cover shadow-md ${config.layout === 'minimal' ? 'rounded-full' : 'rounded-full border-4 border-white/20'}`}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                      {profile.displayName.charAt(0)}
                    </div>
                  )}
                </div>
              )}

              {/* Info */}
              <div className={`flex-1 min-w-0 ${config.layout === 'minimal' ? 'w-full' : ''}`}>
                <h3 className="text-xl font-bold truncate leading-tight mb-1">
                  {profile.displayName}
                </h3>
                {config.showSubtitle && (
                  <p className="text-sm opacity-80 truncate mb-3">
                    {profile.subtitle}
                  </p>
                )}
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 text-xs font-medium ${config.layout === 'minimal' ? 'mx-auto' : ''}`}>
                  <span className="truncate">pholio.links/{profile.username || 'username'}</span>
                </div>
              </div>

              {/* QR Code */}
              {config.showQr && config.layout !== 'minimal' && (
                <div className="shrink-0 bg-white p-2 rounded-lg shadow-sm">
                  <QRCodeCanvas
                    value={profileUrl || 'https://pholio.links'}
                    size={64}
                    level={"M"}
                  />
                </div>
              )}
            </div>

            {/* Footer Branding */}
            <div className="px-6 py-2 bg-black/5 dark:bg-white/5 flex items-center justify-between text-[10px] font-medium opacity-60">
              <span>Pholio.Links</span>
              <span>Scan to connect</span>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          This is a preview of how your business card will look when shared.
        </p>
      </div>
    </div>
  );
}
