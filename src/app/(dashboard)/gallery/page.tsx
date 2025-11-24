'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import Image from 'next/image';
import { 
  HiPlus,
  HiTrash,
  HiPencil,
  HiEye,
  HiEyeOff,
  HiPhotograph,
  HiStar,
  HiLockClosed,
} from 'react-icons/hi';

interface GalleryImage {
  _id: string;
  url: string;
  title: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

interface UserSubscription {
  plan: 'free' | 'pro' | 'premium';
  isActive: boolean;
}

export default function GalleryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription>({ plan: 'free', isActive: false });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  
  // Form state for new/edited images
  const [imageFormData, setImageFormData] = useState({
    title: '',
    description: '',
    url: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Update subscription from session
      if (session?.user) {
        const userTier = (session.user as any)?.subscriptionTier || 'free';
        setSubscription({ 
          plan: userTier === 'paid' ? 'pro' : 'free', 
          isActive: userTier === 'paid' 
        });
      }

      // Load gallery images
      // const response = await fetch('/api/gallery');
      // if (response.ok) {
      //   const data = await response.json();
      //   setImages(data.images || []);
      // }

      // Load user subscription status
      // const subResponse = await fetch('/api/subscription');
      // if (subResponse.ok) {
      //   const subData = await subResponse.json();
      //   setSubscription(subData);
      // }
    } catch (error) {
      console.error('Error loading gallery:', error);
      setMessage('Error loading gallery data');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      loadData();
    }
  }, [status, router, loadData]);

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFormData.title || !imageFormData.url) return;

    try {
      // const url = editingImage ? `/api/gallery/${editingImage._id}` : '/api/gallery';
      // const method = editingImage ? 'PUT' : 'POST';

      // const response = await fetch(url, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(imageFormData),
      // });

      // if (response.ok) {
      //   await loadData();
      //   resetImageForm();
      //   setMessage('Image saved successfully!');
      //   setTimeout(() => setMessage(''), 3000);
      // }

      // Mock success for now
      setMessage('Image saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      resetImageForm();
    } catch (error) {
      console.error('Failed to save image:', error);
      setMessage('Error saving image. Please try again.');
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // const response = await fetch(`/api/gallery/${imageId}`, {
      //   method: 'DELETE',
      // });

      // if (response.ok) {
      //   await loadData();
      //   setMessage('Image deleted successfully!');
      //   setTimeout(() => setMessage(''), 3000);
      // }

      // Mock success for now
      console.log('Deleting image:', imageId);
      setMessage('Image deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to delete image:', error);
      setMessage('Error deleting image. Please try again.');
    }
  };

  const toggleImageStatus = async (imageId: string, isActive: boolean) => {
    try {
      // const response = await fetch(`/api/gallery/${imageId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isActive: !isActive }),
      // });

      // if (response.ok) {
      //   await loadData();
      // }

      // Mock success for now
      console.log('Toggle image status:', imageId, !isActive);
    } catch (error) {
      console.error('Failed to toggle image status:', error);
    }
  };

  const resetImageForm = () => {
    setImageFormData({ title: '', description: '', url: '' });
    setIsAddingImage(false);
    setEditingImage(null);
  };

  const startEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setImageFormData({
      title: image.title,
      description: image.description || '',
      url: image.url,
    });
    setIsAddingImage(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show upgrade prompt for free users
  if (subscription.plan === 'free') {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white mb-8">
          <HiStar className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
          <h1 className="text-3xl font-bold mb-4">Gallery Feature</h1>
          <p className="text-xl mb-6 opacity-90">
            Showcase your photos and visual content with beautiful galleries
          </p>
          
          <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
            <HiLockClosed className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
            <h2 className="text-xl font-semibold mb-2">Premium Feature</h2>
            <p className="text-white/80">
              Galleries are available for Pro and Premium subscribers. 
              Upgrade your account to start sharing your visual story.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <HiPhotograph className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Storytelling</h3>
            <p className="text-gray-600">
              Upload and organize your photos, artwork, or portfolio pieces in beautiful galleries.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <HiEye className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Display</h3>
            <p className="text-gray-600">
              Show off your work with clean, responsive galleries that look great on any device.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            Upgrade to Pro
          </button>
          
          <div className="text-sm text-gray-500">
            Starting at $9/month • Cancel anytime • 30-day free trial
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gallery</h1>
          <p className="text-gray-600">Manage your photo collections and visual content</p>
        </div>
        <button
          onClick={() => setIsAddingImage(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
        >
          <HiPlus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {message}
        </div>
      )}

      {/* Add/Edit Image Form */}
      {isAddingImage && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <form onSubmit={handleImageSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingImage ? 'Edit Image' : 'Add New Image'}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <FileUpload
                onUpload={(url) => setImageFormData(prev => ({ ...prev, url }))}
                folder="gallery"
                currentImage={imageFormData.url}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={imageFormData.title}
                onChange={(e) => setImageFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Image title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={imageFormData.description}
                onChange={(e) => setImageFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Describe this image..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
              >
                {editingImage ? 'Update Image' : 'Add Image'}
              </button>
              <button
                type="button"
                onClick={resetImageForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">
            <HiPhotograph className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No images yet</h3>
          <p className="text-gray-600 mb-6">Start building your gallery by uploading your first image</p>
          <button
            onClick={() => setIsAddingImage(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
          >
            Upload First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image._id} className="bg-white rounded-xl shadow-sm border overflow-hidden group">
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleImageStatus(image._id, image.isActive)}
                      className={`p-2 rounded-lg ${
                        image.isActive
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      } hover:bg-opacity-80`}
                      title={image.isActive ? 'Hide image' : 'Show image'}
                    >
                      {image.isActive ? <HiEye className="w-4 h-4" /> : <HiEyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEditImage(image)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleImageDelete(image._id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{image.title}</h3>
                  {!image.isActive && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      Hidden
                    </span>
                  )}
                </div>
                {image.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{image.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}