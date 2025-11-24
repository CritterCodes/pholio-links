'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  HiPlus, 
  HiEye, 
  HiEyeOff, 
  HiMenuAlt4, 
  HiTrash, 
  HiPencil,
  HiExternalLink,
  HiChevronUp,
  HiChevronDown
} from 'react-icons/hi';
import { ContentBlock, BlockType } from '@/types';
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

export default function BlockBasedDesign() {
  const [blocks, setBlocks] = useState<ContentBlock[]>(defaultBlocks);
  const [blockCounter, setBlockCounter] = useState(6); // Start after default blocks
  const [profile, setProfile] = useState<Profile>({
    name: 'John Doe',
    title: 'Creator & Developer',
    bio: 'Welcome to my digital space! Here you\'ll find all my important links and latest updates.'
  });
  const [links, setLinks] = useState<Link[]>([]);
  const [socialLinks, setSocialLinks] = useState<Link[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ title: '', url: '', linkType: 'regular' as 'social' | 'regular' });

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
      // Update order numbers
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        order: index
      }));
      setBlocks(updatedBlocks);
    }
  };

  const moveBlockDown = (blockId: string) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    if (blockIndex < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[blockIndex], newBlocks[blockIndex + 1]] = [newBlocks[blockIndex + 1], newBlocks[blockIndex]];
      // Update order numbers
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        order: index
      }));
      setBlocks(updatedBlocks);
    }
  };

  const toggleBlockVisibility = (blockId: string) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, isVisible: !block.isVisible }
        : block
    ));
  };

  const addNewBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: `${type}-${blockCounter}`,
      type,
      order: blocks.length,
      isVisible: true
    };
    setBlocks([...blocks, newBlock]);
    setBlockCounter(blockCounter + 1);
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
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

  const renderBlock = (block: ContentBlock) => {
    if (!block.isVisible) return null;

    switch (block.type) {
      case 'profile-image':
        return (
          <div className="flex justify-center mb-6">
            <div className="relative">
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={profile.name}
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-30 h-30 bg-gray-300 rounded-full flex items-center justify-center">
                  <HiPencil className="h-8 w-8 text-gray-500" />
                </div>
              )}
              {editingBlock === block.id && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <FileUpload
                    folder="profiles"
                    onUpload={(url) => setProfile({...profile, profileImage: url})}
                    accept="image/*"
                    maxSize={5}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'title':
        return (
          <div className="text-center mb-2">
            {editingBlock === block.id ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="text-2xl font-bold text-center w-full bg-transparent border-b-2 border-blue-500 focus:outline-none"
                onBlur={() => setEditingBlock(null)}
                autoFocus
              />
            ) : (
              <h1 
                className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setEditingBlock(block.id)}
              >
                {profile.name}
              </h1>
            )}
          </div>
        );

      case 'subtitle':
        return (
          <div className="text-center mb-4">
            {editingBlock === block.id ? (
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({...profile, title: e.target.value})}
                className="text-lg text-gray-600 text-center w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                onBlur={() => setEditingBlock(null)}
                autoFocus
              />
            ) : (
              <p 
                className="text-lg text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                onClick={() => setEditingBlock(block.id)}
              >
                {profile.title}
              </p>
            )}
          </div>
        );

      case 'social-icons':
        return (
          <div className="flex justify-center gap-4 mb-6">
            {socialLinks.map((link) => {
              const platformId = getSocialPlatformFromUrl(link.url);
              const IconComponent = platformId ? getSocialIcon(platformId) : null;
              const color = platformId ? getSocialColor(platformId) : '#6B7280';

              return (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: color + '20', color }}
                >
                  {IconComponent ? (
                    <IconComponent className="h-6 w-6" />
                  ) : (
                    <HiExternalLink className="h-6 w-6" />
                  )}
                </a>
              );
            })}
            <button
              onClick={() => {
                setNewLink({ ...newLink, linkType: 'social' });
                setIsAddingLink(true);
              }}
              className="p-3 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <HiPlus className="h-6 w-6 text-gray-400 hover:text-blue-500" />
            </button>
          </div>
        );

      case 'bio':
        return (
          <div className="text-center mb-6">
            {editingBlock === block.id ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full text-gray-700 bg-transparent border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
                onBlur={() => setEditingBlock(null)}
                autoFocus
              />
            ) : (
              <p 
                className="text-gray-700 leading-relaxed cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => setEditingBlock(block.id)}
              >
                {profile.bio}
              </p>
            )}
          </div>
        );

      case 'links':
        return (
          <div className="space-y-3 mb-6">
            {links.map((link) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {link.title}
                    </h3>
                  </div>
                  <HiExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </a>
            ))}
            <button
              onClick={() => {
                setNewLink({ ...newLink, linkType: 'regular' });
                setIsAddingLink(true);
              }}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <HiPlus className="h-6 w-6 text-gray-400 hover:text-blue-500 mr-2" />
              <span className="text-gray-600 hover:text-blue-600">Add Link</span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Design Your Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Drag to reorder blocks, click to edit content, and customize your profile layout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Side */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Content Blocks</h2>
              
              <div className="space-y-2">
                {blocks
                  .sort((a, b) => a.order - b.order)
                  .map((block, index) => (
                  <div
                    key={block.id}
                    className={cn(
                      "flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200",
                      !block.isVisible && "opacity-50"
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
                      <HiMenuAlt4 className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900 capitalize">
                        {block.type.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleBlockVisibility(block.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {block.isVisible ? (
                          <HiEye className="h-4 w-4" />
                        ) : (
                          <HiEyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingBlock(block.id)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <HiPencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Add new block:</p>
                <div className="flex flex-wrap gap-2">
                  {(['profile-image', 'title', 'subtitle', 'bio', 'social-icons', 'links'] as BlockType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => addNewBlock(type)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors capitalize"
                    >
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Side */}
          <div className="sticky top-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Live Preview</h2>
                <div className="text-sm text-gray-500">Mobile View</div>
              </div>
              
              {/* Mobile Preview Frame */}
              <div className="mx-auto max-w-sm">
                <div className="bg-white rounded-3xl border-8 border-gray-800 shadow-xl overflow-hidden">
                  <div className="h-6 bg-gray-800 flex items-center justify-center">
                    <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="p-6 min-h-96 max-h-96 overflow-y-auto">
                    {blocks
                      .sort((a, b) => a.order - b.order)
                      .map((block) => (
                        <div key={block.id}>
                          {renderBlock(block)}
                        </div>
                      ))}
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add {newLink.linkType === 'social' ? 'Social Link' : 'Link'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newLink.linkType === 'social' ? 'Platform' : 'Title'}
                </label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  placeholder={newLink.linkType === 'social' ? 'Instagram, Twitter, etc.' : 'My Website'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
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
                  Add {newLink.linkType === 'social' ? 'Social' : 'Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}