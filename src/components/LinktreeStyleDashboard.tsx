'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import FileUpload from '@/components/FileUpload';
import Image from 'next/image';
import { 
  HiPlus, 
  HiDotsVertical, 
  HiPencil, 
  HiTrash, 
  HiEye,
  HiEyeOff,
  HiGlobeAlt,
  HiMail,
  HiPhone,
  HiUserCircle,
} from 'react-icons/hi';
import { FaTwitter, FaLinkedin, FaTiktok, FaYoutube, FaSpotify, FaGithub, FaInstagram } from 'react-icons/fa';

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  profileImage?: string;
}

interface Link {
  _id: string;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
  order: number;
  linkType?: 'custom' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'spotify' | 'github' | 'website' | 'email' | 'phone';
  analytics?: {
    clicks: number;
    lastClicked: Date;
  };
}

// Common link types with their icons
const LINK_TYPES = {
  instagram: { icon: FaInstagram, label: 'Instagram', color: 'bg-gradient-to-r from-purple-400 to-pink-400' },
  twitter: { icon: FaTwitter, label: 'Twitter', color: 'bg-blue-400' },
  linkedin: { icon: FaLinkedin, label: 'LinkedIn', color: 'bg-blue-600' },
  tiktok: { icon: FaTiktok, label: 'TikTok', color: 'bg-black' },
  youtube: { icon: FaYoutube, label: 'YouTube', color: 'bg-red-500' },
  spotify: { icon: FaSpotify, label: 'Spotify', color: 'bg-green-500' },
  github: { icon: FaGithub, label: 'GitHub', color: 'bg-gray-800' },
  website: { icon: HiGlobeAlt, label: 'Website', color: 'bg-blue-500' },
  email: { icon: HiMail, label: 'Email', color: 'bg-gray-600' },
  phone: { icon: HiPhone, label: 'Phone', color: 'bg-green-600' },
  custom: { icon: HiUserCircle, label: 'Custom Link', color: 'bg-purple-500' },
};

export default function LinktreeStyleDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    title: '',
    bio: '',
    profileImage: '',
  });
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [selectedLinkType, setSelectedLinkType] = useState<keyof typeof LINK_TYPES>('custom');

  // Form state for new/edited links
  const [linkFormData, setLinkFormData] = useState({
    title: '',
    url: '',
    description: '',
    linkType: 'custom' as keyof typeof LINK_TYPES,
  });

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        setProfile({
          name: (session?.user as { username?: string })?.username || '',
          title: 'Welcome to my profile',
          bio: 'Tell the world about yourself!',
          profileImage: '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Error loading profile data');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      loadProfile();
      fetchLinks();
    }
  }, [status, router, session, loadProfile]);

  const handleProfileInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedLinks = items.map((link, index) => ({
      ...link,
      order: index,
    }));

    setLinks(updatedLinks);

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
      fetchLinks();
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkFormData.title || !linkFormData.url) return;

    try {
      const url = editingLink ? `/api/links/${editingLink._id}` : '/api/links';
      const method = editingLink ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...linkFormData,
          linkType: selectedLinkType,
        }),
      });

      if (response.ok) {
        await fetchLinks();
        resetLinkForm();
        setMessage('Link saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save link:', error);
      setMessage('Error saving link. Please try again.');
    }
  };

  const handleLinkDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchLinks();
        setMessage('Link deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      setMessage('Error deleting link. Please try again.');
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

  const resetLinkForm = () => {
    setLinkFormData({ title: '', url: '', description: '', linkType: 'custom' });
    setSelectedLinkType('custom');
    setIsAddingLink(false);
    setEditingLink(null);
  };

  const startEditLink = (link: Link) => {
    setEditingLink(link);
    setLinkFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
      linkType: link.linkType || 'custom',
    });
    setSelectedLinkType(link.linkType || 'custom');
    setIsAddingLink(true);
  };

  const getDefaultTitle = (linkType: keyof typeof LINK_TYPES) => {
    return LINK_TYPES[linkType].label;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
      {/* Main Content Area - Linktree Style */}
      <div className="flex-1 flex">
        
        {/* Left Panel - Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-lg">
            
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Header</h1>
              
              {/* Profile Image Upload */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profile.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                        <HiUserCircle className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <FileUpload
                    onUpload={(url) => handleProfileInputChange('profileImage', url)}
                    folder="profiles"
                    currentImage={profile.profileImage}
                  />
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile title
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => handleProfileInputChange('name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="@username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Tell people about yourself..."
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleProfileSave}
                disabled={isSaving}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Success/Error Messages */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                {message}
              </div>
            )}

            {/* Links Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Links</h2>
                <button
                  onClick={() => setIsAddingLink(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2 font-medium"
                >
                  <HiPlus className="w-4 h-4" />
                  Add link
                </button>
              </div>

              {/* Quick Add Links */}
              {!isAddingLink && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {Object.entries(LINK_TYPES).slice(0, 6).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedLinkType(type as keyof typeof LINK_TYPES);
                        setLinkFormData(prev => ({
                          ...prev,
                          title: getDefaultTitle(type as keyof typeof LINK_TYPES),
                          linkType: type as keyof typeof LINK_TYPES,
                        }));
                        setIsAddingLink(true);
                      }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors flex items-center gap-3 text-left"
                    >
                      <div className={`p-2 rounded-lg text-white ${config.color}`}>
                        <config.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-900">{config.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Add Link Form */}
              {isAddingLink && (
                <form onSubmit={handleLinkSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-900">
                    {editingLink ? 'Edit Link' : 'Add New Link'}
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <select
                      value={selectedLinkType}
                      onChange={(e) => {
                        const newType = e.target.value as keyof typeof LINK_TYPES;
                        setSelectedLinkType(newType);
                        setLinkFormData(prev => ({
                          ...prev,
                          linkType: newType,
                          title: prev.title || getDefaultTitle(newType),
                        }));
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {Object.entries(LINK_TYPES).map(([type, config]) => (
                        <option key={type} value={type}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={linkFormData.title}
                      onChange={(e) => setLinkFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Link title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="url"
                      value={linkFormData.url}
                      onChange={(e) => setLinkFormData(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="https://example.com"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium"
                    >
                      {editingLink ? 'Update' : 'Add link'}
                    </button>
                    <button
                      type="button"
                      onClick={resetLinkForm}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Links List */}
              {links.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-gray-400 text-lg mb-2">No links yet</div>
                  <p className="text-gray-600">Add your first link to get started</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="links">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {links.map((link, index) => {
                          const LinkTypeIcon = LINK_TYPES[link.linkType || 'custom'].icon;
                          const linkColor = LINK_TYPES[link.linkType || 'custom'].color;
                          
                          return (
                            <Draggable key={link._id} draggableId={link._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  } ${!link.isActive ? 'opacity-50' : ''}`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="text-gray-400 hover:text-gray-600 cursor-grab"
                                  >
                                    <HiDotsVertical className="w-5 h-5" />
                                  </div>

                                  <div className={`p-2 rounded-lg text-white ${linkColor}`}>
                                    <LinkTypeIcon className="w-5 h-5" />
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-gray-900">{link.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{link.url}</p>
                                    {link.analytics && (
                                      <p className="text-xs text-gray-400">
                                        {link.analytics.clicks} clicks
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleLinkStatus(link._id, link.isActive)}
                                      className={`p-2 rounded-lg ${
                                        link.isActive
                                          ? 'text-green-600 hover:bg-green-50'
                                          : 'text-gray-400 hover:bg-gray-100'
                                      }`}
                                      title={link.isActive ? 'Hide link' : 'Show link'}
                                    >
                                      {link.isActive ? <HiEye className="w-4 h-4" /> : <HiEyeOff className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => startEditLink(link)}
                                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                      <HiPencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleLinkDelete(link._id)}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                      <HiTrash className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="w-72 bg-gray-50 border-l border-gray-200 p-4 flex flex-col items-center">
          <div className="w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 mb-2">Preview</div>
              <div className="text-xs text-gray-500">
                Join {profile.name || 'user'} on Pholio.Links
              </div>
            </div>
            
            {/* Phone Mockup */}
            <div className="bg-black rounded-3xl p-2 shadow-2xl">
              <div className="bg-white rounded-2xl p-8 min-h-[600px] overflow-y-auto">
                
                {/* Profile Section */}
                <div className="text-center mb-8">
                  {profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full object-cover mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiUserCircle className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <h1 className="text-lg font-bold text-gray-900 mb-2">
                    {profile.name || '@username'}
                  </h1>
                  
                  {profile.bio && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {/* Links */}
                <div className="space-y-3">
                  {links.filter(link => link.isActive).map((link) => {
                    const LinkTypeIcon = LINK_TYPES[link.linkType || 'custom'].icon;
                    const linkColor = LINK_TYPES[link.linkType || 'custom'].color;
                    
                    return (
                      <a
                        key={link._id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gray-100 hover:bg-gray-200 transition-colors rounded-full p-4"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div className={`p-1 rounded-full text-white ${linkColor}`}>
                            <LinkTypeIcon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-900">{link.title}</span>
                        </div>
                      </a>
                    );
                  })}
                  
                  {links.filter(link => link.isActive).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">No active links to show</p>
                    </div>
                  )}
                </div>
                
                <div className="text-center mt-8 pt-8 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    Report • Privacy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}