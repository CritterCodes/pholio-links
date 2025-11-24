'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, GripVertical, Edit3, Trash2, ExternalLink } from 'lucide-react';

interface Link {
  _id: string;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
  order: number;
  analytics?: {
    clicks: number;
    lastClicked: Date;
  };
}

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  // Form state for new/edited links
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedLinks = items.map((link, index) => ({
      ...link,
      order: index,
    }));

    setLinks(updatedLinks);

    // Save new order to database
    try {
      await fetch('/api/links/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkOrders: updatedLinks.map(link => ({
            id: link._id,
            order: link.order,
          })),
        }),
      });
    } catch (error) {
      console.error('Failed to update link order:', error);
      // Revert on error
      fetchLinks();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url) return;

    try {
      const url = editingLink ? `/api/links/${editingLink._id}` : '/api/links';
      const method = editingLink ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchLinks();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save link:', error);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchLinks();
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const toggleLinkStatus = async (linkId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        await fetchLinks();
      }
    } catch (error) {
      console.error('Failed to toggle link status:', error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', url: '', description: '' });
    setIsAddingLink(false);
    setEditingLink(null);
  };

  const startEdit = (link: Link) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
    });
    setIsAddingLink(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Links</h1>
          <p className="text-gray-600">Add and organize your social links</p>
        </div>
        <button
          onClick={() => setIsAddingLink(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </div>

      {/* Add/Edit Link Form */}
      {isAddingLink && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">
            {editingLink ? 'Edit Link' : 'Add New Link'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., My Instagram"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://instagram.com/username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Follow me for daily updates"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingLink ? 'Update Link' : 'Add Link'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      <div className="bg-white rounded-lg border">
        {links.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">No links yet</div>
            <p className="text-gray-600">Add your first link to get started</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="links">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {links.map((link, index) => (
                    <Draggable key={link._id} draggableId={link._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 border-b last:border-b-0 flex items-center gap-4 ${
                            snapshot.isDragging ? 'bg-gray-50' : ''
                          } ${!link.isActive ? 'opacity-50' : ''}`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="text-gray-400 hover:text-gray-600 cursor-grab"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">{link.title}</h3>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-600"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            <p className="text-sm text-gray-600">{link.url}</p>
                            {link.description && (
                              <p className="text-sm text-gray-500">{link.description}</p>
                            )}
                            {link.analytics && (
                              <p className="text-xs text-gray-400">
                                {link.analytics.clicks} clicks
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={link.isActive}
                                onChange={() => toggleLinkStatus(link._id, link.isActive)}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-600">Active</span>
                            </label>
                            <button
                              onClick={() => startEdit(link)}
                              className="p-2 text-gray-400 hover:text-blue-600"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(link._id)}
                              className="p-2 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
        )}
      </div>
    </div>
  );
}