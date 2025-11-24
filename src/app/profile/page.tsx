'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Get the hostname and extract subdomain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      
      // Check if it's a subdomain (not localhost, not www, not root domain)
      if (parts.length > 2 || (parts.length === 2 && parts[0] !== 'www')) {
        const subdomain = parts[0];
        // Redirect to /s/[subdomain]/profile
        router.push(`/s/${subdomain}/profile`);
      } else {
        // On root domain without a subdomain, show error or redirect
        router.push('/');
      }
    }
  }, [router]);

  return null;
}
