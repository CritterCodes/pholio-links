'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  profileImage?: string;
  heroImage?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    title: '',
    bio: '',
    profileImage: '',
    heroImage: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.displayName || '',
          title: data.subtitle || '',
          bio: data.bio || '',
          profileImage: data.profileImage || '',
          heroImage: data.heroImage || '',
        });
      } else if (response.status === 404) {
        // Profile doesn't exist yet, use defaults
        setProfile({
          name: (session?.user as { username?: string })?.username || '',
          title: 'Welcome to my profile',
          bio: 'Edit your bio to tell people about yourself!',
          profileImage: '',
          heroImage: '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Error loading profile data');
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
      loadProfile();
    }
  }, [status, router, session, loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      // Update profile
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: profile.name,
          profileImage: profile.profileImage,
          heroImage: profile.heroImage,
          subtitle: profile.title,
          bio: profile.bio,
        }),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        // Reload profile to get latest data
        loadProfile();
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

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600">Customize your public profile information</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-blue-800">
              Your Profile Information
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>This information will be visible to everyone who visits your profile page. Make sure to:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Use a professional profile image</li>
                <li>Write a clear, engaging bio that describes what you do</li>
                <li>Keep your title concise and descriptive</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Profile Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Profile Image
          </label>
          <FileUpload
            onUpload={(url) => handleInputChange('profileImage', url)}
            folder="profiles"
            currentImage={profile.profileImage}
            className="mb-4"
          />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Display Name
          </label>
          <input
            type="text"
            id="name"
            value={profile.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="Your display name"
            required
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title/Job
          </label>
          <input
            type="text"
            id="title"
            value={profile.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g. Content Creator, Developer, Artist"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            value={profile.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="Tell people about yourself..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {profile.bio.length}/500 characters
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              Your profile is available at: <span className="font-medium">{(session?.user as { username?: string })?.username}.pholio.links</span>
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}