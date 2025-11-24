'use client';

import { GripVertical, X, Eye, EyeOff, Plus, Instagram, Twitter, Facebook, Youtube, Linkedin, Github, Globe } from 'lucide-react';

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface SocialIconsBlockProps {
  block: Block;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onRemove: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  enabled: boolean;
}

const socialPlatforms = [
  { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
  { key: 'twitter', name: 'Twitter', icon: Twitter, color: 'from-blue-400 to-blue-500' },
  { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700' },
  { key: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
  { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-800' },
  { key: 'github', name: 'GitHub', icon: Github, color: 'from-gray-700 to-gray-800' },
  { key: 'website', name: 'Website', icon: Globe, color: 'from-green-500 to-green-600' },
];

export function SocialIconsBlock({ block, onUpdate, onRemove, onToggleVisibility }: SocialIconsBlockProps) {
  const socialLinks = (block.content as { socialLinks?: SocialLink[] })?.socialLinks || [];

  const addSocialLink = (platform: string) => {
    const newLink: SocialLink = {
      id: `social-${platform}-${Math.random().toString(36).substr(2, 9)}`,
      platform,
      url: '',
      enabled: true
    };
    onUpdate(block._id, { socialLinks: [...socialLinks, newLink] });
  };

  const removeSocialLink = (linkId: string) => {
    onUpdate(block._id, { socialLinks: socialLinks.filter(link => link.id !== linkId) });
  };

  const updateSocialLink = (linkId: string, field: keyof SocialLink, value: string | boolean) => {
    const updatedLinks = socialLinks.map(link => 
      link.id === linkId ? { ...link, [field]: value } : link
    );
    onUpdate(block._id, { socialLinks: updatedLinks });
  };

  const getAvailablePlatforms = () => {
    const usedPlatforms = socialLinks.map(link => link.platform);
    return socialPlatforms.filter(platform => !usedPlatforms.includes(platform.key));
  };

  const getPlatformInfo = (platformKey: string) => {
    return socialPlatforms.find(p => p.key === platformKey);
  };

  const handleAddSocial = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlatform = e.target.value;
    if (selectedPlatform) {
      addSocialLink(selectedPlatform);
      e.target.value = ''; // Reset dropdown
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-grab hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
          <span className="font-medium text-gray-900 dark:text-gray-100">Social Icons</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleVisibility(block._id)}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {block.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onRemove(block._id)}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="pl-7">
        <div className="space-y-3">
          {socialLinks.map((link) => {
            const platformInfo = getPlatformInfo(link.platform);
            const PlatformIcon = platformInfo?.icon || Globe;
            
            return (
              <div key={link.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${platformInfo?.color || 'from-gray-500 to-gray-600'} rounded-lg flex items-center justify-center`}>
                    <PlatformIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {platformInfo?.name || 'Unknown Platform'}
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                      placeholder={`Your ${platformInfo?.name || 'social'} URL`}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateSocialLink(link.id, 'enabled', !link.enabled)}
                      className={`px-3 py-1 text-xs rounded ${
                        link.enabled
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {link.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => removeSocialLink(link.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remove social link"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Add new social platform dropdown */}
          {getAvailablePlatforms().length > 0 && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <select 
                    onChange={handleAddSocial}
                    defaultValue=""
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select a social platform to add...</option>
                    {getAvailablePlatforms().map(platform => (
                      <option key={platform.key} value={platform.key}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {socialLinks.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No social platforms added yet</p>
              <p className="text-xs">Use the dropdown above to add your first social link</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}