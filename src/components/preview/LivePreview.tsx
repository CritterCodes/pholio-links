'use client';

import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { PreviewBlock } from './PreviewBlock';

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
  blocks: Block[];
  status?: {
    message: string;
    emoji?: string;
  };
}

interface ThemeData {
  backgroundColor: string;
  textColor: string;
  linkStyle: 'rounded' | 'square' | 'pill';
  linkColor: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  gradientFrom: string;
  gradientTo: string;
  font: string;
}

interface LivePreviewProps {
  formData: FormData;
  previewMode: 'desktop' | 'mobile';
  theme?: ThemeData;
}

export function LivePreview({ formData, previewMode, theme }: LivePreviewProps) {
  // Debug status
  if (formData.status) {
    console.log('[LivePreview] Status present:', formData.status);
  } else {
    console.log('[LivePreview] No status in formData');
  }

  const getBackgroundStyle = () => {
    if (!theme) return { backgroundColor: '#ffffff' };
    
    if (theme.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
      };
    } else {
      return {
        backgroundColor: theme.backgroundColor,
      };
    }
  };

  const getThemeStyles = () => {
    if (!theme) return { color: '#000000', fontFamily: 'Inter, sans-serif' };
    return {
      color: theme.textColor,
      fontFamily: theme.font,
    };
  };

  // Determine if theme is dark for contrast
  const isDark = theme?.backgroundColor === '#000000' || theme?.textColor === '#ffffff';

  if (previewMode === 'mobile') {
    return (
      // Mobile phone container
      <div className="relative mx-auto" style={{ width: '320px', height: '640px' }}>
        {/* Phone frame */}
        <div className="absolute inset-0 bg-gray-900 dark:bg-gray-100 rounded-[2.5rem] p-2">
          {/* Screen */}
          <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-inner">
            {/* Status bar */}
            <div className="h-6 bg-black flex items-center justify-between px-4 text-white text-xs">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-white rounded-sm">
                  <div className="w-3 h-1 bg-white rounded-sm"></div>
                </div>
              </div>
            </div>
            
            {/* Content area with scroll */}
            <div 
              className="h-full overflow-y-auto pb-6"
              style={{
                ...getBackgroundStyle(),
                ...getThemeStyles(),
              }}
            >
              {/* Banner Section */}
              <div className="relative -mb-10">
                {/* Banner Image */}
                {formData.heroImage ? (
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <Image
                      src={formData.heroImage}
                      alt="Banner"
                      width={320}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-b from-blue-400 to-blue-300 dark:from-blue-700 dark:to-blue-600"></div>
                )}
                
                {/* Profile Image (centered, peaking halfway into banner) */}
                <div className="flex justify-center -translate-y-1/2 relative">
                  <div className="relative">
                    {formData.profileImage ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-900">
                        <Image
                          src={formData.profileImage}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-900">
                        <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}

                    {/* Status Thought Bubble */}
                    {formData.status && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 w-max max-w-[150px]">
                        <div className="relative bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium leading-snug">
                            <span className="mr-1">{formData.status.emoji}</span>
                            {formData.status.message}
                          </p>
                          {/* Thought bubble circles */}
                          <div className="absolute -bottom-1 left-3 w-2 h-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"></div>
                          <div className="absolute -bottom-2.5 left-1.5 w-1 h-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-2">
                {/* Display Name and Subtitle */}
                <div className="text-center mb-6">
                  {formData.displayName ? (
                    <h3 className="text-lg font-bold mb-1">
                      {formData.displayName}
                    </h3>
                  ) : (
                    <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500 mb-1">
                      Your Name
                    </h3>
                  )}
                  
                  {formData.subtitle && (
                    <p className="text-sm opacity-80 font-medium">
                      {formData.subtitle}
                    </p>
                  )}
                </div>
                
                {/* Blocks */}
                <div className="space-y-4">
                  {formData.blocks.length === 0 ? (
                    <div className="text-center text-gray-400 dark:text-gray-500 py-6">
                      <p className="text-sm">Add blocks to see preview</p>
                    </div>
                  ) : (
                    formData.blocks
                      .filter(block => block.enabled)
                      .map(block => (
                        <PreviewBlock key={block._id} block={block} theme={theme} />
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Desktop preview
  return (
    <div className="h-full flex flex-col">
      <div 
        className="flex-1 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
        style={{
          ...getBackgroundStyle(),
          ...getThemeStyles(),
        }}
      >
        {/* Banner Section */}
        <div className="relative -mb-14">
          {/* Banner Image */}
          {formData.heroImage ? (
            <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <Image
                src={formData.heroImage}
                alt="Banner"
                width={600}
                height={224}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-56 bg-gradient-to-b from-blue-400 to-blue-300 dark:from-blue-700 dark:to-blue-600"></div>
          )}
          
          {/* Profile Image (centered, peaking halfway into banner) */}
          <div className="flex justify-center -translate-y-1/2 relative">
            <div className="relative">
              {formData.profileImage ? (
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-900">
                  <Image
                    src={formData.profileImage}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-900">
                  <ImageIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
              )}

              {/* Status Thought Bubble */}
              {formData.status && (
                <div className="absolute -top-12 left-24 z-20 w-max max-w-[200px]">
                  <div className="relative bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium leading-snug">
                      <span className="mr-1">{formData.status.emoji}</span>
                      {formData.status.message}
                    </p>
                    {/* Thought bubble circles */}
                    <div className="absolute -bottom-1 left-4 w-3 h-3 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"></div>
                    <div className="absolute -bottom-3 left-2 w-1.5 h-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-2">
          {/* Display Name and Subtitle */}
          <div className="text-center mb-6">
            {formData.displayName ? (
              <h3 className="text-xl font-bold mb-1">
                {formData.displayName}
            </h3>
          ) : (
            <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-1">
              Your Name
            </h3>
          )}
          
          {formData.subtitle && (
            <p className="text-base opacity-80 font-medium">
              {formData.subtitle}
            </p>
          )}
        </div>
        
        {/* Blocks */}
        <div className="space-y-4">
          {formData.blocks.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">
              <p className="text-sm">Add blocks to see preview</p>
            </div>
          ) : (
            formData.blocks
              .filter(block => block.enabled)
              .map(block => (
                <PreviewBlock key={block._id} block={block} theme={theme} />
              ))
          )}
        </div>
      </div>
    </div>
    </div>
  );
}