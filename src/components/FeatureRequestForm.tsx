'use client';

import { useState } from 'react';
import { HiLightBulb } from 'react-icons/hi';

export default function FeatureRequestForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit request');
      }

      setSuccess(true);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center mb-4">
        <HiLightBulb className="h-6 w-6 text-yellow-400 mr-2" />
        <h3 className="text-lg font-medium text-white">Request a Feature</h3>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Have an idea for Pholio? Let us know! We review all requests.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm px-3 py-2"
            placeholder="e.g., Dark mode for profiles"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm px-3 py-2"
            placeholder="Describe how this feature would help you..."
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">Request submitted successfully!</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
