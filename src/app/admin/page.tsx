'use client';

import { useState, useEffect } from 'react';
import { HiUsers, HiCurrencyDollar, HiLightningBolt, HiDocumentText } from 'react-icons/hi';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading stats...</div>;
  }

  const statCards = [
    { name: 'Total Users', value: stats?.totalUsers || 0, icon: HiUsers, color: 'bg-blue-500' },
    { name: 'Pro Users', value: stats?.proUsers || 0, icon: HiCurrencyDollar, color: 'bg-green-500' },
    { name: 'Total Requests', value: stats?.totalFeatureRequests || 0, icon: HiDocumentText, color: 'bg-purple-500' },
    { name: 'Pending Requests', value: stats?.pendingFeatureRequests || 0, icon: HiLightningBolt, color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.name}
            className="bg-slate-800 overflow-hidden shadow rounded-lg border border-slate-700"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`rounded-md p-3 ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">{item.name}</dt>
                    <dd className="text-3xl font-semibold text-white">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for charts or recent activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-white mb-4">Recent Activity</h2>
        <div className="bg-slate-800 shadow rounded-lg border border-slate-700 p-6">
          <p className="text-gray-400">Activity log coming soon...</p>
        </div>
      </div>
    </div>
  );
}
