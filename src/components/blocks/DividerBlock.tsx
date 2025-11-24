'use client';

import { useState } from 'react';
import { GripVertical, X, Eye, EyeOff, Minus, ChevronDown, ChevronUp } from 'lucide-react';

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface DividerBlockProps {
  block: Block;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onRemove: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

export function DividerBlock({ block, onUpdate, onRemove, onToggleVisibility }: DividerBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dividerStyle = (block.content as { style?: string })?.style || 'solid';
  const dividerColor = (block.content as { color?: string })?.color || '#e5e7eb';
  const dividerThickness = (block.content as { thickness?: number })?.thickness || 2;
  const dividerWidth = (block.content as { width?: string })?.width || 'medium';

  const handleStyleChange = (style: string) => {
    onUpdate(block._id, { ...block.content, style });
  };

  const handleColorChange = (color: string) => {
    onUpdate(block._id, { ...block.content, color });
  };

  const handleThicknessChange = (thickness: number) => {
    onUpdate(block._id, { ...block.content, thickness });
  };

  const handleWidthChange = (width: string) => {
    onUpdate(block._id, { ...block.content, width });
  };

  const getWidthValue = (width: string) => {
    switch (width) {
      case 'small': return '25%';
      case 'large': return '100%';
      default: return '50%'; // medium
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Divider</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Visual separator line</p>
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
          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-center">
              <div 
                className="mx-auto"
                style={{
                  height: `${dividerThickness}px`,
                  borderTop: dividerStyle === 'dashed' ? `${dividerThickness}px dashed ${dividerColor}` : 
                            dividerStyle === 'dotted' ? `${dividerThickness}px dotted ${dividerColor}` : 'none',
                  backgroundColor: dividerStyle === 'solid' ? dividerColor : 'transparent',
                  width: getWidthValue(dividerWidth),
                  maxWidth: '200px'
                }}
              />
            </div>
          </div>

          {/* Style Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Divider Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['solid', 'dashed', 'dotted'].map((style) => (
                <button
                  key={style}
                  onClick={() => handleStyleChange(style)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    dividerStyle === style
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className="w-8 h-px"
                      style={{
                        backgroundColor: style === 'solid' ? '#6b7280' : 'transparent',
                        borderTop: style === 'dashed' ? '1px dashed #6b7280' : 
                                  style === 'dotted' ? '1px dotted #6b7280' : 'none'
                      }}
                    />
                    <span className="capitalize text-xs">{style}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Divider Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={dividerColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={dividerColor}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#e5e7eb"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
          </div>

          {/* Thickness Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thickness
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 1, label: 'Thin' },
                { value: 2, label: 'Medium' },
                { value: 4, label: 'Thick' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThicknessChange(option.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    dividerThickness === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className="w-8"
                      style={{
                        height: `${option.value}px`,
                        backgroundColor: '#6b7280'
                      }}
                    />
                    <span className="text-xs">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Width Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Width
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'small', label: 'Short' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Full' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleWidthChange(option.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    dividerWidth === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className="h-px bg-gray-500"
                      style={{
                        width: option.value === 'small' ? '16px' : option.value === 'large' ? '32px' : '24px'
                      }}
                    />
                    <span className="text-xs">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}