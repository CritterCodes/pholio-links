'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Campaign {
  _id: string;
  title: string;
  description: string;
  code: string;
  percentOff: number;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    percentOff: 20,
    duration: 'once',
    durationInMonths: 1,
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowCreateForm(false);
        fetchCampaigns();
        // Reset form
        setFormData({
          title: '',
          description: '',
          code: '',
          percentOff: 20,
          duration: 'once',
          durationInMonths: 1,
          startDate: '',
          endDate: '',
          isActive: true
        });
      } else {
        alert('Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Campaign Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          {showCreateForm ? 'Cancel' : 'New Campaign'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-8 border border-slate-700">
          <h2 className="text-lg font-medium text-white mb-4">Create New Campaign</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Campaign Title</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md text-white px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Black Friday Sale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Discount Code</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md text-white px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="BF2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Discount Percentage (%)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md text-white px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.percentOff}
                  onChange={(e) => setFormData({ ...formData, percentOff: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Duration</label>
                <select
                  className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md text-white px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value as any })}
                >
                  <option value="once">Once</option>
                  <option value="repeating">Repeating (Months)</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
              {formData.duration === 'repeating' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400">Duration (Months)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md text-white px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    value={formData.durationInMonths}
                    onChange={(e) => setFormData({ ...formData, durationInMonths: parseInt(e.target.value) })}
                  />
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400">Description (Public)</label>
                <textarea
                  required
                  className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md text-white px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Get 50% off your first month!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Start Date</label>
                <input
                  type="datetime-local"
                  required
                  className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md text-white px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">End Date</label>
                <input
                  type="datetime-local"
                  required
                  className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md text-white px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-800 shadow overflow-hidden sm:rounded-md border border-slate-700">
        <ul className="divide-y divide-slate-700">
          {campaigns.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-400">No campaigns found.</li>
          ) : (
            campaigns.map((campaign) => (
              <li key={campaign._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">{campaign.title}</h3>
                    <p className="text-sm text-gray-400">{campaign.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-slate-700 px-2 py-1 rounded text-gray-300 font-mono">
                        {campaign.code}
                      </span>
                      <span>{campaign.percentOff}% OFF</span>
                      <span>
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <StatusBadge status={campaign.isActive} />
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
