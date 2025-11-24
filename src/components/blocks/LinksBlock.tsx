'use client';

import { GripVertical, X, Eye, EyeOff, Plus, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface LinksBlockProps {
  block: Block;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onRemove: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

interface CustomLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  color?: string;
}

export function LinksBlock({ block, onUpdate, onRemove, onToggleVisibility }: LinksBlockProps) {
  const links = (block.content as { links?: CustomLink[] })?.links || [];

  const addLink = () => {
    const newLink: CustomLink = {
      id: Date.now().toString(),
      title: 'New Link',
      url: 'https://',
      description: '',
      color: '#3b82f6'
    };
    onUpdate(block._id, { links: [...links, newLink] });
  };

  const removeLink = (linkId: string) => {
    onUpdate(block._id, { links: links.filter(link => link.id !== linkId) });
  };

  const updateLink = (linkId: string, field: keyof CustomLink, value: string) => {
    const updatedLinks = links.map(link => 
      link.id === linkId ? { ...link, [field]: value } : link
    );
    onUpdate(block._id, { links: updatedLinks });
  };

  const moveLink = (linkId: string, direction: 'up' | 'down') => {
    const currentIndex = links.findIndex(link => link.id === linkId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const newLinks = [...links];
    [newLinks[currentIndex], newLinks[newIndex]] = [newLinks[newIndex], newLinks[currentIndex]];
    onUpdate(block._id, { links: newLinks });
  };

  const presetColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-grab hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
          <span className="font-medium text-gray-900 dark:text-gray-100">Custom Links</span>
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
          {links.map((link, index) => (
            <div key={link.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="space-y-3">
                {/* Title and URL */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Link title"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://"
                  />
                </div>

                {/* Description */}
                <input
                  type="text"
                  value={link.description || ''}
                  onChange={(e) => updateLink(link.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                />

                {/* Color picker and actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Color:</span>
                    <div className="flex gap-1">
                      {presetColors.map(color => (
                        <button
                          key={color}
                          onClick={() => updateLink(link.id, 'color', color)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            link.color === color 
                              ? 'border-gray-400 dark:border-gray-500' 
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Move buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveLink(link.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveLink(link.id, 'down')}
                        disabled={index === links.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                    
                    {/* Preview */}
                    {link.url && link.url !== 'https://' && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-500 hover:text-blue-700"
                        title="Preview link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    
                    {/* Remove */}
                    <button
                      onClick={() => removeLink(link.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remove link"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={addLink}
            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Custom Link
          </button>


          {links.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <LinkIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No custom links added yet</p>
              <p className="text-xs">Create custom links with colors and descriptions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}