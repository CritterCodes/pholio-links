'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setMaintenanceMode(data.maintenanceMode);
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = async (checked: boolean) => {
    setMaintenanceMode(checked);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceMode: checked }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating maintenance mode:', error);
      // Revert on error
      setMaintenanceMode(!checked);
      alert('Failed to update maintenance mode');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading settings...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Admin Settings</h1>
      <p className="mt-4 text-gray-400">Global application settings.</p>
      
      <div className="mt-8 space-y-6">
        {/* Maintenance Mode Card */}
        <div className="bg-slate-800 shadow rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-white">Maintenance Mode</h3>
              <p className="text-sm text-gray-400 mt-1">
                When enabled, the dashboard, login, and registration pages will be inaccessible.
                <br />
                <span className="text-green-400 font-semibold">Public profiles remain 100% online.</span>
              </p>
            </div>
            <div className="flex items-center">
              {saving && <span className="text-xs text-gray-500 mr-3">Saving...</span>}
              <Switch
                checked={maintenanceMode}
                onChange={toggleMaintenanceMode}
                className={`${
                  maintenanceMode ? 'bg-purple-600' : 'bg-slate-600'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900`}
              >
                <span className="sr-only">Enable maintenance mode</span>
                <span
                  className={`${
                    maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>
          {maintenanceMode && (
            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-200 text-sm">
              ⚠️ Maintenance mode is currently active. Regular users cannot access the dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
