'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  HiPlus, 
  HiEye, 
  HiEyeOff, 
  HiTrash, 
  HiPencil,
  HiExternalLink,
  HiChevronUp,
  HiChevronDown,
  HiSave
} from 'react-icons/hi';
import { ContentBlock } from '@/types';
import { getSocialPlatformFromUrl, getSocialIcon, getSocialColor } from '@/lib/socialPlatforms';
import { cn } from '@/lib/utils';
import FileUpload from './FileUpload';

interface Link {
  _id: string;
  title: string;
  url: string;
  linkType: 'social' | 'regular';
  order: number;
  isActive: boolean;
}

interface Profile {
  name: string;
  title: string;
  bio: string;
  profileImage?: string;
}

const defaultBlocks: ContentBlock[] = [
  { id: 'profile-image', type: 'profile-image', order: 0, isVisible: true },
  { id: 'title', type: 'title', order: 1, isVisible: true },
  { id: 'subtitle', type: 'subtitle', order: 2, isVisible: true },
  { id: 'social-icons', type: 'social-icons', order: 3, isVisible: true },
  { id: 'bio', type: 'bio', order: 4, isVisible: true },
  { id: 'links', type: 'links', order: 5, isVisible: true },
];

export default function ModernDesignDashboard() {
  const [blocks, setBlocks] = useState<ContentBlock[]>(defaultBlocks);
  const [profile, setProfile] = useState<Profile>({
    name: 'John Doe',
    title: 'Creator & Developer',
    bio: 'Welcome to my digital space! Here you\'ll find all my important links and latest updates.'
  });
  const [links, setLinks] = useState<Link[]>([]);
  const [socialLinks, setSocialLinks] = useState<Link[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', linkType: 'regular' as 'social' | 'regular' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load profile and links
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        // Load links
        const linksRes = await fetch('/api/links');
        if (linksRes.ok) {
          const linksData = await linksRes.json();
          const allLinks = linksData.links || [];
          setSocialLinks(allLinks.filter((link: Link) => link.linkType === 'social'));
          setLinks(allLinks.filter((link: Link) => link.linkType === 'regular'));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const moveBlockUp = (blockId: string) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    if (blockIndex > 0) {
      const newBlocks = [...blocks];
      [newBlocks[blockIndex - 1], newBlocks[blockIndex]] = [newBlocks[blockIndex], newBlocks[blockIndex - 1]];
      const updatedBlocks = newBlocks.map((block, index) => ({ ...block, order: index }));
      setBlocks(updatedBlocks);
      setHasUnsavedChanges(true);
    }
  };

  const moveBlockDown = (blockId: string) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    if (blockIndex < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[blockIndex], newBlocks[blockIndex + 1]] = [newBlocks[blockIndex + 1], newBlocks[blockIndex]];
      const updatedBlocks = newBlocks.map((block, index) => ({ ...block, order: index }));
      setBlocks(updatedBlocks);
      setHasUnsavedChanges(true);
    }
  };

  const toggleBlockVisibility = (blockId: string) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, isVisible: !block.isVisible } : block
    ));
    setHasUnsavedChanges(true);
  };

  const addLink = async () => {
    if (!newLink.title || !newLink.url) return;

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      });

      if (response.ok) {
        const createdLink = await response.json();
        
        if (newLink.linkType === 'social') {
          setSocialLinks([...socialLinks, createdLink]);
        } else {
          setLinks([...links, createdLink]);
        }
        
        setNewLink({ title: '', url: '', linkType: 'regular' });
        setIsAddingLink(false);
      }
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const saveChanges = async () => {
    try {
      // Save profile changes
      const profileResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (profileResponse.ok) {
        setHasUnsavedChanges(false);
        // Show success message
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const renderPreviewBlock = (block: ContentBlock) => {
    if (!block.isVisible) return null;

    switch (block.type) {
      case 'profile-image':
        return (
          <div className="flex justify-center mb-4">
            {profile.profileImage ? (
              <Image
                src={profile.profileImage}
                alt={profile.name}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <HiPencil className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
        );

      case 'title':
        return (
          <div className="text-center mb-2">
            <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
          </div>
        );

      case 'subtitle':
        return (
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600">{profile.title}</p>
          </div>
        );

      case 'social-icons':
        return (
          <div className="flex justify-center gap-3 mb-4">
            {socialLinks.slice(0, 6).map((link) => {
              const platformId = getSocialPlatformFromUrl(link.url);
              const IconComponent = platformId ? getSocialIcon(platformId) : null;
              const color = platformId ? getSocialColor(platformId) : '#6B7280';

              return (
                <div
                  key={link._id}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color + '20' }}
                >
                  {IconComponent ? (
                    <IconComponent className="w-4 h-4" />
                  ) : (
                    <HiExternalLink className="w-4 h-4" />
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'bio':
        return (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-700 leading-relaxed px-2">{profile.bio}</p>
          </div>
        );

      case 'links':
        return (
          <div className="space-y-2 px-4">
            {links.slice(0, 3).map((link) => (
              <div
                key={link._id}
                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-center"
              >
                <span className="text-xs font-medium text-gray-900">{link.title}</span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Design Your Profile</h1>
            <p className="mt-2 text-sm text-gray-600">
              Customize your profile layout and content
            </p>
          </div>
          <button
            onClick={saveChanges}
            disabled={!hasUnsavedChanges}
            className={cn(
              "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm",
              hasUnsavedChanges
                ? "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
            )}
          >
            <HiSave className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Editor - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => {
                        setProfile({ ...profile, name: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={profile.title}
                      onChange={(e) => {
                        setProfile({ ...profile, title: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => {
                      setProfile({ ...profile, bio: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center space-x-4">
                    {profile.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt="Profile"
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-15 h-15 bg-gray-200 rounded-full flex items-center justify-center">
                        <HiPencil className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <FileUpload
                      folder="profiles"
                      onUpload={(url) => {
                        setProfile({ ...profile, profileImage: url });
                        setHasUnsavedChanges(true);
                      }}
                      accept="image/*"
                      maxSize={5}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Layout Blocks</h2>
              
              <div className="space-y-3">
                {blocks.sort((a, b) => a.order - b.order).map((block, index) => (
                  <div
                    key={block.id}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg",
                      block.isVisible ? "border-gray-200 bg-gray-50" : "border-gray-100 bg-gray-25 opacity-60"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveBlockUp(block.id)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <HiChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => moveBlockDown(block.id)}
                          disabled={index === blocks.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <HiChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-medium text-gray-900 capitalize">
                        {block.type.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleBlockVisibility(block.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          block.isVisible
                            ? "text-green-600 bg-green-100 hover:bg-green-200"
                            : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                        )}
                      >
                        {block.isVisible ? (
                          <HiEye className="h-4 w-4" />
                        ) : (
                          <HiEyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Links Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Links</h2>
                <button
                  onClick={() => setIsAddingLink(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <HiPlus className="h-4 w-4 mr-1" />
                  Add Link
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Social Icons</h3>
                  <div className="space-y-2">
                    {socialLinks.length === 0 ? (
                      <p className="text-sm text-gray-500">No social links yet</p>
                    ) : (
                      socialLinks.map((link) => (
                        <div key={link._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">{link.title}</span>
                          <button className="text-red-400 hover:text-red-600">
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Regular Links</h3>
                  <div className="space-y-2">
                    {links.length === 0 ? (
                      <p className="text-sm text-gray-500">No regular links yet</p>
                    ) : (
                      links.map((link) => (
                        <div key={link._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">{link.title}</span>
                          <button className="text-red-400 hover:text-red-600">
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Preview - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Mobile</span>
                </div>
                
                {/* iPhone-style preview */}
                <div className="mx-auto max-w-xs">
                  <div className="relative">
                    {/* Phone Frame */}
                    <div className="bg-black rounded-[2.5rem] p-2">
                      <div className="bg-white rounded-[2rem] overflow-hidden">
                        {/* Status Bar */}
                        <div className="bg-gray-900 h-8 flex items-center justify-center rounded-t-[1.75rem]">
                          <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
                        </div>
                        
                        {/* Screen Content */}
                        <div className="h-96 overflow-y-auto bg-white py-6">
                          {blocks
                            .sort((a, b) => a.order - b.order)
                            .map((block) => (
                              <div key={block.id}>
                                {renderPreviewBlock(block)}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Link Modal */}
      {isAddingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Link</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Type</label>
                <select
                  value={newLink.linkType}
                  onChange={(e) => setNewLink({...newLink, linkType: e.target.value as 'social' | 'regular'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="regular">Regular Link (Full Button)</option>
                  <option value="social">Social Icon (Small Icon)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  placeholder={newLink.linkType === 'social' ? 'Instagram' : 'My Portfolio'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  placeholder="https://"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsAddingLink(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}