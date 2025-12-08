'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, BarChart2, Trash2, ExternalLink, Edit } from 'lucide-react';
import { Form } from '@/types';

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/forms');
      if (res.ok) {
        const data = await res.json();
        setForms(data);
      } else if (res.status === 403) {
        setError('Upgrade to Pro to use Forms');
      } else {
        setError('Failed to load forms');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setForms(forms.filter(f => f._id?.toString() !== id));
      }
    } catch (err) {
      console.error('Failed to delete form');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          {error.includes('Upgrade') && (
            <Link href="/settings" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Upgrade Now
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Forms</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage forms for your profile</p>
        </div>
        <Link
          href="/forms/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No forms yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first form to start collecting responses</p>
          <Link
            href="/forms/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Form
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div key={form._id?.toString()} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">
                  {form.title}
                </h3>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  form.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 flex-1">
                {form.description || 'No description'}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <BarChart2 className="w-4 h-4" />
                  <span>{form.submissionsCount || 0} responses</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{form.fields.length} fields</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link
                  href={`/forms/${form._id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <Link
                  href={`/forms/${form._id}/submissions`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                >
                  <BarChart2 className="w-4 h-4" />
                  Results
                </Link>
                <button
                  onClick={() => deleteForm(form._id!.toString())}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
