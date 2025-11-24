'use client';

import { useState } from 'react';
import { GripVertical, X, Eye, EyeOff, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect } from 'react';

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface GalleryBlockProps {
  block: Block;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onRemove: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

export function GalleryBlock({ block, onUpdate, onRemove, onToggleVisibility }: GalleryBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const title = (block.content as { title?: string })?.title || 'Gallery';
  const selectedImageIds = (block.content as { selectedImageIds?: string[] })?.selectedImageIds || [];
  const maxImages = (block.content as { maxImages?: number })?.maxImages || 6;
  const columns = (block.content as { columns?: number })?.columns || 2;

  const fetchAvailableImages = async () => {
    try {
      // This would be your gallery API endpoint
      // For now, I'll create a placeholder structure
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  // Fetch available images from the gallery API
  useEffect(() => {
    fetchAvailableImages();
  }, []);

  const handleTitleChange = (newTitle: string) => {
    onUpdate(block._id, { ...block.content, title: newTitle });
  };

  const handleMaxImagesChange = (newMax: number) => {
    onUpdate(block._id, { ...block.content, maxImages: newMax });
  };

  const handleColumnsChange = (newColumns: number) => {
    onUpdate(block._id, { ...block.content, columns: newColumns });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Gallery</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Display your photo gallery</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onToggleVisibility(block._id)}
            className={`p-2 rounded-lg transition-colors ${
              block.enabled
                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {block.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onRemove(block._id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && block.enabled && (
        <div className="space-y-4">
          {/* Gallery Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gallery Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Gallery"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Display Options */}
          <div className="grid grid-cols-2 gap-4">
            {/* Max Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Images
              </label>
              <select
                value={maxImages}
                onChange={(e) => handleMaxImagesChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {[3, 6, 9, 12, 15].map(num => (
                  <option key={num} value={num}>{num} images</option>
                ))}
              </select>
            </div>

            {/* Columns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3].map(cols => (
                  <button
                    key={cols}
                    onClick={() => handleColumnsChange(cols)}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                      columns === cols
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cols} col
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-center">
              <h4 className="font-medium mb-3">{title}</h4>
              {selectedImageIds.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 py-8">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No images selected</p>
                  <p className="text-xs">Select images from your gallery to display</p>
                </div>
              ) : (
                <div className={`grid gap-2 ${
                  columns === 1 ? 'grid-cols-1' : 
                  columns === 2 ? 'grid-cols-2' : 
                  'grid-cols-3'
                }`}>
                  {selectedImageIds.slice(0, maxImages).map((imageId, index) => (
                    <div key={imageId} className="aspect-square bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Manage your images:</strong> Go to the Gallery page to upload and organize your photos. 
              This block controls how they&apos;re displayed on your profile.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}