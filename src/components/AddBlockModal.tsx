'use client';

import { X, Plus } from 'lucide-react';

type BlockType = 'profile_image' | 'title' | 'subtitle' | 'bio' | 'social_icons' | 'links' | 'gallery' | 'divider' | 'contact' | 'form';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (type: BlockType) => void;
  availableBlocks: BlockType[];
  isProMember?: boolean;
}

interface BlockOption {
  type: BlockType;
  title: string;
  description: string;
  icon: string;
  isPro?: boolean;
}

const blockOptions: BlockOption[] = [
  {
    type: 'profile_image',
    title: 'Profile Image',
    description: 'Display your profile picture',
    icon: '📷',
  },
  {
    type: 'title',
    title: 'Name/Title', 
    description: 'Your name or main title',
    icon: '👤',
  },
  {
    type: 'subtitle',
    title: 'Subtitle',
    description: 'Add a job title or tagline below your name',
    icon: '💼',
  },
  {
    type: 'bio',
    title: 'Bio',
    description: 'Share a longer description about yourself',
    icon: '📝',
  },
  {
    type: 'social_icons',
    title: 'Social Icons',
    description: 'Display your social media profiles',
    icon: '🔗',
  },
  {
    type: 'links',
    title: 'Custom Links',
    description: 'Add buttons linking to your content',
    icon: '🎯',
  },
  {
    type: 'gallery',
    title: 'Gallery',
    description: 'Showcase your work with images',
    icon: '🖼️',
    isPro: true,
  },
  {
    type: 'divider',
    title: 'Divider',
    description: 'Add a visual separator line',
    icon: '➖',
  },
  {
    type: 'contact',
    title: 'Contact Form',
    description: 'Add a simple contact form',
    icon: '📧',
  },
  {
    type: 'form',
    title: 'Custom Form',
    description: 'Link to one of your custom forms',
    icon: '📋',
    isPro: true,
  },
];

export default function AddBlockModal({ isOpen, onClose, onAddBlock, availableBlocks, isProMember = false }: AddBlockModalProps) {
  if (!isOpen) return null;

  const filteredOptions = blockOptions.filter(option => availableBlocks.includes(option.type));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto transform transition-all">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Add Content Block
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            {filteredOptions.length > 0 ? (
              <div className="space-y-3">
                {filteredOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => {
                      if (option.isPro && !isProMember) {
                        // Show pro upgrade prompt instead of adding block
                        alert('Upgrade to Pro to unlock Gallery blocks and more premium features!');
                        return;
                      }
                      onAddBlock(option.type);
                      onClose();
                    }}
                    className={`w-full p-4 text-left border rounded-lg transition-all group ${
                      option.isPro && !isProMember
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-75'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                    disabled={option.isPro && !isProMember}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{option.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${
                            option.isPro && !isProMember 
                              ? 'text-gray-500 dark:text-gray-500' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {option.title}
                          </h4>
                          {option.isPro && (
                            <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                              PRO
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {option.description}
                          {option.isPro && !isProMember && (
                            <span className="block text-xs text-purple-600 dark:text-purple-400 mt-1">
                              Upgrade to Pro to unlock this feature
                            </span>
                          )}
                        </p>
                      </div>
                      {option.isPro && !isProMember ? (
                        <div className="w-5 h-5 text-gray-400 flex items-center justify-center">
                          🔒
                        </div>
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✨</div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  All blocks added!
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  You&apos;ve added all available content blocks to your profile.
                </p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}