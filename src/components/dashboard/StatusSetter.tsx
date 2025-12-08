'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Smile, X, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Status {
  message: string;
  emoji?: string;
  expiresAt?: string;
}

export function StatusSetter() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('👋');
  const [duration, setDuration] = useState('24h');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setStatus(data.status);
          setMessage(data.status.message);
          setEmoji(data.status.emoji || '👋');
        }
      }
    } catch (error) {
      console.error('Failed to fetch status', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, emoji, duration }),
      });
      
      if (res.ok) {
        setIsOpen(false);
        fetchStatus();
      }
    } catch (error) {
      console.error('Failed to save status', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/status', {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setStatus(null);
        setMessage('');
        setEmoji('👋');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to clear status', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        <span className="text-lg">{status?.emoji || '💭'}</span>
        <span className="max-w-[100px] truncate hidden sm:inline">
          {status?.message || 'Set Status'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <Dialog
            static
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <Dialog.Panel
              as={motion.div}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                  Set Status
                </Dialog.Title>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative">
                    <button
                      className="w-12 h-12 flex items-center justify-center text-2xl bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      {emoji}
                    </button>
                    {/* Emoji picker could go here */}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What's happening?"
                      maxLength={144}
                      className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {message.length}/144
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Clear after
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {['1h', '4h', '24h', '7d', 'permanent'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                          duration === d
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 border'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {d === 'permanent' ? 'Never' : d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {status && (
                    <button
                      onClick={handleClear}
                      disabled={loading}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                  <div className="flex-1"></div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || !message}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Status'}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
