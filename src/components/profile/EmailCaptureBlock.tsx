'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, Loader2 } from 'lucide-react';

interface EmailCaptureProps {
  username: string;
  title?: string;
  description?: string;
  successMessage?: string;
  theme: any;
}

export function EmailCaptureBlock({ username, title, description, successMessage, theme }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/fans/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        const text = await res.text();
        setStatus('error');
        setErrorMessage(text === 'Already subscribed' ? 'You are already subscribed!' : 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to connect. Please try again.');
    }
  };

  // Determine styles based on theme
  const isDark = theme.backgroundColor === '#000000' || theme.textColor === '#ffffff';
  const bgColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mb-6 p-6 rounded-2xl backdrop-blur-sm border"
      style={{ 
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: theme.textColor 
      }}
    >
      {status === 'success' ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-lg mb-1" style={{ color: theme.textColor }}>Subscribed!</h3>
          <p className="opacity-80" style={{ color: theme.textColor }}>
            {successMessage || 'Thanks for subscribing!'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-xl mb-2" style={{ color: theme.textColor }}>
              {title || 'Join my newsletter'}
            </h3>
            <p className="opacity-80 text-sm" style={{ color: theme.textColor }}>
              {description || 'Stay updated with my latest content.'}
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none transition-all bg-white/10 backdrop-blur-sm"
              style={{ 
                color: theme.textColor,
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 rounded-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: theme.linkColor || '#8b5cf6',
                color: '#ffffff'
              }}
            >
              {status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Subscribe
                </>
              )}
            </button>
          </div>
          
          {status === 'error' && (
            <p className="text-red-500 text-sm text-center mt-2">{errorMessage}</p>
          )}
        </form>
      )}
    </motion.div>
  );
}
