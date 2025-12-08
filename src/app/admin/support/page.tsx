'use client';

import { useState, useEffect } from 'react';
import { BugReport } from '@/types';
import Image from 'next/image';
import { 
  CheckCircle, 
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusSelect } from '@/components/ui/StatusSelect';

export default function AdminSupportPage() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/support');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'open' | 'in-progress' | 'resolved' | 'closed') => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setReports(reports.map(r => 
          r._id?.toString() === id ? { ...r, status } : r
        ));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = 
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.description.toLowerCase().includes(search.toLowerCase()) ||
      (report.email && report.email.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage bug reports and user issues</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <StatusSelect
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'open', label: 'Open' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredReports.map((report) => (
            <div 
              key={report._id?.toString()} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <StatusBadge status={report.status} />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {report.title}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Reported by: <span className="font-medium text-gray-900 dark:text-gray-300">{report.email || 'Anonymous'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusSelect
                      value={report.status}
                      onChange={(val) => updateStatus(report._id!.toString(), val as any)}
                      disabled={updating === report._id?.toString()}
                      options={[
                        { value: 'open', label: 'Open' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'resolved', label: 'Resolved' },
                        { value: 'closed', label: 'Closed' },
                      ]}
                    />
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>

                {report.imageUrl && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Screenshot</h4>
                    <a 
                      href={report.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block relative h-48 w-full sm:w-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={report.imageUrl}
                        alt="Bug report screenshot"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors">
                        <ExternalLink className="text-white opacity-0 hover:opacity-100 w-6 h-6 drop-shadow-md" />
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reports found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {search || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Great job! There are no bug reports.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
