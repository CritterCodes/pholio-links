'use client';

import { motion } from 'framer-motion';

export function PhoneMockup() {
  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
      <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
      <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
      
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-gray-900 relative">
        {/* Screen Content */}
        <div className="h-full w-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 flex flex-col items-center pt-12">
          
          {/* Profile Pic */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 mb-4 shadow-lg"
          />
          
          {/* Name */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"
          />
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-8"
          />

          {/* Links */}
          <div className="w-full space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                className="w-full h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center px-4"
              >
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 mr-3" />
                <div className="h-2 w-20 bg-gray-100 dark:bg-gray-700 rounded-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
