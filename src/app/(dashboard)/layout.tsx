'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Header } from '@/components/ui/Header';
import { 
  HiUser, 
  HiColorSwatch,
  HiPhotograph, 
  HiCog, 
  HiLogout,
  HiShieldCheck
} from 'react-icons/hi';

const navigation = [
  { name: 'Design', href: '/dashboard', icon: HiUser },
  { name: 'Theme', href: '/theme', icon: HiColorSwatch },
  { name: 'Gallery', href: '/gallery', icon: HiPhotograph, premium: true },
  { name: 'Settings', href: '/settings', icon: HiCog },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Global Header */}
      <Header />
      
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16">
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 shadow transition-colors">
          
          {/* Main Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto pt-4">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                    )}
                  >
                    <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                    {item.name}
                    {item.premium && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded-full">
                        PRO
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Admin Link */}
              {(session?.user as any)?.isAdmin && (
                <Link
                  href="/admin"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                >
                  <HiShieldCheck className="mr-3 flex-shrink-0 h-5 w-5 text-purple-500" />
                  Admin Portal
                </Link>
              )}
            </nav>

            {/* User Info Section */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <HiUser className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {session?.user?.name || session?.user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              {/* Settings & Sign Out */}
              <div className="space-y-1 mt-4">
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors"
                >
                  <HiLogout className="mr-3 h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 pt-16 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}