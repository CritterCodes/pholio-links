'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'M', val: 40 },
  { name: 'T', val: 30 },
  { name: 'W', val: 60 },
  { name: 'T', val: 45 },
  { name: 'F', val: 80 },
  { name: 'S', val: 55 },
  { name: 'S', val: 70 },
];

export function StatsPreview() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="text-sm text-gray-500">Total Views</div>
          <div className="text-2xl font-bold">12.4k</div>
        </div>
        <div className="text-green-500 text-sm font-medium">+12%</div>
      </div>
      <div className="flex-1 min-h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar 
              dataKey="val" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
