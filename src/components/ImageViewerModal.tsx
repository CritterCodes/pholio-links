'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import Image from 'next/image';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle?: string;
  imageDescription?: string;
}

export default function ImageViewerModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  imageTitle, 
  imageDescription 
}: ImageViewerModalProps) {
  // Initialize with clean state
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 300));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const resetView = useCallback(() => {
    setZoom(100);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleRotate]);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageTitle || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 100) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-60">
        <div className="text-white">
          {imageTitle && <h3 className="font-semibold text-lg">{imageTitle}</h3>}
          {imageDescription && <p className="text-sm text-gray-300 mt-1">{imageDescription}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black bg-opacity-50 rounded-lg p-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              disabled={zoom <= 25}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <span className="text-white text-sm min-w-[3rem] text-center">
              {zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              disabled={zoom >= 300}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleRotate}
            className="p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          <button
            onClick={handleDownload}
            className="p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={resetView}
            className="px-3 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors text-sm"
          >
            Reset
          </button>

          <button
            onClick={onClose}
            className="p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div 
        className="flex items-center justify-center w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="relative max-w-full max-h-full"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <Image
            src={imageUrl}
            alt={imageTitle || 'Image'}
            width={800}
            height={600}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            priority
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 rounded-lg px-4 py-2">
        <span>Press ESC to close • +/- to zoom • R to rotate • Drag to move when zoomed</span>
      </div>
    </div>
  );
}