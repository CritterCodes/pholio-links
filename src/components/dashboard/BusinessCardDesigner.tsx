'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Save, Layout, Type, Palette, Image as ImageIcon, Check, Phone, Mail, Globe, Trash2, Download } from 'lucide-react';
import Image from 'next/image';
import FileUpload from '@/components/FileUpload';
import html2canvas from 'html2canvas';

interface BusinessCardConfig {
  layout: 'classic' | 'modern' | 'minimal';
  showQr: boolean;
  showAvatar: boolean;
  showSubtitle: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  phoneNumber: string;
  email: string;
  website: string;
  backgroundImage?: string;
  minimalLayoutSwap?: boolean;
  theme: 'default' | 'custom';
  customColors: {
    background: string;
    text: string;
    accent: string;
    backgroundType: 'solid' | 'gradient';
    gradientFrom: string;
    gradientTo: string;
    gradientDirection: 'to right' | 'to bottom' | 'to bottom right' | 'to top right';
  };
}

interface ProfileData {
  displayName: string;
  subtitle: string;
  profileImage: string;
  username: string;
  customDomain?: string;
  blocks?: Array<{
    type: string;
    content: any;
  }>;
  theme: {
    backgroundColor: string;
    textColor: string;
    linkColor: string;
    backgroundType?: 'solid' | 'gradient' | 'image';
    gradientFrom?: string;
    gradientTo?: string;
    font?: string;
  };
}

export default function BusinessCardDesigner() {
  const [config, setConfig] = useState<BusinessCardConfig>({
    layout: 'classic',
    showQr: true,
    showAvatar: true,
    showSubtitle: true,
    showPhone: false,
    showEmail: false,
    showWebsite: false,
    phoneNumber: '',
    email: '',
    website: '',
    backgroundImage: '',
    minimalLayoutSwap: false,
    theme: 'default',
    customColors: {
      background: '#ffffff',
      text: '#000000',
      accent: '#3b82f6',
      backgroundType: 'solid',
      gradientFrom: '#ffffff',
      gradientTo: '#f3f4f6',
      gradientDirection: 'to bottom right'
    }
  });
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, configRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/business-card')
      ]);

      let profileData: ProfileData | null = null;
      let configData: Partial<BusinessCardConfig> | null = null;

      if (profileRes.ok) {
        profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (configRes.ok) {
        configData = await configRes.json();
      }

      // Merge logic:
      // If config exists, use it.
      // If config is missing contact info, try to pull from profile blocks.
      
      const newConfig = { ...config, ...configData };

      if (profileData?.blocks) {
        const contactBlock = profileData.blocks.find((b: any) => b.type === 'contact');
        if (contactBlock && contactBlock.content && contactBlock.content.contacts) {
          const contacts = contactBlock.content.contacts;
          
          // Only auto-fill if the config doesn't have values yet (or if it's a fresh load and we want to be smart)
          // But we should respect if user cleared them. 
          // Let's only fill if the config was empty/default for these fields.
          // Actually, if we just loaded configData, we should check if IT has values.
          
          const phoneContact = contacts.find((c: any) => c.type === 'phone' && c.enabled);
          const emailContact = contacts.find((c: any) => c.type === 'email' && c.enabled);
          
          if (phoneContact && !newConfig.phoneNumber) {
            newConfig.phoneNumber = phoneContact.value;
            newConfig.showPhone = true;
          }
          
          if (emailContact && !newConfig.email) {
            newConfig.email = emailContact.value;
            newConfig.showEmail = true;
          }
        }
      }

      setConfig(newConfig);

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

  const downloadCard = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: null,
          useCORS: true
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${profile?.username || 'card'}-business-card.png`;
        link.click();
      } catch (err) {
        console.error('Failed to download card:', err);
      }
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

  const getBackgroundStyle = () => {
    if (config.backgroundImage) {
      return `url(${config.backgroundImage}) center/cover no-repeat`;
    }

    if (config.theme === 'default') {
       if (profile.theme.backgroundType === 'gradient') {
         return `linear-gradient(135deg, ${profile.theme.gradientFrom}, ${profile.theme.gradientTo})`;
       }
       return profile.theme.backgroundColor;
    }

    if (config.customColors.backgroundType === 'gradient') {
       return `linear-gradient(${config.customColors.gradientDirection}, ${config.customColors.gradientFrom}, ${config.customColors.gradientTo})`;
    }
    
    return config.customColors.background;
  };

  const profileUrl = profile.customDomain 
    ? `https://${profile.customDomain}`
    : (typeof window !== 'undefined' ? `${window.location.origin}/${profile.username || ''}` : '');

  const displayUrl = profile.customDomain || `pholio.links/${profile.username || 'username'}`;

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
            
            {/* Minimal Layout Options */}
            {config.layout === 'minimal' && (
              <div className="mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.minimalLayoutSwap}
                    onChange={(e) => setConfig({ ...config, minimalLayoutSwap: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Swap Columns
                </label>
              </div>
            )}
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

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact Details
            </h3>
            <div className="space-y-3">
              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showPhone}
                    onChange={(e) => setConfig({ ...config, showPhone: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Phone Number
                </label>
                {config.showPhone && (
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={config.phoneNumber}
                    onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600"
                  />
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showEmail}
                    onChange={(e) => setConfig({ ...config, showEmail: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Email Address
                </label>
                {config.showEmail && (
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600"
                  />
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showWebsite}
                    onChange={(e) => setConfig({ ...config, showWebsite: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Website
                </label>
                {config.showWebsite && (
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={config.website}
                    onChange={(e) => setConfig({ ...config, website: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Theme */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Colors & Background
            </h3>
            
            {/* Background Image Upload */}
            <div className="mb-6">
              <label className="text-xs text-gray-500 block mb-2">Card Background Image</label>
              <div className="space-y-2">
                <FileUpload
                  folder="business-cards"
                  onUpload={(url) => setConfig({ ...config, backgroundImage: url })}
                  currentImage={config.backgroundImage}
                  className="w-full"
                />
                {config.backgroundImage && (
                  <button
                    onClick={() => setConfig({ ...config, backgroundImage: '' })}
                    className="text-xs text-red-500 flex items-center gap-1 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Background Image
                  </button>
                )}
              </div>
            </div>

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
              <div className="space-y-4">
                {/* Background Type Selection */}
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Background Style</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfig({
                        ...config,
                        customColors: { ...config.customColors, backgroundType: 'solid' }
                      })}
                      className={`flex-1 py-1.5 text-xs rounded border transition-all ${
                        config.customColors.backgroundType === 'solid'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => setConfig({
                        ...config,
                        customColors: { ...config.customColors, backgroundType: 'gradient' }
                      })}
                      className={`flex-1 py-1.5 text-xs rounded border transition-all ${
                        config.customColors.backgroundType === 'gradient'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {config.customColors.backgroundType === 'solid' ? (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Background Color</label>
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
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Direction</label>
                      <select
                        value={config.customColors.gradientDirection}
                        onChange={(e) => setConfig({
                          ...config,
                          customColors: { ...config.customColors, gradientDirection: e.target.value as any }
                        })}
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="to right">Left to Right</option>
                        <option value="to bottom">Top to Bottom</option>
                        <option value="to bottom right">Diagonal (Top-Left to Bottom-Right)</option>
                        <option value="to top right">Diagonal (Bottom-Left to Top-Right)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Start Color</label>
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={config.customColors.gradientFrom}
                            onChange={(e) => setConfig({
                              ...config,
                              customColors: { ...config.customColors, gradientFrom: e.target.value }
                            })}
                            className="h-8 w-8 rounded cursor-pointer border border-gray-200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">End Color</label>
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={config.customColors.gradientTo}
                            onChange={(e) => setConfig({
                              ...config,
                              customColors: { ...config.customColors, gradientTo: e.target.value }
                            })}
                            className="h-8 w-8 rounded cursor-pointer border border-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-gray-500 block mb-1">Text Color</label>
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
          
          <button
            onClick={downloadCard}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Download Card
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
            ref={cardRef}
            className="w-full max-w-md aspect-[1.75/1] rounded-xl shadow-2xl overflow-hidden relative flex flex-col transition-all duration-300"
            style={{
              background: getBackgroundStyle(),
              color: colors.text,
              fontFamily: config.theme === 'default' ? profile.theme.font : 'inherit'
            }}
          >
            {/* Overlay for readability if background image is present */}
            {config.backgroundImage && (
              <div className="absolute inset-0 bg-black/30 z-0"></div>
            )}

            {/* Decorative Elements based on layout */}
            {config.layout === 'modern' && !config.backgroundImage && config.customColors.backgroundType !== 'gradient' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-bl-full"></div>
            )}
            {config.layout === 'classic' && (
              <div className="absolute inset-3 border-2 border-current opacity-30 z-0 pointer-events-none rounded-lg"></div>
            )}

            <div className={`flex-1 p-6 flex ${
              config.layout === 'minimal' 
                ? `items-center gap-6 ${config.minimalLayoutSwap ? 'flex-row-reverse text-right' : 'flex-row text-left'}`
                : config.layout === 'classic'
                  ? 'flex-col items-center justify-center text-center gap-1'
                  : 'items-center gap-6'
            } relative z-10`}>
              
              {/* Profile Image */}
              {config.showAvatar && (
                <div className="shrink-0">
                  {profile.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={profile.profileImage} 
                      alt="Profile" 
                      className={`object-cover shadow-md ${
                        config.layout === 'minimal' 
                          ? 'w-24 h-24 rounded-full' 
                          : config.layout === 'classic'
                            ? 'w-20 h-20 rounded-full border-2 border-current'
                            : 'w-24 h-24 rounded-full border-4 border-white/20'
                      }`}
                    />
                  ) : (
                    <div className={`bg-gray-200 flex items-center justify-center text-2xl ${
                      config.layout === 'classic' ? 'w-20 h-20 rounded-full' : 'w-24 h-24 rounded-full'
                    }`}>
                      {profile.displayName.charAt(0)}
                    </div>
                  )}
                </div>
              )}

              {/* Divider for Minimal Layout */}
              {config.layout === 'minimal' && config.showAvatar && (
                <div className="w-px h-24 bg-current opacity-20 shrink-0"></div>
              )}

              {/* Info */}
              <div className={`min-w-0 ${config.layout === 'classic' ? 'w-full' : 'flex-1 w-full'}`}>
                <h3 className={`font-bold truncate leading-tight mb-1 ${
                  config.layout === 'classic' ? 'text-2xl tracking-wide font-serif' : 'text-xl'
                }`}>
                  {profile.displayName}
                </h3>
                {config.showSubtitle && (
                  <p className={`text-sm opacity-80 truncate ${config.layout === 'classic' ? 'mb-2 uppercase tracking-widest text-xs font-medium' : 'mb-3'}`}>
                    {profile.subtitle}
                  </p>
                )}

                {/* Classic Divider */}
                {config.layout === 'classic' && (
                  <div className="w-12 h-px bg-current opacity-30 mx-auto mb-2"></div>
                )}
                
                {/* URL Display - Only show here if QR is hidden */}
                {!config.showQr && (
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 text-xs font-medium ${config.layout === 'minimal' ? '' : ''}`}>
                    <span className="truncate">{displayUrl}</span>
                  </div>
                )}

                {/* Contact Details */}
                {(config.showPhone || config.showEmail || config.showWebsite) && (
                  <div className={`mt-2 space-y-1.5 ${
                    config.layout === 'minimal' 
                      ? (config.minimalLayoutSwap ? 'flex flex-col items-end' : 'flex flex-col items-start') 
                      : config.layout === 'classic'
                        ? 'flex flex-row flex-wrap justify-center gap-x-6 gap-y-2'
                        : ''
                  }`}>
                    {config.showPhone && config.phoneNumber && (
                      <div className="flex items-center gap-2 text-xs opacity-90">
                        <Phone className="w-3 h-3" />
                        <span>{config.phoneNumber}</span>
                      </div>
                    )}
                    {config.showEmail && config.email && (
                      <div className="flex items-center gap-2 text-xs opacity-90">
                        <Mail className="w-3 h-3" />
                        <span>{config.email}</span>
                      </div>
                    )}
                    {config.showWebsite && config.website && (
                      <div className="flex items-center gap-2 text-xs opacity-90">
                        <Globe className="w-3 h-3" />
                        <span>{config.website}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* QR Code */}
              {config.showQr && (
                <div className={`flex flex-col items-center gap-2 shrink-0 ${config.layout === 'classic' ? 'mt-1' : ''}`}>
                  <div className="bg-white p-1.5 rounded-lg shadow-sm">
                    <QRCodeCanvas
                      value={profileUrl || 'https://pholio.links'}
                      size={config.layout === 'classic' ? 48 : 64}
                      level={"M"}
                    />
                  </div>
                  <div className="inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-medium w-full">
                    <span className="break-all text-center leading-tight">{displayUrl}</span>
                  </div>
                </div>
              )}
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
