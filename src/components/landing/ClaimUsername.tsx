'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function ClaimUsername() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      router.push(`/register?username=${username}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="relative flex items-center">
        <span className="absolute left-4 text-gray-400 font-medium">pholio.link/</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
          placeholder="yourname"
          className="w-full pl-24 pr-12 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-lg font-medium"
        />
        <button
          type="submit"
          disabled={!username}
          className="absolute right-2 p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      <p className="mt-3 text-sm text-gray-500 text-center">
        Claim your unique handle before it's taken.
      </p>
    </form>
  );
}
