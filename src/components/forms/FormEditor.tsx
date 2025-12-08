'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2, GripVertical, Save, ArrowLeft, Settings } from 'lucide-react';
import { Form, FormField } from '@/types';

interface FormEditorProps {
  initialData?: Form;
  isNew?: boolean;
}

export default function FormEditor({ initialData, isNew = false }: FormEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'settings'>('fields');
  
  const [formData, setFormData] = useState<Partial<Form>>(initialData || {
    title: '',
    description: '',
    fields: [],
    submitButtonText: 'Submit',
    successMessage: 'Thank you for your submission!',
    isActive: true,
  });

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `New ${type} field`,
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
    };

    setFormData({
      ...formData,
      fields: [...(formData.fields || []), newField],
    });
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormData({
      ...formData,
      fields: formData.fields?.map(f => f.id === id ? { ...f, ...updates } : f),
    });
  };

  const removeField = (id: string) => {
    setFormData({
      ...formData,
      fields: formData.fields?.filter(f => f.id !== id),
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !formData.fields) return;

    const items = Array.from(formData.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData({
      ...formData,
      fields: items,
    });
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      alert('Please enter a form title');
      return;
    }

    setLoading(true);
    try {
      const url = isNew ? '/api/forms' : `/api/forms/${initialData?._id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/forms');
        router.refresh();
      } else {
        alert('Failed to save form');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isNew ? 'Create New Form' : 'Edit Form'}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Form'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('fields')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'fields'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                Fields
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                Settings
              </button>
            </div>

            {activeTab === 'fields' ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase mb-3">Add Field</p>
                <button onClick={() => addField('text')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">Text Input</button>
                <button onClick={() => addField('textarea')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">Long Text</button>
                <button onClick={() => addField('email')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">Email Address</button>
                <button onClick={() => addField('number')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">Number</button>
                <button onClick={() => addField('select')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">Dropdown</button>
                <button onClick={() => addField('checkbox')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">Checkbox</button>
                <button onClick={() => addField('radio')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">Radio Buttons</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Form Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                    placeholder="Contact Us"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                    rows={3}
                    placeholder="Send us a message..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Submit Button Text</label>
                  <input
                    type="text"
                    value={formData.submitButtonText}
                    onChange={(e) => setFormData({ ...formData, submitButtonText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Success Message</label>
                  <input
                    type="text"
                    value={formData.successMessage}
                    onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">Form is Active</label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview / Editor Area */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 min-h-[600px]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{formData.title || 'Untitled Form'}</h2>
              <p className="text-gray-500">{formData.description}</p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="form-fields">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {formData.fields?.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="group relative bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                          >
                            <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div {...provided.dragHandleProps} className="p-1 cursor-grab hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                              <button
                                onClick={() => removeField(field.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="pr-16">
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                className="block w-full bg-transparent font-medium mb-2 focus:outline-none focus:border-b border-blue-500"
                                placeholder="Field Label"
                              />
                              
                              {/* Field Preview */}
                              <div className="pointer-events-none opacity-60">
                                {field.type === 'textarea' ? (
                                  <div className="h-20 w-full bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"></div>
                                ) : field.type === 'select' ? (
                                  <div className="h-10 w-full bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center px-3">Dropdown</div>
                                ) : field.type === 'checkbox' ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border rounded"></div>
                                    <span>Checkbox option</span>
                                  </div>
                                ) : field.type === 'radio' ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border rounded-full"></div>
                                    <span>Radio option</span>
                                  </div>
                                ) : (
                                  <div className="h-10 w-full bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"></div>
                                )}
                              </div>

                              {/* Field Settings */}
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 text-sm">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                    className="rounded border-gray-300"
                                  />
                                  Required
                                </label>
                                
                                {(field.type === 'select' || field.type === 'radio') && (
                                  <div className="w-full">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Options (comma separated)</label>
                                    <input
                                      type="text"
                                      value={field.options?.join(', ')}
                                      onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                      className="w-full px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {(!formData.fields || formData.fields.length === 0) && (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <p className="text-gray-500">Add fields from the sidebar to build your form</p>
              </div>
            )}

            <div className="mt-8">
              <button disabled className="w-full py-3 bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed">
                {formData.submitButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
