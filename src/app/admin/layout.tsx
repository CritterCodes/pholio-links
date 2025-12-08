'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { HiChartPie, HiLightBulb, HiCog, HiHome } from 'react-icons/hi';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !(session.user as any).isAdmin) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session || !(session.user as any).isAdmin) {
    return null;
  }

  const navigation = [
    { name: 'Overview', href: '/admin', icon: HiChartPie },
    { name: 'Feature Requests', href: '/admin/features', icon: HiLightBulb },
    { name: 'Settings', href: '/admin/settings', icon: HiCog },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 bg-slate-800 border-r border-slate-700">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4 mb-6">
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Pholio Admin
                  </span>
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-slate-700 hover:text-white"
                    >
                      <item.icon
                        className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-slate-700 p-4">
                <Link
                  href="/dashboard"
                  className="flex-shrink-0 w-full group block"
                >
                  <div className="flex items-center">
                    <HiHome className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-300 mr-3" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white group-hover:text-gray-200">
                        Back to App
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
