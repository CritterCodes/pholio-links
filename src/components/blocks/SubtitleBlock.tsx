'use client';

import { useState } from 'react';
import { GripVertical, X, Eye, EyeOff, Type, ChevronDown, ChevronUp } from 'lucide-react';

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface SubtitleBlockProps {
  block: Block;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onRemove: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

export function SubtitleBlock({ block, onUpdate, onRemove, onToggleVisibility }: SubtitleBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const subtitle = (block.content as { subtitle?: string })?.subtitle || '';

  const updateSubtitle = (value: string) => {
    onUpdate(block._id, { subtitle: value });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-grab hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
          <span className="font-medium text-gray-900 dark:text-gray-100">Subtitle</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
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
      
      {!isCollapsed && (
        <div className="pl-7">
          <input
            type="text"
            value={subtitle}
            onChange={(e) => updateSubtitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a short subtitle or tagline..."
            maxLength={100}
          />
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {subtitle.length}/100 characters
          </div>
          
          {subtitle.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Type className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Add a subtitle or tagline</p>
              <p className="text-xs">Perfect for job titles, quotes, or short descriptions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}