'use client';

import { motion } from 'framer-motion';
import { StatsPreview } from './StatsPreview';
import { Palette, QrCode, Tag, Zap } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function FeatureBento() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto p-4"
    >
      {/* Analytics - Large Card */}
      <motion.div variants={item} className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Understand your audience with detailed insights on views, clicks, and devices.
            </p>
          </div>
          <div className="w-48 h-32 hidden sm:block">
            <StatsPreview />
          </div>
        </div>
      </motion.div>

      {/* Themes - Tall Card */}
      <motion.div variants={item} className="md:col-span-1 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 text-white shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2">Custom Themes</h3>
        <p className="text-white/80 mb-6">
          Express yourself with fully customizable colors, fonts, and backgrounds.
        </p>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-white" />
          <div className="w-8 h-8 rounded-full bg-yellow-400" />
          <div className="w-8 h-8 rounded-full bg-green-400" />
        </div>
      </motion.div>

      {/* QR Codes - Medium Card */}
      <motion.div variants={item} className="md:col-span-3 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
        <div>
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
            <QrCode className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Instant Sharing</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Share your profile instantly with generated QR codes.
          </p>
        </div>
        <div className="bg-white p-2 rounded-xl border border-gray-100 hidden sm:block">
          <QrCode className="w-24 h-24 text-gray-900" />
        </div>
      </motion.div>
    </motion.div>
  );
}
