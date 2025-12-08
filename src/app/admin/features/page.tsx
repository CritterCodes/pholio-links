'use client';

import { useState, useEffect } from 'react';
import { HiCheck, HiX, HiClock, HiTrash } from 'react-icons/hi';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusSelect } from '@/components/ui/StatusSelect';

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
                        <StatusBadge status={request.status} />
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
                  <StatusSelect
                    value={request.status}
                    onChange={(val) => updateStatus(request._id, val)}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'planned', label: 'Planned' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'rejected', label: 'Rejected' },
                    ]}
                  />
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
