'use client';

import { useSession } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Settings, Menu, Eye, Share2 } from 'lucide-react';
import Image from 'next/image';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { StatusSetter } from '@/components/dashboard/StatusSetter';
import { ShareModal } from '@/components/share/ShareModal';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileUrl = async () => {
      if (session?.user) {
        try {
          const res = await fetch('/api/custom-domain');
          const data = await res.json();
          const username = (session.user as any).username;
          
          if (data.customDomain) {
            setProfileUrl(`https://${data.customDomain}`);
          } else if (username) {
            setProfileUrl(`https://${username}.pholio.link`);
          }
        } catch (error) {
          console.error('Failed to fetch profile URL:', error);
        }
      }
    };

    fetchProfileUrl();
  }, [session]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left side - Logo & Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Pholio.Links
            </span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Share Button */}
          {profileUrl && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Share Profile"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}

          {/* View Profile Eye Button */}
          {profileUrl && (
            <a 
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="View Public Profile"
            >
              <Eye className="w-5 h-5" />
            </a>
          )}

          {/* Status */}
          <StatusSetter />

          {/* Notifications */}
          <NotificationDropdown />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Settings */}
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        username={(session?.user as any)?.username || ''}
        profileUrl={profileUrl}
      />
    </header>
  );
}