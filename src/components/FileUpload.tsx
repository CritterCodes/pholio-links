'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onUpload: (url: string) => void;
  folder: 'profiles' | 'gallery' | 'splash' | 'heroes' | 'business-cards' | 'bug-reports';
  currentImage?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export default function FileUpload({
  onUpload,
  folder,
  currentImage,
  className = '',
  accept = 'image/*',
  maxSize = 5,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onUpload(data.url);
      } else {
        setUploadError(data.message || 'Upload failed');
        setPreviewUrl(currentImage || '');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Upload failed. Please try again.');
      setPreviewUrl(currentImage || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative inline-block">
          <Image
            src={previewUrl}
            alt="Preview"
            width={128}
            height={128}
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-b-transparent"></div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-b-transparent"></div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Upload Image</span>
            </>
          )}
        </button>
      )}

      {uploadError && (
        <div className="text-red-600 text-sm">
          {uploadError}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Max size: {maxSize}MB. Supported: JPEG, PNG, WebP
      </div>
    </div>
  );
}