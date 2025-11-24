'use client';

import { useState } from 'react';
import { Type, X, Eye, EyeOff, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface BioBlockProps {
  block: Block;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onRemove: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

export function BioBlock({ block, onUpdate, onRemove, onToggleVisibility }: BioBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const bioText = (block.content as { text?: string })?.text || '';

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-grab hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
          <span className="font-medium text-gray-900 dark:text-gray-100">Bio</span>
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
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio Text</span>
            </div>
            <textarea
              value={bioText}
              onChange={(e) => onUpdate(block._id, { text: e.target.value })}
              placeholder="Tell people about yourself..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}