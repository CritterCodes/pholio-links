'use client';

import { useState, useEffect } from 'react';
import { HiCheck, HiX, HiClock, HiTrash } from 'react-icons/hi';

interface FeatureRequest {
  _id: string;
  title: string;
  description: string;
  status: string;
  votes: number;
  username: string;
  createdAt: string;
}

export default function AdminFeatureRequests() {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/feature-requests');
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/feature-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchRequests(); // Refresh list
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/50 text-yellow-200 border-yellow-700';
      case 'planned': return 'bg-blue-900/50 text-blue-200 border-blue-700';
      case 'in_progress': return 'bg-purple-900/50 text-purple-200 border-purple-700';
      case 'completed': return 'bg-green-900/50 text-green-200 border-green-700';
      case 'rejected': return 'bg-red-900/50 text-red-200 border-red-700';
      default: return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  if (loading) {
    return <div className="text-white">Loading requests...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Feature Requests</h1>

      <div className="bg-slate-800 shadow overflow-hidden sm:rounded-md border border-slate-700">
        <ul className="divide-y divide-slate-700">
          {requests.map((request) => (
            <li key={request._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-purple-400 truncate">
                        {request.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-300">
                        {request.description}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>Requested by <span className="text-gray-300">{request.username}</span></p>
                      <p className="ml-4">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      <p className="ml-4">
                        {request.votes} votes
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <select
                    value={request.status}
                    onChange={(e) => updateStatus(request._id, e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5"
                  >
                    <option value="pending">Pending</option>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </li>
          ))}
          {requests.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-400">
              No feature requests found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
