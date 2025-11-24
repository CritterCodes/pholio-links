'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import FileUpload from '@/components/FileUpload';
import Image from 'next/image';
import { useToast } from '@/contexts/ToastContext';
import AddBlockModal from '@/components/AddBlockModal';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { LivePreview } from '@/components/preview/LivePreview';
import { 
  Plus, 
  Image as ImageIcon,
  Type
} from 'lucide-react';

type BlockType = 'profile_image' | 'title' | 'subtitle' | 'bio' | 'social_icons' | 'links' | 'gallery' | 'divider' | 'contact';

interface Link {
  _id: string;
  title: string;
  url: string;
  enabled: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

interface Block {
  _id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
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
  backgroundImage?: string;
}

interface FormData {
  displayName: string;
  profileImage: string;
  heroImage: string;
  subtitle: string;
  bio: string;
  links: Link[];
  socialLinks: SocialLink[];
  blocks: Block[];
}

const defaultFormData: FormData = {
  displayName: '',
  profileImage: '',
  heroImage: '',
  subtitle: '',
  bio: '',
  links: [],
  socialLinks: [], // Start with empty array, only add platforms when user explicitly adds them
  blocks: []
};

export default function FlexibleDesignDashboard() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [theme, setTheme] = useState<ThemeData>({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    linkStyle: 'rounded',
    linkColor: '#3b82f6',
    backgroundType: 'solid',
    gradientFrom: '#ffffff',
    gradientTo: '#f3f4f6',
    font: 'Inter, sans-serif',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<FormData>(defaultFormData);

  const availableBlocks: BlockType[] = ['bio', 'social_icons', 'links', 'gallery', 'divider', 'contact'];

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Track changes to form data
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalFormData]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();
        
        // Filter out disabled social links with empty URLs on load
        const activeSocialLinks = (userData.socialLinks || []).filter(
          (link: SocialLink) => link.enabled && link.url && link.url.trim() !== ''
        );
        
        const loadedData = {
          displayName: userData.displayName || '',
          profileImage: userData.profileImage || '',
          heroImage: userData.heroImage || '',
          subtitle: userData.subtitle || '',
          bio: userData.bio || '',
          links: userData.links || [],
          socialLinks: activeSocialLinks, // Only load active social links
          blocks: userData.blocks || []
        };
        setFormData(loadedData);
        setOriginalFormData(loadedData); // Set original data for comparison
        
        // Load theme data
        if (userData.theme) {
          setTheme(userData.theme);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Filter out social links that are disabled or have empty URLs
      const activeSocialLinks = formData.socialLinks.filter(
        link => link.enabled && link.url && link.url.trim() !== ''
      );

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileImage: formData.profileImage,
          heroImage: formData.heroImage,
          displayName: formData.displayName,
          subtitle: formData.subtitle,
          bio: formData.bio,
          links: formData.links,
          socialLinks: activeSocialLinks, // Only save active social links
          blocks: formData.blocks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      // Update original data to match current data after successful save
      setOriginalFormData({ ...formData });
      
      showToast({
        type: 'success',
        title: 'Profile saved!',
        message: 'Your profile changes have been saved successfully.'
      });
    } catch (error) {
      console.error('Failed to save:', error);
      showToast({
        type: 'error',
        title: 'Save failed',
        message: 'There was an error saving your profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      _id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      order: formData.blocks.length,
      enabled: true
    };
    
    let updatedBlocks;
    
    if (insertIndex !== null && insertIndex >= 0 && insertIndex <= formData.blocks.length) {
      // Insert at specific position
      updatedBlocks = [...formData.blocks];
      updatedBlocks.splice(insertIndex, 0, newBlock);
      
      // Update order property for all blocks
      updatedBlocks = updatedBlocks.map((block, index) => ({
        ...block,
        order: index
      }));
    } else {
      // Add to the end (default behavior)
      updatedBlocks = [...formData.blocks, newBlock];
    }
    
    setFormData({
      ...formData,
      blocks: updatedBlocks
    });
    
    setShowAddModal(false);
    setInsertIndex(null); // Reset insert index
  };

  const removeBlock = (blockId: string) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.filter(block => block._id !== blockId)
    });
  };

  const toggleBlockVisibility = (blockId: string) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.map(block =>
        block._id === blockId ? { ...block, enabled: !block.enabled } : block
      )
    });
  };

  const updateBlockContent = (blockId: string, content: Record<string, unknown>) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.map(block =>
        block._id === blockId ? { ...block, content: { ...block.content, ...content } } : block
      )
    });
  };

  const getDefaultContent = (type: BlockType) => {
    switch (type) {
      case 'subtitle':
        return { subtitle: '' };
      case 'links':
        return { title: 'My Links', links: [] };
      case 'social_icons':
        return { socialLinks: [] };
      case 'gallery':
        return { title: 'Gallery', selectedImageIds: [], maxImages: 6, columns: 2 };
      case 'bio':
        return { text: '' };
      case 'divider':
        return { style: 'solid', color: '#e5e7eb', thickness: 2, width: 'medium' };
      case 'contact':
        return { title: 'Contact Me', contacts: [] };
      default:
        return {};
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', blockId);
    
    // Add visual feedback to the drag image
    const dragElement = e.currentTarget as HTMLElement;
    dragElement.style.cursor = 'grabbing';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropZoneDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDropZoneDrop = (e: React.DragEvent, insertIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedBlockId) {
      setDragOverIndex(null);
      return;
    }

    const blocks = [...formData.blocks];
    const draggedIndex = blocks.findIndex(block => block._id === draggedBlockId);

    if (draggedIndex === -1) {
      setDraggedBlockId(null);
      setDragOverIndex(null);
      return;
    }

    // Remove the dragged block
    const [draggedBlock] = blocks.splice(draggedIndex, 1);
    
    // Adjust insert index if dragging down
    const adjustedInsertIndex = draggedIndex < insertIndex ? insertIndex - 1 : insertIndex;
    
    // Insert at the new position
    blocks.splice(adjustedInsertIndex, 0, draggedBlock);

    // Update order property
    const reorderedBlocks = blocks.map((block, index) => ({
      ...block,
      order: index
    }));

    setFormData({
      ...formData,
      blocks: reorderedBlocks
    });

    setDraggedBlockId(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    
    if (!draggedBlockId || draggedBlockId === targetBlockId) {
      setDraggedBlockId(null);
      setDragOverIndex(null);
      return;
    }

    const blocks = [...formData.blocks];
    const draggedIndex = blocks.findIndex(block => block._id === draggedBlockId);
    const targetIndex = blocks.findIndex(block => block._id === targetBlockId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedBlockId(null);
      setDragOverIndex(null);
      return;
    }

    // Remove the dragged block and insert it at the target position
    const [draggedBlock] = blocks.splice(draggedIndex, 1);
    blocks.splice(targetIndex, 0, draggedBlock);

    // Update order property
    const reorderedBlocks = blocks.map((block, index) => ({
      ...block,
      order: index
    }));

    setFormData({
      ...formData,
      blocks: reorderedBlocks
    });

    setDraggedBlockId(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedBlockId(null);
    setDragOverIndex(null);
    
    // Reset cursor
    document.body.style.cursor = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Drop Zone Component
  const DropZone = ({ index, isActive }: { index: number; isActive: boolean }) => (
    <div
      onDragOver={(e) => handleDropZoneDragOver(e, index)}
      onDragLeave={handleDropZoneDragLeave}
      onDrop={(e) => handleDropZoneDrop(e, index)}
      className={`transition-all duration-200 flex items-center justify-center ${
        isActive
          ? 'h-8 bg-blue-100 dark:bg-blue-900 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg'
          : draggedBlockId
            ? 'h-2 hover:h-6 hover:bg-gray-100 dark:hover:bg-gray-800 border border-dashed border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded'
            : 'h-0'
      }`}
    >
      {isActive && (
        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          Drop here
        </div>
      )}
    </div>
  );

  // Add Block Between Component
  const AddBlockBetween = ({ index }: { index: number }) => {
    if (draggedBlockId) return null; // Hide during drag operations
    
    return (
      <div className="group flex items-center justify-center py-1 opacity-0 hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => {
            setInsertIndex(index);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add block
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Persistent Save Toast */}
      {hasUnsavedChanges && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <div className="flex-1">
            <p className="font-medium">You have unsaved changes</p>
            <p className="text-xs text-blue-100">Click save to keep your changes</p>
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

      {/* Header with View Profile Button */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Design Dashboard</h1>
        {session?.user && (session.user as any).username && (
          <a
            href={`https://${(session.user as any).username}.pholio.link`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
          >
            View Profile →
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="space-y-6 lg:pr-4">
          {/* Basic Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Details</h2>
              <p className="text-gray-600 dark:text-gray-400">Essential profile information (required)</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Image Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Profile Image</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upload your profile picture</p>
                  </div>
                </div>

                <div className="pl-11">
                  <FileUpload
                    onUpload={(url: string) => setFormData({ ...formData, profileImage: url })}
                    folder="profiles"
                    accept="image/*"
                    maxSize={5}
                    className="w-full"
                  />
                  {formData.profileImage && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <Image
                          src={formData.profileImage}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">Profile image uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hero Image Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Hero Image</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Banner image displayed at the top of your profile</p>
                  </div>
                </div>

                <div className="pl-11">
                  <FileUpload
                    onUpload={(url: string) => setFormData({ ...formData, heroImage: url })}
                    folder="heroes"
                    accept="image/*"
                    maxSize={5}
                    className="w-full"
                  />
                  {formData.heroImage && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <Image
                          src={formData.heroImage}
                          alt="Hero"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">Hero image uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Display Name Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Type className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Display Name</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your name or brand</p>
                  </div>
                </div>

                <div className="pl-11">
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Enter your display name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Subtitle Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Type className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Subtitle</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Optional tagline or role (e.g. &quot;Web Developer&quot;)</p>
                  </div>
                </div>

                <div className="pl-11">
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Your role, tagline, or subtitle"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Blocks Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Blocks</h2>
                  <p className="text-gray-600 dark:text-gray-400">Optional sections for your profile</p>
                </div>
                <button
                  onClick={() => {
                    setInsertIndex(null); // Ensure we add to the end
                    setShowAddModal(true);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Block
                </button>
              </div>
            </div>

            <div className="p-6">
              {formData.blocks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <Plus className="w-12 h-12 mx-auto mb-4" />
                    <p>No content blocks yet</p>
                    <p className="text-sm">Add blocks to customize your profile</p>
                  </div>
                  <button
                    onClick={() => {
                      setInsertIndex(null); // Ensure we add to the end
                      setShowAddModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Block
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Add block button and drop zone at the top */}
                  <AddBlockBetween index={0} />
                  <DropZone index={0} isActive={dragOverIndex === 0} />
                  
                  {formData.blocks.map((block, index) => (
                    <div key={block._id}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, block._id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, block._id)}
                        onDragEnd={handleDragEnd}
                        className={`transition-all duration-200 ${
                          draggedBlockId === block._id 
                            ? 'opacity-50 scale-95 rotate-1 shadow-lg' 
                            : draggedBlockId 
                              ? 'hover:scale-102 hover:shadow-md border-2 border-dashed border-transparent hover:border-blue-200 dark:hover:border-blue-800' 
                              : ''
                        }`}
                      >
                        <BlockRenderer
                          block={block}
                          onUpdate={updateBlockContent}
                          onRemove={removeBlock}
                          onToggleVisibility={toggleBlockVisibility}
                        />
                      </div>
                      
                      {/* Add block button and drop zone after each block */}
                      <AddBlockBetween index={index + 1} />
                      <DropZone index={index + 1} isActive={dragOverIndex === index + 1} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-hidden">
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Live Preview</h2>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden min-h-0">
              <LivePreview formData={formData} previewMode={previewMode} theme={theme} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Block Modal */}
      <AddBlockModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setInsertIndex(null);
        }}
        onAddBlock={addBlock}
        availableBlocks={availableBlocks}
        isProMember={true} // TODO: Replace with actual user pro status
      />
    </div>
  );
}