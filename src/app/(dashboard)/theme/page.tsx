'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { LivePreview } from '@/components/preview/LivePreview';
import { Monitor, Smartphone } from 'lucide-react';

interface ThemeData {
  backgroundColor: string;
  textColor: string;
  linkStyle: 'rounded' | 'square' | 'pill';
  linkColor: string;
  backgroundImage?: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  gradientFrom: string;
  gradientTo: string;
  font: string;
  statusButtonStyle?: 'thought' | 'speech' | 'pill';
  statusBackgroundColor?: string;
  statusTextColor?: string;
}

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface FormData {
  displayName: string;
  profileImage: string;
  heroImage: string;
  subtitle: string;
  bio: string;
  links: {
    id: string;
    title: string;
    url: string;
    description?: string;
    color?: string;
  }[];
  socialLinks: {
    id: string;
    platform: string;
    url: string;
    enabled: boolean;
  }[];
  blocks: Block[];
  status?: {
    message: string;
    emoji?: string;
  };
}

const defaultFormData: FormData = {
  displayName: '',
  profileImage: '',
  heroImage: '',
  subtitle: '',
  bio: '',
  links: [],
  socialLinks: [],
  blocks: [],
};

const presetThemes = [
  {
    name: 'Default',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    linkColor: '#3b82f6',
    backgroundType: 'solid',
    gradientFrom: '#ffffff',
    gradientTo: '#f3f4f6',
  },
  {
    name: 'Dark Mode',
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    linkColor: '#60a5fa',
    backgroundType: 'solid',
    gradientFrom: '#1f2937',
    gradientTo: '#111827',
  },
  {
    name: 'Sunset',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    linkColor: '#f59e0b',
    backgroundType: 'gradient',
    gradientFrom: '#fbbf24',
    gradientTo: '#f97316',
  },
  {
    name: 'Ocean',
    backgroundColor: '#ffffff',
    textColor: '#ffffff',
    linkColor: '#3b82f6',
    backgroundType: 'gradient',
    gradientFrom: '#3b82f6',
    gradientTo: '#1e40af',
  },
];

const fontOptions = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
];

export default function ThemePage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [theme, setTheme] = useState<ThemeData>({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    linkStyle: 'rounded',
    linkColor: '#3b82f6',
    backgroundType: 'solid',
    gradientFrom: '#ffffff',
    gradientTo: '#f3f4f6',
    font: 'Inter, sans-serif',
    statusButtonStyle: 'thought',
  });
  
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalTheme, setOriginalTheme] = useState<ThemeData>(theme);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  // Track theme changes
  useEffect(() => {
    const hasChanges = JSON.stringify(theme) !== JSON.stringify(originalTheme);
    setHasUnsavedChanges(hasChanges);
  }, [theme, originalTheme]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();

        // Filter out disabled social links with empty URLs on load
        const activeSocialLinks = (userData.socialLinks || []).filter(
          (link: FormData['socialLinks'][0]) => link.enabled && link.url && link.url.trim() !== ''
        );

        const loadedData = {
          displayName: userData.displayName || '',
          profileImage: userData.profileImage || '',
          heroImage: userData.heroImage || '',
          subtitle: userData.subtitle || '',
          bio: userData.bio || '',
          links: userData.links || [],
          socialLinks: activeSocialLinks,
          blocks: userData.blocks || [],
          status: userData.status,
        };
        setFormData(loadedData);
        
        // Load theme data from the userData
        if (userData.theme) {
          setTheme(userData.theme);
          setOriginalTheme(userData.theme);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (field: keyof ThemeData, value: string) => {
    setTheme(prev => ({ ...prev, [field]: value }));
  };

  const applyPresetTheme = (preset: typeof presetThemes[0]) => {
    setTheme(prev => ({
      ...prev,
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
      linkColor: preset.linkColor,
      backgroundType: preset.backgroundType as 'solid' | 'gradient' | 'image',
      gradientFrom: preset.gradientFrom,
      gradientTo: preset.gradientTo,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(theme),
      });

      if (!response.ok) {
        throw new Error('Failed to save theme');
      }
      
      setOriginalTheme({ ...theme });
      
      showToast({
        type: 'success',
        title: 'Theme saved!',
        message: 'Your theme preferences have been saved successfully.'
      });
    } catch (error) {
      console.error('Failed to save theme:', error);
      showToast({
        type: 'error',
        title: 'Save failed',
        message: 'There was an error saving your theme. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Persistent Save Toast */}
      {hasUnsavedChanges && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <div className="flex-1">
            <p className="font-medium">You have unsaved theme changes</p>
            <p className="text-xs text-blue-100">Click save to apply your new theme</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Controls Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Theme Customization</h2>
              <p className="text-gray-600 dark:text-gray-400">Customize the appearance of your profile</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Preset Themes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Preset Themes
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {presetThemes.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPresetTheme(preset)}
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                          style={{ 
                            background: preset.backgroundType === 'gradient' 
                              ? `linear-gradient(135deg, ${preset.gradientFrom}, ${preset.gradientTo})`
                              : preset.backgroundColor 
                          }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Background Type
                </label>
                <div className="flex gap-2">
                  {(['solid', 'gradient'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleThemeChange('backgroundType', type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        theme.backgroundType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              {theme.backgroundType === 'solid' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                    className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Gradient Start
                    </label>
                    <input
                      type="color"
                      value={theme.gradientFrom}
                      onChange={(e) => handleThemeChange('gradientFrom', e.target.value)}
                      className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Gradient End
                    </label>
                    <input
                      type="color"
                      value={theme.gradientTo}
                      onChange={(e) => handleThemeChange('gradientTo', e.target.value)}
                      className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Text Color
                </label>
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) => handleThemeChange('textColor', e.target.value)}
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Link Color
                </label>
                <input
                  type="color"
                  value={theme.linkColor}
                  onChange={(e) => handleThemeChange('linkColor', e.target.value)}
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              {/* Font */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Font Family
                </label>
                <select
                  value={theme.font}
                  onChange={(e) => handleThemeChange('font', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Link Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Link Style
                </label>
                <div className="flex gap-2">
                  {(['rounded', 'square', 'pill'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => handleThemeChange('linkStyle', style)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        style === 'rounded' ? 'rounded-lg' :
                        style === 'square' ? 'rounded-none' : 'rounded-full'
                      } ${
                        theme.linkStyle === style
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Bubble Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Status Bubble Style
                </label>
                <div className="flex gap-2 mb-4">
                  {(['thought', 'speech', 'pill'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => handleThemeChange('statusButtonStyle', style)}
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                        (theme.statusButtonStyle || 'thought') === style
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Bubble Background
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={theme.statusBackgroundColor || '#ffffff'}
                        onChange={(e) => handleThemeChange('statusBackgroundColor', e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer border border-gray-200"
                      />
                      <input
                        type="text"
                        value={theme.statusBackgroundColor || '#ffffff'}
                        onChange={(e) => handleThemeChange('statusBackgroundColor', e.target.value)}
                        className="flex-1 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Bubble Text
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={theme.statusTextColor || '#000000'}
                        onChange={(e) => handleThemeChange('statusTextColor', e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer border border-gray-200"
                      />
                      <input
                        type="text"
                        value={theme.statusTextColor || '#000000'}
                        onChange={(e) => handleThemeChange('statusTextColor', e.target.value)}
                        className="flex-1 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Theme Preview</h2>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  previewMode === 'desktop'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className={previewMode === 'mobile' ? "flex justify-center" : "w-full"}>
              <LivePreview formData={formData} previewMode={previewMode} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}