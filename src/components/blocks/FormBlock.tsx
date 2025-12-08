'use client';

import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff, GripVertical, ClipboardList } from 'lucide-react';
import { Form } from '@/types';

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface FormBlockProps {
  block: Block;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onRemove: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

export function FormBlock({ block, onUpdate, onRemove, onToggleVisibility }: FormBlockProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch('/api/forms');
        if (res.ok) {
          const data = await res.json();
          setForms(data);
        }
      } catch (error) {
        console.error('Failed to fetch forms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const selectedFormId = block.content.formId as string;
  const buttonText = block.content.buttonText as string || 'Fill out form';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            <span>Custom Form Link</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleVisibility(block._id)}
            className={`p-2 rounded-md transition-colors ${
              block.enabled
                ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                : 'text-gray-300 dark:text-gray-600'
            }`}
            title={block.enabled ? 'Hide block' : 'Show block'}
          >
            {block.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onRemove(block._id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-md"
            title="Remove block"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 pl-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Form
          </label>
          {loading ? (
            <div className="text-sm text-gray-500">Loading forms...</div>
          ) : forms.length === 0 ? (
            <div className="text-sm text-amber-600 dark:text-amber-400">
              You haven't created any forms yet. Go to the Forms tab to create one.
            </div>
          ) : (
            <select
              value={selectedFormId || ''}
              onChange={(e) => onUpdate(block._id, { ...block.content, formId: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a form...</option>
              {forms.map((form) => (
                <option key={form._id?.toString()} value={form._id?.toString()}>
                  {form.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Button Text
          </label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => onUpdate(block._id, { ...block.content, buttonText: e.target.value })}
            placeholder="e.g., Fill out our survey"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
